import * as React from 'react';
import { CSSProperties } from 'react';
import * as jQuery from 'jquery';
import BrowserHelper from '../components/BrowserHelper';
import { LineChart, Line, Tooltip } from 'recharts';

interface Props {
    show?: boolean;
    style?: CSSProperties;
}

let data: any[] = [];
for (let i = 0; i < 150; i++) {
    data.push({ step: i + 1, value: Math.random() * 10 });
}

export default class AnalysisPanel extends React.Component<Props, any> {

    private root: JQuery<HTMLElement>;
    get open() { return this.root.height()! > 0; }

    componentDidMount() {
        this.root = jQuery('#analysis-panel');
        let ctrlBar = jQuery('#board-controller')!;

        setTimeout(() => {
            this.root.css('left', window.innerWidth - 12 - ctrlBar.width()!).css('top', ctrlBar.offset()!.top - 372).animate({ width: ctrlBar.width(), height: 0 })
        }, 500);

        this.close();
    }

    show() {
        this.root.animate({ height: 360 });
    }

    close() {
        this.root.animate({ height: 0 });
    }

    toggle() {
        this.open ? this.close() : this.show();
    }



    render() {
        return (
            <div id='analysis-panel' className={`blur shadow-controller`} style={Object.assign({ background: `rgba(255,255,255,${BrowserHelper.isChrome ? 0.95 : 0.15})` }, this.props.style)}>
                <LineChart width={this.root ? this.root.width() : 0} height={250} data={data}>
                    <Line type="monotone" dataKey="value" stroke="#222" />
                    <Tooltip />
                </LineChart>
            </div>
        );
    }
}