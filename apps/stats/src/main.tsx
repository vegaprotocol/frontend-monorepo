import React from 'react';
import './styles/styles.css';
import App from './app';
import reportWebVitals from './report-web-vitals';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
const root = rootElement && createRoot(rootElement);

root?.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
