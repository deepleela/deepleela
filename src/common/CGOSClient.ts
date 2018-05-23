import { EventEmitter } from "events";

export type Match = {
    gameId: string,
    date: string,
    time: string,
    boardSize: string,
    version: string,
    blackPlayer: string,
    whitePlayer: string,
    result: string;
}

export default class CGOSClient extends EventEmitter {

    static readonly url = process.env.NODE_ENV === 'production' ? `ws${location.protocol === 'https:' ? 's' : ''}://cgos.deepleela.com` : 'ws://192.168.31.54:3302';
    static default: CGOSClient = new CGOSClient();

    private ws: WebSocket;
    private msgHandlers = new Map<string, Function>();

    constructor() {
        super();
        this.ws = this.createWs();
        this.msgHandlers.set('match', this.handleMatch);
        this.msgHandlers.set('gameover', this.handleGameover);
        this.msgHandlers.set('setup', this.handleSetup);
        this.msgHandlers.set('update', this.handleUpdate);
    }

    private createWs() {
        let ws = new WebSocket(CGOSClient.url);
        ws.onclose = this.handleClose;
        ws.onerror = this.handleError;
        ws.onmessage = this.handleMessage;
        return ws;
    }

    private handleMessage = (ev: MessageEvent) => {
        let msg = ev.data as string;
        if (!msg) return;
        let info = msg.split(' ');
        if (info.length === 0) return;

        let cmd = info.splice(0, 1);
        let handler = this.msgHandlers.get(cmd[0]);
        if (!handler) return;
        handler(info);
    }

    private handleClose = (ev: CloseEvent) => {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;

        setTimeout(() => this.ws = this.createWs(), 3000);
    }

    private handleError = (ev: Event) => {

    }

    /**
     * match 480790 - - 9 7.0 Newronamin3(2889) Nats0515_p2v4_t8g2(3138) -
     * match 480737 2018-05-23 00:21 9 7.0 Newronamin3(2888) Aya799_p1v1_10k(2792) W+Resign
     */
    protected handleMatch = (msg: string[]) => {
        let [gameId, date, time, boardSize, version, whitePlayer, blackPlayer, result] = msg;
        let match: Match = { gameId, date, time, boardSize, version, blackPlayer, whitePlayer, result };
        if (!Object.getOwnPropertyNames(match).every(k => match[k])) return;

        super.emit('match', match);
    }

    protected handleGameover = (data: string[]) => {
        let [gameId, result,] = data;
        let gameover = { gameId, result };
        super.emit('gameover', gameover);
        console.log(gameover);
    }

    protected handleSetup = (data: string[]) => {
        let [gameId, date, time, version, blackPlayer, whitePlayer,] = data;
        let setup = { gameId, date, time, version, blackPlayer, whitePlayer };
        let moves = data.splice(0, 6);
        console.log(setup);
    }

    protected handleUpdate = (data: string[]) => {
        let [gameId, move,] = data;
        let update = { gameId, move };
        super.emit('update', update);
        console.log(update);
    }

    observe(gameId: string) {
        this.ws.send(`observe ${gameId}`);
    }
}