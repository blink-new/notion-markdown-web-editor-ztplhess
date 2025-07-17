import { blink } from '@/blink/client'

// Database types
export interface Document {
  id: string
  user_id: string
  title: string
  content: any // JSONB content
  markdown_content?: string
  parent_id?: string
  is_published: boolean
  published_url?: string
  custom_domain?: string
  seo_title?: string
  seo_description?: string
  cover_image_url?: string
  icon_emoji?: string
  position: number
  created_at: string
  updated_at: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  content: any
  markdown_content?: string
  version_number: number
  created_at: string
  created_by: string
}

export interface Website {
  id: string
  user_id: string
  name: string
  description?: string
  custom_domain?: string
  subdomain?: string
  theme_config: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WebsitePage {
  id: string
  website_id: string
  document_id: string
  slug: string
  is_homepage: boolean
  position: number
  created_at: string
}

export interface MediaFile {
  id: string
  user_id: string
  document_id?: string
  filename: string
  original_filename: string
  file_size?: number
  mime_type?: string
  storage_path: string
  public_url: string
  alt_text?: string
  created_at: string
}

// Temporary localStorage-based storage until database is available
const STORAGE_KEYS = {
  DOCUMENTS: 'notion_editor_documents',
  WEBSITES: 'notion_editor_websites',
  MEDIA_FILES: 'notion_editor_media_files'
}

// Helper functions for database operations
export const db = {
  // Document operations
  async getDocuments(userId: string): Promise<Document[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
      const allDocs: Document[] = stored ? JSON.parse(stored) : []
      return allDocs
        .filter(doc => doc.user_id === userId)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    } catch (error) {
      console.error('Error getting documents:', error)
      return []
    }
  },

  async getDocument(id: string): Promise<Document> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
      const allDocs: Document[] = stored ? JSON.parse(stored) : []
      const doc = allDocs.find(d => d.id === id)
      if (!doc) {
        throw new Error('Document not found')
      }
      return doc
    } catch (error) {
      throw new Error('Document not found')
    }
  },

  async createDocument(document: Partial<Document>): Promise<Document> {
    try {
      const newDoc: Document = {
        id: crypto.randomUUID(),
        user_id: document.user_id!,
        title: document.title || 'Untitled Document',
        content: document.content || {},
        markdown_content: document.markdown_content || '',
        parent_id: document.parent_id || null,
        is_published: document.is_published || false,
        published_url: document.published_url || null,
        custom_domain: document.custom_domain || null,
        seo_title: document.seo_title || null,
        seo_description: document.seo_description || null,
        cover_image_url: document.cover_image_url || null,
        icon_emoji: document.icon_emoji || null,
        position: document.position || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
      const allDocs: Document[] = stored ? JSON.parse(stored) : []
      allDocs.push(newDoc)
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(allDocs))
      
      return newDoc
    } catch (error) {
      throw new Error('Failed to create document')
    }
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
      const allDocs: Document[] = stored ? JSON.parse(stored) : []
      const docIndex = allDocs.findIndex(d => d.id === id)
      
      if (docIndex === -1) {
        throw new Error('Document not found')
      }

      const updatedDoc = {
        ...allDocs[docIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      allDocs[docIndex] = updatedDoc
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(allDocs))
      
      return updatedDoc
    } catch (error) {
      throw new Error('Failed to update document')
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
      const allDocs: Document[] = stored ? JSON.parse(stored) : []
      const filteredDocs = allDocs.filter(d => d.id !== id)
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filteredDocs))
    } catch (error) {
      throw new Error('Failed to delete document')
    }
  },

  // Website operations
  async getWebsites(userId: string): Promise<Website[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WEBSITES)
      const allSites: Website[] = stored ? JSON.parse(stored) : []
      return allSites
        .filter(site => site.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error getting websites:', error)
      return []
    }
  },

  async createWebsite(website: Partial<Website>): Promise<Website> {
    try {
      const newSite: Website = {
        id: crypto.randomUUID(),
        user_id: website.user_id!,
        name: website.name || 'Untitled Website',
        description: website.description || null,
        custom_domain: website.custom_domain || null,
        subdomain: website.subdomain || null,
        theme_config: website.theme_config || {},
        is_active: website.is_active || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const stored = localStorage.getItem(STORAGE_KEYS.WEBSITES)
      const allSites: Website[] = stored ? JSON.parse(stored) : []
      allSites.push(newSite)
      localStorage.setItem(STORAGE_KEYS.WEBSITES, JSON.stringify(allSites))
      
      return newSite
    } catch (error) {
      throw new Error('Failed to create website')
    }
  },

  // Media operations
  async uploadFile(file: File, path: string) {
    try {
      const { publicUrl } = await blink.storage.upload(file, path, { upsert: true })
      return { path, publicUrl }
    } catch (error) {
      throw new Error('Failed to upload file')
    }
  },

  async saveMediaFile(mediaFile: Partial<MediaFile>): Promise<MediaFile> {
    try {
      const newFile: MediaFile = {
        id: crypto.randomUUID(),
        user_id: mediaFile.user_id!,
        document_id: mediaFile.document_id || null,
        filename: mediaFile.filename!,
        original_filename: mediaFile.original_filename!,
        file_size: mediaFile.file_size || null,
        mime_type: mediaFile.mime_type || null,
        storage_path: mediaFile.storage_path!,
        public_url: mediaFile.public_url!,
        alt_text: mediaFile.alt_text || null,
        created_at: new Date().toISOString()
      }

      const stored = localStorage.getItem(STORAGE_KEYS.MEDIA_FILES)
      const allFiles: MediaFile[] = stored ? JSON.parse(stored) : []
      allFiles.push(newFile)
      localStorage.setItem(STORAGE_KEYS.MEDIA_FILES, JSON.stringify(allFiles))
      
      return newFile
    } catch (error) {
      throw new Error('Failed to save media file')
    }
  }
}