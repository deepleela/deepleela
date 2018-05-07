import * as React from 'react';
import * as jQuery from 'jquery';
import * as interactjs from 'interactjs';
import './Styles.css'
import { Interactable } from 'interactjs';
import i18n from '../i18n';
import SGF from '../common/SGF';
import { State } from '../components/Intersection';
import { CSSProperties } from 'react';
import { StoneColor } from '../common/Constants';

interface BoardControllerProps {
    style?: CSSProperties;
    onAIThinkingClick?: () => void;
    onSnapshotChange?: (snapshot: State[][], coord: { x: number, y: number }, currentColor: StoneColor) => void;
}

export default class BoardController extends React.Component<BoardControllerProps, {}> {

    private snapshots: State[][][];
    private coords: { x: number, y: number }[];
    private stonesColor: StoneColor[];
    currentIndex = 0;

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
        this.reset();

        try {
            let tree = SGF.import(sgf);
            this.snapshots = tree.snapshots;
            this.coords = tree.coords;
            this.stonesColor = tree.stonesColor;
            return tree;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    reset() {
        this.snapshots = [];
        this.coords = [];
        this.stonesColor = [];
        this.currentIndex = 0;
    }

    private triggerSnapshotChange(index: number) {
        if (!this.props.onSnapshotChange) return;
        let snapshot = this.snapshots[index];
        this.props.onSnapshotChange(snapshot, this.coords[index], this.stonesColor[index]);
    }

    render() {
        return (
            <div id='board-controller' style={this.props.style} className='board-controller'>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', alignContent: 'center', background: 'rgba(255, 255, 255, 0.5)', userSelect: 'none', backdropFilter: 'blur(25px)' }}>
                    <div id='draggable-handler'>
                        <span uk-icon='icon: more-vertical; ratio: 1' style={{ display: 'inline-block', paddingLeft: 10 }}></span>
                    </div>
                    <div className='touch' data-message={i18n.tips.first} onClick={e => this.triggerSnapshotChange(this.currentIndex = 0)}>
                        <span uk-icon='icon:  chevron-left; ratio: 1;'></span>
                        <span uk-icon='icon:  chevron-left; ratio: 1.2' style={{ display: 'inline-block', marginLeft: -16 }}></span>
                    </div>
                    <div className='touch' style={{ paddingTop: 2 }} data-message={i18n.tips.previous} onClick={e => this.triggerSnapshotChange(Math.max(0, this.currentIndex = this.currentIndex - 1 < 0 ? 0 : this.currentIndex - 1))}>
                        <span uk-icon='icon: arrow-left; ratio: 1.35'></span>
                    </div>
                    <div className='touch' data-message={i18n.tips.aithingking} onClick={e => this.props.onAIThinkingClick ? this.props.onAIThinkingClick() : undefined}>
                        <span style={{ fontWeight: 100, fontSize: 19, marginTop: 2, display: 'block' }}>AI</span>
                    </div>
                    <div className='touch' style={{ paddingTop: 2 }} data-message={i18n.tips.next} onClick={e => this.triggerSnapshotChange(Math.min(this.currentIndex = this.currentIndex + 1 === this.snapshots.length ? this.currentIndex : this.currentIndex + 1, this.snapshots.length - 1))}>
                        <span uk-icon='icon: arrow-right; ratio: 1.35'></span>
                    </div>
                    <div className='touch' data-message={i18n.tips.last} onClick={e => this.triggerSnapshotChange(this.currentIndex = this.snapshots.length - 1)}>
                        <span uk-icon='icon:  chevron-right; ratio: 1.2' style={{ display: 'inline-block', marginRight: -16 }}></span>
                        <span uk-icon='icon:  chevron-right; ratio: 1'></span>
                    </div>
                </div>
            </div>
        );
    }
}