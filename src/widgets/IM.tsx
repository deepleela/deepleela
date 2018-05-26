import * as React from 'react';
import { CSSProperties } from 'react';
import * as jQuery from 'jquery';
import * as clipboard from 'clipboard';

interface Props {
    style?: CSSProperties;
    people?: number;
    onShareClick?: () => void;
}

export default class IM extends React.Component<Props, any> {

    root: HTMLDivElement;
    expanded = false;
    shrinkTimer: NodeJS.Timer;

    componentDidMount() {
        this.root = document.getElementById('room-messenger') as HTMLDivElement;
        let fx = - this.root.getBoundingClientRect().width + 68;
        let fy = Math.max(0, window.innerHeight - 50 - 52);
        jQuery('#room-messenger').css('left', fx).css('top', fy);
        new clipboard('.share');
    }

    expandSelf() {
        clearTimeout(this.shrinkTimer);
        if (this.expanded) return;

        let rect = this.root.getBoundingClientRect();
        jQuery('#room-messenger').animate({ left: 12, });
        this.expanded = true;
    }

    shrinkSelf(immediately = false) {
        clearTimeout(this.shrinkTimer);

        this.shrinkTimer = setTimeout(() => {
            let fx = - this.root.getBoundingClientRect().width + 68;
            jQuery('#room-messenger').animate({ left: fx });
            this.expanded = false;
        }, immediately ? 0 : 5000);
    }

    render() {
        return (
            <div id='room-messenger' style={this.props.style} onMouseEnter={e => this.expandSelf()} onClick={e => this.expanded ? this.shrinkSelf(true) : this.expandSelf()} onMouseLeave={e => this.shrinkSelf()} >

                <div className='blur shadow-controller' style={{ position: 'absolute', marginBottom: 12, height: 360, width: '100%', top: -370, }}>
                </div>

                <div className='blur shadow-controller' style={{ display: 'flex', justifyContent: 'space-around', padding: 1, paddingTop: 2, marginBottom: -1 }}>

                    <div className='touch' style={{ marginLeft: 8, paddingTop: 1, marginBottom: -1 }}>
                        <span uk-icon='icon: comment'></span>
                    </div>

                    <div className='touch' >
                        <span uk-icon='icon: receiver'></span>
                    </div>

                    <div className='touch share' data-clipboard-text={location.href}>
                        <span uk-icon='icon: social; ratio: 1.02'></span>
                    </div>

                    <div className='touch' style={{ marginRight: 8, pointerEvents: 'none' }}>
                        <span uk-icon='icon: users'></span>
                        <span className='inline-block' style={{ fontWeight: 800, marginLeft: 8, verticalAlign: 'bottom', fontSize: 15, paddingTop: 2 }}>{this.props.people || 0}</span>
                    </div>
                </div>
            </div >
        );
    }
}