
declare module 'sgfjs' {

    export function parse(sgf: string): Tree;

    export interface Tree {
        props: {
            FF?: string, GM?: string, SZ?: string, PB?: string, PW?: string, DT?: string, RE?: string, KM?: string, // for information
            AB?: string[],
            B?: string, W?: string, // for moves, eg B[aa]
            C?: string, // comments
            TR?: string, LB?: string
        };
        childs: Tree[];
    }

}