import { Command } from "@sabaki/gtp";
import { Protocol, ProtocolDef } from 'deepleela-common';
import { EventEmitter } from "events";

export default class GameClient extends EventEmitter {

    static readonly url = process.env.NODE_ENV === 'production' ? 'wss://' : 'ws://localhost:3301';
    static readonly default = new GameClient();

    private ws: WebSocket;
    private reconnected = false;

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
        setTimeout(() => this.reconnect(), 2000);
    }

    private onmessage = (ev: MessageEvent) => {

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

    }

    sendSysMessage(msg: any) {

    }
}