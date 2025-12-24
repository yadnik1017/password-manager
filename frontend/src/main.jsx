import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b0b0f] transition-colors duration-500">
      <App />
    </div>
  </StrictMode>
);
