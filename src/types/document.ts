export interface Document {
  id: string
  title: string
  content: string
  markdown_content?: string
  created_at: string
  updated_at: string
  user_id: string
  is_published: boolean
  published_url?: string
}

export interface Block {
  id: string
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'code' | 'quote' | 'list' | 'image'
  content: string
  properties?: Record<string, any>
}

export type EditorMode = 'blocks' | 'markdown'