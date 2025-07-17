import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CanvasElement } from "@/types/editor"
import { Trash2, Copy } from "lucide-react"

interface PropertiesPanelProps {
  element: CanvasElement
  onUpdate: (updates: Partial<CanvasElement>) => void
  onDelete: () => void
  onDuplicate: () => void
}

export function PropertiesPanel({ element, onUpdate, onDelete, onDuplicate }: PropertiesPanelProps) {
  const updateStyle = (property: string, value: string) => {
    onUpdate({
      styles: {
        ...element.styles,
        [property]: value,
      },
    })
  }

  const updateContent = (content: string) => {
    onUpdate({ content })
  }

  const updatePosition = (axis: "x" | "y", value: number) => {
    onUpdate({
      position: {
        ...element.position,
        [axis]: Math.max(0, value),
      },
    })
  }

  const updateSize = (dimension: "width" | "height", value: number) => {
    onUpdate({
      size: {
        ...element.size,
        [dimension]: Math.max(10, value),
      },
    })
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg capitalize">{element.type} Properties</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
              className="text-blue-600 hover:text-blue-700 bg-transparent"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Position & Size */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Position & Size</h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="posX">X Position</Label>
                <Input
                  id="posX"
                  type="number"
                  value={element.position.x}
                  onChange={(e) => updatePosition("x", Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posY">Y Position</Label>
                <Input
                  id="posY"
                  type="number"
                  value={element.position.y}
                  onChange={(e) => updatePosition("y", Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={element.size.width}
                  onChange={(e) => updateSize("width", Number.parseInt(e.target.value) || 10)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={element.size.height}
                  onChange={(e) => updateSize("height", Number.parseInt(e.target.value) || 10)}
                  disabled={element.type === "image"}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          {(element.type === "heading" || element.type === "text" || element.type === "button") && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              {element.type === "text" ? (
                <Textarea
                  id="content"
                  value={element.content}
                  onChange={(e) => updateContent(e.target.value)}
                  rows={3}
                />
              ) : (
                <Input id="content" value={element.content} onChange={(e) => updateContent(e.target.value)} />
              )}
            </div>
          )}

          {element.type === "image" && (
            <div className="space-y-2">
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={element.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {/* Styling */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Styling</h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  value={element.styles.fontSize || ""}
                  onChange={(e) => updateStyle("fontSize", e.target.value)}
                  placeholder="16px"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={element.styles.color || "#000000"}
                  onChange={(e) => updateStyle("color", e.target.value)}
                />
              </div>
            </div>

            {(element.type === "button" || element.type === "container") && (
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={element.styles.backgroundColor || "#3b82f6"}
                  onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="padding">Padding</Label>
                <Input
                  id="padding"
                  value={element.styles.padding || ""}
                  onChange={(e) => updateStyle("padding", e.target.value)}
                  placeholder="16px"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="borderRadius">Border Radius</Label>
                <Input
                  id="borderRadius"
                  value={element.styles.borderRadius || ""}
                  onChange={(e) => updateStyle("borderRadius", e.target.value)}
                  placeholder="4px"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zIndex">Layer (Z-Index)</Label>
              <Input
                id="zIndex"
                type="number"
                value={element.zIndex}
                onChange={(e) => onUpdate({ zIndex: Number.parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
