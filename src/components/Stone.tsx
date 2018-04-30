import * as React from 'react';
import { CSSProperties } from 'react';

interface StoneProps {
    style: CSSProperties;
}

export default class Stone extends React.Component<StoneProps, any> {

    render() {
        let margin = '6.25%';
        return (
            <div style={Object.assign({
                backgroundColor: this.props.style.color,
                borderRadius: '50%',
                position: 'absolute',
                top: margin, right: margin, bottom: margin, left: margin,
                pointerEvents: 'none',
            }, this.props.style)} />
        );
    }
}