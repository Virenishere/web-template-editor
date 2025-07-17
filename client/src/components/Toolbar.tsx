import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Type,
  X
} from "lucide-react";

interface SelectedElement {
  element: HTMLElement;
  rect: DOMRect;
}

interface FloatingToolbarProps {
  selectedElement: SelectedElement;
  onTextChange: (text: string) => void;
  onStyleChange: (property: string, value: string) => void;
  onBackgroundChange: (color: string) => void;
  onClose: () => void;
}

function Toolbar({ 
  selectedElement, 
  onTextChange, 
  onStyleChange, 
  onBackgroundChange,
  onClose 
}: FloatingToolbarProps) {
  const [text, setText] = useState(selectedElement?.element?.textContent || "");
  const [fontSize, setFontSize] = useState("16");
  const [textColor, setTextColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [fontWeight, setFontWeight] = useState("normal");
  const [textAlign, setTextAlign] = useState("left");

  useEffect(() => {
    if (!selectedElement || !selectedElement.element) return;

    const element = selectedElement.element;
    const computedStyle = window.getComputedStyle(element);
    
    setText(element.textContent || "");
    setFontSize(parseInt(computedStyle.fontSize) || "16");
    setTextColor(rgbToHex(computedStyle.color));
    setBackgroundColor(rgbToHex(computedStyle.backgroundColor));
    setFontWeight(computedStyle.fontWeight);
    setTextAlign(computedStyle.textAlign);
  }, [selectedElement]);

  const rgbToHex = (rgb: string): string => {
    if (rgb.startsWith('#')) return rgb;
    if (rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    
    const matches = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (matches) {
      const r = parseInt(matches[1]);
      const g = parseInt(matches[2]);
      const b = parseInt(matches[3]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    return '#000000';
  };

  const handleTextSubmit = () => {
    onTextChange(text);
  };

  const handleStyleUpdate = (property: string, value: string) => {
    onStyleChange(property, value);
  };

  const toolbarStyle = selectedElement?.rect
    ? {
        position: 'fixed' as const,
        top: Math.max(10, selectedElement.rect.top - 60), // Prevent toolbar from going off-screen
        left: Math.max(10, selectedElement.rect.left), // Prevent toolbar from going off-screen
        zIndex: 1000,
      }
    : {};

  return (
    <Card 
      className="bg-[#1a1a1a] border border-white/20 shadow-lg p-3 min-w-[400px] text-white"
      style={toolbarStyle}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Edit Element</h4>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {/* Text Editing */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Text Content</Label>
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 text-sm bg-[#2a2a2a] text-white border-white/20"
              placeholder="Edit text..."
            />
            <Button size="sm" className="bg-gradient-primary" onClick={handleTextSubmit}>
              Update
            </Button>
          </div>
        </div>

        {/* Style Controls */}
        <div className="grid grid-cols-2 gap-3">
          {/* Font Size */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Font Size</Label>
            <div className="flex items-center gap-1">
              <Type className="w-3 h-3 text-gray-400" />
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  handleStyleUpdate('font-size', e.target.value + 'px');
                }}
                className="text-xs h-8 bg-[#2a2a2a] text-white border-white/20"
                min="8"
                max="72"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Text Color</Label>
            <div className="flex items-center gap-1">
              <Palette className="w-3 h-3 text-gray-400" />
              <Input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  handleStyleUpdate('color', e.target.value);
                }}
                className="w-full h-8 bg-[#2a2a2a] border-white/20"
              />
            </div>
          </div>
        </div>

        {/* Text Formatting */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Text Format</Label>
          <div className="flex gap-1">
            <Button
              variant={fontWeight === 'bold' ? 'default' : 'outline'}
              size="sm"
              className={fontWeight === 'bold' ? 'bg-gradient-primary' : 'text-white border-white/20 hover:bg-white/10'}
              onClick={() => {
                const newWeight = fontWeight === 'bold' ? 'normal' : 'bold';
                setFontWeight(newWeight);
                handleStyleUpdate('font-weight', newWeight);
              }}
            >
              <Bold className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={() => handleStyleUpdate('font-style', 'italic')}
            >
              <Italic className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={() => handleStyleUpdate('text-decoration', 'underline')}
            >
              <Underline className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Text Align</Label>
          <div className="flex gap-1">
            <Button
              variant={textAlign === 'left' ? 'default' : 'outline'}
              size="sm"
              className={textAlign === 'left' ? 'bg-gradient-primary' : 'text-white border-white/20 hover:bg-white/10'}
              onClick={() => {
                setTextAlign('left');
                handleStyleUpdate('text-align', 'left');
              }}
            >
              <AlignLeft className="w-3 h-3" />
            </Button>
            <Button
              variant={textAlign === 'center' ? 'default' : 'outline'}
              size="sm"
              className={textAlign === 'center' ? 'bg-gradient-primary' : 'text-white border-white/20 hover:bg-white/10'}
              onClick={() => {
                setTextAlign('center');
                handleStyleUpdate('text-align', 'center');
              }}
            >
              <AlignCenter className="w-3 h-3" />
            </Button>
            <Button
              variant={textAlign === 'right' ? 'default' : 'outline'}
              size="sm"
              className={textAlign === 'right' ? 'bg-gradient-primary' : 'text-white border-white/20 hover:bg-white/10'}
              onClick={() => {
                setTextAlign('right');
                handleStyleUpdate('text-align', 'right');
              }}
            >
              <AlignRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-1">
          <Label className="text-xs text-gray-400">Background Color</Label>
          <div className="flex items-center gap-1">
            <Palette className="w-3 h-3 text-gray-400" />
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value);
                handleStyleUpdate('background-color', e.target.value);
              }}
              className="w-full h-8 bg-[#2a2a2a] border-white/20"
            />
          </div>
        </div>

        {/* Page Background Color */}
        <div className="space-y-1">
          <Label className="text-xs text-gray-400">Page Background</Label>
          <div className="flex items-center gap-1">
            <Palette className="w-3 h-3 text-gray-400" />
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                onBackgroundChange(e.target.value);
              }}
              className="w-full h-8 bg-[#2a2a2a] border-white/20"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default Toolbar;