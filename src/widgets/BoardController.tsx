import * as React from 'react';
import * as jQuery from 'jquery';
import * as interactjs from 'interactjs';
import './Styles.css'
import { Interactable } from 'interactjs';
import i18n from '../i18n';
import SGF from '../common/SGF';

interface BoardControllerProps extends React.HTMLProps<HTMLDivElement> {
    onAIThinkingClick?: () => void;
    onFirstClick?: () => void;
    onLastClick?: () => void;
    onPreviousClick?: () => void;
    onNextClick?: () => void;
}

export default class BoardController extends React.Component<BoardControllerProps, {}> {

    componentDidMount() {
        const xKey = 'board-controller-x';
        const yKey = 'board-controller-y';

        let x = localStorage.getItem(xKey);
        let y = localStorage.getItem(yKey);
        if (x && y) {
            let fx = Math.min(Math.max(Number.parseFloat(x), 0), window.innerWidth - 290);
            let fy = Math.min(Math.max(Number.parseFloat(y), 0), window.innerHeight - 52);
            jQuery('#board-controller').css('left', fx).css('top', fy);
        }

        interactjs('#draggable-handler').draggable({
            onmove: e => {
                jQuery('#board-controller').css('top', Math.max(e.clientY, 0)).css('left', Math.max(e.clientX, 0));
            },
            onend: e => {
                localStorage.setItem(xKey, e.clientX.toString());
                localStorage.setItem(yKey, e.clientY.toString());
            },
        });
    }

    loadSgf(sgf: string) {
        try {
            let snapshots = SGF.import(sgf);
            return true;
        } catch{
            return false;
        }
    }

    render() {
        return (
            <div id='board-controller' {...this.props}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', alignContent: 'center', background: 'rgba(255, 255, 255, 0.25)', userSelect: 'none', backdropFilter: 'blur(25px)' }}>
                    <div id='draggable-handler'>
                        <span uk-icon='icon: more-vertical; ratio: 1' style={{ display: 'inline-block', paddingLeft: 10 }}></span>
                    </div>
                    <div className='touch' uk-tooltip={i18n.tips.first}>
                        <span uk-icon='icon:  chevron-left; ratio: 1; color: deepskyblue'></span>
                        <span uk-icon='icon:  chevron-left; ratio: 1.2' style={{ display: 'inline-block', marginLeft: -16 }}></span>
                    </div>
                    <div className='touch' style={{ paddingTop: 2 }} uk-tooltip={i18n.tips.previous}>
                        <span uk-icon='icon: arrow-left; ratio: 1.35'></span>
                    </div>
                    <div className='touch' uk-tooltip={i18n.tips.aithingking}>
                        <span style={{ fontWeight: 100, fontSize: 19, marginTop: 2, display: 'block' }}>AI</span>
                    </div>
                    <div className='touch' style={{ paddingTop: 2 }} uk-tooltip={i18n.tips.next}>
                        <span uk-icon='icon: arrow-right; ratio: 1.35'></span>
                    </div>
                    <div className='touch' uk-tooltip={i18n.tips.last}>
                        <span uk-icon='icon:  chevron-right; ratio: 1.2' style={{ display: 'inline-block', marginRight: -16 }}></span>
                        <span uk-icon='icon:  chevron-right; ratio: 1'></span>
                    </div>
                </div>
            </div>
        );
    }
}