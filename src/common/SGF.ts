import * as sgfjs from 'sgfjs';
import { State } from "../components/Intersection";
import { stat } from 'fs';
import { StoneColor } from './Constants';

export interface Tree {
    props: {
        FF?: string, GM?: string, SZ?: string, PB?: string, PW?: string, DT?: string, RE?: string, // for information
        B?: string, W?: string, // for moves, eg B[aa]
        C?: string, // comments
        TR?: string, LB?: string
    };
    childs: Tree[];
}

export default class SGF {

    static readonly alphabets = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    static import(sgf: string) {
        let tree = sgfjs.parse(sgf) as Tree;
        let child = tree.childs;

        let blackPlayer = tree.props.PB;
        let whitePlayer = tree.props.PW;

        let size = Number.parseInt(tree.props.SZ || '19');
        let init = this.createEmptyBoard(size);

        let snapshots: State[][][] = [];
        snapshots.push(init);

        while (child.length > 0) {
            let color: StoneColor | undefined = child[0].props.B ? 'B' : child[0].props.W ? 'W' : undefined;
            let pos = child[0].props.B || child[0].props.W;

            if (pos && pos.length == 2) {
                let row = SGF.alphabets.indexOf(pos[0]);
                let col = SGF.alphabets.indexOf(pos[1]);

                let currentBoard = this.createBoardFrom(snapshots[snapshots.length - 1]);
                currentBoard[row][col] = color === 'B' ? State.Black : color === 'W' ? State.White : State.Empty;

                snapshots.push(currentBoard);
            }

            child = child[0].childs;
        }

        return { snapshots, whitePlayer, blackPlayer, size };
    }

    static createEmptyBoard(size: number) {
        let states: State[][] = [];
        for (let i = 0; i < size; i++) {
            states.push([]);
            for (let j = 0; j < size; j++) {
                states[i].push(State.Empty);
            }
        }

        return states;
    }

    static createBoardFrom(states: State[][]) {
        let newBoard: State[][] = [];

        for (let i = 0; i < states.length; i++) {
            newBoard.push([]);

            for (let j = 0; j < states[i].length; j++) {
                newBoard[i].push(states[i][j]);
            }
        }

        return newBoard;
    }
}