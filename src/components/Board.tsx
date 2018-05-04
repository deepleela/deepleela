import * as React from 'react';
import Intersection, { State, WinRate } from './Intersection';
import { CSSProperties } from 'react';

export interface Variation {
    visits: number;
    stats: { W: string };
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
    hightlightCoord?: { x: number, y: number };

    /**
     * Calls when users click a position on board, cartesian coordinate
     */
    onIntersectionClicked?: (row: number, col: number) => void;

    style?: CSSProperties & { boardColor?: string, gridColor?: string, whiteStoneColor?: string, blackStoneColor?: string };
    states: State[][];
    heatmap?: number[][];
    fontSize?: number;
    currentColor: 'W' | 'B';
}

interface BoardStates {
    variationStates: (Variation | undefined)[][];
    branchStates: (BranchState | undefined)[][];
    highestWinrateVariationOffset?: { x: number, y: number };
}

export default class Board extends React.Component<BoardProps, BoardStates> {

    static readonly alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

    static cartesianCoordToArrayPosition(x: number, y: number, size = 19) {
        return { x: size - x, y: y - 1 };
    }

    static cartesianCoordToString(x: number, y: number) {
        return `${Board.alphabets[y - 1]}${x}`;
    }

    static stringToCartesianCoord(coord: string) {
        let alphabet = coord[0];
        let y = Board.alphabets.indexOf(alphabet) + 1;
        let x = Number.parseInt(coord.substr(1));
        return { x, y };
    }

    static stringToArrayPosition(coord: string) {
        let cartesian = Board.stringToCartesianCoord(coord);
        return Board.cartesianCoordToArrayPosition(cartesian.x, cartesian.y);
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
        let { x, y } = Board.cartesianCoordToArrayPosition(row, col);
        let branch = this.state.variationStates[x][y];
        if (!branch) return;
        if (!branch.variation || branch.variation.length === 0) return;

        let currColor = this.props.currentColor;

        branch.variation.forEach((value, i) => {
            let { x, y } = Board.stringToArrayPosition(value);
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
            let arrayOffset = Board.cartesianCoordToArrayPosition(position.x, position.y);
            this.state.variationStates[arrayOffset.x][arrayOffset.y] = v;
        });

        let hightest = varitations[0];
        if (!hightest) {
            this.forceUpdate();
            return;
        }

        let pos = Board.stringToCartesianCoord(varitations[0].variation[0]);
        let offset = Board.cartesianCoordToArrayPosition(pos.x, pos.y);
        this.setState({ highestWinrateVariationOffset: offset });
    }

    clearVariations() {
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

        this.forceUpdate();
    }

    render() {
        const size = 100.0 / this.props.size;
        const dimension = this.props.size;

        const boardParent = document.getElementById('smartboard');
        const gridWidth = boardParent ? boardParent.getBoundingClientRect().height * (size / 100.0) : 0;
        const top = gridWidth / 2 - 6.25;

        const gridLineColor = this.props.style ? this.props.style.gridColor : undefined;

        return (
            <div id={this.props.id} style={this.props.style} draggable={false}>

                <div style={{ background: this.props.style ? (this.props.style.background || '') : '', padding: 4, paddingBottom: `${0.6 + size}%`, }}>

                    {this.props.states.map((row, i) => (
                        <div style={{ clear: 'both', height: `${size}%`, position: 'relative' }} key={i} >
                            {this.props.showCoordinate ? <div style={{ position: 'absolute', left: 0, top: top, bottom: 0, fontSize: 8, fontWeight: 100, color: '#cccccc80', }}>{19 - i}</div> : undefined}

                            {row.map((state, j) => (
                                <div key={`${i},${j}`}>
                                    {this.props.showCoordinate && i === (this.props.size - 1) ?
                                        <div style={{ position: 'absolute', bottom: 0, left: top + 2 + j * (gridWidth - 2.52), fontSize: 8, fontWeight: 100, color: '#cccccc80', top: top + 12 }}>
                                            {'ABCDEFGHJKLMNOPQRST'[j]}
                                        </div>
                                        : undefined
                                    }

                                    <Intersection
                                        onClick={(r, c) => this.onClick(r, c)}
                                        style={{ color: gridLineColor, whiteStoneColor: this.props.style ? this.props.style.whiteStoneColor : 'white', blackStoneColor: this.props.style ? this.props.style.blackStoneColor : 'black' }}
                                        key={j}
                                        row={19 - i}
                                        col={j + 1}
                                        lineThickness={2}
                                        disabled={this.props.disabled}
                                        highlight={this.props.hightlightCoord && i === (this.props.size - this.props.hightlightCoord.x) && j === this.props.hightlightCoord.y - 1}
                                        width={size}
                                        state={state === State.Empty ? (this.state.branchStates[i][j] ? this.state.branchStates[i][j]!.state : state) : state}
                                        topEdge={i === 0}
                                        bottomEdge={i === dimension - 1}
                                        leftEdge={j === 0}
                                        rightEdge={j === dimension - 1}
                                        star={[3, dimension - 4, (dimension - 1) / 2].indexOf(i) >= 0 && [3, dimension - 4, (dimension - 1) / 2].indexOf(j) >= 0}
                                        highlightSize={gridWidth > 25 ? 'large' : 'small'}
                                        heatmap={this.props.heatmap ? this.props.heatmap[i][j] : 0}
                                        winrate={this.state.variationStates[i][j] ? {
                                            value: Number.parseFloat(this.state.variationStates[i][j]!.stats.W),
                                            visits: this.state.variationStates[i][j]!.visits,
                                            highest: this.state.highestWinrateVariationOffset ? this.state.highestWinrateVariationOffset.x === i && this.state.highestWinrateVariationOffset.y === j : false,
                                        } : undefined}
                                        fontSize={this.props.fontSize}
                                        onVariationHover={(row, col) => this.onVariationHover(row, col)}
                                        onVariationHoverLeave={(row, col) => this.clearBranchStates()}
                                        moveNumber={this.state.branchStates[i][j] ? this.state.branchStates[i][j]!.moveNumber : undefined}
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