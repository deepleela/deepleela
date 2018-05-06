import * as sgfjs from 'sgfjs';
import { State } from "../components/Intersection";
import { stat } from 'fs';
import { StoneColor } from './Constants';
import Go from './Go';
import Board from '../components/Board';

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
        let game = new Go(size);

        let snapshots: State[][][] = [];
        snapshots.push(this.createBoardFrom(game.board));

        let coords: { x: number, y: number }[] = [];
        coords.push({ x: -1, y: -1 });

        while (child.length > 0) {
            let color: StoneColor | undefined = child[0].props.B ? 'B' : child[0].props.W ? 'W' : undefined;
            let pos = child[0].props.B || child[0].props.W;

            if (!pos) game.pass();

            if (pos && pos.length == 2) {
                let row = SGF.alphabets.indexOf(pos[1]);
                let col = SGF.alphabets.indexOf(pos[0]);
                let coord = Board.arrayPositionToCartesianCoord(row, col);
                game.play(coord.x, coord.y)

                snapshots.push(this.createBoardFrom(game.board));
                coords.push({ x: row, y: col });
            }

            child = child[0].childs;
        }

        return { snapshots, whitePlayer, blackPlayer, size, coords };
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