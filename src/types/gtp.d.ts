
declare module '@sabaki/gtp' {

    export class Controller extends NodeJS.EventEmitter {
        process: NodeJS.Process;
        constructor(path: string, args: any[]);
        start();
        stop(): Promise<void>;
        sendCommand(cmd: Command): Promise<Response>;
    }

    export class Command {
        id?: number;
        name: string;
        args?: any;
        static fromString(input: string);
        static toString(cmd: Command);
    }

    export class Response {
        id?: any;
        content?: any;
        error?: any;
    }
}