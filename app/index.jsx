import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
// import Upload from './components/Upload';
import Test from './components/Test';

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
    <Test />
  </AppContainer>,
  document.getElementById('app')
);
