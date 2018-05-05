
declare module 'sgfjs' {

    export function parse(sgf: string): Tree;

    export interface Tree {
        props: { FF?: string, GM?: string, SZ?: string, B?: string; W?: string };
        childs: Tree[];
    }

}