import * as React from 'react';
import Modal from 'react-modal';
import i18n from '../i18n';
import { littleBox, largeBox } from './Styles';

interface SGFDialogProps {
    sgf?: string;
    isOpen?: boolean;
    readOnly?: boolean;
    onOk?: () => void;
    onCancel?: () => void;
}

export default class SGFDialog extends React.Component<SGFDialogProps, any>{

    render() {
        return (
            <Modal isOpen={this.props.isOpen} style={largeBox} shouldCloseOnOverlayClick={true}>
                <form className="uk-form-stacked">
                    <legend className="uk-legend">{this.props.readOnly ? i18n.dialogs.sgf.export : i18n.dialogs.sgf.load}</legend>
                    <div className="uk-margin">
                        <textarea className="uk-textarea" placeholder="SGF" rows={12} style={{ resize: 'none' }} readOnly={this.props.readOnly} />
                    </div>

                    <div style={{ height: 1, width: '100%', backgroundColor: '#eee', marginBottom: 12 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="uk-button uk-button-default" type="button" style={{ width: '49%', }} onClick={e => this.props.onCancel ? this.props.onCancel() : undefined}>
                            {i18n.button.cancel}
                        </button>
                        <button className="uk-button uk-button-primary" type="button" style={{ width: '49%', }} onClick={e => { this.props.onOk ? this.props.onOk() : undefined; }}>
                            {i18n.button.ok}
                        </button>
                    </div>
                </form>
            </Modal>
        );
    }
}