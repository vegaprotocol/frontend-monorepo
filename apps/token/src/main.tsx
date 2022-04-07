import "./index.scss";
import "@vegaprotocol/ui-toolkit/dist/style.css";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import React from "react";
import ReactDOM from "react-dom";

import packageJson from "../package.json";
import App from "./app";
import reportWebVitals from "./reportWebVitals";

const dsn = process.env.REACT_APP_SENTRY_DSN || false;
const environment = process.env.REACT_APP_ENV || "local";
const commit = process.env.COMMIT_REF || "local";
const branch = process.env.BRANCH || "unknown";

/* istanbul ignore next */
if (dsn) {
  Sentry.init({
    dsn,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 0.1,
    enabled: environment !== "local",
    environment,
    release: packageJson.version,
    beforeSend(event) {
      if (event.request?.url?.includes("/claim?")) {
        return {
          ...event,
          request: { ...event.request, url: event.request?.url.split("?")[0] },
        };
      }
      return event;
    },
  });

  Sentry.setTag("branch", branch);
  Sentry.setTag("commit", commit);
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
