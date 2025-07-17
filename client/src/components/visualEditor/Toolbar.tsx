import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Save, Trash2 } from "lucide-react"

interface ToolbarProps {
  previewMode: boolean
  onPreviewToggle: () => void
  onSave: () => void
  onClear: () => void
  elementsCount: number
}

export function Toolbar({ previewMode, onPreviewToggle, onSave, onClear, elementsCount }: ToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-900">Visual Editor</h1>
        <div className="text-sm text-gray-500">
          {elementsCount} element{elementsCount !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onClear} disabled={elementsCount === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>

        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>

        <Button variant={previewMode ? "default" : "outline"} size="sm" onClick={onPreviewToggle}>
          {previewMode ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 h-4 mr-2" />
              Preview
            </>
          )}
        </Button>
      </div>
    </div>
  )
}