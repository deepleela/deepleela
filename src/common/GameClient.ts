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
    private msgId = 2;
    private pendingCallbacks = new Map<number, Function>();
    private reconnected = false;

    aiConnected = false;

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
        if (this.reconnected) super.emit('reconnected');
    }

    private onclose = (ev: CloseEvent) => {
        this.aiConnected = false;
        setTimeout(() => this.reconnect(), 3000);
    }

    private onerror = (ev: Event) => {
        this.aiConnected = false;
    }

    private onmessage = (ev: MessageEvent) => {
        try {
            let msg: ProtocolDef = JSON.parse(ev.data as string);
            let callback: Function | undefined = undefined;

            switch (msg.type) {
                case 'gtp':
                    let resp = Response.fromString(msg.data as string);
                    callback = this.pendingCallbacks.get(resp.id || -1);
                    if (!callback) return;
                    callback(resp);
                    this.pendingCallbacks.delete(resp.id!);
                    break;
                case 'sys':
                    let data: any = msg.data;
                    if (data.name === 'airelease') {
                        this.aiConnected = false;
                        this.emit('airelease');
                        break;
                    }

                    callback = this.pendingCallbacks.get(data.id);
                    if (!callback) return;
                    callback(data.args);
                    this.pendingCallbacks.delete(data.id);
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

        this.reconnected = true;
        this.ws = this.createWs();
    }

    get connected() { return this.ws.readyState === WebSocket.OPEN }

    sendGtpCommand(cmd: Command) {
        if (!this.connected || !this.aiConnected) {
            setImmediate(() => this.pendingCallbacks.delete(cmd.id || -1));
            return false;
        }

        let msg = { type: 'gtp', data: Command.toString(cmd) };
        this.ws.send(JSON.stringify(msg));
        return true;
    }

    sendSysMessage(cmd: Command) {
        if (!this.connected) {
            setImmediate(() => this.pendingCallbacks.delete(cmd.id || -1));
            return false;
        }

        let msg: ProtocolDef = { type: 'sys', data: cmd }
        this.ws.send(JSON.stringify(msg));
        return true;
    }

    requestAI(engine: string): Promise<[boolean, number]> {
        return new Promise(resolve => {
            let cmd: Command = { id: this.msgId++, name: Protocol.sys.requestAI, args: engine };
            this.pendingCallbacks.set(cmd.id!, (args: [boolean, number]) => {
                this.aiConnected = args[0];
                resolve(args);
            });

            if (!this.sendSysMessage(cmd)) resolve([false, -1]);
        });
    }

    initBoard(configs: { komi: number, handicap: number, time: number, size: number }) {
        return new Promise(resolve => {
            // this.sendGtpCommand(CommandBuilder.boardsize(configs.size || 19, this.msgId++));
            if (configs.komi > 0) this.sendGtpCommand(CommandBuilder.komi(configs.komi, this.msgId++));
            if (configs.handicap > 0) this.sendGtpCommand(CommandBuilder.fixed_handicap(configs.handicap, this.msgId++));
            if (configs.time > 0) this.sendGtpCommand(CommandBuilder.time_settings(configs.time * 60, 25 * 60, 25, this.msgId++));
            let cmd = CommandBuilder.clear_board(this.msgId++);
            this.pendingCallbacks.set(cmd.id!, () => resolve());
            this.sendGtpCommand(cmd);
        })
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

            if (!this.sendGtpCommand(cmd)) {
                resolve({ move: '', variations: [] });
            }
        });
    }

    peekWinrate(color: StoneColor, blackOnly: boolean, fiveBased: boolean): Promise<Variation[]> {
        return new Promise(resolve => {
            let cmd = CommandBuilder.genmove(color, this.msgId++);

            this.pendingCallbacks.set(cmd.id!, (resultstr: string) => {
                let result = JSON.parse(resultstr);
                let variations = result.variations as Variation[];

                variations.forEach(v => {
                    v.stats.W = Number.parseFloat(((Number.parseFloat(v.stats.W as any) / 100.0) * 100.0).toFixed(1));
                });

                if (color === 'W' && blackOnly) {
                    variations.forEach(v => {
                        v.stats.W = Number.parseFloat(((1 - Number.parseFloat(v.stats.W as any) / 100.0) * 100.0).toFixed(1));
                    });
                }

                if (fiveBased) {
                    variations.forEach(v => {
                        v.stats.W = Number.parseInt(v.stats.W as any) * 10 - 500;
                    });
                }

                let undo = CommandBuilder.undo(this.msgId++);

                this.pendingCallbacks.set(undo.id!, (resp: Response) => {
                    resolve(variations);
                });

                this.sendGtpCommand(undo);
            });

            if (!this.sendGtpCommand(cmd)) {
                resolve([]);
            }
        });
    }

    play(color: StoneColor, move: string): Promise<boolean> {
        return new Promise(resolve => {
            let cmd = CommandBuilder.play(color, move, this.msgId++);

            this.pendingCallbacks.set(cmd.id!, (resp: Response) => {
                resolve(resp.error === false);
            });

            if (!this.sendGtpCommand(cmd)) {
                resolve(false);
            }
        });
    }

    heatmap(): Promise<number[][]> {
        return new Promise(resolve => {
            let cmd = CommandBuilder.leela_heatmap(this.msgId++);

            this.pendingCallbacks.set(cmd.id!, (mapstr: string) => {
                let data: number[][] = JSON.parse(mapstr);
                resolve(data);
            });

            if (!this.sendGtpCommand(cmd)) {
                resolve(undefined);
            }
        });
    }

    loadSgf(sgf: string, step: number, boardSize: number) {
        let moves = SGF.parse2Move(sgf, step, boardSize);
        return this.loadMoves(moves);
    }

    loadMoves(moves: [string, string][]) {
        return new Promise(resolve => {
            let cmd = { name: 'loadMoves', args: moves, id: this.msgId++ };
            this.pendingCallbacks.set(cmd.id!, (msg: string) => resolve(msg));

            if (!this.sendSysMessage(cmd)) {
                resolve();
            }
        });
    }

    undo() {
        return new Promise(resolve => {
            let cmd = CommandBuilder.undo(this.msgId++);
            this.pendingCallbacks.set(cmd.id!, () => resolve());
            if (!this.sendGtpCommand(cmd)) {
                resolve();
            }
        })
    }

    pass(color: StoneColor) {
        return this.play(color, 'pass');
    }

    resign(color: StoneColor) {
        return this.play(color, 'resign');
    }

    finalScore() {
        return new Promise<string | undefined>(resolve => {
            let cmd = CommandBuilder.final_score(this.msgId++);
            this.pendingCallbacks.set(cmd.id!, (value: Response) => {
                resolve(value.content as string);
            });

            if (!this.sendGtpCommand(cmd)) {
                resolve();
            }
        });
    }
}