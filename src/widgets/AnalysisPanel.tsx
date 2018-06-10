import * as React from 'react';
import { CSSProperties } from 'react';
import * as jQuery from 'jquery';
import BrowserHelper from '../components/BrowserHelper';
import { LineChart, Line, Tooltip, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { Variation } from '../components/Board';
import { Command, Response } from "@sabaki/gtp";


interface Props {
    show?: boolean;
    style?: CSSProperties;
    current?: number;
    onMovesRequest?: () => void;
}

interface PanelState {
    data: any[];
    analysing?: boolean;
}

let data: any[] = [];
for (let i = 0; i < 150; i++) {
    data.push({ step: i + 1, value: Math.random() * 10 });
}

export default class AnalysisPanel extends React.Component<Props, PanelState> {

    static readonly url = process.env.NODE_ENV === 'production' ? 'https://analysis.deepleela.com' : 'http://localhost:3304';

    private root: JQuery<HTMLElement>;
    get open() { return this.root.height()! > 0; }
    state: PanelState = { data: [] };

    componentDidMount() {
        this.root = jQuery('#analysis-panel');
        let ctrlBar = jQuery('#board-controller')!;

        setTimeout(() => {
            this.root.css('left', window.innerWidth - 12 - ctrlBar.width()!).css('top', ctrlBar.offset()!.top - 372).animate({ width: ctrlBar.width(), height: 0 })
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

    async startAnalysing(data: { moves: any[], komi: number, size: number }) {
        this.setState({ data: data.moves.map((item, index) => { return { step: index + 1, value: 0 } }) });

        for (let i = 1; i < 5; i++) {
            let moves = data.moves.slice(0, i);
            let genmove = data.moves[i][0] === 'B' ? 'W' : 'B';
            let res = await axios.post(`${AnalysisPanel.url}/analysis`, { moves, komi: data.komi, size: data.size, genmove });
            console.log(res.data);

            let variations = res.data.variations as Variation[];
            let move = Response.fromString(res.data.respstr as string);

        }
    }

    render() {
        return (
            <div id='analysis-panel' className={`blur shadow-controller`} style={Object.assign({ background: `rgba(255,255,255,${BrowserHelper.isChrome ? 0.95 : 0.15})` }, this.props.style)}>
                <BarChart width={this.root ? this.root.width() : 0} height={250} data={this.state.data}>
                    <Bar type="monotone" dataKey="value" fill="#222" />
                    <Tooltip />
                </BarChart>
            </div>
        );
    }
}