import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  Code, 
  Quote, 
  List,
  Image,
  GripVertical
} from 'lucide-react'
import type { Block } from '@/types/document'

interface BlockEditorProps {
  content: string
  onChange: (content: string) => void
  title: string
  onTitleChange: (title: string) => void
}

const createNewBlock = (type: Block['type'], content: string = ''): Block => ({
  id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  content,
  properties: {}
})

const parseContentToBlocks = (content: string): Block[] => {
    const lines = content.split('\n')
    const blocks: Block[] = []
    
    for (const line of lines) {
      if (line.startsWith('# ')) {
        blocks.push(createNewBlock('heading1', line.substring(2)))
      } else if (line.startsWith('## ')) {
        blocks.push(createNewBlock('heading2', line.substring(3)))
      } else if (line.startsWith('### ')) {
        blocks.push(createNewBlock('heading3', line.substring(4)))
      } else if (line.startsWith('```')) {
        blocks.push(createNewBlock('code', ''))
      } else if (line.startsWith('> ')) {
        blocks.push(createNewBlock('quote', line.substring(2)))
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        blocks.push(createNewBlock('list', line.substring(2)))
      } else {
        blocks.push(createNewBlock('paragraph', line))
      }
    }
    
    return blocks.length > 0 ? blocks : [createNewBlock('paragraph', '')]
  }

export function BlockEditor({ content, onChange, title, onTitleChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)

  useEffect(() => {
    // Parse content into blocks or create initial block
    if (content) {
      try {
        const parsedBlocks = parseContentToBlocks(content)
        setBlocks(parsedBlocks)
      } catch {
        // If parsing fails, create a single paragraph block
        setBlocks([createNewBlock('paragraph', content)])
      }
    } else {
      setBlocks([createNewBlock('paragraph', '')])
    }
  }, [content])

  useEffect(() => {
    // Convert blocks back to content
    const newContent = blocksToContent(blocks)
    onChange(newContent)
  }, [blocks, onChange])

  const blocksToContent = (blocks: Block[]): string => {
    return blocks.map(block => {
      switch (block.type) {
        case 'heading1': return `# ${block.content}`
        case 'heading2': return `## ${block.content}`
        case 'heading3': return `### ${block.content}`
        case 'code': return `\`\`\`\n${block.content}\n\`\`\``
        case 'quote': return `> ${block.content}`
        case 'list': return `- ${block.content}`
        default: return block.content
      }
    }).join('\n')
  }

  const updateBlock = (blockId: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, content } : block
    ))
  }

  const addBlock = (afterBlockId: string, type: Block['type']) => {
    const newBlock = createNewBlock(type)
    const index = blocks.findIndex(b => b.id === afterBlockId)
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
    setFocusedBlockId(newBlock.id)
  }

  const deleteBlock = (blockId: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== blockId))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addBlock(blockId, 'paragraph')
    } else if (e.key === 'Backspace') {
      const block = blocks.find(b => b.id === blockId)
      if (block && block.content === '') {
        e.preventDefault()
        deleteBlock(blockId)
      }
    }
  }

  const renderBlock = (block: Block) => {
    const commonProps = {
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        updateBlock(block.id, e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block.id),
      onFocus: () => setFocusedBlockId(block.id),
      onBlur: () => setFocusedBlockId(null),
      className: "w-full bg-transparent border-none outline-none resize-none",
      placeholder: getPlaceholder(block.type)
    }

    switch (block.type) {
      case 'heading1':
        return (
          <input
            {...commonProps}
            className={`${commonProps.className} text-3xl font-bold py-2`}
          />
        )
      case 'heading2':
        return (
          <input
            {...commonProps}
            className={`${commonProps.className} text-2xl font-semibold py-2`}
          />
        )
      case 'heading3':
        return (
          <input
            {...commonProps}
            className={`${commonProps.className} text-xl font-medium py-1`}
          />
        )
      case 'code':
        return (
          <textarea
            {...commonProps}
            className={`${commonProps.className} font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-md`}
            rows={3}
          />
        )
      case 'quote':
        return (
          <textarea
            {...commonProps}
            className={`${commonProps.className} border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:text-gray-300`}
            rows={2}
          />
        )
      default:
        return (
          <textarea
            {...commonProps}
            className={`${commonProps.className} leading-relaxed`}
            rows={1}
            style={{ minHeight: '1.5rem' }}
          />
        )
    }
  }

  const getPlaceholder = (type: Block['type']): string => {
    switch (type) {
      case 'heading1': return 'Heading 1'
      case 'heading2': return 'Heading 2'
      case 'heading3': return 'Heading 3'
      case 'code': return 'Enter code...'
      case 'quote': return 'Quote'
      case 'list': return 'List item'
      default: return 'Type something...'
    }
  }

  const getBlockIcon = (type: Block['type']) => {
    switch (type) {
      case 'heading1': return <Heading1 className="h-4 w-4" />
      case 'heading2': return <Heading2 className="h-4 w-4" />
      case 'heading3': return <Heading3 className="h-4 w-4" />
      case 'code': return <Code className="h-4 w-4" />
      case 'quote': return <Quote className="h-4 w-4" />
      case 'list': return <List className="h-4 w-4" />
      default: return <Type className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Untitled Document"
        className="w-full text-4xl font-bold mb-8 bg-transparent border-none outline-none placeholder-gray-400"
      />

      {/* Blocks */}
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="group relative flex items-start space-x-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md p-2 -ml-2"
          >
            {/* Block Handle */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab"
              >
                <GripVertical className="h-3 w-3" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => addBlock(block.id, 'paragraph')}>
                    <Type className="h-4 w-4 mr-2" />
                    Paragraph
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(block.id, 'heading1')}>
                    <Heading1 className="h-4 w-4 mr-2" />
                    Heading 1
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(block.id, 'heading2')}>
                    <Heading2 className="h-4 w-4 mr-2" />
                    Heading 2
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(block.id, 'heading3')}>
                    <Heading3 className="h-4 w-4 mr-2" />
                    Heading 3
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(block.id, 'code')}>
                    <Code className="h-4 w-4 mr-2" />
                    Code Block
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(block.id, 'quote')}>
                    <Quote className="h-4 w-4 mr-2" />
                    Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(block.id, 'list')}>
                    <List className="h-4 w-4 mr-2" />
                    List Item
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Block Type Icon */}
            <div className="flex-shrink-0 mt-1 text-gray-400">
              {getBlockIcon(block.type)}
            </div>

            {/* Block Content */}
            <div className="flex-1 min-w-0">
              {renderBlock(block)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}