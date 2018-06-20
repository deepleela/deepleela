import * as React from 'react';
import { CSSProperties } from 'react';
import * as jQuery from 'jquery';
import BrowserHelper from '../components/BrowserHelper';
import { LineChart, Line, Tooltip, BarChart, Bar, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';
import { Variation } from '../components/Board';
import { Command, Response } from "@sabaki/gtp";
import { StoneColor } from '../common/Constants';
import Stone from '../components/Stone';
import * as constants from '../common/Constants';
import i18n from '../i18n';

type AnalysisItem = {
    value: number;
    step: number;
    color: StoneColor;
    delta: number;
    coord?: string;
    bestMove?: string;
    variations?: Variation[];
};

interface Props {
    show?: boolean;
    style?: CSSProperties;
    current?: number;
    onMovesRequest?: () => void;
    onCursorChange?: (step: number, item: AnalysisItem) => void;
}

interface PanelState {
    data: AnalysisItem[];
    moves: any[];
    analysing?: boolean;
    selectedColor: StoneColor;
    currentItem?: AnalysisItem;
}

const EmptyDiv = () => (<div />);

export default class AnalysisPanel extends React.Component<Props, PanelState> {

    static readonly url = process.env.NODE_ENV === 'production' ? 'https://analysis.deepleela.com' : 'http://localhost:3304';

    private root: JQuery<HTMLElement>;
    get open() { return this.root.height()! > 0; }
    state: PanelState = { data: [], selectedColor: 'B', moves: [] };

    componentDidMount() {
        this.root = jQuery('#analysis-panel');
        let ctrlBar = jQuery('#board-controller')!;

        setTimeout(() => {
            this.root.css('left', window.innerWidth - 12 - ctrlBar.width()!).css('top', ctrlBar.offset()!.top - 380).animate({ width: ctrlBar.width(), height: 0 })
        }, 500);

        this.close();
    }

    show() {
        this.root.animate({ height: 360, opacity: 1 }).css('pointer-events', 'all');
        if (this.state.analysing || this.state.data.length > 0) return;
        this.props.onMovesRequest && this.props.onMovesRequest();
    }

    close() {
        this.root.animate({ height: 0, opacity: 0 }).css('pointer-events', 'none');
    }

    toggle() {
        this.open ? this.close() : this.show();
    }

    async startAnalysing(data: { moves: [string, string][], komi: number, size: number }) {
        if (data.moves.length === 0) return;

        let steps: AnalysisItem[] = data.moves.map((item, index) => { return { step: index + 1, value: 0, color: item[0] as StoneColor, delta: 0, coord: item[1] } });

        steps[0].value = 46.7;
        steps[0].delta = 0;
        steps[0].bestMove = '';

        for (let i = 1; i <= (process.env.NODE_ENV === 'production' ? steps.length : 8); i++) {
            let moves = data.moves.slice(0, i);
            let genmove = moves[moves.length - 1][0] === 'B' ? 'W' : 'B';

            let res = await axios.post(`${AnalysisPanel.url}/analysis`, { moves, komi: data.komi, size: data.size, genmove });
            if (!res.data) continue;

            let variations = res.data.variations as Variation[];
            let move = Response.fromString(res.data.respstr as string);

            variations.forEach(v => {
                v.stats.W = Number.parseFloat(((Number.parseFloat(v.stats.W as any) / 100.0) * 100.0).toFixed(1));
                v.stats.U = Number.parseFloat(((Number.parseFloat(v.stats.U as any) / 100.0) * 100.0).toFixed(1));
            });

            let fake = variations.length === 0 ? 46.7 + 3.3 * Math.random() : 1;
            let bestWinrate = (variations.length > 0 ? (variations[0].stats.W) : (genmove === 'B' ? fake : 100 - fake));
            let lastWinrate = 100 - bestWinrate;
            steps[i - 1].value = lastWinrate;
            steps[i - 1].delta = lastWinrate - steps[i - 1].value;
            steps[i].value = bestWinrate;
            steps[i].delta = variations.length === 0 ? 0 : bestWinrate - steps[i - 1].value;
            steps[i].bestMove = variations.length === 0 ? '' : variations[0].variation[0].split(' ')[0];
            steps[i].variations = variations;

            this.setState({ data: Array.from(steps.filter(i => i.color === this.state.selectedColor)), moves: steps });
        }
    }

    private switchColor(color: StoneColor) {
        this.setState({ selectedColor: color, data: this.state.moves.filter(i => i.color === color) });
    }

    private handleCursorMove(item: AnalysisItem) {
        this.setState({ currentItem: item });
        this.props.onCursorChange && this.props.onCursorChange(item.step, item);
    }

    render() {
        return (
            <div id='analysis-panel' className={`blur shadow-controller`} style={Object.assign({ background: `rgba(255,255,255,${BrowserHelper.isChrome ? 0.95 : 0.15})`, paddingTop: 8 }, this.props.style)}>
                {
                    this.state.data.length > 0 ?
                        <BarChart width={this.root ? this.root.width() : 0} height={250} data={this.state.data}>
                            <CartesianGrid vertical={false} verticalPoints={[0, 50, 100]} />
                            <YAxis type="number" domain={[0, 100]} hide />
                            <Bar type="monotone" dataKey="value" fill="#222" onMouseMove={e => this.handleCursorMove(e)} />
                            <Tooltip content={<EmptyDiv />} cursor={{ fill: 'rgba(255, 255, 255, 0.8)' }} />
                        </BarChart>
                        : undefined
                }

                <div style={{ fontSize: 12, display: 'flex', }}>
                    <div style={{ display: 'flex', alignItems: 'center', alignContent: 'center', opacity: this.state.selectedColor === 'B' ? 1 : 0.25, cursor: 'pointer', }} onClick={e => this.switchColor('B')}>
                        <div className='inline-block' style={{ width: 12, height: 12, position: 'relative', marginRight: 2, marginLeft: 4, }}>
                            <Stone style={{ color: constants.BlackStoneColor }} />
                        </div>
                        <span style={{}}>{i18n.analysis.black}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', alignContent: 'center', opacity: this.state.selectedColor === 'W' ? 1 : 0.25, cursor: 'pointer', }} onClick={e => this.switchColor('W')}>
                        <div className='inline-block' style={{ width: 12, height: 12, position: 'relative', marginRight: 2, marginLeft: 8, }}>
                            <Stone style={{ color: constants.WhiteStoneColor }} />
                        </div>
                        <span style={{}}>{i18n.analysis.white}</span>
                    </div>
                </div>

                {
                    this.state.currentItem ?
                        <div style={{ fontSize: 13, marginLeft: 4, marginTop: 8 }}>
                            <div>
                                {i18n.analysis.winrate}: {`${this.state.currentItem.value.toFixed(2)}%`}
                            </div>
                            <div>
                                {i18n.analysis.delta}: {this.state.currentItem.delta ? `${this.state.currentItem.delta.toFixed(2)}%` : 'NaN'}
                            </div>
                            <div>
                                {i18n.analysis.yourMove}: {`${this.state.currentItem.coord}`}
                            </div>
                            <div>
                                {i18n.analysis.bestMove}: {`${this.state.currentItem.bestMove}`}
                            </div>
                        </div>
                        : undefined
                }

            </div>
        );
    }
}