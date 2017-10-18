import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Upload from './components/Upload';


const renderCom = App => {
  render(
    <AppContainer>
      <App />
    </AppContainer>,
    document.getElementById('app')
  );
}

renderCom(Upload);

if (module.hot) {
  console.log('come in', module);
  module.hot.accept('./components/Upload', () => { renderCom(Upload); })
}
