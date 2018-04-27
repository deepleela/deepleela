import { Command } from "@sabaki/gtp";

export interface Protocol {
    type: 'gtp' | 'sys',
    data: any;
}

export default class GameClient {

    static readonly url = process.env.NODE_ENV === 'production' ? 'wss://' : 'ws://localhost:3301';

    private ws: WebSocket;

    constructor() {
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

    private onopen(ev: Event) {

    }

    private onclose(ev: CloseEvent) {

    }

    private onerror(ev: Event) {

    }

    private onmessage(ev: MessageEvent) {

    }

    sendGtpCommand(cmd: Command) {
        
    }

    sendSysMessage(msg: any) {

    }
}