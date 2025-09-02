<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/panel/users" 
                  class="flex items-center text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Редактировать пользователя</h1>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
    </div>

    <div v-else-if="!user" class="bg-white rounded-lg shadow p-6">
      <div class="text-center text-gray-500">
        Пользователь не найден
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- User form -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Основные данные</h2>
        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- User basic info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите email пользователя"
              >
            </div>

            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Имя
              </label>
              <input
                v-model="form.name"
                type="text"
                id="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите имя пользователя"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Новый пароль
              </label>
              <input
                v-model="form.password"
                type="password"
                id="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Оставьте пустым, если не хотите менять"
              >
            </div>

            <div>
              <label for="roles" class="block text-sm font-medium text-gray-700 mb-2">
                Роли
              </label>
              <input
                v-model="form.roles"
                type="text"
                id="roles"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите роли (например: admin,user)"
              >
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3">
            <NuxtLink to="/panel/users" 
                      class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
              Отмена
            </NuxtLink>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ submitting ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>

      <!-- API Key management -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Управление API ключом</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Текущий API ключ
            </label>
            <div class="flex items-center space-x-3">
              <div class="flex-1">
                <input
                  :value="showApiKey ? user.apikey : maskApiKey(user.apikey)"
                  type="text"
                  readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                >
              </div>
              <button
                @click="showApiKey = !showApiKey"
                class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {{ showApiKey ? 'Скрыть' : 'Показать' }}
              </button>
              <button
                @click="copyApiKey"
                class="px-3 py-2 text-sm text-blue-600 hover:text-blue-900"
              >
                Копировать
              </button>
            </div>
          </div>

          <div>
            <button
              @click="regenerateApiKey"
              :disabled="regenerating"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ regenerating ? 'Генерация...' : 'Перегенерировать API ключ' }}
            </button>
            <p class="mt-2 text-sm text-gray-500">
              Внимание: старый API ключ перестанет работать после генерации нового.
            </p>
          </div>
        </div>
      </div>

      <!-- User info -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Информация</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Создан</label>
            <p class="text-sm text-gray-900">{{ formatDate(user.createdAt) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Обновлен</label>
            <p class="text-sm text-gray-900">{{ formatDate(user.updatedAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const regenerating = ref(false)
const showApiKey = ref(false)
const user = ref(null)

const form = ref({
  email: '',
  name: '',
  password: '',
  roles: ''
})

// Fetch user data
const fetchUser = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/users/${route.params.id}`)
    user.value = data
    
    // Fill form
    form.value = {
      email: data.email || '',
      name: data.name || '',
      password: '',
      roles: data.roles || ''
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    toast.error('Ошибка при загрузке пользователя')
  } finally {
    loading.value = false
  }
}

// Submit form
const submitForm = async () => {
  if (!form.value.email.trim()) {
    toast.error('Email обязателен для заполнения')
    return
  }

  submitting.value = true
  
  try {
    const payload = {
      email: form.value.email.trim(),
      name: form.value.name.trim() || null,
      roles: form.value.roles.trim() || null
    }

    // Add password only if provided
    if (form.value.password.trim()) {
      payload.password = form.value.password
    }

    const { data } = await $fetch(`/api/panel/users/${route.params.id}`, {
      method: 'PUT',
      body: payload
    })

    // Update user data
    user.value = data
    form.value.password = '' // Clear password field

    toast.success('Пользователь успешно обновлен')
  } catch (error) {
    console.error('Error updating user:', error)
    
    if (error.statusCode === 400) {
      toast.error(error.statusMessage || 'Некорректные данные')
    } else {
      toast.error('Ошибка при обновлении пользователя')
    }
  } finally {
    submitting.value = false
  }
}

// Regenerate API key
const regenerateApiKey = async () => {
  if (!confirm('Вы действительно хотите перегенерировать API ключ? Старый ключ перестанет работать.')) {
    return
  }

  regenerating.value = true
  
  try {
    const { data } = await $fetch(`/api/panel/users/${route.params.id}/regenerate-apikey`, {
      method: 'POST'
    })
    
    user.value = data
    toast.success('API ключ успешно перегенерирован')
  } catch (error) {
    console.error('Error regenerating API key:', error)
    toast.error('Ошибка при перегенерации API ключа')
  } finally {
    regenerating.value = false
  }
}

// Copy API key to clipboard
const copyApiKey = async () => {
  try {
    await navigator.clipboard.writeText(user.value.apikey)
    toast.success('API ключ скопирован в буфер обмена')
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    toast.error('Не удалось скопировать API ключ')
  }
}

// Mask API key
const maskApiKey = (apikey) => {
  if (!apikey) return ''
  return apikey.substring(0, 8) + '****' + apikey.substring(apikey.length - 8)
}

// Format date
const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Load data on mount
onMounted(() => {
  fetchUser()
})
</script>