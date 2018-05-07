import { Command, Response } from "@sabaki/gtp";
import { Protocol, ProtocolDef } from 'deepleela-common';
import { EventEmitter } from "events";
import CommandBuilder from "./CommandBuilder";
import { StoneColor } from './Constants';
import { Variation } from "../components/Board";
import { resolve } from "path";
import SGF from "./SGF";

export default class GameClient extends EventEmitter {

    static readonly url = process.env.NODE_ENV === 'production' ? `ws${location.protocol === 'https:' ? 's' : ''}://w.deepleela.com` : 'ws://192.168.31.54:3301';
    static readonly default = new GameClient();

    private ws: WebSocket;
    private msgId = 0;
    private pendingCallbacks = new Map<number, Function>();

    constructor() {
        super();
        this.ws = this.createWs();
    }

    private createWs() {
        let ws = new WebSocket(GameClient.url);
        ws.onopen = this.onopen;
        ws.onclose = this.onclose;
        ws.onerror = this.onerror;
        ws.onmessage = this.onmessage;
        return ws;
    }

    private onopen = (ev: Event) => {
        super.emit('connected');
    }

    private onclose = (ev: CloseEvent) => {
        setTimeout(() => this.reconnect(), 3000);
    }

    private onerror = (ev: Event) => {
    }

    private onmessage = (ev: MessageEvent) => {
        try {
            let msg: ProtocolDef = JSON.parse(ev.data as string);
            let callback: Function | undefined = undefined;

            switch (msg.type) {
                case 'gtp':
                    let resp = Response.fromString(msg.data);
                    callback = this.pendingCallbacks.get(resp.id || -1);
                    if (!callback) return;
                    callback(resp);
                    this.pendingCallbacks.delete(resp.id!);
                    break;
                case 'sys':
                    callback = this.pendingCallbacks.get(msg.data.id);
                    if (!callback) return;
                    callback(msg.data.args);
                    this.pendingCallbacks.delete(msg.data.id);
                    break;
            }

        } catch (error) {
            console.info(error.message);
        }
    }

    private reconnect() {
        if (this.ws) {
            this.ws.removeEventListener('close', this.onclose);
            this.ws.removeEventListener('open', this.onopen);
            this.ws.removeEventListener('error', this.onerror);
            this.ws.removeEventListener('message', this.onmessage);
            this.ws.close();
        }

        this.ws = this.createWs();
    }

    get connected() { return this.ws.readyState === WebSocket.OPEN }

    sendGtpCommand(cmd: Command) {
        if (!this.connected) return;

        let msg = { type: 'gtp', data: Command.toString(cmd) };
        this.ws.send(JSON.stringify(msg));
    }

    sendSysMessage(cmd: Command) {
        if (!this.connected) return false;

        let msg: ProtocolDef = { type: 'sys', data: cmd }
        this.ws.send(JSON.stringify(msg));
        return true;
    }

    requestAI(engine: string): Promise<[boolean, number]> {
        return new Promise(resolve => {
            let cmd: Command = { id: this.msgId++, name: Protocol.sys.requestAI, args: engine };
            if (!this.sendSysMessage(cmd)) resolve([false, -1]);
            this.pendingCallbacks.set(cmd.id!, (args: [boolean, number]) => resolve(args));
        });
    }

    initBoard(configs: { komi: number, handicap: number, time: number, }) {
        this.sendGtpCommand(CommandBuilder.clear_board(this.msgId++));
        if (configs.komi > 0) this.sendGtpCommand(CommandBuilder.komi(configs.komi, this.msgId++));
        if (configs.handicap > 0) this.sendGtpCommand(CommandBuilder.fixed_handicap(configs.handicap, this.msgId++));
        if (configs.time > 0) this.sendGtpCommand(CommandBuilder.time_settings(configs.time * 60, 25 * 60, 25, this.msgId++));
    }

    genmove(color: StoneColor): Promise<{ move: string, variations: Variation[] }> {
        return new Promise(resolve => {
            let cmd = CommandBuilder.genmove(color, this.msgId++);

            this.pendingCallbacks.set(cmd.id!, (resultstr: string) => {
                let result = JSON.parse(resultstr);
                let gtpresp = Response.fromString(result.respstr);
                let variations = result.variations;
                resolve({ move: gtpresp.content!, variations });
            });

            this.sendGtpCommand(cmd);
        });
    }

    peekWinrate(color: StoneColor): Promise<Variation[]> {
        return new Promise(resolve => {
            let cmd = CommandBuilder.genmove(color, this.msgId++);

            this.pendingCallbacks.set(cmd.id!, (resultstr: string) => {
                let result = JSON.parse(resultstr);
                let variations = result.variations as Variation[];

                if (color === 'W') {
                    variations.forEach(v => {
                        v.stats.W = `${(1 - Number.parseFloat(v.stats.W) / 100) * 100}%`;
                    });
                }

                let undo = CommandBuilder.undo(this.msgId++);

                this.pendingCallbacks.set(undo.id!, (resp: Response) => {
                    resolve(variations);
                });

                this.sendGtpCommand(undo);
            });

            this.sendGtpCommand(cmd);
        });
    }

    play(color: StoneColor, move: string): Promise<boolean> {
        return new Promise(resolve => {
            let cmd = CommandBuilder.play(color, move, this.msgId++);

            this.pendingCallbacks.set(cmd.id!, (resp: Response) => {
                resolve(resp === null);
            });

            this.sendGtpCommand(cmd);
        });
    }

    heatmap(): Promise<number[][]> {
        return new Promise(resolve => {
            let cmd = CommandBuilder.leela_heatmap(this.msgId++);

            this.pendingCallbacks.set(cmd.id!, (mapstr: string) => {
                let data: number[][] = JSON.parse(mapstr);
                resolve(data);
            });

            this.sendGtpCommand(cmd);
        });
    }

    loadSgf(sgf: string, step: number) {
        let moves = SGF.parse2Move(sgf, step);
        return this.loadMoves(moves);
    }

    loadMoves(moves: [string, string][]) {
        return new Promise(resolve => {
            let cmd = { name: 'loadMoves', args: moves, id: this.msgId++ };
            this.pendingCallbacks.set(cmd.id!, (msg: string) => resolve(msg));
            this.sendSysMessage(cmd);
        });
    }

}