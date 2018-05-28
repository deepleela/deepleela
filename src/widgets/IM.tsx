import * as React from 'react';
import { CSSProperties } from 'react';
import * as jQuery from 'jquery';
import * as clipboard from 'clipboard';

export interface Message { isRoomOwner?: string, nickname?: string, message?: string }

interface Props {
    style?: CSSProperties;
    people?: number;
    onShareClick?: () => void;
    messages?: Message[];
    onMessage?: (msg: string) => void;
}

interface States {
    showChat?: boolean;
}

const isChrome = navigator.userAgent.lastIndexOf('Chrome/') > 0;

export default class IM extends React.Component<Props, States> {

    root: HTMLDivElement;
    expanded = false;
    shrinkTimer: NodeJS.Timer;

    state: States = {};

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
        if (this.state.showChat) return;

        this.shrinkTimer = setTimeout(() => {
            let fx = - this.root.getBoundingClientRect().width + 68;
            jQuery('#room-messenger').animate({ left: fx });
            this.expanded = false;
        }, immediately ? 0 : 5000);
    }

    toggleChatBox() {
        this.setState({ showChat: !this.state.showChat }, () => { this.state.showChat ? clearTimeout(this.shrinkTimer) : this.shrinkSelf() });
        jQuery('#chat-box').animate({ height: this.state.showChat ? 0 : 360 });
        jQuery('#chat-messages').animate({ opacity: this.state.showChat ? 0 : 1 });
        jQuery('#chat-input').animate({ opacity: this.state.showChat ? 0 : 1 });
    }

    scrollMessages() {
        jQuery("#chat-messages").animate({ scrollTop: jQuery("#chat-messages").prop("scrollHeight") }, 1000);
    }

    shake() {
        if (!this.root) return;
        this.root.className = 'uk-animation-shake';
        setTimeout(() => this.root.className = '', 1000);
    }

    render() {
        return (
            <div id='room-messenger' style={this.props.style} onMouseEnter={e => this.expandSelf()} onClick={e => this.expanded ? this.shrinkSelf : this.expandSelf()} onMouseLeave={e => this.shrinkSelf()} >

                <div id='chat-box' className={`blur shadow-controller`} style={{ position: 'absolute', marginBottom: 12, height: 0, width: '100%', top: -370, background: 'rgba(255, 255, 255, 0.25)', fontSize: 14, pointerEvents: this.state.showChat ? undefined : 'none' }}>
                    <div id='chat-messages' style={{ margin: 12, opacity: 0, overflow: 'auto', height: 310, background: isChrome ? 'rgba(255, 255, 255, 0.5' : undefined }}>
                        {this.state.showChat && this.props.messages ?
                            this.props.messages.map((m, i) => {
                                return <div key={i}>
                                    <div style={{ fontSize: 10, color: 'grey' }}>{m.nickname ? m.nickname + ':' : undefined} </div>
                                    <div style={{ width: '100%' }}>{m.message}</div>
                                </div>
                            })
                            : undefined}
                    </div>
                    <input id='chat-input' type="text" style={{ position: 'absolute', opacity: 0, bottom: 6, left: 6, right: 6, fontSize: 14, outline: 'none', borderRadius: 0, boxShadow: 'none', width: isChrome ? 207 : undefined }} onKeyDown={e => {
                        if (e.keyCode !== 13 || !this.props.onMessage) return;
                        this.props.onMessage(e.currentTarget.value);
                        e.currentTarget.value = '';
                    }} />
                </div>

                <div className='blur shadow-controller' style={{ display: 'flex', justifyContent: 'space-around', padding: 1, paddingTop: 2, paddingBottom: 0, marginBottom: -1, background: 'rgba(255, 255, 255, 0.25)' }}>

                    <div className='touch' style={{ marginLeft: 8, paddingTop: 1, marginBottom: -1, color: this.state.showChat ? 'deepskyblue' : undefined }} onClick={e => this.toggleChatBox()}>
                        <span uk-icon='icon: comment'></span>
                    </div>

                    <div className='touch'>
                        <span uk-icon='icon: receiver'></span>
                    </div>

                    <div className='touch share' data-clipboard-text={location.href} onClick={e => UIkit.notification('Link copied!')} >
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