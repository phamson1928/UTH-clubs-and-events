import * as React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// @ts-ignore: Cannot find module or type declarations for side-effect import of './index.css'.
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
