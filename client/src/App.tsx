// App.tsx
import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import EditorPage from "./pages/EditorPage";
import { TemplateLibrary } from "./components/TemplateLibrary";
import { TemplatePreview } from "./components/TemplatePreview";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Toaster position="bottom-right" theme="dark" richColors />
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/templates" element={<TemplateLibrary />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/preview/:id" element={<TemplatePreview />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;