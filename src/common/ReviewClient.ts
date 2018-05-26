import { EventEmitter } from "events";
import { Protocol, ProtocolDef, ReviewRoom, ReviewRoomInfo, ReviewRoomState } from 'deepleela-common';
import CommandBuilder from "./CommandBuilder";
import { Command, Response } from "@sabaki/gtp";
import SGF from "./SGF";

export default class ReviewClient extends EventEmitter {
    static readonly url = process.env.NODE_ENV === 'production' ? `ws${location.protocol === 'https:' ? 's' : ''}://review.deepleela.com` : 'ws://192.168.31.54:3303';
    static readonly default = new ReviewClient();

    private ws: WebSocket;
    private msgId = 2000000;
    private pendingCallbacks = new Map<number, Function>();

    constructor() {
        super();
        this.ws = this.createWs();
    }

    private createWs() {
        let ws = new WebSocket(ReviewClient.url);
        console.log(ws.url);
        ws.onopen = this.onopen;
        ws.onclose = this.onclose;
        ws.onerror = this.onerror;
        ws.onmessage = this.onmessage;
        return ws;
    }

    private onopen = (ev: Event) => {
        console.log('review connected');
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
                case 'sys':
                    let data: any = msg.data;
                    callback = this.pendingCallbacks.get(data.id);
                    if (!callback) return;
                    callback(data.args);
                    this.pendingCallbacks.delete(data.id);
                    break;
                case 'sync':
                    try {
                        let payload = msg.data as Command;
                        let msgArgs = payload.name === Protocol.sys.reviewRoomStateUpdate ? JSON.parse(payload.args as string) : payload.args as string;
                        super.emit(payload.name, msgArgs);
                    } catch{ }
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

    sendSysMessage(cmd: Command) {
        if (!this.connected) {
            setImmediate(() => this.pendingCallbacks.delete(cmd.id || -1));
            return false;
        }

        let msg: ProtocolDef = { type: 'sys', data: cmd };
        this.ws.send(JSON.stringify(msg));
        return true;
    }

    sendSyncMessage(cmd: Command) {
        if (!this.connected) {
            return false;
        }

        let msg: ProtocolDef = { type: 'sync', data: cmd };
        this.ws.send(JSON.stringify(msg));
        return true;
    }

    createReviewRoom(opts: { nickname: string, roomName: string, uuid: string, sgf: string, chatBroId?: string }) {
        return new Promise<ReviewRoom | undefined>(resolve => {
            let cmd: Command = { name: Protocol.sys.createReviewRoom, id: this.msgId++, args: [opts.uuid, opts.sgf, opts.nickname, opts.roomName, opts.chatBroId] };
            this.pendingCallbacks.set(cmd.id!, (result: string) => {
                let room = JSON.parse(result) as ReviewRoom;
                resolve(room);
            });

            if (!this.sendSysMessage(cmd)) {
                resolve(undefined);
            }
        });
    }

    enterReviewRoom(opts: { roomId: string, uuid: string, nickname: string }) {
        return new Promise<ReviewRoomInfo | undefined>(resolve => {
            let cmd: Command = { name: Protocol.sys.enterReviewRoom, id: this.msgId++, args: [opts.roomId, opts.uuid, opts.nickname] };
            this.pendingCallbacks.set(cmd.id!, (result: string) => {
                let roomInfo = JSON.parse(result) as ReviewRoomInfo;
                resolve(roomInfo);
            });

            if (!this.sendSysMessage(cmd)) {
                resolve(undefined);
            }
        });
    }

    updateReviewRoomState(state: ReviewRoomState) {
        this.sendSysMessage({ name: Protocol.sys.reviewRoomStateUpdate, args: state });
    }

    sendRoomTextMessage(text: string) {
        this.sendSysMessage({ name: Protocol.sys.reviewRoomMessage, args: text });
    }
}