import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

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

// Helper functions for database operations
export const db = {
  // Document operations
  async getDocuments(userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data as Document[]
  },

  async getDocument(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Document
  },

  async createDocument(document: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single()
    
    if (error) throw error
    return data as Document
  },

  async updateDocument(id: string, updates: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Document
  },

  async deleteDocument(id: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Website operations
  async getWebsites(userId: string) {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Website[]
  },

  async createWebsite(website: Partial<Website>) {
    const { data, error } = await supabase
      .from('websites')
      .insert(website)
      .select()
      .single()
    
    if (error) throw error
    return data as Website
  },

  // Media operations
  async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('media')
      .upload(path, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(path)
    
    return { path: data.path, publicUrl }
  },

  async saveMediaFile(mediaFile: Partial<MediaFile>) {
    const { data, error } = await supabase
      .from('media_files')
      .insert(mediaFile)
      .select()
      .single()
    
    if (error) throw error
    return data as MediaFile
  }
}