/**
 * Admin middleware - protects routes that require admin authentication
 * Automatically applied to all pages in /panel/ directory
 * Redirects unauthenticated users to /authpage/login
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, session, clear } = useUserSession()

  // Check if user is authenticated
  if (!session.value) {
    // Redirect to login page for panel routes
    return navigateTo('/authpage/login')
  }

  // Check if user exists and has admin role
  if (!user.value || (!user.value?.roles?.includes('admin') && !user.value?.roles?.includes('ROLE_ADMIN'))) {
    // Clear invalid session and redirect to login
    await clear()
    return navigateTo('/authpage/login')
  }

  // User is authenticated and has admin role, allow access
})

