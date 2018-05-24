import * as React from 'react';
import CGOSClient, { Match } from '../common/CGOSClient';
import ThemeManager from '../common/ThemeManager';
import i18n from '../i18n';
import App from '../App';
import './Style.css';

let matches: Match[] = [];

export default class CGOS extends React.Component {

    client: CGOSClient = CGOSClient.default;
    table: HTMLTableElement;
    refreshTimer: NodeJS.Timer;

    componentDidMount() {
        this.client.init();
        this.client.on('match', (match: Match) => {
            if (matches.find(m => m.gameId === match.gameId)) {
                matches.splice(matches.findIndex(m => m.gameId === match.gameId), 1);
            }
            matches.unshift(match);
        });

        this.client.on('gameover', (gameover: { gameId: string, result: string }) => {
            let match = matches.find(m => m.gameId === gameover.gameId);
            if (!match) return;

            let now = new Date();
            match.date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDay().toString().padStart(2, '0')}`;
            match.time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            match.result = gameover.result;
        });

        this.table = document.getElementById('cgos-table') as HTMLTableElement;

        this.refreshTimer = setInterval(() => this.forceUpdate(), 3000);
    }

    componentWillUnmount() {
        clearInterval(this.refreshTimer);
    }

    render() {
        let tableWidth = this.table ? this.table.getBoundingClientRect().width : 0;
        return (
            <div style={{ width: '100%', height: '100%', minHeight: '87vh', overflow: 'hidden', position: 'relative' }}>

                <div style={{ display: 'flex', justifyContent: 'center', }}>
                    {
                        matches.length > 0 ?
                            undefined :
                            <div className='cgos-spinner' style={{ margin: 'auto', position: 'absolute', left: '50%', top: '45%', transform: 'translate(-50%, -50%)' }} />
                    }

                    <div className='uk-overflow-auto' style={{ minWidth: '80%', display: matches.length > 0 ? 'block' : 'none' }}>
                        <table id='cgos-table' className="uk-table uk-table-hover uk-table-divider uk-table-small " style={{ fontSize: 12, marginLeft: 14 }}>
                            <thead>
                                <tr>
                                    <th style={{ color: `${ThemeManager.default.logoColor}` }}>{i18n.cgos.black}</th>
                                    <th style={{ color: `${ThemeManager.default.logoColor}` }}>{i18n.cgos.white}</th>
                                    <th style={{ color: `${ThemeManager.default.logoColor}` }}>{i18n.cgos.date}</th>
                                    <th style={{ color: `${ThemeManager.default.logoColor}` }}>{i18n.cgos.time}</th>
                                    <th style={{ color: `${ThemeManager.default.logoColor}` }}>{i18n.cgos.result}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map(m => {
                                    return (
                                        <tr className='uk-animation-fade' key={m.gameId} style={{ color: 'grey', cursor: 'pointer', }} onClick={e => App.history.push(`/cgos/${m.gameId}`)}>
                                            <td>{m.blackPlayer}</td>
                                            <td>{m.whitePlayer}</td>
                                            <td>{m.date}</td>
                                            <td>{m.time}</td>
                                            <td>{m.result}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style={{ width: '100%', fontSize: 9, color: ThemeManager.default.logoColor, textAlign: 'right', marginTop: 4, display: matches.length > 0 ? 'block' : 'none' }}>
                    <span style={{ display: 'inline-block', marginRight: (window.innerWidth - tableWidth) / 2 }}>Data Source: <a href="http://www.yss-aya.com/cgos/" target='_blank'>yss-aya.com/cgos</a></span>
                </div>
            </div >
        );
    }
}