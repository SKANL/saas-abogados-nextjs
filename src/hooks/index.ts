/**
 * Custom Hooks - Centralized Export
 * 
 * All hooks for the application.
 * 
 * @example
 * ```tsx
 * import { useAuth, useClients, useProfile } from '@/hooks'
 * ```
 */

export { useAuth } from './use-auth'
export { useClients, useClient, useDashboardStats } from './use-clients'
export { useContractTemplates, useQuestionnaireTemplates, useQuestionnaire } from './use-templates'
export { useProfile } from './use-profile'
export { usePortal } from './use-portal'
export { useRealtimeClients, useRealtimeTable } from './use-realtime'
export { useIsMobile } from './use-mobile'
export { useThemeMode } from './use-theme-mode'
