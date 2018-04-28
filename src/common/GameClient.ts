import { Command } from "@sabaki/gtp";
import { Protocol, ProtocolDef } from 'deepleela-common';
import { EventEmitter } from "events";
import CommandBuilder from "./CommandBuilder";

export default class GameClient extends EventEmitter {

    static readonly url = process.env.NODE_ENV === 'production' ? 'wss://' : 'ws://localhost:3301';
    static readonly default = new GameClient();

    private ws: WebSocket;
    private reconnected = false;
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
        if (this.reconnected) super.emit('reconnected');
    }

    private onclose = (ev: CloseEvent) => {
        setTimeout(() => this.reconnect(), 1000);
    }

    private onerror = (ev: Event) => {
    }

    private onmessage = (ev: MessageEvent) => {
        try {
            let msg: ProtocolDef = JSON.parse(ev.data as string);
            let callback = this.pendingCallbacks.get(msg.data.id);
            if (!callback) return;

            callback(msg.data.args);
            this.pendingCallbacks.delete(msg.data.id);
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
        this.reconnected = true;
    }

    get connected() { return this.ws.readyState === WebSocket.OPEN }

    onReconnected(callback: () => void) {
        super.addListener('reconnected', callback);
    }

    sendGtpCommand(cmd: Command) {
        let msg = { type: 'gtp', data: Command.toString(cmd) };
        this.ws.send(JSON.stringify(msg));
    }

    sendSysMessage(cmd: Command) {
        let msg: ProtocolDef = { type: 'sys', data: cmd }
        this.ws.send(JSON.stringify(msg));
    }

    requestAI(callback: (args: any[]) => void) {
        let cmd = { id: this.msgId++, name: Protocol.sys.requestAI };
        this.sendSysMessage(cmd);
        this.pendingCallbacks.set(cmd.id, callback);
    }

    initBoard(configs: { komi: number, handicap: number, time: number, }) {
        this.sendGtpCommand(CommandBuilder.clear_board(this.msgId++));
        if (configs.komi > 0) this.sendGtpCommand(CommandBuilder.komi(configs.komi, this.msgId++));
        if (configs.handicap > 0) this.sendGtpCommand(CommandBuilder.fixed_handicap(configs.handicap, this.msgId++));
        if (configs.time > 0) this.sendGtpCommand(CommandBuilder.time_settings(configs.time * 60, 25 * 60, 25, this.msgId++));
    }
}