import * as React from 'react';
import Modal from 'react-modal';
import Stone from '../components/Stone';
import * as constants from '../common/Constants';
import i18n from '../i18n';
import * as jQuery from 'jquery';
import { largeBox } from './Styles';
import './Styles.css';

interface AboutDialogProps {
    isOpen?: boolean;
    onOk?: () => void;
}

export default class AboutDialog extends React.Component<AboutDialogProps, any> {

    render() {
        return (
            <Modal isOpen={this.props.isOpen} style={largeBox}>
                <form className="uk-form-stacked" style={{ overflow: 'scroll', maxHeight: '90vh' }}>
                    <legend className="uk-legend">{i18n.dialogs.about.title} <span style={{ fontFamily: 'Questrial' }}>DeepLeela</span></legend>
                    <div className="uk-margin" style={{ fontWeight: 100 }}>
                        <p>{i18n.dialogs.about.text.p1} </p>
                        <p>{i18n.dialogs.about.text.p2} </p>
                        <p>{i18n.dialogs.about.text.p3} </p>
                    </div>

                    <div className="uk-margin">
                        <div className='coin-div uk-text-middle'>
                            <img src="https://github.com/cjdowner/cryptocurrency-icons/raw/master/128/color/btc.png" alt="Bitcoin" />
                            <span>1CmZ4D9b4cCYQzd6By5bnnpaSaznjGZnvd</span>
                        </div>
                        <div className='coin-div uk-text-middle'>
                            <img src="https://github.com/cjdowner/cryptocurrency-icons/raw/master/128/color/eth.png" alt="Ethereum" />
                            <span>0xd6a978a975402f3a62f10e25c404488d7fd054f2</span>
                        </div>
                        <div className='coin-div uk-text-middle'>
                            <img src="https://github.com/cjdowner/cryptocurrency-icons/raw/master/128/color/bch.png" alt="Bitcoin Cash" />
                            <span>1CmZ4D9b4cCYQzd6By5bnnpaSaznjGZnvd</span>
                        </div>
                        <div className='coin-div uk-text-middle'>
                            <img src="https://github.com/cjdowner/cryptocurrency-icons/raw/master/128/color/ltc.png" alt="Litcoin" />
                            <span>LZfiUWjNAbaFhuDPVdFL4nBDg48kKvFHiW</span>
                        </div>
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