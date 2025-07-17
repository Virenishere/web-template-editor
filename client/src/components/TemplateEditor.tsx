import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Eye, Undo, Redo } from "lucide-react";
import Toolbar from "./Toolbar";
import { toast } from "sonner";
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  html: string;
  css: string;
  thumbnail: string;
}

interface TemplateEditorProps {
  template: Template;
  onBack: () => void;
  onSave: (template: Template) => void;
  onPreview: (template: Template) => void;
}

interface SelectedElement {
  element: HTMLElement;
  rect: DOMRect;
}

interface DraggableElement {
  id: string;
  position: { x: number; y: number };
}

function TemplateEditor({
  template,
  onBack,
  onSave,
  onPreview,
}: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<Template>(
    () =>
      template ?? {
        id: "",
        name: "",
        description: "",
        category: "",
        html: "<p>Edit me</p>",
        css: "body { background-color: #ffffff; }",
        thumbnail: "",
      }
  );
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [history, setHistory] = useState<Template[]>([template]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [draggableElements, setDraggableElements] = useState<DraggableElement[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  const updateTemplate = (updates: Partial<Template>) => {
    const newTemplate = { ...editedTemplate, ...updates };
    setEditedTemplate(newTemplate);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTemplate);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    toast({
      title: "Template Updated",
      description: "Changes have been applied to the template.",
    });
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditedTemplate(history[historyIndex - 1]);
      toast({
        title: "Undo",
        description: "Previous change has been undone.",
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditedTemplate(history[historyIndex + 1]);
      toast({
        title: "Redo",
        description: "Change has been redone.",
      });
    }
  };

  const handleElementClick = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const editableElements = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "DIV", "BUTTON", "A"];

    if (editableElements.includes(target.tagName)) {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      const rect = target.getBoundingClientRect();
      const iframeRect = iframe.getBoundingClientRect();

      if (iframeRect) {
        setSelectedElement({
          element: target,
          rect: {
            ...rect,
            top: rect.top + iframeRect.top + window.scrollY,
            left: rect.left + iframeRect.left + window.scrollX,
          } as DOMRect,
        });
        setShowToolbar(true);
        target.style.outline = "2px solid hsl(var(--editor-selected))";
        target.style.outlineOffset = "2px";
        toast({
          title: "Element Selected",
          description: `${target.tagName.toLowerCase()} element is ready for editing.`,
        });
      }
    }
  };

  const handleElementTextChange = (newText: string) => {
    if (selectedElement?.element) {
      selectedElement.element.textContent = newText;
      const iframe = iframeRef.current;
      if (iframe?.contentDocument) {
        updateTemplate({ html: iframe.contentDocument.body.innerHTML });
        toast({
          title: "Text Updated",
          description: "Element text has been updated.",
        });
      }
    }
  };

  const handleStyleChange = (property: string, value: string) => {
    if (selectedElement?.element) {
      selectedElement.element.style.setProperty(property, value);
      const iframe = iframeRef.current;
      if (iframe?.contentDocument) {
        updateTemplate({ html: iframe.contentDocument.body.innerHTML });
        toast({
          title: "Style Updated",
          description: `${property} has been updated to ${value}.`,
        });
      }
    }
  };

  const handleBackgroundChange = (color: string) => {
    const newCss = editedTemplate.css.replace(
      /body\s*{\s*background-color:[^;]*;/,
      `body { background-color: ${color};`
    ) || `body { background-color: ${color}; }`;
    updateTemplate({ css: newCss });
    toast({
      title: "Background Updated",
      description: `Page background set to ${color}.`,
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, delta } = event;
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const element = iframe.contentDocument.getElementById(active.id);
    if (element) {
      const currentStyle = window.getComputedStyle(element);
      const newX = parseInt(currentStyle.left || "0") + delta.x;
      const newY = parseInt(currentStyle.top || "0") + delta.y;
      element.style.position = "relative";
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
      updateTemplate({ html: iframe.contentDocument.body.innerHTML });
      toast({
        title: "Element Moved",
        description: "Element position updated.",
      });
    }
  };

  const clearSelection = () => {
    if (selectedElement?.element) {
      selectedElement.element.style.outline = "";
    }
    setSelectedElement(null);
    setShowToolbar(false);
    toast({
      title: "Selection Cleared",
      description: "No element is selected.",
    });
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const editableElements = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "DIV", "BUTTON", "A"];
    const elements = doc.querySelectorAll(editableElements.join(","));
    const draggableData: DraggableElement[] = [];
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      if (!htmlEl.id) htmlEl.id = `draggable-${index}`;
      draggableData.push({
        id: htmlEl.id,
        position: {
          x: parseInt(htmlEl.style.left || "0"),
          y: parseInt(htmlEl.style.top || "0"),
        },
      });
    });
    setDraggableElements(draggableData);

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; ${editedTemplate.css} }
            * { cursor: pointer !important; }
            *:hover { background-color: rgba(102, 126, 234, 0.1) !important; }
            [id^="draggable-"] { position: relative; }
          </style>
        </head>
        <body>
          ${editedTemplate.html}
        </body>
      </html>
    `);
    doc.close();

    const addClickListeners = () => {
      const elements = doc.querySelectorAll("*");
      elements.forEach((el) => {
        el.removeEventListener("click", handleElementClick);
        el.addEventListener("click", handleElementClick);
      });
    };

    const handleIframeLoad = () => {
      addClickListeners();
      doc.addEventListener("click", (e) => {
        if (e.target === doc.body) {
          clearSelection();
        }
      });
    };

    iframe.addEventListener("load", handleIframeLoad);

    return () => {
      iframe.removeEventListener("load", handleIframeLoad);
      if (doc) {
        const elements = doc.querySelectorAll("*");
        elements.forEach((el) => el.removeEventListener("click", handleElementClick));
      }
    };
  }, [editedTemplate]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-[#0f0f0f]">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#1a1a1a]">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                onBack();
                toast({
                  title: "Back to Library",
                  description: "Returned to the template library.",
                });
              }}
              className="text-white hover:text-white hover:bg-white/20 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">{editedTemplate.name}</h1>
              <p className="text-sm text-gray-400">Visual Editor Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={undo}
              disabled={historyIndex === 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={redo}
              disabled={historyIndex === history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={() => {
                onPreview(editedTemplate);
                toast({
                  title: "Preview Opened",
                  description: `Previewing template "${editedTemplate.name}".`,
                });
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={() => onSave(editedTemplate)}
              className="bg-gradient-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="w-full h-full p-4">
            <Card className="w-full h-full overflow-hidden bg-white">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Template Editor"
                sandbox="allow-same-origin"
              />
            </Card>
          </div>
          {showToolbar && selectedElement && (
            <Toolbar
              selectedElement={selectedElement}
              onTextChange={handleElementTextChange}
              onStyleChange={handleStyleChange}
              onBackgroundChange={handleBackgroundChange}
              onClose={clearSelection}
            />
          )}
        </div>
      </div>
    </DndContext>
  );
}

export default TemplateEditor;