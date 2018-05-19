import * as React from 'react';
import Modal from 'react-modal';
import i18n from '../i18n';
import { littleBox, largeBox } from './Styles';
import UserPreferences from '../common/UserPreferences';

interface SGFDialogProps {
    sgf?: string;
    isOpen?: boolean;
    readOnly?: boolean;
    onOk?: (sgf?: string) => void;
    onCancel?: () => void;
}

interface SGFDialogStates {
    online?: boolean;
    reviewRoom?: string;
}

export default class SGFDialog extends React.Component<SGFDialogProps, SGFDialogStates>{

    textarea: HTMLTextAreaElement;
    state: SGFDialogStates = { online: false, reviewRoom: UserPreferences.reviewRoom };

    render() {

        return (
            <Modal isOpen={this.props.isOpen} style={largeBox} shouldCloseOnOverlayClick={true}>
                <form className="uk-form-stacked">
                    <legend className="uk-legend">{this.props.readOnly ? i18n.dialogs.sgf.export : i18n.dialogs.sgf.load}</legend>
                    <div className="uk-margin">
                        <textarea ref={e => this.textarea = e!} className="uk-textarea" placeholder="SGF" rows={12} style={{ resize: 'none' }} readOnly={this.props.readOnly} defaultValue={this.props.sgf} />
                    </div>

                    <div className='uk-margin'>
                        {
                            this.state.online ?
                                <div className={`uk-margin uk-animation-slide-top-small`}>
                                    <input className="uk-input" type="text" maxLength={64} placeholder="My Review Room" value={this.state.reviewRoom} onChange={e => { this.setState({ reviewRoom: e.target.value }); UserPreferences.reviewRoom = e.target.value; }} />
                                </div>
                                : undefined
                        }
                        <div className="uk-margin uk-grid-small uk-child-width-auto uk-grid">
                            <label><input className="uk-checkbox" type="checkbox" onChange={e => this.setState({ online: e.target.checked })} /> Online Mode</label>
                        </div>
                    </div>

                    <div style={{ height: 1, width: '100%', backgroundColor: '#eee', marginBottom: 12 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="uk-button uk-button-default" type="button" style={{ width: '49%', }} onClick={e => this.props.onCancel ? this.props.onCancel() : undefined}>
                            {i18n.button.cancel}
                        </button>
                        <button className="uk-button uk-button-primary" type="button" style={{ width: '49%', }} onClick={e => { this.props.onOk ? this.props.onOk(this.textarea.value) : undefined; this.setState({ online: false }) }}>
                            {i18n.button.ok}
                        </button>
                    </div>
                </form>
            </Modal>
        );
    }
}