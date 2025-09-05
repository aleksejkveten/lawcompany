<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <!-- Navigation and Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/panel/users" 
                      class="flex items-center text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад к списку
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ user?.name || user?.email || 'Загрузка...' }}
            </h1>
          </div>
          
          <div class="flex space-x-3" v-if="user">
            <NuxtLink :to="`/panel/users/${user.id}/edit`" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Редактировать
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-6">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="!user" class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-gray-500">
          Пользователь не найден
        </div>
      </div>

      <!-- User Details -->
      <div v-else class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Основная информация</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p class="text-gray-900 font-medium">{{ user.email }}</p>
            </div>
            
            <div v-if="user.name">
              <label class="block text-sm font-medium text-gray-500 mb-1">Имя</label>
              <p class="text-gray-900">{{ user.name }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <p class="text-gray-900 font-mono">{{ user.id }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус</label>
              <span :class="user.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ user.isDeleted ? 'Удален' : 'Активен' }}
              </span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Дата создания</label>
              <p class="text-gray-900">{{ formatDate(user.createdAt) }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Дата обновления</label>
              <p class="text-gray-900">{{ formatDate(user.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Roles and Permissions -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Роли и права доступа</h3>
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-2">Роли</label>
            <div v-if="user.roles">
              <div class="flex flex-wrap gap-2">
                <span v-for="role in parseRoles(user.roles)" :key="role"
                      class="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {{ role }}
                </span>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              Роли не назначены
            </div>
          </div>
        </div>

        <!-- API Access -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">API доступ</h3>
          <div class="grid grid-cols-1 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-2">API ключ</label>
              <div v-if="user.apikey" class="space-y-3">
                <div class="flex items-center space-x-3">
                  <input 
                    :type="showApiKey ? 'text' : 'password'"
                    :value="user.apikey"
                    readonly
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                  >
                  <button 
                    @click="showApiKey = !showApiKey"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {{ showApiKey ? 'Скрыть' : 'Показать' }}
                  </button>
                  <button 
                    @click="copyApiKey"
                    class="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Копировать
                  </button>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-green-600">API ключ активен</span>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">
                API ключ не создан
              </div>
            </div>
          </div>
        </div>

        <!-- Account Statistics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Статистика аккаунта</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ getDaysFromCreation(user.createdAt) }}</div>
              <div class="text-sm text-gray-500">дней в системе</div>
            </div>
            
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ user.apikey ? '1' : '0' }}</div>
              <div class="text-sm text-gray-500">активных API ключей</div>
            </div>
            
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ getAccountType(user.roles) }}</div>
              <div class="text-sm text-gray-500">тип аккаунта</div>
            </div>
          </div>
        </div>

        <!-- Security Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Безопасность</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус пароля</label>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-green-600">Пароль установлен</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Последняя активность</label>
              <p class="text-gray-900">{{ formatDate(user.updatedAt) }}</p>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div class="flex items-start space-x-3">
              <svg class="h-5 w-5 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div>
                <h4 class="text-sm font-medium text-amber-800">Рекомендации по безопасности</h4>
                <p class="text-sm text-amber-700 mt-1">
                  Регулярно обновляйте пароль и API ключи для обеспечения безопасности аккаунта.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const user = ref(null)
const loading = ref(true)
const showApiKey = ref(false)

const fetchUser = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/users/${route.params.id}`)
    user.value = data
  } catch (error) {
    console.error('Error fetching user:', error)
    user.value = null
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Не указано'
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const parseRoles = (rolesString) => {
  if (!rolesString) return []
  try {
    return rolesString.split(',').map(role => role.trim()).filter(Boolean)
  } catch {
    return [rolesString]
  }
}

const getDaysFromCreation = (createdAt) => {
  if (!createdAt) return 0
  const now = new Date()
  const created = new Date(createdAt)
  const diffTime = Math.abs(now - created)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getAccountType = (roles) => {
  if (!roles) return 'Базовый'
  const rolesList = parseRoles(roles)
  if (rolesList.includes('admin')) return 'Админ'
  if (rolesList.includes('manager')) return 'Менеджер'
  if (rolesList.includes('user')) return 'Пользователь'
  return 'Базовый'
}

const copyApiKey = async () => {
  if (!user.value?.apikey) return
  
  try {
    await navigator.clipboard.writeText(user.value.apikey)
    // You can add a toast notification here
    console.log('API ключ скопирован в буфер обмена')
  } catch (error) {
    console.error('Ошибка копирования:', error)
  }
}

onMounted(() => {
  fetchUser()
})
</script>