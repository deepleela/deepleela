import * as React from 'react';
import * as jQuery from 'jquery';
import * as interactjs from 'interactjs';
import './Styles.css'
import { Interactable } from 'interactjs';

interface BoardControllerProps extends React.HTMLProps<HTMLDivElement> {

}

export default class BoardController extends React.Component<BoardControllerProps, {}> {

    componentDidMount() {

        // let dragging = false;
        // jQuery('#draggable-handler').on('mousedown', e => {
        //     dragging = true;
        // }).on('mouseup', e => {
        //     dragging = false;
        // }).on('mousemove', e => {
        //     // if (!dragging) return;
        //     let left = e.clientX! - e.offsetX! + 10;
        //     let top = e.clientY! - e.offsetY!;
        //     console.log(e.clientX, e.offsetX)
        //     jQuery('#board-controller').css('left', left).css('top', top);

        // });


        interactjs('#draggable-handler').draggable({
            onmove: e => {
                console.log('client', e.clientX, e.clientY);
                console.log('page', e.pageX, e.pageY);
                jQuery('#board-controller').css('top', e.clientY).css('left', e.clientX);
            }
        });
    }

    render() {
        return (
            <div id='board-controller' {...this.props}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', alignContent: 'center', background: 'rgba(255, 255, 255, 0.8)', userSelect: 'none', backdropFilter: 'blur(25px)' }}>
                    <div id='draggable-handler'>
                        <span uk-icon='icon: more-vertical; ratio: 1' style={{ display: 'inline-block', paddingLeft: 10 }}></span>
                    </div>
                    <div className='touch'>
                        <span uk-icon='icon:  chevron-left; ratio: 1'></span>
                        <span uk-icon='icon:  chevron-left; ratio: 1.2' style={{ display: 'inline-block', marginLeft: -16 }}></span>
                    </div>
                    <div className='touch'>
                        <span uk-icon='icon: arrow-left; ratio: 1.35'></span>
                    </div>
                    <div className='touch'>
                        <span style={{ fontWeight: 100 }}>AI</span>
                    </div>
                    <div className='touch'>
                        <span uk-icon='icon: arrow-right; ratio: 1.35'></span>
                    </div>
                    <div className='touch'>
                        <span uk-icon='icon:  chevron-right; ratio: 1.2' style={{ display: 'inline-block', marginRight: -16 }}></span>
                        <span uk-icon='icon:  chevron-right; ratio: 1'></span>
                    </div>
                </div>
            </div>
        );
    }
}