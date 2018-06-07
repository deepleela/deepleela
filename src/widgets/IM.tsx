import * as React from 'react';
import { CSSProperties } from 'react';
import * as jQuery from 'jquery';
import * as clipboard from 'clipboard';
import 'rtcmulticonnection-v3';

export interface Message { isRoomOwner?: string, nickname?: string, message?: string }

interface Props {
    roomId: string;
    style?: CSSProperties;
    people?: number;
    onShareClick?: () => void;
    messages?: Message[];
    onMessage?: (msg: string) => void;
}

interface States {
    showChat?: boolean;
    enableAudio?: boolean;
}

const isChrome = navigator.userAgent.lastIndexOf('Chrome/') > 0;

export default class IM extends React.Component<Props, States> {

    root: HTMLDivElement;
    expanded = false;
    shrinkTimer: NodeJS.Timer;

    state: States = {};

    get isAudioAvailable() { return navigator.getUserMedia !== undefined; }

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

    audioConnection?: RTCMultiConnection;

    toggleAudio() {
        this.setState({ enableAudio: !this.state.enableAudio }, () => {
            if (this.state.enableAudio) return;
            if (!this.audioConnection) return;
            this.audioConnection.close();
            this.audioConnection = undefined;
        });

        if (this.audioConnection) return;

        let connection = this.audioConnection = new RTCMultiConnection();
        connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
        connection.socketMessageEvent = 'deepleela-review';

        connection.session = {
            audio: true,
            video: false
        };

        connection.mediaConstraints = {
            audio: true,
            video: false
        };

        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: false
        };

        connection.audiosContainer = document.getElementById('audios-container');

        connection.onstream = function (event) {
            var width = (connection.audiosContainer.clientWidth / 2) - 20;

            if (event.type === 'remote') connection.audiosContainer.appendChild(event.mediaElement);
            event.mediaElement.hidden = true;
            event.mediaElement.volume = event.type === 'local' ? 0 : 0.75;
            event.mediaElement.muted = event.type === 'local' ? true : false;

            setTimeout(function () {
                event.mediaElement.play();
            }, 3000);

            event.mediaElement.id = event.streamid;
        };

        connection.onstreamended = function (event) {
            connection.audiosContainer.removeChild(event.mediaElement);
        };

        connection.openOrJoin(this.props.roomId);
    }

    render() {
        return (
            <div id='room-messenger' style={this.props.style} onMouseEnter={e => this.expandSelf()} onClick={e => this.expanded ? this.shrinkSelf : this.expandSelf()} onMouseLeave={e => this.shrinkSelf()} >

                <div id='chat-box' className={`blur shadow-controller`} style={{ position: 'absolute', marginBottom: 12, height: 0, width: '100%', top: -370, background: 'rgba(255, 255, 255, 0.25)', fontSize: 14, pointerEvents: this.state.showChat ? undefined : 'none' }}>
                    <div id='chat-messages' style={{ margin: 12, opacity: 0, overflow: 'auto', height: 310, background: undefined }}>
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

                <div id='audios-container' style={{ marginBottom: 0 }}></div>

                <div className='blur shadow-controller' style={{ display: 'flex', justifyContent: 'space-around', padding: 1, paddingTop: 2, paddingBottom: 0, marginBottom: -1, background: 'rgba(255, 255, 255, 0.25)' }}>

                    <div className='touch' style={{ marginLeft: 8, paddingTop: 1, marginBottom: -1, color: this.isAudioAvailable ? (this.state.showChat ? 'deepskyblue' : undefined) : 'lightgrey', pointerEvents: this.isAudioAvailable ? undefined : 'none' }} onClick={e => this.toggleChatBox()}>
                        <span uk-icon='icon: comment'></span>
                    </div>

                    <div className='touch' onClick={e => this.toggleAudio()} style={{ color: this.state.enableAudio ? 'deepskyblue' : undefined }}>
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