import "@fontsource/im-fell-english/latin-400.css";
import "@fontsource-variable/atkinson-hyperlegible-next/wght.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
