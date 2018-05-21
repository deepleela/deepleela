import * as React from 'react';
import * as jQuery from 'jquery';
import './Styles.css';
import { CSSProperties } from 'react';
import ThemeManager from '../common/ThemeManager';

interface InputBoxProps {
    style?: CSSProperties;
    onSend?: (text: string) => void;
}

interface InputBoxStates {
    text: string;
}

export default class InputBox extends React.Component<InputBoxProps, InputBoxStates> {

    constructor(props: any, ctx: any) {
        super(props, ctx);
        this.state = { text: '' };
    }

    componentDidMount() {
        let fx = Math.max(0, 32);
        let fy = Math.max(0, window.innerHeight - 50 - 252);
        jQuery('#msg-input-box').css('left', fx).css('top', fy);
    }

    onSendClick() {
        if (!this.props.onSend || !this.state.text) return;
        this.props.onSend(this.state.text);
        this.setState({ text: '' });
    }

    render() {
        return (
            <div id='msg-input-box' className='shadow-controller' style={Object.assign({ padding: 12 }, this.props.style)}>
                <div style={{ fontSize: 12, color: 'black', display: 'block', marginBottom: 8 }}> Message: </div>
                <textarea cols={20} rows={6} style={{ border: 'none', background: 'none', fontSize: 20, outline: 'none' }} value={this.state.text} onChange={e => this.setState({ text: e.target.value })} />
                <div>
                    <button style={{ width: '100%', color: ThemeManager.default.blackStoneColor, borderColor: ThemeManager.default.blackStoneColor }} className="uk-button uk-button-default uk-button-small" onClick={e => this.onSendClick()}>Send</button>
                </div>
            </div>
        );
    }
}