// server/middleware/admin-logged-in.ts
// Middleware для защиты админ API эндпоинтов
export default defineEventHandler(async (event) => {
  // Получаем путь запроса
  const path = event.context?.path || event.node.req?.url || ''

  // Проверяем, что запрос идет к API панели администратора
  if (!path.startsWith('/api/panel/')) {
    return // Пропускаем запросы не к админ API
  }

  try {
    // Получаем данные сессии
    const { user } = await getUserSession(event)
    
    // Проверяем существование пользователя
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - user session not found'
      })
    }
    
    // Проверяем роль администратора
    if (!user.roles?.includes('admin') && (user as any).roles !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - admin role required'
      })
    }
    
    // Добавляем данные авторизации в контекст для использования в API маршрутах
    event.context.auth = {
      user,
      isAdmin: true,
      timestamp: new Date()
    }
    
    // Не возвращаем ничего, чтобы middleware продолжил выполнение
    return
    
  } catch (error) {
    // Если ошибка уже создана через createError, пробрасываем её
    if ((error as any).statusCode) {
      throw error
    }
    
    // Обрабатываем неожиданные ошибки
    console.error('Admin middleware error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})