import { useState, useEffect, useCallback } from 'react'
import { supabase, db, type Document } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BlockEditor } from '@/components/editor/BlockEditor'
import { EditorModeToggle } from '@/components/editor/EditorModeToggle'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { AuthForm } from '@/components/auth/AuthForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Globe, Share } from 'lucide-react'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [editorMode, setEditorMode] = useState<'rich' | 'markdown'>('rich')
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishTitle, setPublishTitle] = useState('')
  const [publishDescription, setPublishDescription] = useState('')

  useEffect(() => {
    // Initialize Supabase auth
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadDocuments = useCallback(async () => {
    if (!user) return
    
    try {
      const docs = await db.getDocuments(user.id)
      setDocuments(docs)
      
      if (docs.length > 0 && !currentDocument) {
        setCurrentDocument(docs[0])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      })
    }
  }, [user, currentDocument])

  useEffect(() => {
    if (user) {
      loadDocuments()
    }
  }, [user, loadDocuments])

  const createNewDocument = async () => {
    if (!user) return

    try {
      const newDoc = await db.createDocument({
        user_id: user.id,
        title: 'Untitled Document',
        content: {},
        markdown_content: '',
        position: 0
      })
      
      const updatedDocs = [newDoc, ...documents]
      setDocuments(updatedDocs)
      setCurrentDocument(newDoc)
      
      toast({
        title: "Document created",
        description: "New document created successfully"
      })
    } catch (error) {
      console.error('Error creating document:', error)
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive"
      })
    }
  }

  const saveDocument = async (title: string, content: string) => {
    if (!currentDocument || !user) return

    try {
      const updatedDoc = await db.updateDocument(currentDocument.id, {
        title,
        content: typeof content === 'string' ? { text: content } : content,
        markdown_content: content
      })
      
      const updatedDocs = documents.map(doc => 
        doc.id === currentDocument.id ? updatedDoc : doc
      )
      
      setCurrentDocument(updatedDoc)
      setDocuments(updatedDocs)
    } catch (error) {
      console.error('Error saving document:', error)
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive"
      })
    }
  }

  const handlePublish = () => {
    if (!currentDocument) return
    setPublishTitle(currentDocument.title)
    setPublishDescription(currentDocument.seo_description || '')
    setPublishDialogOpen(true)
  }

  const publishDocument = async () => {
    if (!currentDocument || !user) return

    try {
      const slug = publishTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const publishedUrl = `${window.location.origin}/published/${slug}`

      const updatedDoc = await db.updateDocument(currentDocument.id, {
        is_published: true,
        published_url: publishedUrl,
        seo_title: publishTitle,
        seo_description: publishDescription
      })

      const updatedDocs = documents.map(doc => 
        doc.id === currentDocument.id ? updatedDoc : doc
      )

      setCurrentDocument(updatedDoc)
      setDocuments(updatedDocs)
      setPublishDialogOpen(false)
      
      toast({
        title: "Document published!",
        description: "Your document is now live on the web",
        action: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(publishedUrl, '_blank')}
          >
            <Share className="h-4 w-4 mr-2" />
            View
          </Button>
        )
      })
    } catch (error) {
      console.error('Error publishing document:', error)
      toast({
        title: "Error",
        description: "Failed to publish document",
        variant: "destructive"
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      toast({
        title: "Error",
        description: "Failed to sign in",
        variant: "destructive"
      })
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      toast({
        title: "Success",
        description: "Account created successfully!"
      })
    } catch (error) {
      console.error('Error signing up:', error)
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive"
      })
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setDocuments([])
      setCurrentDocument(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onPublish={handlePublish}
        currentDocument={currentDocument}
        user={user}
        onSignOut={signOut}
      />
      
      <div className="flex">
        <Sidebar 
          documents={documents}
          currentDocument={currentDocument}
          onDocumentSelect={setCurrentDocument}
          onNewDocument={createNewDocument}
        />
        
        <main className="flex-1 min-h-screen">
          {currentDocument ? (
            <div className="h-full">
              <div className="border-b bg-white dark:bg-gray-900 px-6 py-3">
                <EditorModeToggle 
                  mode={editorMode}
                  onModeChange={setEditorMode}
                />
              </div>
              
              <div className="h-full bg-white dark:bg-gray-900">
                {editorMode === 'rich' ? (
                  <BlockEditor
                    content={currentDocument.markdown_content || ''}
                    onChange={(content) => saveDocument(currentDocument.title, content)}
                    title={currentDocument.title}
                    onTitleChange={(title) => saveDocument(title, currentDocument.markdown_content || '')}
                  />
                ) : (
                  <MarkdownEditor
                    content={currentDocument.markdown_content || ''}
                    onChange={(content) => saveDocument(currentDocument.title, content)}
                    title={currentDocument.title}
                    onTitleChange={(title) => saveDocument(title, currentDocument.markdown_content || '')}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">No document selected</h2>
                <p className="text-gray-600 mb-6">Create a new document to get started</p>
                <Button onClick={createNewDocument}>
                  Create New Document
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="publish-title">Title</Label>
              <Input
                id="publish-title"
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                placeholder="Enter title for published document"
              />
            </div>
            <div>
              <Label htmlFor="publish-description">Description (Optional)</Label>
              <Textarea
                id="publish-description"
                value={publishDescription}
                onChange={(e) => setPublishDescription(e.target.value)}
                placeholder="Enter a brief description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={publishDocument}>
                <Globe className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

export default App