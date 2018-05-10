import * as React from 'react';
import { CSSProperties } from 'react';

interface StoneProps {
    style: CSSProperties;
    highlight?: boolean;
    highlightSize?: number;
}

export default class Stone extends React.Component<StoneProps, any> {

    render() {
        let margin = '0%';
        return (
            <div style={Object.assign({
                backgroundColor: this.props.style.color,
                borderRadius: '50%',
                position: 'absolute',
                margin: '6%',
                top: margin, right: margin, bottom: margin, left: margin,
                pointerEvents: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center'
            } as CSSProperties, this.props.style)}>
                {
                    this.props.highlight ? <div style={{ width: this.props.highlightSize || 5, height: this.props.highlightSize || 5, borderRadius: '50%', background: 'deeppink', opacity: 0.75 }}></div> : undefined
                }
            </div>
        );
    }
}