
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
        static fromString(input: string): Command;
        static toString(cmd: Command): string;
    }

    export class Response {
        id?: any;
        content?: any;
        error?: any;
        static fromString(input: string): Response;
        static toString(resp: Response): string;
    }
}