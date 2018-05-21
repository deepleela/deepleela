declare class RTCEvent extends Event {
    isAudioMuted: boolean;
    mediaElement: HTMLMediaElement;
}

declare class RTCMultiConnection {
    socketURL: string;
    session: {
        audio?: boolean, // by default, it is true
        video?: boolean, // by default, it is true
        screen?: boolean,
        data?: boolean,
        oneway?: boolean,
        broadcast?: boolean,
    };
    enableFileSharing?: boolean;
    sdpConstraints: {
        mandatory: {
            OfferToReceiveAudio?: boolean;
            OfferToReceiveVideo?: boolean;
        }
    }
    mediaConstraints: {
        video?: boolean;
        audio?: boolean;
    }

    openOrJoin(id: string);
    open(id: string);
    join(id: string);
    send(data: any);
    getAllParticipants();
    token(): string;
    getUserMediaHandler(options: { localMediaConstraints?: { video: boolean, audio: boolean } });
    removeStream(opts: { audio?: boolean, video?: boolean });

    onstream: (event: RTCEvent) => void;
    onstreamended: (event: RTCEvent) => void;
    onmessage: (event: RTCEvent) => void;
    onopen: (event: RTCEvent) => void;
    onclose: (event: RTCEvent) => void;
    onUserIdAlreadyTaken: (token: string, newId: string) => void;

    videoContainer?: HTMLElement;

    attachStreams?: any[];
    userid?: string;
    socketMessageEvent?: string;

    dontCaptureUserMedia: boolean;
    enableScalableBroadcast: boolean;
    maxRelayLimitPerUser: number;
    autoCloseEntireSession: boolean;
    broadcastId: string;
}
