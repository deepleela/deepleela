import * as React from 'react';
import { CSSProperties } from 'react';

interface StoneProps {
    style: CSSProperties;
}

export default class Stone extends React.Component<StoneProps, any> {

    render() {
        return (
            <div style={Object.assign({
                backgroundColor: this.props.style.color,
                borderRadius: '50%',
                position: 'absolute',
                top: '5%', right: '5%', bottom: '5%', left: '5%',
            }, this.props.style)} />
        );
    }
}