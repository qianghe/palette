import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
// import Upload from './components/Upload';
import Map from './components/Map';

// const renderCom = App => {
//   render(
//     <AppContainer>
//       <App />
//     </AppContainer>,
//     document.getElementById('app')
//   );
// }
//
// renderCom(Map);
//
// if (module.hot) {
//   module.hot.accept('./components/Upload', () => { renderCom(Upload); })
// }

render(
  <AppContainer>
    <Map />
  </AppContainer>,
  document.getElementById('app')
);
