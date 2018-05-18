import * as React from 'react';
import SmartGoBoard from '../widgets/SmartGoBoard';

export default class OnlineReivew extends React.Component {

    smartboard: SmartGoBoard;

    render() {
        let isLandscape = window.innerWidth > window.innerHeight;
        let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 7.5) : 100;

        return (
            <div style={{ width: '100%', height: '100%', }}>
                <div style={{ width: `${width}%`, height: '100%', margin: 'auto', marginTop: -8, minHeight: window.innerHeight - 96 }}>
                    <SmartGoBoard id='smartboard' ref={e => this.smartboard = e!} />
                </div>
            </div>
        );
    }
}