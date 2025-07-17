import { supabase } from '@/blink/client'

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

// Helper functions for database operations using Supabase
export const db = {
  // Document operations
  async getDocuments(userId: string): Promise<Document[]> {
    if (!userId) {
      console.warn('No user ID provided to getDocuments')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Failed to load documents:', error)
        // Return empty array instead of throwing for better UX
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting documents:', error)
      // Return empty array instead of throwing for better UX
      return []
    }
  },

  async getDocument(id: string): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Failed to get document:', error)
        throw error
      }

      if (!data) {
        throw new Error('Document not found')
      }

      return data
    } catch (error) {
      console.error('Error getting document:', error)
      throw new Error('Document not found')
    }
  },

  async createDocument(document: Partial<Document>): Promise<Document> {
    try {
      const newDoc = {
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
        position: document.position || 0
      }

      const { data, error } = await supabase
        .from('documents')
        .insert([newDoc])
        .select()
        .single()

      if (error) {
        console.error('Failed to create document:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating document:', error)
      throw new Error('Failed to create document')
    }
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Failed to update document:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating document:', error)
      throw new Error('Failed to update document')
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Failed to delete document:', error)
        throw error
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      throw new Error('Failed to delete document')
    }
  },

  // Website operations
  async getWebsites(userId: string): Promise<Website[]> {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load websites:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting websites:', error)
      throw new Error('Failed to load websites')
    }
  },

  async createWebsite(website: Partial<Website>): Promise<Website> {
    try {
      const newSite = {
        user_id: website.user_id!,
        name: website.name || 'Untitled Website',
        description: website.description || null,
        custom_domain: website.custom_domain || null,
        subdomain: website.subdomain || null,
        theme_config: website.theme_config || {},
        is_active: website.is_active || false
      }

      const { data, error } = await supabase
        .from('websites')
        .insert([newSite])
        .select()
        .single()

      if (error) {
        console.error('Failed to create website:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating website:', error)
      throw new Error('Failed to create website')
    }
  },

  // Media operations
  async uploadFile(file: File, path: string) {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: true })

      if (error) {
        console.error('Failed to upload file:', error)
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path)

      return { path: data.path, publicUrl }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error('Failed to upload file')
    }
  },

  async saveMediaFile(mediaFile: Partial<MediaFile>): Promise<MediaFile> {
    try {
      const newFile = {
        user_id: mediaFile.user_id!,
        document_id: mediaFile.document_id || null,
        filename: mediaFile.filename!,
        original_filename: mediaFile.original_filename!,
        file_size: mediaFile.file_size || null,
        mime_type: mediaFile.mime_type || null,
        storage_path: mediaFile.storage_path!,
        public_url: mediaFile.public_url!,
        alt_text: mediaFile.alt_text || null
      }

      const { data, error } = await supabase
        .from('media_files')
        .insert([newFile])
        .select()
        .single()

      if (error) {
        console.error('Failed to save media file:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error saving media file:', error)
      throw new Error('Failed to save media file')
    }
  }
}