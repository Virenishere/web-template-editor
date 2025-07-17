import { forwardRef } from "react"
import type React from "react"

import { useDroppable } from "@dnd-kit/core"
import type { CanvasElement as CanvasElementType } from "@/types/Editor"
import { CanvasElement } from "./CanvasElement"
import { cn } from "@/lib/utils"

interface CanvasProps {
  elements: CanvasElementType[]
  selectedElement: CanvasElementType | null
  onSelectElement: (element: CanvasElementType | null) => void
  onUpdateElement: (id: string, updates: Partial<CanvasElementType>) => void
  onDuplicateElement: (element: CanvasElementType) => void
  onBringToFront: (id: string) => void
  onSendToBack: (id: string) => void
  previewMode: boolean
  backgroundColor: string
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  (
    {
      elements,
      selectedElement,
      onSelectElement,
      onUpdateElement,
      onDuplicateElement,
      onBringToFront,
      onSendToBack,
      previewMode,
      backgroundColor,
    },
    ref,
  ) => {
    const { setNodeRef, isOver } = useDroppable({
      id: "canvas",
    })

    const handleCanvasClick = (e: React.MouseEvent) => {
      // Only deselect if clicking directly on canvas, not on elements
      if (e.target === e.currentTarget) {
        onSelectElement(null)
      }
    }

    return (
      <div className="flex-1 p-4">
        <div
          ref={(node) => {
            setNodeRef(node)
            if (ref) {
              if (typeof ref === "function") {
                ref(node)
              } else {
                ref.current = node
              }
            }
          }}
          onClick={handleCanvasClick}
          className={cn(
            "relative min-h-full rounded-lg shadow-sm border-2 transition-colors overflow-hidden",
            isOver ? "border-blue-400 bg-blue-50" : "border-gray-200",
            previewMode ? "border-solid border-gray-300" : "border-dashed",
            "min-h-[800px]", // Ensure minimum height for canvas
          )}
          style={{ position: "relative", backgroundColor }}
        >
          {/* Grid background for better positioning */}
          {!previewMode && (
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #000 1px, transparent 1px),
                  linear-gradient(to bottom, #000 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />
          )}

          {elements.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">Start Building</div>
                <div className="text-sm">Drag elements from the sidebar to get started</div>
              </div>
            </div>
          ) : (
            elements
              .sort((a, b) => a.zIndex - b.zIndex) // Sort by z-index
              .map((element) => (
                <CanvasElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElement?.id === element.id}
                  onSelect={() => onSelectElement(element)}
                  onUpdate={onUpdateElement}
                  onDuplicate={() => onDuplicateElement(element)}
                  onBringToFront={() => onBringToFront(element.id)}
                  onSendToBack={() => onSendToBack(element.id)}
                  previewMode={previewMode}
                />
              ))
          )}
        </div>
      </div>
    )
  },
)

Canvas.displayName = "Canvas"