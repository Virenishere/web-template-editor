import { Suspense } from "react";
import { BrowserRouter } from "react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import LoadingSpinner from "@/components/LoadingSpinner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
     <Suspense fallback={<LoadingSpinner />}>
      <App />
     </Suspense>
    </BrowserRouter>
  </StrictMode>
);
