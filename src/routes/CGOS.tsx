import * as React from 'react';
import CGOSClient, { Match } from '../common/CGOSClient';
import ThemeManager from '../common/ThemeManager';
import i18n from '../i18n';

export default class CGOS extends React.Component {

    matches: Match[] = [];
    client: CGOSClient;
    table: HTMLTableElement;

    componentDidMount() {
        this.client = CGOSClient.default;
        this.client.on('match', (match: Match) => {
            this.matches.unshift(match);
            this.forceUpdate();
        });

        this.table = document.getElementById('cgos-table') as HTMLTableElement;
    }

    render() {
        let dataSourceMarginLeft = this.table ? this.table.getBoundingClientRect().left + 12 : 25;
        return (
            <div style={{ width: '100%', height: '100%', minHeight: '87vh', overflow: 'hidden' }}>
                <div style={{ marginLeft: dataSourceMarginLeft, width: '100%', fontSize: 9, color: ThemeManager.default.logoColor }}>
                    Data Source: <a href="http://www.yss-aya.com/cgos/" target='_blank'>yss-aya.com/cgos</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', }}>
                    <div className='uk-overflow-auto' style={{ minWidth: '80%' }}>
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
                                {this.matches.map(m => {
                                    return (
                                        <tr className='uk-animation-fade' key={m.gameId} style={{ cursor: 'pointer', color: 'grey' }}>
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
            </div>
        );
    }
}