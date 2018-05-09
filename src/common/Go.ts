// Source from http://cjlarose.com/2014/01/09/react-board-game-tutorial.html

import { State } from "../components/Intersection";
import { StoneColor } from './Constants';
import { EventEmitter } from "events";
import SGF from "./SGF";
import Board from "../components/Board";

export type Coordinate = { x: number, y: number };
type Moves = { stone: State, arrayCoord: Coordinate, cartesianCoord: Coordinate }[];

export default class Go extends EventEmitter {

    private koStones?: { coor: Coordinate, stoneColor: State, deadStones: Coordinate[], deadColor: State };
    private deadlines: [number, number] = [0, 0];  // black, white
    private stopWatch: NodeJS.Timer;
    private _board: State[][];

    snapshots: State[][][] = [];
    mainBranch: Moves = [];
    cursor = -1;

    history: Moves = [];
    size: number;
    current = State.Black;
    currentCartesianCoord = { x: -1, y: -1 };

    set time(value: number) {
        let ms = value * 60 * 1000;
        this.deadlines = [ms, ms];
    }

    get blackTime() { return this.deadlines[0]; }

    get whiteTime() { return this.deadlines[1]; }

    get currentColor(): StoneColor { return this.current === State.Black ? 'B' : 'W'; }

    get isLatestCursor() { return this.cursor === -1 || this.cursor === this.snapshots.length - 1 };

    constructor(size: number) {
        super();
        this._board = this.create(size);
    }

    private create(size: number) {
        this.size = size >= 7 ? size : 19;
        let states: State[][] = [];

        for (let i = 0; i < size; i++) {
            states.push([]);

            for (let j = 0; j < size; j++) {
                states[i].push(State.Empty);
            }
        }

        return states;
    }

    private turn() {
        this.current = this.opponentOf(this.current);
    }

    private opponentOf(stone: State) {
        return stone === State.Black ? State.White : State.Black;
    }

    private findNeighbors(row: number, col: number) {

        let neighbors: Coordinate[] = [];

        if (row > 0) neighbors.push({ x: row - 1, y: col }); // upper neighbor
        if (row < this.size - 1) neighbors.push({ x: row + 1, y: col }); // lower neighbor
        if (col > 0) neighbors.push({ x: row, y: col - 1 }); // left neighbor
        if (col < this.size - 1) neighbors.push({ x: row, y: col + 1 }); // right neighbor

        return neighbors;
    }

    private findGroup(row: number, col: number) {
        let target = this._board[row][col];
        if (target === State.Empty) return null;

        let visited = new Map<string, boolean>();
        let queue = [{ x: row, y: col }];
        let liberties = 0;
        let stones: { x: number, y: number }[] = [];

        while (queue.length > 0) {
            let stone = queue.pop()!;
            if (visited.get(`${stone.x}-${stone.y}`)) continue;

            let neighbors = this.findNeighbors(stone.x, stone.y);
            neighbors.forEach(neighbor => {
                let state = this._board[neighbor.x][neighbor.y];
                if (state === State.Empty) liberties++;
                if (state === target) queue.push({ x: neighbor.x, y: neighbor.y });
            });

            visited.set(`${stone.x}-${stone.y}`, true);
            stones.push(stone);
        }

        return { liberties, stones };
    }

    set board(value: State[][]) {
        this._board = value;
        this.history = [];
    }

    get board() { return this._board; }

    /**
     * Play a stone on board
     * @param row cartesian coord x
     * @param col cartesian coord y
     */
    play(row: number, col: number) {
        // Convert cartesian coord to array offset
        let currentCoord = { x: row, y: col };
        let { x, y } = { x: this.size - row, y: col - 1 };
        row = x;
        col = y;

        if (!this.isEmpty(row, col)) return false;

        this._board[row][col] = this.current;

        let captured: Coordinate[][] = [];

        // finding neighbors to detect atari and dead stones
        let neighbors = this.findNeighbors(row, col);

        neighbors.forEach(neighbor => {
            let state = this._board[neighbor.x][neighbor.y];

            if (state === State.Empty || state === this.current) return;

            let group = this.findGroup(neighbor.x, neighbor.y);
            if (group === null) return;

            if (group.liberties === 0) captured.push(group.stones);
        });

        let suicideGroup = this.findGroup(row, col);
        if (captured.length === 0 && suicideGroup && suicideGroup.liberties === 0) {
            this._board[row][col] = State.Empty;
            return false;
        }

        let deadStones = captured.reduce((prev, cur, index) => prev.concat(cur), []);

        // Detect ko 
        if (deadStones.length === 1 &&
            this.koStones &&
            deadStones[0].x === this.koStones.coor.x &&
            deadStones[0].y === this.koStones.coor.y &&
            this.koStones.stoneColor === this.opponentOf(this.current) &&
            this.koStones.deadStones.length === 1 &&
            this.koStones.deadColor === this.current
        ) {
            this._board[row][col] = State.Empty;
            return false;
        }

        // Remove dead stones
        deadStones.forEach(stone => this._board[stone.x][stone.y] = State.Empty);

        // Memorize last dead stones
        if (deadStones.length > 0) {
            this.koStones = { coor: { x, y }, stoneColor: this.current, deadColor: this.opponentOf(this.current), deadStones };
        } else {
            this.koStones = undefined;
        }

        this.history.push({ stone: this.current, arrayCoord: { x, y }, cartesianCoord: currentCoord });
        this.currentCartesianCoord = currentCoord;

        // Just save the latest board on main branch
        if (this.cursor === -1 || this.cursor === this.snapshots.length - 1) {
            this.snapshots.push(SGF.createBoardFrom(this.board));
            this.mainBranch.push({ stone: this.current, arrayCoord: { x, y }, cartesianCoord: currentCoord });
            this.history = []; // reset history
            this.cursor = this.snapshots.length - 1;
        }

        this.turn();

        return true;
    }

    start() {
        if (this.stopWatch) clearInterval(this.stopWatch);

        this.stopWatch = setInterval(() => {
            this.currentColor === 'B' ? this.deadlines[0] -= 1000 : this.deadlines[1] -= 1000;
            if (this.deadlines.some(i => i <= 0)) clearInterval(this.stopWatch);
            this.emit('tick');
        }, 1000);
    }

    isEmpty(row: number, col: number) {
        return this._board[row][col] === State.Empty;
    }

    pass() {
        this.turn();
    }

    clear(resize?: number) {
        this.history = [];
        this.mainBranch = [];
        this.snapshots = [];
        this.cursor = -1;
        this._board = this.create(resize || (this._board.length || 19));
        this.current = State.Black;
        this.currentCartesianCoord = { x: -1, y: -1 };
    }

    changeCursor(delta: number) {
        if (this.snapshots.length === 0) return;

        this.cursor = Math.max(0, Math.min(this.cursor + delta, this.snapshots.length - 1));
        this.board = SGF.createBoardFrom(this.snapshots[this.cursor]);

        let state = this.mainBranch[this.cursor];
        this.currentCartesianCoord = state.cartesianCoord;
        this.current = this.opponentOf(state.stone);
    }

    genMoves() {
        let moves = this.mainBranch.slice(0, this.cursor + 1).concat(this.history);
        return moves.map(m => [m.stone, Board.cartesianCoordToString(m.cartesianCoord.x, m.cartesianCoord.y)]) as [string, string][];
    }

    genSgf() {
        let moves = this.mainBranch.slice(0, this.cursor + 1).concat(this.history);
        return SGF.genSGF(moves);
    }
}