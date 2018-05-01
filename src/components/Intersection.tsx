import * as React from 'react';
import { CSSProperties } from 'react';
import Stone from './Stone';
import './Styles.css';

interface IntersectionProps {
    width: number;
    lineThickness?: number;
    onClick: (row: number, col: number) => void;
    onMouseEnter?: (row: number, col: number) => void;
    onMouseLeave?: (row: number, col: number) => void;
    state: State;
    star: boolean;
    disabled?: boolean;
    highlight?: boolean;
    rightEdge?: boolean;
    leftEdge?: boolean;
    topEdge?: boolean;
    bottomEdge?: boolean;
    row: number;
    col: number;
    style?: CSSProperties & { whiteStoneColor?: string, blackStoneColor?: string };
    highlightSize?: 'large' | 'small';
}

interface IntersectionStates {
    hover: boolean;
}

export enum State {
    White = -1,
    Empty = 0,
    Black = 1,
}

export default class Intersection extends React.Component<IntersectionProps, IntersectionStates> {

    constructor(props: IntersectionProps, ctx: any) {
        super(props, ctx);
        this.state = { hover: false };
    }

    private onMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
        if (this.props.disabled) return;
        if (this.props.onMouseEnter) this.props.onMouseEnter(this.props.row, this.props.col);
        this.setState({ hover: true });
    }

    private onMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
        this.setState({ hover: false });
    }

    private onClick(e: React.MouseEvent<HTMLDivElement>) {
        if (this.props.disabled) return;
        this.props.onClick(this.props.row, this.props.col);
    }

    render() {
        const gridColor = this.props.style ? (this.props.style.color || 'black') : 'black';
        const highlightSize = this.props.highlightSize === 'small' ? 4 : 8;

        return (

            <div style={{ float: 'left', lineHeight: 1, paddingTop: `${this.props.width}%`, width: `${this.props.width}%`, position: 'relative', textAlign: 'center' }}>

                {/* Vertical Grid Line */}
                <div style={{ pointerEvents: 'none', background: gridColor, height: this.props.lineThickness || 1, position: 'absolute', top: '50%', right: this.props.rightEdge ? '50%' : 0, left: this.props.leftEdge ? '50%' : 0, transform: 'translateY(-50%)' }} />

                {/* Horizontal Grid Line */}
                <div style={{ pointerEvents: 'none', background: gridColor, width: this.props.lineThickness || 1, position: 'absolute', left: '50%', top: this.props.topEdge ? '50%' : 0, bottom: this.props.bottomEdge ? '50%' : 0, transform: 'translateX(-50%)' }} />

                {/* Star Point */}
                {this.props.star ? <div style={{ pointerEvents: 'none', background: 'lightgrey', borderRadius: '50%', height: 6, width: 6, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} /> : null}

                {/* Touch Surface */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0, 0, 0, 0)', border: this.state.hover && this.props.state === State.Empty ? '2px dashed rgba(0, 0, 0, 0.15)' : undefined, }} onMouseEnter={e => this.onMouseEnter(e)} onMouseLeave={e => this.onMouseLeave(e)} onClick={e => this.onClick(e)} />

                {this.props.row % 5 === 0 && this.props.col % 4 === 0 ?
                    <div className={'heatmap'} style={{
                        transform: 'scale(1.7)', width: '100%', height: '100%', position: 'absolute', zIndex: 1, pointerEvents: 'none',
                    }}></div> : undefined
                }

                {
                    this.props.state === State.Black ?
                        <Stone style={{ color: this.props.style ? (this.props.style.blackStoneColor || 'black') : 'black', zIndex: 2 }} /> :
                        this.props.state === State.White ?
                            <Stone style={{ color: this.props.style ? (this.props.style.whiteStoneColor || 'white') : 'white', zIndex: 2 }} /> : undefined
                }

                {/* ${this.props.state === State.Black ? 'white' : 'black'} */}
                {this.props.highlight ? <div style={{ pointerEvents: 'none', opacity: 0.7, background: `deeppink`, borderRadius: '50%', zIndex: 3, height: highlightSize, width: highlightSize, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} /> : null}

            </div>
        );
    }
}