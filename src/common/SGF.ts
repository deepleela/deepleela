import * as sgfjs from 'sgfjs';
import { State } from "../components/Intersection";
import { stat } from 'fs';
import { StoneColor } from './Constants';
import Go from './Go';
import Board from '../components/Board';

export default class SGF {

    static readonly alphabets = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    static parse2Move(sgf: string, steps = Number.MAX_SAFE_INTEGER) {
        let tree = sgfjs.parse(sgf);
        let child = tree.childs;
        let moves: [StoneColor, string][] = [];
        let i = 0;

        while (child && child.length > 0 && i < steps) {
            let color: StoneColor | undefined = child[0].props.B ? 'B' : child[0].props.W ? 'W' : undefined;
            let pos = child[0].props.B || child[0].props.W;

            if (pos) {
                let row = SGF.alphabets.indexOf(pos[1]);
                let col = SGF.alphabets.indexOf(pos[0]);
                let coord = Board.arrayPositionToCartesianCoord(row, col);
                let coordstr = Board.cartesianCoordToString(coord.x, coord.y);

                moves.push([color!, coordstr]);
            }

            child = child[0].childs;
            i++;
        }

        return moves;
    }

    static import(sgf: string) {
        let tree = sgfjs.parse(sgf);
        let child = tree.childs;

        let blackPlayer = tree.props.PB;
        let whitePlayer = tree.props.PW;

        let size = Number.parseInt(tree.props.SZ || '19');
        let game = new Go(size);

        let snapshots: State[][][] = [];
        let coords: { x: number, y: number }[] = [];
        let stonesColor: StoneColor[] = [];

        while (child && child.length > 0) {
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
                stonesColor.push(color!);
            }

            child = child[0].childs;
        }

        return { snapshots, whitePlayer, blackPlayer, size, coords, stonesColor };
    }

    static createBoardFrom(states: State[][]) {
        let newBoard: State[][] = [];

        for (let i = 0; i < states.length; i++) {
            newBoard.push(Array.from(states[i]));
        }

        return newBoard;
    }
}