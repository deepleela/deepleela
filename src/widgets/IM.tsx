import * as React from 'react';
import { CSSProperties } from 'react';
import * as jQuery from 'jquery';

interface Props {
    style?: CSSProperties;
    people?: number;
}

export default class IM extends React.Component<Props, any> {

    root: HTMLDivElement;

    componentDidMount() {
        this.root = document.getElementById('room-messenger') as HTMLDivElement;
        let fx = - this.root.getBoundingClientRect().width + 68;
        let fy = Math.max(0, window.innerHeight - 50 - 52);
        jQuery('#room-messenger').css('left', fx).css('top', fy);
    }

    render() {
        return (
            <div id='room-messenger' className='shadow-controller' style={this.props.style}>

                <div style={{ display: 'flex', justifyContent: 'space-around', padding: 1 }}>

                    <div className='touch'>

                    </div>

                    <div>

                    </div>

                    <div className='touch' style={{ marginRight: 8 }}>
                        <span uk-icon='icon: users'></span>
                        <span className='inline-block' style={{ fontWeight: 800, marginLeft: 8, verticalAlign: 'bottom', fontSize: 15, paddingTop: 2 }}>{this.props.people || 0}</span>
                    </div>
                </div>
            </div >
        );
    }
}