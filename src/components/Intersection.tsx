import * as React from 'react';
import { CSSProperties } from 'react';
import Stone from './Stone';
import './Styles.css';

export interface WinRate {
    value: number;
    fontSize?: number;
    visits: number;
    highest?: boolean;
}

interface IntersectionProps {
    width: number;
    lineThickness?: number;
    onClick: (row: number, col: number) => void;
    onMouseEnter?: (row: number, col: number) => void;
    onMouseLeave?: (row: number, col: number) => void;
    onVariationHover?: (row: number, col: number) => void;
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
    heatmap?: number;
    winrate?: WinRate;
    moveNumber?: number;
}

interface IntersectionStates {
    hover: boolean;
}

export enum State {
    White = -1,
    Empty = 0,
    Black = 1,
}

// http://www.surfingsuccess.com/javascript/javascript-browser-detection.html#.WurdwdOFO34
const isSafari = navigator.userAgent.lastIndexOf('Safari/') > 0 && navigator.userAgent.lastIndexOf('Chrome/') < 0;

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
        const winrate = (this.props.winrate || {}) as WinRate;

        return (

            <div style={{ float: 'left', lineHeight: 1, paddingTop: `${this.props.width}%`, width: `${this.props.width}%`, position: 'relative', textAlign: 'center' }}>

                {/* Vertical Grid Line */}
                <div style={{ pointerEvents: 'none', background: gridColor, height: this.props.lineThickness || 1, position: 'absolute', top: '50%', right: this.props.rightEdge ? '50%' : 0, left: this.props.leftEdge ? '50%' : 0, transform: 'translateY(-50%)' }} />

                {/* Horizontal Grid Line */}
                <div style={{ pointerEvents: 'none', background: gridColor, width: this.props.lineThickness || 1, position: 'absolute', left: '50%', top: this.props.topEdge ? '50%' : 0, bottom: this.props.bottomEdge ? '50%' : 0, transform: 'translateX(-50%)' }} />

                {/* Star Point */}
                {this.props.star ? <div style={{ pointerEvents: 'none', background: 'lightgrey', borderRadius: '50%', height: 6, width: 6, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', }} /> : null}

                {/* Touch Surface */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0, 0, 0, 0)', border: this.state.hover && this.props.state === State.Empty ? '2px dashed rgba(0, 0, 0, 0.15)' : undefined, }} onMouseEnter={e => this.onMouseEnter(e)} onMouseLeave={e => this.onMouseLeave(e)} onClick={e => this.onClick(e)} />

                {/* Heatmap */}
                <div className={isSafari ? 'heatmap-safari' : 'heatmap'} style={{ transform: `scale(1.${this.props.heatmap || 0})`, opacity: this.props.heatmap && this.props.heatmap > 0 && !this.props.winrate ? 0.5 + (this.props.heatmap || 0) / 20 : 0, width: '100%', height: '100%', position: 'absolute', zIndex: 1, top: 0, left: 0, pointerEvents: 'none', transition: 'all 0.5s', }} />

                {/* Winrate */}
                <div uk-tooltip={this.props.winrate ? `${this.props.winrate.visits} Visits` : undefined} style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, fontSize: winrate.fontSize || 10, background: 'transparent', opacity: this.props.state !== State.Empty ? 0 : winrate.value ? 1 : 0, transition: 'all 0.5s', zIndex: 2 }} onMouseEnter={e => this.onMouseEnter(e)} onMouseLeave={e => this.onMouseLeave(e)} onClick={e => this.onClick(e)} onMouseOver={e => this.props.winrate && this.props.onVariationHover ? this.props.onVariationHover(this.props.row, this.props.col) : undefined}>
                    <div className={this.props.winrate && this.props.winrate.highest ? 'winrate-high' : 'winrate'} style={{ marginLeft: '4%', marginTop: '5%', borderRadius: '50%', width: '85%', height: '85%', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', }}>
                        {winrate.value ? winrate.value.toFixed(1) : undefined}
                    </div>
                </div>

                {
                    this.props.state === State.Black ?
                        <Stone style={{ color: this.props.style ? (this.props.style.blackStoneColor || 'black') : 'black', zIndex: 2 }} /> :
                        this.props.state === State.White ?
                            <Stone style={{ color: this.props.style ? (this.props.style.whiteStoneColor || 'white') : 'white', zIndex: 2 }} /> : undefined
                }

                {/* Move Number */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 12, pointerEvents: 'none', color: this.props.state === State.Black ? 'white' : 'black', zIndex: 3, fontWeight: 800, }}>
                    {this.props.moveNumber}
                </div>

                {/* ${this.props.state === State.Black ? 'white' : 'black'} */}
                {this.props.highlight ? <div style={{ pointerEvents: 'none', opacity: 0.7, background: `deeppink`, borderRadius: '50%', zIndex: 3, height: highlightSize, width: highlightSize, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} /> : null}

            </div>
        );
    }
}