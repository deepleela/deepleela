import * as React from 'react';
import Intersection, { State, WinRate } from './Intersection';
import { CSSProperties } from 'react';
import ThemeManager from '../common/ThemeManager';

export interface Variation {
    visits: number;
    stats: { W: number, U: number, };
    variation: string[];
}

interface BranchState {
    state: State;
    moveNumber: number;
}

interface BoardProps {
    size: number;
    id?: string;
    disabled?: boolean;
    showCoordinate?: boolean;
    highlightCoord?: { x: number, y: number };

    /**
     * Calls when users click a position on board, cartesian coordinate
     */
    onIntersectionClicked?: (row: number, col: number) => void;

    style?: CSSProperties & { boardColor?: string, gridColor?: string, whiteStoneColor?: string, blackStoneColor?: string, coordTextColor?: string };
    states: State[][];
    heatmap?: number[][];
    fontSize?: number;
    currentColor: 'W' | 'B';
}

interface BoardStates {
    variationStates: (Variation | undefined)[][];
    branchStates: (BranchState | undefined)[][];
    highlightWinrateVariationOffset?: { x: number, y: number };
    touchedCoord?: { x: number, y: number };
    disableAnimation?: boolean;
}

export default class Board extends React.Component<BoardProps, BoardStates> {

    static readonly alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

    static cartesianCoordToArrayPosition(x: number, y: number, size: number) {
        return { x: size - x, y: y - 1 };
    }

    static cartesianCoordToString(x: number, y: number) {
        return `${Board.alphabets[y - 1]}${x}`;
    }

    static stringToCartesianCoord(coord: string) {
        let alphabet = coord[0];
        let y = Board.alphabets.indexOf(alphabet.toUpperCase()) + 1;
        let x = Number.parseInt(coord.substr(1));
        return { x, y };
    }

    static stringToArrayPosition(coord: string, size: number) {
        let cartesian = Board.stringToCartesianCoord(coord);
        return Board.cartesianCoordToArrayPosition(cartesian.x, cartesian.y, size);
    }

    static arrayPositionToCartesianCoord(x: number, y: number, size: number) {
        return { x: size - x, y: y + 1 };
    }

    constructor(props: BoardProps, ctx?: any) {
        super(props, ctx);

        let variationStates: (Variation | undefined)[][] = [];

        for (let i = 0; i < props.size; i++) {
            variationStates.push([]);
            for (let j = 0; j < props.size; j++) {
                variationStates[i].push(undefined);
            }
        }

        let branchStates: (BranchState | undefined)[][] = [];
        for (let i = 0; i < props.size; i++) {
            branchStates.push([]);
            for (let j = 0; j < props.size; j++) {
                branchStates[i].push(undefined)
            }
        }

        this.state = { variationStates, branchStates };
    }

    private onClick(row: number, col: number) {
        this.clearBranchStates();
        if (!this.props.onIntersectionClicked) return;
        this.props.onIntersectionClicked(row, col);
    }

    private onVariationHover(row: number, col: number) {
        let { x, y } = Board.cartesianCoordToArrayPosition(row, col, this.props.size);
        let branch = this.state.variationStates[x][y];
        if (!branch) return;
        if (!branch.variation || branch.variation.length === 0) return;

        let currColor = this.props.currentColor;

        branch.variation.forEach((value, i) => {
            let { x, y } = Board.stringToArrayPosition(value, this.props.size);
            let state = currColor === 'B' ? State.Black : State.White;
            currColor = currColor === 'B' ? 'W' : 'B';
            this.state.branchStates[x][y] = { state, moveNumber: i + 1 };
        });

        this.forceUpdate();
    }

    setVariations(varitations: Variation[]) {
        this.clearVariations();

        varitations.forEach(v => {
            let position = Board.stringToCartesianCoord(v.variation[0]);
            let arrayOffset = Board.cartesianCoordToArrayPosition(position.x, position.y, this.props.size);
            this.state.variationStates[arrayOffset.x][arrayOffset.y] = v;
        });

        let highlight = varitations[0];
        if (!highlight) {
            this.forceUpdate();
            return;
        }

        let pos = Board.stringToCartesianCoord(varitations[0].variation[0]);
        let offset = Board.cartesianCoordToArrayPosition(pos.x, pos.y, this.props.size);
        this.setState({ highlightWinrateVariationOffset: offset });
    }

    setMovesNumber(moves: { coord: { x: number, y: number }, number: number }[]) {
        moves.forEach(m => {
            let offset = Board.cartesianCoordToArrayPosition(m.coord.x, m.coord.y, this.props.size);
            let state = this.props.states[offset.x][offset.y];
            this.state.branchStates[offset.x][offset.y] = { state: State.Empty, moveNumber: m.number };
        });
    }

    clearVariations() {
        if (!this.state.branchStates || this.state.branchStates.length === 0) return;

        for (let i = 0; i < this.props.size; i++) {
            for (let j = 0; j < this.props.size; j++) {
                this.state.variationStates[i][j] = undefined;
            }
        }
    }

    clearBranchStates() {
        for (let i = 0; i < this.props.size; i++) {
            for (let j = 0; j < this.props.size; j++) {
                this.state.branchStates[i][j] = undefined;
            }
        }
    }

    setAnimation(enable: boolean) {
        this.setState({ disableAnimation: !enable });
    }

    clearTouchedCoord() {
        this.setState({ touchedCoord: { x: -1, y: -1 } });
    }

    render() {
        const size = 100.0 / this.props.size;
        const dimension = this.props.size;

        const boardParent = document.getElementById('smartboard');
        const gridWidth = boardParent ? boardParent.getBoundingClientRect().height * (size / 100.0) : 0;
        const top = gridWidth / 2 - 6.25;

        const gridLineColor = this.props.style ? this.props.style.gridColor : undefined;
        const coordTextColor = this.props.style ? this.props.style.coordTextColor : gridLineColor;

        const subtleTextCoordLeftMargin = 4.2 * (1 - this.props.size / 19);
        const subtleTextBaseLeftMargin = this.props.size > 9 ? 2.32 : this.props.size === 9 ? 2.82 : 3.92;

        const startPoints = [dimension > 9 ? 3 : (dimension > 7 ? 2 : 1), dimension > 9 ? dimension - 4 : (dimension > 7 ? dimension - 3 : dimension - 2), (dimension - 1) / 2];

        return (
            <div id={this.props.id} style={this.props.style} draggable={false}>

                <div style={{ background: this.props.style ? (this.props.style.background || '') : '', padding: 4, paddingBottom: `${0.6 + size}%`, }}>

                    {this.props.states.map((row, i) => (
                        <div style={{ clear: 'both', height: `${size}%`, position: 'relative' }} key={i} >
                            {this.props.showCoordinate ? <div style={{ position: 'absolute', left: 0, top: top, bottom: 0, fontSize: 8, fontWeight: 100, color: coordTextColor, }}>{this.props.size - i}</div> : undefined}

                            {row.map((state, j) => (
                                <div key={`${i},${j}`}>
                                    {this.props.showCoordinate && i === (this.props.size - 1) ?
                                        <div style={{ position: 'absolute', bottom: 0, left: top + 2 + j * (gridWidth - subtleTextBaseLeftMargin - subtleTextCoordLeftMargin), fontSize: 8, fontWeight: 100, color: coordTextColor, top: top + 12 }}>
                                            {'ABCDEFGHJKLMNOPQRST'[j]}
                                        </div>
                                        : undefined
                                    }

                                    <Intersection
                                        onClick={(r, c) => this.onClick(r, c)}
                                        style={{ color: gridLineColor, whiteStoneColor: this.props.style ? this.props.style.whiteStoneColor : 'white', blackStoneColor: this.props.style ? this.props.style.blackStoneColor : 'black' }}
                                        key={j}
                                        row={this.props.size - i}
                                        col={j + 1}
                                        lineThickness={2}
                                        disabled={this.props.disabled}
                                        width={size}
                                        state={state === State.Empty ? (this.state.branchStates[i][j] ? this.state.branchStates[i][j]!.state : state) : state}
                                        topEdge={i === 0}
                                        bottomEdge={i === dimension - 1}
                                        leftEdge={j === 0}
                                        rightEdge={j === dimension - 1}
                                        star={startPoints.indexOf(i) >= 0 && startPoints.indexOf(j) >= 0}
                                        highlight={this.props.highlightCoord && i === (this.props.size - this.props.highlightCoord.x) && j === this.props.highlightCoord.y - 1}
                                        highlightPointSize={gridWidth > 25 ? 'large' : 'small'}
                                        needTouchConfirmation={gridWidth < 25}
                                        onTouch={(x, y) => this.setState({ touchedCoord: { x, y } })}
                                        showTouchConfirmation={this.state.touchedCoord && i === (this.props.size - this.state.touchedCoord.x) && j === (this.state.touchedCoord.y - 1)}
                                        heatmap={this.props.heatmap ? this.props.heatmap[i][j] : 0}
                                        winrate={this.state.variationStates[i][j] ? {
                                            value: this.state.variationStates[i][j]!.stats.W,
                                            uvalue: this.state.variationStates[i][j]!.stats.U,
                                            visits: this.state.variationStates[i][j]!.visits,
                                            highest: this.state.highlightWinrateVariationOffset ? this.state.highlightWinrateVariationOffset.x === i && this.state.highlightWinrateVariationOffset.y === j : false,
                                        } : undefined}
                                        fontSize={this.props.fontSize}
                                        onVariationHover={(row, col) => this.onVariationHover(row, col)}
                                        onVariationHoverLeave={(row, col) => { this.clearBranchStates(), this.forceUpdate() }}
                                        moveNumber={this.state.branchStates[i][j] ? this.state.branchStates[i][j]!.moveNumber : undefined}
                                        disableAnimation={this.state.disableAnimation}
                                    />
                                </div>
                            ))}

                        </div>
                    ))}

                </div>

            </div>
        );
    }
}