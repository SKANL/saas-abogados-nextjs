/**
 * Data Service Types
 * 
 * These interfaces define a generic repository pattern that is
 * agnostic of the underlying data provider (Supabase, REST API, etc.)
 * 
 * This allows swapping the data layer without changing the business logic.
 */

import type {
  Client,
  ClientInsert,
  ClientUpdate,
  ClientWithDetails,
  ClientCreateInput,
  ContractTemplate,
  ContractTemplateInsert,
  QuestionnaireTemplate,
  QuestionnaireTemplateInsert,
  Question,
  QuestionInsert,
  Profile,
  ProfileUpdate,
  ClientDocument,
  ClientDocumentInsert,
  ClientAnswer,
  ClientAnswerInsert,
  ClientLink,
  AuditLogInsert,
} from '@/lib/supabase/database.types'

// ============================================
// Generic Service Result Types
// ============================================

/**
 * Standard result wrapper for all service operations
 */
export interface ServiceResult<T> {
  data: T | null
  error: ServiceError | null
}

/**
 * Service error with code and message
 */
export interface ServiceError {
  code: string
  message: string
  details?: unknown
}

/**
 * Pagination options for list queries
 */
export interface PaginationOptions {
  page?: number
  pageSize?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> extends ServiceResult<T[]> {
  count: number | null
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// Service Interfaces (Repository Pattern)
// ============================================

/**
 * Authentication service interface
 */
export interface IAuthService {
  signUp(email: string, password: string, profileData?: { firm_name?: string }): Promise<ServiceResult<{ userId: string }>>
  signIn(email: string, password: string): Promise<ServiceResult<{ userId: string }>>
  signOut(): Promise<ServiceResult<void>>
  getCurrentUser(): Promise<ServiceResult<{ id: string; email: string } | null>>
  resetPassword(email: string): Promise<ServiceResult<void>>
  updatePassword(newPassword: string): Promise<ServiceResult<void>>
}

/**
 * Profile service interface
 */
export interface IProfileService {
  getProfile(): Promise<ServiceResult<Profile>>
  updateProfile(data: ProfileUpdate): Promise<ServiceResult<Profile>>
  uploadLogo(file: File): Promise<ServiceResult<{ url: string }>>
}

/**
 * Clients service interface
 */
export interface IClientsService {
  list(options?: PaginationOptions): Promise<PaginatedResult<Client>>
  getById(id: string): Promise<ServiceResult<ClientWithDetails>>
  create(data: ClientCreateInput): Promise<ServiceResult<Client>>
  update(id: string, data: ClientUpdate): Promise<ServiceResult<Client>>
  delete(id: string): Promise<ServiceResult<void>>
  softDelete(id: string): Promise<ServiceResult<void>>
  getByStatus(status: 'pending' | 'completed'): Promise<ServiceResult<Client[]>>
  getDashboardStats(): Promise<ServiceResult<{
    total: number
    pending: number
    completed: number
    recentActivity: Client[]
  }>>
}

/**
 * Contract templates service interface
 */
export interface IContractTemplatesService {
  list(): Promise<ServiceResult<ContractTemplate[]>>
  getById(id: string): Promise<ServiceResult<ContractTemplate>>
  create(name: string, file: File): Promise<ServiceResult<ContractTemplate>>
  delete(id: string): Promise<ServiceResult<void>>
}

/**
 * Questionnaire templates service interface
 */
export interface IQuestionnaireTemplatesService {
  list(): Promise<ServiceResult<(QuestionnaireTemplate & { questions: Question[] })[]>>
  getById(id: string): Promise<ServiceResult<QuestionnaireTemplate & { questions: Question[] }>>
  create(name: string, questions: string[]): Promise<ServiceResult<QuestionnaireTemplate>>
  update(id: string, name: string, questionTexts: string[]): Promise<ServiceResult<QuestionnaireTemplate>>
  delete(id: string): Promise<ServiceResult<void>>
}

/**
 * Client documents service interface
 */
export interface IDocumentsService {
  list(clientId: string): Promise<ServiceResult<ClientDocument[]>>
  upload(clientId: string, file: File, documentType: string): Promise<ServiceResult<ClientDocument>>
  delete(documentId: string): Promise<ServiceResult<void>>
  getDownloadUrl(fileUrl: string): Promise<ServiceResult<string>>
}

/**
 * Client answers service interface
 */
export interface IAnswersService {
  list(clientId: string): Promise<ServiceResult<ClientAnswer[]>>
  submit(answers: ClientAnswerInsert[]): Promise<ServiceResult<ClientAnswer[]>>
}

/**
 * Magic links / Portal service interface
 */
export interface IPortalService {
  generateLink(clientId: string, expiresInHours?: number): Promise<ServiceResult<{ token: string; url: string }>>
  validateLink(token: string): Promise<ServiceResult<{ 
    valid: boolean
    clientId?: string
    expired?: boolean
    revoked?: boolean
  }>>
  revokeLink(linkId: string): Promise<ServiceResult<void>>
  getClientByToken(token: string): Promise<ServiceResult<ClientWithDetails>>
  signContract(clientId: string, signatureData: { typed_name: string }): Promise<ServiceResult<void>>
  completePortal(clientId: string): Promise<ServiceResult<void>>
}

/**
 * Audit logging service interface
 */
export interface IAuditService {
  log(data: AuditLogInsert): Promise<ServiceResult<void>>
  getClientLogs(clientId: string): Promise<ServiceResult<{ action: string; created_at: string; details: unknown }[]>>
}

/**
 * Storage service interface
 */
export interface IStorageService {
  upload(bucket: string, path: string, file: File): Promise<ServiceResult<{ url: string }>>
  download(bucket: string, path: string): Promise<ServiceResult<Blob>>
  delete(bucket: string, path: string): Promise<ServiceResult<void>>
  getPublicUrl(bucket: string, path: string): string
}

// ============================================
// Service Registry
// ============================================

/**
 * Central registry for all services
 * Allows dependency injection and easy testing
 */
export interface IServiceRegistry {
  auth: IAuthService
  profile: IProfileService
  clients: IClientsService
  contractTemplates: IContractTemplatesService
  questionnaireTemplates: IQuestionnaireTemplatesService
  documents: IDocumentsService
  answers: IAnswersService
  portal: IPortalService
  audit: IAuditService
  storage: IStorageService
}
