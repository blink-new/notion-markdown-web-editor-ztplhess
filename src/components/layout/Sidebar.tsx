import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  FileText, 
  Folder,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { blink } from '@/blink/client'
import type { Document } from '@/types/document'

interface SidebarProps {
  onDocumentSelect: (doc: Document) => void
  onNewDocument: () => void
  currentDocumentId?: string
}

export function Sidebar({ onDocumentSelect, onNewDocument, currentDocumentId }: SidebarProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const user = await blink.auth.me()
      const docs = await blink.db.documents.list({
        where: { user_id: user.id },
        orderBy: { updated_at: 'desc' }
      })
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-64 border-r bg-gray-50 dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={onNewDocument} className="w-full mb-4">
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredDocuments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents yet</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Button
                key={doc.id}
                variant={currentDocumentId === doc.id ? "secondary" : "ghost"}
                className="w-full justify-start mb-1 h-auto py-2"
                onClick={() => onDocumentSelect(doc)}
              >
                <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium truncate">{doc.title}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}