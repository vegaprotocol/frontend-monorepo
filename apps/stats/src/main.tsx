import React from 'react';
import './styles/styles.css';
import App from './app';
import reportWebVitals from './report-web-vitals';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
// React docs: createRoot(container!) if we use TypeScript
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
