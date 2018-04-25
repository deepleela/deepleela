import * as React from 'react';
import Modal from 'react-modal';
import Stone from '../components/Stone';
import * as constants from '../common/Constants';


const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        minWidth: '270px',
        transform: 'translate(-50%, -50%)'
    }
};

interface NewGameDialogProps {

}

interface NewGameDialogStates {
    selectedColor: constants.StoneColor;
}

export default class NewGameDialog extends React.Component<NewGameDialogProps, NewGameDialogStates> {

    constructor(props: NewGameDialogProps, ctx: any) {
        super(props, ctx);
        this.state = { selectedColor: "B" };
    }

    render() {
        return (
            <Modal isOpen={true} style={customStyles} shouldCloseOnOverlayClick={true}>
                <form className="uk-form-stacked">
                    <legend className="uk-legend">New Game</legend>

                    <div className="uk-margin">
                        <label className="uk-form-label">Your Color:</label>
                        <div className="full-width" uk-form-custom="target: > * > span.selected-text">
                            <select style={{ width: '100%' }} onChange={e => this.setState({ selectedColor: e.target.value as constants.StoneColor })} defaultValue={this.state.selectedColor}>
                                <option value="B">Black</option>
                                <option value="W">White</option>
                            </select>
                            <button className="uk-button uk-button-default" type="button" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                                <Stone style={{ color: this.state.selectedColor == "B" ? constants.BlackStoneColor : constants.WhiteStoneColor, width: 18, height: 18, top: 0, right: 0, bottom: 0, left: 0, position: 'relative', margin: '0 4px' }} />
                                <span className="selected-text"></span>
                                <span uk-icon="icon: chevron-down"></span>
                            </button>
                        </div>
                    </div>

                    <div className="uk-margin">
                        <label className="uk-form-label">Komi:</label>
                        <div className="uk-form-controls">
                            <input className="uk-input" type="number" placeholder="6.5" />
                        </div>
                    </div>

                    <div className="uk-margin">
                        <label className="uk-form-label">Handicap:</label>
                        <div className="uk-form-controls">
                            <input className="uk-input" type="number" placeholder="0" max={9} />
                        </div>
                    </div>

                    <div className="uk-margin">
                        <label className="uk-form-label">Time (minutes):</label>
                        <div className="uk-form-controls">
                            <input className="uk-input" type="number" placeholder="200" />
                        </div>
                    </div>


                    <div style={{ height: 1, width: '100%', backgroundColor: '#eee', marginBottom: 12 }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="uk-button uk-button-default" type="button" style={{ width: '48%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            Cancel
                    </button>
                        <button className="uk-button uk-button-primary" type="button" style={{ width: '48%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            OK
                    </button>
                    </div>
                </form>
            </Modal>
        );
    }
}