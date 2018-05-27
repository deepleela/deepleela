import * as React from 'react';
import Modal from 'react-modal';
import i18n from '../i18n';
import { littleBox, largeBox } from './Styles';
import UserPreferences from '../common/UserPreferences';

interface SGFDialogProps {
    sgf?: string;
    isOpen?: boolean;
    readOnly?: boolean;
    onOk?: (sgf?: string, options?: SGFDialogStates) => void;
    onCancel?: () => void;
    showOnlineMode?: boolean;
}

export interface SGFDialogStates {
    online?: boolean;
    roomName?: string;
}

export default class SGFDialog extends React.Component<SGFDialogProps, SGFDialogStates>{

    textarea: HTMLTextAreaElement;
    state: SGFDialogStates = { online: false, roomName: UserPreferences.reviewRoom, };

    render() {

        return (
            <Modal isOpen={this.props.isOpen} style={largeBox} shouldCloseOnOverlayClick={true}>
                <form className="uk-form-stacked">
                    <legend className="uk-legend">{this.props.readOnly ? i18n.dialogs.sgf.export : i18n.dialogs.sgf.load}</legend>
                    <div className="uk-margin">
                        <textarea ref={e => this.textarea = e!} className="uk-textarea" placeholder="SGF" rows={12} style={{ resize: 'none' }} readOnly={this.props.readOnly} defaultValue={this.props.sgf} />
                    </div>

                    {
                        this.props.showOnlineMode ?
                            <div>
                                <div className='uk-margin'>
                                    <div className="uk-margin uk-grid-small uk-child-width-auto uk-grid">
                                        <label><input className="uk-checkbox" type="checkbox" onChange={e => this.setState({ online: e.target.checked })} /> {i18n.dialogs.sgf.onlineMode}</label>
                                    </div>
                                </div>
                            </div>
                            : undefined
                    }

                    <div style={{ height: 1, width: '100%', backgroundColor: '#eee', marginBottom: 12 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="uk-button uk-button-default" type="button" style={{ width: '49%', }} onClick={e => this.props.onCancel ? this.props.onCancel() : undefined}>
                            {i18n.button.cancel}
                        </button>
                        <button className="uk-button uk-button-primary" type="button" style={{ width: '49%', }} onClick={e => { this.props.onOk ? this.props.onOk(this.textarea.value, this.state) : undefined; this.setState({ online: false }) }}>
                            {i18n.button.ok}
                        </button>
                    </div>
                </form>
            </Modal>
        );
    }
}