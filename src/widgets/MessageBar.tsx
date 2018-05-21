import * as React from 'react';
import { CSSProperties } from 'react';

interface Props {
    style?: CSSProperties;
    text?: string;
}

export default class MessageBar extends React.Component<Props, any> {

    private lastText?: string;

    render() {
        this.lastText = this.props.text || this.lastText;

        return (
            <div style={Object.assign({ padding: 12, position: 'relative' }, this.props.style)} className='shadow-controller' >
                {this.lastText}
            </div>
        );
    }
}