<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Управление пользователями</h1>
        <div class="flex items-center space-x-3">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по email или имени..."
              class="w-64 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="debouncedSearch"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <NuxtLink to="/panel/users/new" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Добавить пользователя
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Users table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>

      <div v-else-if="users.length === 0" class="p-6 text-center text-gray-500">
        Пользователи не найдены
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роли
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API ключ
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Создан
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.name || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.roles || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 font-mono">
                    {{ user.apikey ? maskApiKey(user.apikey) : '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <NuxtLink 
                      :to="`/panel/users/${user.id}/edit`"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Редактировать
                    </NuxtLink>
                    <button
                      @click="regenerateApiKey(user.id)"
                      :disabled="regeneratingKeys.includes(user.id)"
                      class="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      {{ regeneratingKeys.includes(user.id) ? 'Обновление...' : 'Обновить ключ' }}
                    </button>
                    <button
                      @click="confirmDelete(user)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Предыдущая
              </button>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.pages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Следующая
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Показано <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
                  до <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                  из <span class="font-medium">{{ pagination.total }}</span> результатов
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    @click="changePage(pagination.page - 1)"
                    :disabled="pagination.page <= 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Предыдущая
                  </button>
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === pagination.page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  <button
                    @click="changePage(pagination.page + 1)"
                    :disabled="pagination.page >= pagination.pages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Следующая
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="userToDelete" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900">Подтвердить удаление</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Вы действительно хотите удалить пользователя "{{ userToDelete.email }}"?
              Это действие нельзя отменить.
            </p>
          </div>
          <div class="flex justify-center space-x-4 mt-4">
            <button
              @click="userToDelete = null"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Отмена
            </button>
            <button
              @click="deleteUser"
              :disabled="deleting"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {{ deleting ? 'Удаление...' : 'Удалить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

// Reactive data
const loading = ref(true)
const deleting = ref(false)
const users = ref([])
const searchQuery = ref('')
const userToDelete = ref(null)
const regeneratingKeys = ref([])

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// Computed
const visiblePages = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.pages
  const delta = 2
  const range = []
  const start = Math.max(1, current - delta)
  const end = Math.min(total, current + delta)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  return range
})

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/panel/users', {
      query: {
        page: pagination.value?.page || 1,
        limit: pagination.value?.limit || 20,
        search: searchQuery.value || ''
      }
    })
    
    users.value = response?.data || []
    if (response?.pagination) {
      pagination.value = {
        ...pagination.value,
        ...response.pagination
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.error('Ошибка при загрузке пользователей')
    users.value = []
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (pagination.value && page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    fetchUsers()
  }
}

// Simple debounce implementation
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const debouncedSearch = debounce(() => {
  if (pagination.value) {
    pagination.value.page = 1
    fetchUsers()
  }
}, 300)

const confirmDelete = (user) => {
  userToDelete.value = user
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  deleting.value = true
  try {
    await $fetch(`/api/panel/users/${userToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    toast.success('Пользователь успешно удален')
    userToDelete.value = null
    await fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    toast.error('Ошибка при удалении пользователя')
  } finally {
    deleting.value = false
  }
}

const regenerateApiKey = async (userId) => {
  regeneratingKeys.value.push(userId)
  
  try {
    const { data } = await $fetch(`/api/panel/users/${userId}/regenerate-apikey`, {
      method: 'POST'
    })
    
    // Update user in the list
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex] = data
    }
    
    toast.success('API ключ успешно обновлен')
  } catch (error) {
    console.error('Error regenerating API key:', error)
    toast.error('Ошибка при обновлении API ключа')
  } finally {
    regeneratingKeys.value = regeneratingKeys.value.filter(id => id !== userId)
  }
}

const maskApiKey = (apikey) => {
  if (!apikey) return ''
  return apikey.substring(0, 8) + '****' + apikey.substring(apikey.length - 8)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Load data on mount
onMounted(() => {
  fetchUsers()
})

// Watch search query
watch(searchQuery, () => {
  debouncedSearch()
})
</script>