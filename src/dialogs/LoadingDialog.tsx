import * as React from 'react';
import Modal from 'react-modal';
import Stone from '../components/Stone';
import * as constants from '../common/Constants';
import i18n from '../i18n';
import * as jQuery from 'jquery';
import { littleBox, tinyBox } from './Styles';
import './Styles.css';

interface LoadingDialogProps {
    isOpen?: boolean;
}

export default class LoadingDialog extends React.Component<LoadingDialogProps, any> {

    render() {
        return (
            <Modal isOpen={this.props.isOpen} style={tinyBox}>
                <div className="spinner">
                    <div className="dot1"></div>
                    <div className="dot2"></div>
                </div>
            </Modal>
        );
    }
}