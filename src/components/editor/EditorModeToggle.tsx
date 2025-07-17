import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FileText, Code } from 'lucide-react'
import type { EditorMode } from '@/types/document'

interface EditorModeToggleProps {
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
}

export function EditorModeToggle({ mode, onModeChange }: EditorModeToggleProps) {
  return (
    <div className="flex items-center space-x-2 p-2 border-b bg-white dark:bg-gray-900">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Editor Mode:
      </span>
      <ToggleGroup 
        type="single" 
        value={mode} 
        onValueChange={(value) => value && onModeChange(value as EditorMode)}
        className="bg-gray-100 dark:bg-gray-800 rounded-md p-1"
      >
        <ToggleGroupItem 
          value="blocks" 
          aria-label="Block Editor"
          className="data-[state=on]:bg-white data-[state=on]:shadow-sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Blocks
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="markdown" 
          aria-label="Markdown Editor"
          className="data-[state=on]:bg-white data-[state=on]:shadow-sm"
        >
          <Code className="h-4 w-4 mr-2" />
          Markdown
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}