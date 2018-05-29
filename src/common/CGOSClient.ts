import { EventEmitter } from "events";
import SGF from "./SGF";

export interface Match {
    gameId: string;
    date: string;
    time: string;
    boardSize: number;
    komi: number;
    blackPlayer: string;
    whitePlayer: string;
    result?: string;
}

export interface Setup extends Match {
    moves: string[];
}

export interface Update {
    gameId: string;
    move: string;
}

export default class CGOSClient extends EventEmitter {

    static readonly url = process.env.NODE_ENV === 'production' ? `ws${location.protocol === 'https:' ? 's' : ''}://cgos.deepleela.com` : 'ws://192.168.31.54:3302';
    static default: CGOSClient = new CGOSClient();

    private ws: WebSocket;
    private msgHandlers = new Map<string, Function>();

    cgosReady = false;
    get connected() { return this.ws && this.ws.readyState === this.ws.OPEN; }

    constructor() {
        super();
    }

    init() {
        if (this.connected) return;

        this.ws = this.createWs();
        this.msgHandlers.set('match', this.handleMatch);
        this.msgHandlers.set('gameover', this.handleGameover);
        this.msgHandlers.set('setup', this.handleSetup);
        this.msgHandlers.set('update', this.handleUpdate);
    }

    private createWs() {
        let ws = new WebSocket(CGOSClient.url);
        ws.onopen = () => super.emit('connected');
        ws.onclose = this.handleClose;
        ws.onerror = this.handleError;
        ws.onmessage = this.handleMessage;
        return ws;
    }

    private handleMessage = (ev: MessageEvent) => {
        let msg = ev.data as string;
        if (!msg) return;

        if (msg.startsWith('cgos-ready-deepleela')) {
            this.cgosReady = true;
            return;
        }

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
        this.cgosReady = false;

        setTimeout(() => this.ws = this.createWs(), 3000);
    }

    private handleError = (ev: Event) => {

    }

    /**
     * match 480790 - - 9 7.0 Newronamin3(2889) Nats0515_p2v4_t8g2(3138) -
     * match 480737 2018-05-23 00:21 9 7.0 Newronamin3(2888) Aya799_p1v1_10k(2792) W+Resign
     */
    protected handleMatch = (msg: string[]) => {
        let [gameId, date, time, boardSize, komi, whitePlayer, blackPlayer, result] = msg;
        let match: Match = { gameId, date, time, boardSize: Number.parseInt(boardSize), komi: Number.parseFloat(komi), blackPlayer, whitePlayer, result };
        if (!Object.getOwnPropertyNames(match).every(k => match[k])) return;

        super.emit('match', match);
    }

    protected handleGameover = (data: string[]) => {
        let [gameId, result,] = data;
        let gameover = { gameId, result };
        super.emit('gameover', gameover);
    }

    /**
     * setup 480935 2018-05-23 05:20 9 7.0 LZ20-128_300po(2903) Aya799_p1v1_10k(2794) 300000 D5 300000 F5 297687 E7 295785 E3 294922 D3 295785 D2 292871 E4 295785 C3 290935 D4 295785 E6 288799 D6 290413 F7 286763 E2 286088 D7 284324 E8 280738 C7 282153 F8 277509 G7 279703 G8 274843 H8 277324 D8 271335 C8 275344 B6 269028 F3 273052 C2 262141 B7 270720 C6 255109 D9 268260 F4 249596 G4 265650 G5 242205 H6 263417 G3 233406 H4 261333 H3 226497 J4 259601 B9 217776 C9 257701 H7 210108 J7 255321 A6 203113 A8 253757 F2 196563 J3 252071 J2 188983 G6 250111 A7 183177 E9 248174 H2 178717 F6 246878 E5 172027 G9 245397 B8 166984 A9 243875 B8 161792 B9 242348 H5 157301 J5 240884 H9 151473 F9 239669 D1 146670 J9 238346 W+Resign
     */
    protected handleSetup = (data: string[]) => {
        let [gameId, date, time, boardSize, komi, whitePlayer, blackPlayer,] = data;
        let moves: string[] = [];
        let result = '';
        let setup: Setup = { gameId, date, time, boardSize: Number.parseInt(boardSize), komi: Number.parseFloat(komi), blackPlayer, whitePlayer, moves, result };
        data.splice(0, 7);

        for (let i = 0; i < data.length; i += 2) {
            let [timestamp, move] = data.slice(i, i + 2);
            if (!move) break;

            if (CGOSClient.isIllegalMove(move)) {
                continue;
            }

            moves.push(move);
        }

        setup.result = data[data.length - 1] && CGOSClient.isIllegalMove(data[data.length - 1]) ? result = data[data.length - 1] : result;

        super.emit('setup', setup);
    }

    protected handleUpdate = (data: string[]) => {
        let [gameId, move,] = data;
        let update: Update = { gameId, move };
        super.emit('update', update);
    }

    observe(gameId: string) {
        if (!this.cgosReady) return;
        this.ws.send(`observe ${gameId}`);
    }

    initMatches() {
        if (!this.cgosReady) return;
        this.ws.send('init');
    }

    static isIllegalMove(move: string) {
        return !move || move.includes('+') || ['draw', 'resign', 'pass'].includes(move.toLowerCase());
    }
}
