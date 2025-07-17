import type React from "react"
import { useState, useRef } from "react"
import { useDraggable } from "@dnd-kit/core"
import type { CanvasElement as CanvasElementType } from "@/types/Editor"
import { cn } from "@/lib/utils"
import { GripVertical, Copy, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CanvasElementProps {
  element: CanvasElementType
  isSelected: boolean
  onSelect: () => void
  onUpdate: (id: string, updates: Partial<CanvasElementType>) => void
  onDuplicate: () => void
  onBringToFront: () => void
  onSendToBack: () => void
  previewMode: boolean
}

export function CanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  previewMode,
}: CanvasElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(element.content)
  const elementRef = useRef<HTMLDivElement>(null)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: element.id,
    disabled: previewMode || isEditing,
  })

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!previewMode && (element.type === "heading" || element.type === "text" || element.type === "button")) {
      setIsEditing(true)
      setEditContent(element.content)
    }
  }

  const handleSave = () => {
    onUpdate(element.id, { content: editContent })
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setEditContent(element.content)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  // Handle resize (basic implementation)
  const handleResize = (direction: string, delta: { x: number; y: number }) => {
    const newSize = { ...element.size }

    if (direction.includes("right")) newSize.width += delta.x
    if (direction.includes("bottom")) newSize.height += delta.y
    if (direction.includes("left")) {
      newSize.width -= delta.x
      onUpdate(element.id, {
        size: newSize,
        position: { ...element.position, x: element.position.x + delta.x },
      })
      return
    }
    if (direction.includes("top")) {
      newSize.height -= delta.y
      onUpdate(element.id, {
        size: newSize,
        position: { ...element.position, y: element.position.y + delta.y },
      })
      return
    }

    onUpdate(element.id, { size: newSize })
  }

  const renderElement = () => {
    const baseStyle = {
      ...element.styles,
      width: element.size.width,
      height: element.type === "image" ? "auto" : element.size.height,
      minHeight: element.type === "container" ? element.size.height : "auto",
      maxWidth: element.size.width,
      wordWrap: "break-word" as const,
      overflow: "hidden",
    }

    if (isEditing && (element.type === "heading" || element.type === "text" || element.type === "button")) {
      return element.type === "text" ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent border-2 border-blue-400 rounded px-2 py-1 outline-none resize-none"
          style={baseStyle}
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-2 border-blue-400 rounded px-2 py-1 outline-none"
          style={baseStyle}
          autoFocus
        />
      )
    }

    const commonProps = {
      style: baseStyle,
      onDoubleClick: handleDoubleClick,
      className: cn("transition-all duration-200 cursor-pointer", !previewMode && "hover:ring-1 hover:ring-blue-300"),
    }

    switch (element.type) {
      case "heading":
        return <h1 {...commonProps}>{element.content}</h1>
      case "text":
        return (
          <p {...commonProps} style={{ ...baseStyle, whiteSpace: "pre-wrap" }}>
            {element.content}
          </p>
        )
      case "button":
        return <button {...commonProps}>{element.content}</button>
      case "image":
        return (
          <img
            {...commonProps}
            src={element.content || "/placeholder.svg?height=200&width=300"}
            alt="Canvas element"
            style={{ ...baseStyle, objectFit: "cover" }}
          />
        )
      case "container":
        return (
          <div
            {...commonProps}
            className={cn(commonProps.className, "flex items-center justify-center text-gray-500 text-sm")}
          >
            {element.content || "Container - Drop elements here"}
          </div>
        )
      default:
        return <div {...commonProps}>{element.content}</div>
    }
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        if (elementRef.current !== node) {
          elementRef.current = node
        }
      }}
      onClick={handleClick}
      className={cn(
        "absolute group",
        isSelected && !previewMode && "ring-2 ring-blue-400",
        isDragging && "opacity-50 z-50",
        !previewMode && "hover:ring-1 hover:ring-blue-200",
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        zIndex: isDragging ? 9999 : element.zIndex,
        transform: isDragging ? "rotate(2deg)" : "none",
      }}
    >
      {/* Selection controls */}
      {isSelected && !previewMode && !isEditing && (
        <>
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs cursor-grab active:cursor-grabbing flex items-center gap-1"
          >
            <GripVertical className="h-3 w-3" />
            {element.type}
          </div>

          {/* Action buttons */}
          <div className="absolute -top-8 right-0 flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onBringToFront}>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Bring to Front
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSendToBack}>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Send to Back
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Resize handles */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize rounded-sm" />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize rounded-sm" />
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-e-resize rounded-sm" />
        </>
      )}

      {renderElement()}
    </div>
  )
}
