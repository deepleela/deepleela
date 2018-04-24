import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import * as jQuery from 'jquery';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();

window['jQuery'] = jQuery;

['https://code.jquery.com/ui/1.12.1/jquery-ui.js', '/jquery.jfMagnify.min.js'].forEach(url => {
  let my_awesome_script = document.createElement('script');
  my_awesome_script.setAttribute('src', url);
  document.head.appendChild(my_awesome_script);
});
