import type { Feature } from './schema'

const DOCS = 'https://clerk.com/docs'

/**
 * Every Clerk feature any project leans on. Projects reference these by id so the
 * gallery can group by feature and link to the same doc everywhere.
 */
export const features = {
  'custom-ui-elements': {
    id: 'custom-ui-elements',
    name: { en: 'Custom sign-in UI with Clerk Elements', es: 'UI de sign-in a medida con Clerk Elements' },
    docs: `${DOCS}/customization/elements/overview`,
  },
  'anonymous-to-account': {
    id: 'anonymous-to-account',
    name: { en: 'Anonymous first, account later', es: 'Anónimo primero, cuenta después' },
    docs: `${DOCS}/guides/development/custom-flows/overview`,
  },
  'user-metadata': {
    id: 'user-metadata',
    name: { en: 'User metadata', es: 'Metadata de usuario' },
    docs: `${DOCS}/guides/users/extending`,
  },
  'backend-verification': {
    id: 'backend-verification',
    name: {
      en: 'Verifying session tokens on the backend',
      es: 'Verificación de tokens de sesión en el backend',
    },
    docs: `${DOCS}/guides/sessions/manual-jwt-verification`,
  },
  passkeys: {
    id: 'passkeys',
    name: { en: 'Passkeys', es: 'Passkeys' },
    docs: `${DOCS}/guides/configure/auth-strategies/sign-up-sign-in-options`,
  },
  'device-flow': {
    id: 'device-flow',
    name: { en: 'OAuth Device Authorization Grant', es: 'OAuth Device Authorization Grant' },
    docs: `${DOCS}/guides/configure/auth-strategies/oauth/device-authorization-grant`,
  },
  'go-sdk': {
    id: 'go-sdk',
    name: { en: 'Go SDK', es: 'SDK de Go' },
    docs: `${DOCS}/reference/go/overview`,
  },
  'm2m-tokens': {
    id: 'm2m-tokens',
    name: { en: 'Machine-to-machine tokens', es: 'Tokens máquina a máquina' },
    docs: `${DOCS}/guides/development/machine-auth/m2m-tokens`,
  },
  'expo-sdk': {
    id: 'expo-sdk',
    name: { en: 'Expo SDK', es: 'SDK de Expo' },
    docs: `${DOCS}/reference/expo/overview`,
  },
  invitations: {
    id: 'invitations',
    name: { en: 'Invitations', es: 'Invitaciones' },
    docs: `${DOCS}/guides/users/inviting`,
  },
  organizations: {
    id: 'organizations',
    name: { en: 'Organizations', es: 'Organizaciones' },
    docs: `${DOCS}/guides/organizations/overview`,
  },
  'custom-roles': {
    id: 'custom-roles',
    name: { en: 'Custom roles and permissions', es: 'Roles y permisos personalizados' },
    docs: `${DOCS}/guides/organizations/roles-and-permissions`,
  },
  saml: {
    id: 'saml',
    name: { en: 'Enterprise SSO (SAML)', es: 'SSO empresarial (SAML)' },
    docs: `${DOCS}/guides/configure/auth-strategies/enterprise-connections/overview`,
  },
  'billing-b2b': {
    id: 'billing-b2b',
    name: { en: 'Billing for organizations', es: 'Billing para organizaciones' },
    docs: `${DOCS}/guides/billing/for-b2b`,
  },
  'billing-b2c': {
    id: 'billing-b2c',
    name: { en: 'Billing for users', es: 'Billing para usuarios' },
    docs: `${DOCS}/guides/billing/for-b2c`,
  },
  'satellite-domains': {
    id: 'satellite-domains',
    name: { en: 'Satellite domains', es: 'Dominios satélite' },
    docs: `${DOCS}/guides/dashboard/dns-domains/satellite-domains`,
  },
  'api-keys': {
    id: 'api-keys',
    name: { en: 'API keys', es: 'API keys' },
    docs: `${DOCS}/guides/development/machine-auth/api-keys`,
  },
  'oauth-provider': {
    id: 'oauth-provider',
    name: { en: 'Clerk as an OAuth provider', es: 'Clerk como proveedor OAuth' },
    docs: `${DOCS}/guides/configure/auth-strategies/oauth/how-clerk-implements-oauth`,
  },
  'oauth-pkce': {
    id: 'oauth-pkce',
    name: { en: 'OAuth authorization code with PKCE', es: 'OAuth authorization code con PKCE' },
    docs: `${DOCS}/guides/development/machine-auth/overview`,
  },
  mcp: {
    id: 'mcp',
    name: { en: 'MCP server authentication', es: 'Autenticación de servidores MCP' },
    docs: `${DOCS}/guides/development/mcp/overview`,
  },
  'multi-session': {
    id: 'multi-session',
    name: { en: 'Multi-session applications', es: 'Aplicaciones multi-sesión' },
    docs: `${DOCS}/guides/development/custom-flows/authentication/multi-session-applications`,
  },
  'has-helper': {
    id: 'has-helper',
    name: { en: 'Gating with has()', es: 'Control de acceso con has()' },
    docs: `${DOCS}/reference/backend/types/auth-object`,
  },
  'chrome-extension': {
    id: 'chrome-extension',
    name: { en: 'Chrome Extension SDK', es: 'SDK para extensiones de Chrome' },
    docs: `${DOCS}/reference/chrome-extension/overview`,
  },
  'sync-host': {
    id: 'sync-host',
    name: { en: 'Sync host for extensions', es: 'Sync host para extensiones' },
    docs: `${DOCS}/reference/chrome-extension/sync-host`,
  },
  webhooks: {
    id: 'webhooks',
    name: { en: 'Webhooks', es: 'Webhooks' },
    docs: `${DOCS}/guides/development/webhooks/overview`,
  },
  reverification: {
    id: 'reverification',
    name: { en: 'Reverification (step-up auth)', es: 'Reverificación (step-up)' },
    docs: `${DOCS}/guides/secure/reverification`,
  },
  'sessions-api': {
    id: 'sessions-api',
    name: { en: 'Sessions API', es: 'API de sesiones' },
    docs: `${DOCS}/reference/backend/sessions/get-session-list`,
  },
  'user-import': {
    id: 'user-import',
    name: { en: 'Importing users with password hashes', es: 'Importar usuarios con hashes de contraseña' },
    docs: `${DOCS}/guides/development/migrating/overview`,
  },
  'sign-in-tokens': {
    id: 'sign-in-tokens',
    name: { en: 'Sign-in tokens', es: 'Tokens de sign-in' },
    docs: `${DOCS}/reference/backend/sign-in-tokens/create-sign-in-token`,
  },
} as const satisfies Record<string, Feature>

export type FeatureId = keyof typeof features

export function feature(id: FeatureId): Feature {
  return features[id]
}
