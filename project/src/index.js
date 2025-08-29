import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

window.addEventListener('submit', (e) => {
  // onSubmit 내부에서 preventDefault 하지 않은 폼이 있으면 여기 찍힙니다.
  console.log('[FORM SUBMIT]', {
    action: e.target?.getAttribute('action'),
    method: e.target?.getAttribute('method'),
    node: e.target,
  });
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
