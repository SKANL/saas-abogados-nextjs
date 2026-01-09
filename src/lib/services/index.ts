/**
 * Services Module - Centralized Export
 * 
 * Provides a unified interface for all data services.
 * 
 * @example
 * ```tsx
 * import { services } from '@/lib/services'
 * 
 * const { data, error } = await services.clients.list()
 * ```
 */

// Service implementations
export { authService } from './auth.service'
export { profileService } from './profile.service'
export { clientsService } from './clients.service'
export { contractTemplatesService, questionnaireTemplatesService } from './templates.service'
export { documentsService } from './documents.service'
export { answersService } from './answers.service'
export { portalService } from './portal.service'

// Types
export type * from './types'

// ============================================
// Unified Services Object
// ============================================

import { authService } from './auth.service'
import { profileService } from './profile.service'
import { clientsService } from './clients.service'
import { contractTemplatesService, questionnaireTemplatesService } from './templates.service'
import { documentsService } from './documents.service'
import { answersService } from './answers.service'
import { portalService } from './portal.service'

/**
 * Unified services object for convenient access
 */
export const services = {
  auth: authService,
  profile: profileService,
  clients: clientsService,
  contractTemplates: contractTemplatesService,
  questionnaireTemplates: questionnaireTemplatesService,
  documents: documentsService,
  answers: answersService,
  portal: portalService,
} as const

export default services
