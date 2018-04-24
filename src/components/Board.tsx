import * as React from 'react';
import { Intersection, State } from './Intersection';
import { CSSProperties } from 'react';

interface BoardProps {
    size: number;
    className?: string;
    id?: string;
    disabled?: boolean;
    onStonePlaced?: (row: number, col: number) => void,
    style?: CSSProperties & { boardColor?: string, gridColor?: string, whiteStoneColor?: string, blackStoneColor?: string };
}

interface BoardStates {
    states: State[][];
}

export default class Board extends React.Component<BoardProps, BoardStates> {

    static fromHumanCoord(x: number, y: number, size = 19) {
        return { x: size - y, y: x - 1 };
    }

    constructor(props: BoardProps, ctx: any) {
        super(props, ctx);

        // y, x
        let states: State[][] = [];
        for (let i = 0; i < props.size; i++) {
            states[i] = [];
            for (let j = 0; j < props.size; j++) {
                states[i].push(State.Empty);
            }
        }

        let coord = Board.fromHumanCoord(3, 3);
        states[coord.x][coord.y] = State.Black;
        states[0][0] = State.White;
        states[0][18] = State.White;
        this.state = { states };
    }

    private onClick(row: number, col: number) {
        console.log(row, col);
        if (this.props.onStonePlaced) this.props.onStonePlaced(row, col);
    }

    render() {
        const size = 100.0 / this.props.size;
        const dimension = this.props.size;

        return (
            <div className={this.props.className} id={this.props.id} style={this.props.style} draggable={false}>

                <div style={{ background: this.props.style ? (this.props.style.background || '') : '', padding: 4, paddingBottom: `${0.6 + size}%`, }}>

                    {this.state.states.map((row, i) => (
                        <div style={{ clear: 'both', height: `${size}%`, position: 'relative' }} key={i} >

                            {row.map((state, j) => (
                                <Intersection
                                    onClick={(r, c) => this.onClick(r, c)}
                                    style={{ color: this.props.style ? this.props.style.gridColor : undefined }}
                                    key={j}
                                    row={19 - i}
                                    col={19 - j}
                                    lineThickness={2}
                                    disabled={this.props.disabled}
                                    // highlight={i === this.state.lastPlacedPosition.row && j === this.state.lastPlacedPosition.col}
                                    width={size}
                                    state={state}
                                    topEdge={i === 0}
                                    bottomEdge={i === dimension - 1}
                                    leftEdge={j === 0}
                                    rightEdge={j === dimension - 1}
                                    star={[3, dimension - 4, (dimension - 1) / 2].indexOf(i) >= 0 && [3, dimension - 4, (dimension - 1) / 2].indexOf(j) >= 0} />
                            ))}

                        </div>
                    ))}

                </div>

            </div>
        );
    }
}