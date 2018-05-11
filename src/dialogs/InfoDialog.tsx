import * as React from 'react';
import Modal from 'react-modal';
import Stone from '../components/Stone';
import * as constants from '../common/Constants';
import i18n from '../i18n';
import * as jQuery from 'jquery';
import { littleBox, largeBox } from './Styles';
import './Styles.css';

interface InfoDialogProps {
    isOpen?: boolean;
    title?: string;
    message?: string;
    onOk?: () => void;
}

export default class InfoDialog extends React.Component<InfoDialogProps, {}> {

    render() {
        return (
            <Modal isOpen={this.props.isOpen} style={largeBox}>
                <form className="uk-form-stacked">
                    <legend className="uk-legend">{this.props.title}</legend>
                    <div className="uk-margin">
                        <textarea className="uk-textarea" placeholder="Message" rows={12} style={{ resize: 'none' }} readOnly defaultValue={this.props.message} />
                    </div>

                    <div style={{ height: 1, width: '100%', backgroundColor: '#eee', marginBottom: 12 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="uk-button uk-button-primary" type="button" style={{ width: '100%', }} onClick={e => { this.props.onOk ? this.props.onOk() : undefined; }}>
                            {i18n.button.ok}
                        </button>
                    </div>
                </form>
            </Modal>
        );
    }
}