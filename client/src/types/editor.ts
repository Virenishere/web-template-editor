export type ElementType = "heading" | "text" | "button" | "image" | "container"

export interface CanvasElement {
  id: string;
  type: ElementType;
  content: string;
  styles: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  parentId?: string;
}
