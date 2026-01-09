/**
 * Documents Service - Supabase Implementation
 * 
 * Handles client document upload, download, and management.
 */

import { supabase } from '@/lib/supabase/client'
import type { ClientDocument, ClientDocumentInsert } from '@/lib/supabase/database.types'
import type { IDocumentsService, ServiceResult } from './types'

/**
 * Create an error object
 */
function createError(code: string, message: string, details?: unknown) {
  return { code, message, details }
}

/**
 * Documents service implementation using Supabase
 */
export const documentsService: IDocumentsService = {
  /**
   * List all documents for a client
   */
  async list(clientId: string): Promise<ServiceResult<ClientDocument[]>> {
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('uploaded_at', { ascending: false })

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Upload a document for a client
   */
  async upload(
    clientId: string,
    file: File,
    documentType: string
  ): Promise<ServiceResult<ClientDocument>> {
    try {
      // Generate unique filename
      const ext = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `documents/${clientId}/${documentType}-${timestamp}.${ext}`

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('firm-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
        })

      if (uploadError) {
        return {
          data: null,
          error: createError('STORAGE_ERROR', uploadError.message, uploadError),
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('firm-assets')
        .getPublicUrl(fileName)

      // Create document record
      const documentData: ClientDocumentInsert = {
        client_id: clientId,
        document_type: documentType,
        file_url: publicUrl,
        file_size_bytes: file.size,
      }

      const { data, error } = await supabase
        .from('client_documents')
        .insert(documentData)
        .select()
        .single()

      if (error) {
        // Clean up uploaded file on error
        await supabase.storage.from('firm-assets').remove([fileName])
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      // Log audit event
      await supabase.from('audit_logs').insert({
        client_id: clientId,
        action: 'document_uploaded',
        resource_type: 'document',
        resource_id: data.id,
        details: {
          document_type: documentType,
          file_name: file.name,
          file_size: file.size,
        },
      })

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Delete a document
   */
  async delete(documentId: string): Promise<ServiceResult<void>> {
    try {
      // Get document to find file URL
      const { data: document } = await supabase
        .from('client_documents')
        .select('file_url, client_id')
        .eq('id', documentId)
        .single()

      // Delete record
      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', documentId)

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      // Try to delete file (non-blocking)
      if (document?.file_url) {
        const path = document.file_url.split('/firm-assets/')[1]
        if (path) {
          supabase.storage.from('firm-assets').remove([path]).catch(() => {})
        }
      }

      // Log audit event
      if (document?.client_id) {
        await supabase.from('audit_logs').insert({
          client_id: document.client_id,
          action: 'document_deleted',
          resource_type: 'document',
          resource_id: documentId,
        })
      }

      return { data: undefined, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Get a signed download URL for a file
   */
  async getDownloadUrl(fileUrl: string): Promise<ServiceResult<string>> {
    try {
      // Extract path from URL
      const path = fileUrl.split('/firm-assets/')[1]
      
      if (!path) {
        return {
          data: null,
          error: createError('INVALID_URL', 'Could not parse file URL'),
        }
      }

      // For public bucket, just return the URL
      // For private bucket, use createSignedUrl
      const { data } = supabase.storage.from('firm-assets').getPublicUrl(path)

      return { data: data.publicUrl, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },
}

export default documentsService
