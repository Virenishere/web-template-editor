import { useState, useCallback, useRef, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DragMoveEvent,
} from "@dnd-kit/core"
import { Sidebar } from "../components/visualEditor/Sidebar"
import { Canvas } from "../components/visualEditor/Canvas"
import { PropertiesPanel } from "../components/visualEditor/PropertiesPanel"
import { Toolbar } from "../components/visualEditor/Toolbar"
import type { ElementType, CanvasElement } from "@/types/Editor"
import { generateId } from "@/lib/utils"
import instance from "../lib/axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Palette, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  html: string;
  css: string;
  thumbnail: string;
}

interface Page {
  id: string;
  name: string;
  elements: CanvasElement[];
  backgroundColor: string;
}

interface VisualEditorProps {
  template: Template | null;
  onBack: () => void;
  onSave: (template: Template) => void;
}

export function VisualEditor({ template, onBack, onSave }: VisualEditorProps) {
  const [pages, setPages] = useState<Page[]>([{ id: generateId(), name: "Page 1", elements: [], backgroundColor: "#ffffff" }])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [templateName, setTemplateName] = useState(template?.name || "New Template")
  const canvasRef = useRef<HTMLDivElement>(null)

  // Load template into pages
  useEffect(() => {
    if (template && template.html && template.css) {
      const parseTemplateToPages = () => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(template.html, "text/html");
        const pageElements: Page[] = [];

        // Define parseNode at the top to be accessible everywhere
        const parseNode = (node: HTMLElement, elements: CanvasElement[], zIndex: { value: number }) => {
          const tagName = node.tagName.toLowerCase();
          let type: ElementType;
          switch (tagName) {
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
              type = "heading";
              break;
            case "p":
            case "span":
              type = "text";
              break;
            case "button":
              type = "button";
              break;
            case "img":
              type = "image";
              break;
            case "div":
              type = "container";
              break;
            default:
              return;
          }

          const computedStyle = window.getComputedStyle(node);
          const styles: Record<string, any> = {
            fontSize: computedStyle.fontSize,
            fontWeight: computedStyle.fontWeight,
            color: computedStyle.color,
            backgroundColor: computedStyle.backgroundColor,
            padding: computedStyle.padding,
            margin: computedStyle.margin,
            border: computedStyle.border,
            borderRadius: computedStyle.borderRadius,
            textAlign: computedStyle.textAlign,
          };

          const newElement: CanvasElement = {
            id: generateId(),
            type,
            content: node.tagName === "IMG" ? node.getAttribute("src") || "" : node.textContent || "",
            styles,
            position: {
              x: parseFloat(computedStyle.left || "0"),
              y: parseFloat(computedStyle.top || "0"),
            },
            size: {
              width: parseFloat(computedStyle.width || getDefaultSize(type).width.toString()),
              height: parseFloat(computedStyle.height || getDefaultSize(type).height.toString()),
            },
            zIndex: zIndex.value++,
          };

          elements.push(newElement);
        };

        // Check for multi-page structure
        const pageNodes = doc.body.querySelectorAll('div[class^="page-"]');
        if (pageNodes.length === 0) {
          // Single-page fallback
          const elements: CanvasElement[] = [];
          const zIndex = { value: 1 };
          const nodes = doc.body.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, button, img, div:not([class^='page-'])");
          nodes.forEach((node: HTMLElement) => parseNode(node, elements, zIndex));

          const cssMatch = template.css.match(/body\s*{\s*background-color:\s*([^;]+);/);
          const backgroundColor = cssMatch ? cssMatch[1].trim() : "#ffffff";

          pageElements.push({
            id: generateId(),
            name: "Page 1",
            elements,
            backgroundColor,
          });
        } else {
          // Multi-page parsing
          pageNodes.forEach((pageNode, index) => {
            const elements: CanvasElement[] = [];
            const zIndex = { value: 1 };
            const pageClass = pageNode.className;
            const nodes = pageNode.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, button, img, div");
            nodes.forEach((node: HTMLElement) => parseNode(node, elements, zIndex));

            const cssMatch = template.css.match(new RegExp(`\\.${pageClass}\\s*{[^}]*background-color:\\s*([^;]+);`));
            const backgroundColor = cssMatch ? cssMatch[1].trim() : "#ffffff";

            pageElements.push({
              id: generateId(),
              name: `Page ${index + 1}`,
              elements,
              backgroundColor,
            });
          });
        }

        setPages(pageElements);
        setCurrentPageIndex(0);
        setSelectedElement(pageElements[0]?.elements[0] || null);
        setTemplateName(template.name);
      };

      parseTemplateToPages();
    } else {
      setPages([{ id: generateId(), name: "Page 1", elements: [], backgroundColor: "#ffffff" }]);
      setCurrentPageIndex(0);
      setSelectedElement(null);
    }
  }, [template]);

  // Generate HTML and CSS for all pages
  const generateTemplateContent = () => {
    let html = '';
    let css = '';

    if (pages.length === 0) {
      html = '<p>Empty Template</p>';
      css = `body { background-color: #ffffff; }`;
    } else {
      pages.forEach((page, index) => {
        const pageClass = `page-${index + 1}`;
        html += `<div class="${pageClass}">`;
        page.elements.forEach((element) => {
          const { type, content, styles, position, size } = element;
          const styleString = Object.entries(styles)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
          const positionStyle = `position: absolute; left: ${position.x}px; top: ${position.y}px; width: ${size.width}px; height: ${size.height}px; z-index: ${element.zIndex};`;

          switch (type) {
            case 'heading':
              html += `<h1 style="${styleString} ${positionStyle}">${content}</h1>`;
              break;
            case 'text':
              html += `<p style="${styleString} ${positionStyle}">${content}</p>`;
              break;
            case 'button':
              html += `<button style="${styleString} ${positionStyle}">${content}</button>`;
              break;
            case 'image':
              html += `<img src="${content}" style="${styleString} ${positionStyle}" alt="Canvas image" />`;
              break;
            case 'container':
              html += `<div style="${styleString} ${positionStyle}">${content}</div>`;
              break;
          }
        });
        html += `</div>`;

        css += `
          .${pageClass} {
            background-color: ${page.backgroundColor};
            min-height: 800px;
            position: relative;
          }
        `;
        css += page.elements
          .map((element) => `
            #element-${element.id} {
              ${Object.entries(element.styles).map(([key, value]) => `${key}: ${value};`).join(' ')}
              position: absolute;
              left: ${element.position.x}px;
              top: ${element.position.y}px;
              width: ${element.size.width}px;
              height: ${element.size.height}px;
              z-index: ${element.zIndex};
            }
          `)
          .join('\n');
      });
    }

    return { html, css };
  };

  const saveProject = useCallback(async () => {
    try {
      if (!templateName) {
        toast("Template name is required.", { variant: "destructive" });
        return;
      }

      const { html, css } = generateTemplateContent();
      const templateData = {
        id: template?.id || generateId(),
        name: templateName,
        html,
        css,
        description: template?.description || "",
        category: template?.category || "",
        thumbnail: template?.thumbnail || "",
      };

      if (template?.id) {
        await instance.put(`/api/templates/${template.id}`, templateData);
        toast(`Template "${templateData.name}" updated successfully.`);
      } else {
        const response = await instance.post("/api/templates", templateData);
        templateData.id = response.data.data._id;
        toast(`Template "${templateData.name}" saved successfully.`);
      }
      onSave(templateData);
    } catch (error) {
      toast("Failed to save the template.", {
        variant: "destructive",
      });
      console.error("Error saving template:", error);
    }
  }, [pages, template, templateName, onSave]);

  const clearCanvas = useCallback(() => {
    setPages((prev) =>
      prev.map((page, index) =>
        index === currentPageIndex
          ? { ...page, elements: [], backgroundColor: "#ffffff" }
          : page
      )
    );
    setSelectedElement(null);
    toast("Current page cleared successfully.");
  }, [currentPageIndex]);

  const handleBack = useCallback(() => {
    setPages([{ id: generateId(), name: "Page 1", elements: [], backgroundColor: "#ffffff" }]);
    setCurrentPageIndex(0);
    setSelectedElement(null);
    setPreviewMode(false);
    onBack();
    toast("Returned to template library.");
  }, [onBack]);

  const addPage = useCallback(() => {
    const newPage: Page = {
      id: generateId(),
      name: `Page ${pages.length + 1}`,
      elements: [],
      backgroundColor: "#ffffff",
    };
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    toast(`Page ${pages.length + 1} added.`);
  }, [pages.length]);

  const deletePage = useCallback((index: number) => {
    if (pages.length <= 1) {
      toast("Cannot delete the only page.", { variant: "destructive" });
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
    setCurrentPageIndex((prev) => (prev >= index ? Math.max(0, prev - 1) : prev));
    setSelectedElement(null);
    toast(`Page ${index + 1} deleted.`);
  }, [pages.length]);

  const handleBackgroundChange = (color: string) => {
    setPages((prev) =>
      prev.map((page, index) =>
        index === currentPageIndex ? { ...page, backgroundColor: color } : page
      )
    );
    toast("Page background updated.");
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const activeElement = pages[currentPageIndex].elements.find((el) => el.id === event.active.id);
    if (activeElement) {
      setDragOffset({
        x: activeElement.position.x,
        y: activeElement.position.y,
      });
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, delta } = event;
    const activeElement = pages[currentPageIndex].elements.find((el) => el.id === active.id);
    if (activeElement) {
      const newX = dragOffset.x + delta.x;
      const newY = dragOffset.y + delta.y;
      setPages((prev) =>
        prev.map((page, index) =>
          index === currentPageIndex
            ? {
                ...page,
                elements: page.elements.map((el) =>
                  el.id === active.id
                    ? { ...el, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
                    : el
                ),
              }
            : page
        )
      );
    }
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;
      setActiveId(null);

      if (!over || over.id !== "canvas") return;

      if (active.id.toString().startsWith("sidebar-")) {
        const elementType = active.id.toString().replace("sidebar-", "") as ElementType;
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        const dropX = canvasRect ? event.activatorEvent.clientX - canvasRect.left : 100;
        const dropY = canvasRect ? event.activatorEvent.clientY - canvasRect.top : 100;

        const newElement: CanvasElement = {
          id: generateId(),
          type: elementType,
          content: getDefaultContent(elementType),
          styles: getDefaultStyles(elementType),
          position: { x: Math.max(0, dropX - 50), y: Math.max(0, dropY - 25) },
          size: getDefaultSize(elementType),
          zIndex: pages[currentPageIndex].elements.length + 1,
        };
        setPages((prev) =>
          prev.map((page, index) =>
            index === currentPageIndex
              ? { ...page, elements: [...page.elements, newElement] }
              : page
          )
        );
        setSelectedElement(newElement);
        toast(`${elementType} added to page ${currentPageIndex + 1}.`);
        return;
      }

      const activeElement = pages[currentPageIndex].elements.find((el) => el.id === active.id);
      if (activeElement) {
        const newX = dragOffset.x + delta.x;
        const newY = dragOffset.y + delta.y;
        updateElement(active.id as string, {
          position: { x: Math.max(0, newX), y: Math.max(0, newY) },
        });
      }
    },
    [currentPageIndex, pages, dragOffset]
  );

  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      setPages((prev) =>
        prev.map((page, index) =>
          index === currentPageIndex
            ? {
                ...page,
                elements: page.elements.map((el) =>
                  el.id === id ? { ...el, ...updates } : el
                ),
              }
            : page
        )
      );
      if (selectedElement?.id === id) {
        setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null));
      }
      toast("Element updated successfully.");
    },
    [selectedElement, currentPageIndex]
  );

  const deleteElement = useCallback(
    (id: string) => {
      setPages((prev) =>
        prev.map((page, index) =>
          index === currentPageIndex
            ? { ...page, elements: page.elements.filter((el) => el.id !== id) }
            : page
        )
      );
      if (selectedElement?.id === id) {
        setSelectedElement(null);
      }
      toast("Element deleted successfully.");
    },
    [selectedElement, currentPageIndex]
  );

  const duplicateElement = useCallback(
    (element: CanvasElement) => {
      const newElement: CanvasElement = {
        ...element,
        id: generateId(),
        position: { x: element.position.x + 20, y: element.position.y + 20 },
        zIndex: Math.max(...pages[currentPageIndex].elements.map((el) => el.zIndex)) + 1,
      };
      setPages((prev) =>
        prev.map((page, index) =>
          index === currentPageIndex
            ? { ...page, elements: [...page.elements, newElement] }
            : page
        )
      );
      setSelectedElement(newElement);
      toast(`${element.type} duplicated successfully.`);
    },
    [currentPageIndex, pages]
  );

  const bringToFront = useCallback(
    (id: string) => {
      const maxZ = Math.max(...pages[currentPageIndex].elements.map((el) => el.zIndex));
      updateElement(id, { zIndex: maxZ + 1 });
      toast("Element brought to front.");
    },
    [currentPageIndex, pages, updateElement]
  );

  const sendToBack = useCallback(
    (id: string) => {
      const minZ = Math.min(...pages[currentPageIndex].elements.map((el) => el.zIndex));
      updateElement(id, { zIndex: minZ - 1 });
      toast("Element sent to back.");
    },
    [currentPageIndex, pages, updateElement]
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <div className="flex flex-col p-4 border-b border-gray-700 bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-white hover:text-white hover:bg-white/20 border border-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Library
                </Button>
                <div>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="text-xl font-semibold text-white bg-[#2a2a2a] border-white/20"
                    placeholder="Template Name"
                  />
                  <p className="text-sm text-gray-400">Visual Editor Mode</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="canvas-bg" className="text-white">Page Background</Label>
                  <Input
                    id="canvas-bg"
                    type="color"
                    value={pages[currentPageIndex].backgroundColor}
                    onChange={(e) => handleBackgroundChange(e.target.value)}
                    className="w-10 h-10 p-1 bg-[#2a2a2a] border-white/20"
                  />
                </div>
                <Button
                  onClick={saveProject}
                  className="bg-gradient-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={currentPageIndex.toString()} onValueChange={(value) => setCurrentPageIndex(parseInt(value))}>
                <TabsList>
                  {pages.map((page, index) => (
                    <TabsTrigger key={page.id} value={index.toString()}>
                      {page.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button
                variant="outline"
                size="sm"
                onClick={addPage}
                className="text-black border-white/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Page
              </Button>
              {pages.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deletePage(currentPageIndex)}
                  className="text-white border-white/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Page
                </Button>
              )}
            </div>
          </div>

          <Toolbar
            previewMode={previewMode}
            onPreviewToggle={() => setPreviewMode(!previewMode)}
            onSave={saveProject}
            onClear={clearCanvas}
            elementsCount={pages[currentPageIndex].elements.length}
          />

          <div className="flex-1 flex">
            <Canvas
              ref={canvasRef}
              elements={pages[currentPageIndex].elements}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={updateElement}
              onDuplicateElement={duplicateElement}
              onBringToFront={bringToFront}
              onSendToBack={sendToBack}
              previewMode={previewMode}
              backgroundColor={pages[currentPageIndex].backgroundColor}
            />
            {selectedElement && !previewMode && (
              <PropertiesPanel
                element={selectedElement}
                onUpdate={(updates) => updateElement(selectedElement.id, updates)}
                onDelete={() => deleteElement(selectedElement.id)}
                onDuplicate={() => duplicateElement(selectedElement)}
              />
            )}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="p-2 bg-blue-500 text-white rounded shadow-lg opacity-80">
                {activeId.replace("sidebar-", "")}
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
    </div>
  )
}

function getDefaultContent(type: ElementType): string {
  switch (type) {
    case "heading":
      return "Your Heading Here"
    case "text":
      return "Your text content goes here. Click to edit this text."
    case "button":
      return "Click Me"
    case "image":
      return "/placeholder.svg?height=200&width=300"
    case "container":
      return ""
    default:
      return ""
  }
}

function getDefaultStyles(type: ElementType): Record<string, any> {
  switch (type) {
    case "heading":
      return {
        fontSize: "32px",
        fontWeight: "bold",
        color: "#1f2937",
        padding: "8px 16px",
        margin: "0",
        backgroundColor: "transparent",
      }
    case "text":
      return {
        fontSize: "16px",
        lineHeight: "1.6",
        color: "#374151",
        padding: "8px 16px",
        margin: "0",
        backgroundColor: "transparent",
      }
    case "button":
      return {
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "12px 24px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        margin: "0",
      }
    case "image":
      return {
        borderRadius: "4px",
        margin: "0",
      }
    case "container":
      return {
        border: "2px dashed #d1d5db",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        padding: "20px",
        margin: "0",
      }
    default:
      return {}
  }
}

function getDefaultSize(type: ElementType): { width: number; height: number } {
  switch (type) {
    case "heading":
      return { width: 300, height: 50 }
    case "text":
      return { width: 400, height: 100 }
    case "button":
      return { width: 120, height: 44 }
    case "image":
      return { width: 300, height: 200 }
    case "container":
      return { width: 400, height: 200 }
    default:
      return { width: 200, height: 100 }
  }
}