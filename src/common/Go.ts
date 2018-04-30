// Source from http://cjlarose.com/2014/01/09/react-board-game-tutorial.html

import { State } from "../components/Intersection";
import { StoneColor } from './Constants';
import { EventEmitter } from "events";

type Coordinate = { row: number, col: number };

export default class Go extends EventEmitter {

    private koStones?: { coor: Coordinate, stoneColor: State, deadStones: Coordinate[], deadColor: State };
    private current = State.Black;
    private deadlines: [number, number] = [0, 0];  // black, white
    private stopWatch: NodeJS.Timer;

    history: { stone: State, coor: Coordinate }[] = [];
    board: State[][];
    size: number;
    currentCartesianCoord = { x: -1, y: -1 };
    
    set time(value: number) {
        let ms = value * 60 * 1000;
        this.deadlines = [ms, ms];
    }

    get blackTime() { return this.deadlines[0]; }

    get whiteTime() { return this.deadlines[1]; }

    get currentColor(): StoneColor { return this.current === State.Black ? 'B' : 'W'; }

    constructor(size: number) {
        super();
        this.board = this.create(size);
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

        if (row > 0) neighbors.push({ row: row - 1, col }); // upper neighbor
        if (row < this.size - 1) neighbors.push({ row: row + 1, col }); // lower neighbor
        if (col > 0) neighbors.push({ row, col: col - 1 }); // left neighbor
        if (col < this.size - 1) neighbors.push({ row, col: col + 1 }); // right neighbor

        return neighbors;
    }

    private findGroup(row: number, col: number) {
        let target = this.board[row][col];
        if (target === State.Empty) return null;

        let visited = new Map<string, boolean>();
        let queue = [{ row, col }];
        let liberties = 0;
        let stones: { row: number, col: number }[] = [];

        while (queue.length > 0) {
            let stone = queue.pop()!;
            if (visited.get(`${stone.row}-${stone.col}`)) continue;

            let neighbors = this.findNeighbors(stone.row, stone.col);
            neighbors.forEach(neighbor => {
                let state = this.board[neighbor.row][neighbor.col];
                if (state === State.Empty) liberties++;
                if (state === target) queue.push({ row: neighbor.row, col: neighbor.col });
            });

            visited.set(`${stone.row}-${stone.col}`, true);
            stones.push(stone);
        }

        return { liberties, stones };
    }

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

        this.board[row][col] = this.current;

        let captured: Coordinate[][] = [];

        // finding neighbors to detect atari and dead stones
        let neighbors = this.findNeighbors(row, col);

        neighbors.forEach(neighbor => {
            let state = this.board[neighbor.row][neighbor.col];

            if (state === State.Empty || state === this.current) return;

            let group = this.findGroup(neighbor.row, neighbor.col);
            if (group === null) return;

            if (group.liberties === 0) captured.push(group.stones);
        });

        let suicideGroup = this.findGroup(row, col);
        if (captured.length === 0 && suicideGroup && suicideGroup.liberties === 0) {
            this.board[row][col] = State.Empty;
            return false;
        }

        let deadStones = captured.reduce((prev, cur, index) => prev.concat(cur), []);

        // Detect ko 
        if (deadStones.length === 1 &&
            this.koStones &&
            deadStones[0].row === this.koStones.coor.row &&
            deadStones[0].col === this.koStones.coor.col &&
            this.koStones.stoneColor === this.opponentOf(this.current) &&
            this.koStones.deadStones.length === 1 &&
            this.koStones.deadColor === this.current
        ) {
            this.board[row][col] = State.Empty;
            return false;
        }

        // Remove dead stones
        deadStones.forEach(stone => this.board[stone.row][stone.col] = State.Empty);

        // Memorize last dead stones
        if (deadStones.length > 0) {
            this.koStones = { coor: { row, col }, stoneColor: this.current, deadColor: this.opponentOf(this.current), deadStones };
        } else {
            this.koStones = undefined;
        }

        this.history.push({ stone: this.current, coor: { row, col } });
        this.turn();
        this.currentCartesianCoord = currentCoord;
        
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
        return this.board[row][col] === State.Empty;
    }

    pass() {
        this.turn();
    }

    clear(resize?: number) {
        this.history = [];
        this.board = this.create(resize || (this.board.length || 19));
        this.current = State.Black;
    }

}