import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Type, ImageIcon, MousePointer, Container } from "lucide-react"

const elements = [
  { id: "heading", label: "Heading", icon: Type },
  { id: "text", label: "Text", icon: Type },
  { id: "button", label: "Button", icon: MousePointer },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "container", label: "Container", icon: Container },
]

function DraggableElement({ id, label, icon: Icon }: { id: string; label: string; icon: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${id}`,
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      variant="outline"
      className="w-full justify-start gap-2 h-12 cursor-grab active:cursor-grabbing bg-transparent"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  )
}

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {elements.map((element) => (
            <DraggableElement key={element.id} id={element.id} label={element.label} icon={element.icon} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
