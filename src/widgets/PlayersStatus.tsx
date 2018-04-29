import * as React from 'react';
import * as constants from '../common/Constants';
import Board from '../components/Board';
import Stone from '../components/Stone';
import i18n from '../i18n';

interface PlayerStatusProps {
    width: string;
    blackPlayer?: string;
    whitePlayer?: string;
}

export default class PlayerStatus extends React.Component<PlayerStatusProps, {}> {

    render() {
        return (
            <div style={{ display: 'flex', width: this.props.width, margin: 'auto', fontSize: 14, justifyContent: 'space-between', pointerEvents: 'none', }}>
                <div style={{ marginLeft: 32, paddingTop: 4, display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                    <div style={{ position: 'relative', width: 16, height: 16, marginRight: 4, marginTop: -2 }}>
                        <Stone style={{ color: constants.BlackStoneColor, }} />
                    </div>
                    <span>{this.props.blackPlayer || '---'}</span>
                </div>

                <div style={{ marginRight: 32, paddingTop: 4, display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                    <div style={{ position: 'relative', width: 16, height: 16, marginRight: 4, marginTop: -2 }}>
                        <Stone style={{ color: constants.WhiteStoneColor, }} />
                    </div>
                    <span>{this.props.whitePlayer || '---'}</span>
                </div>
            </div>
        );
    }
}