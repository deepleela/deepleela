import * as sgfjs from 'sgfjs';
import * as sgfgrove from 'sgfgrove';
import { State } from "../components/Intersection";
import { stat } from 'fs';
import { StoneColor } from './Constants';
import Go, { Coordinate } from './Go';
import Board from '../components/Board';

export default class SGF {

    static readonly alphabets = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    static stringToArrayPosition(offset: string) {
        let first = offset[0];
        let second = offset[1];
        let y = SGF.alphabets.indexOf(first);
        let x = SGF.alphabets.indexOf(second);
        return { x, y };
    }

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

        if (tree.props.AB) {
            tree.props.AB.map(v => SGF.stringToArrayPosition(v))
                .forEach(offset => game.board[offset.x][offset.y] = State.Black);
        }

        while (child && child.length > 0) {
            if (child[0].props) console.log(child[0].props);

            let color: StoneColor | undefined = child[0].props.B ? 'B' : child[0].props.W ? 'W' : undefined;
            let pos = child[0].props.B || child[0].props.W;

            while (game.currentColor !== color && pos) game.pass();
            if (!pos) game.pass();

            if (pos && pos.length == 2) {
                let row = SGF.alphabets.indexOf(pos[1]);
                let col = SGF.alphabets.indexOf(pos[0]);
                let coord = Board.arrayPositionToCartesianCoord(row, col);
                game.play(coord.x, coord.y)
            }

            child = child[0].childs;
        }

        return { whitePlayer, blackPlayer, size, game };
    }

    static createBoardFrom(states: State[][]) {
        let newBoard: State[][] = [];

        for (let i = 0; i < states.length; i++) {
            newBoard.push(Array.from(states[i]));
        }

        return newBoard;
    }

    static genSGF(moves: { stone: State, arrayCoord: Coordinate }[], info = { whitePlayer: '', blackPlayer: '', result: '', size: 19 }) {

        let data: any[] = [{ FF: 4, AP: 'DeepLeela', RE: info.result, PW: info.whitePlayer, PB: info.blackPlayer, DT: (new Date()).toLocaleDateString(), CA: 'UTF-8', SZ: info.size }];
        data = data.concat(moves.map((item, i) => {
            let coor = `${SGF.alphabets[item.arrayCoord.y]}${SGF.alphabets[item.arrayCoord.x]}`;
            return item.stone === State.Black ? { B: coor } : { W: coor };
        }));

        let sgf = [[
            data,
            []
        ]];

        return sgfgrove.stringify(sgf) as string;
    }
}