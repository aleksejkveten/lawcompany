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
        <h1 class="text-2xl font-bold text-gray-900">Добавить пользователя</h1>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
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
              Пароль *
            </label>
            <input
              v-model="form.password"
              type="password"
              id="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите пароль"
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

        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">
                API ключ
              </h3>
              <div class="mt-2 text-sm text-blue-700">
                <p>API ключ будет автоматически сгенерирован при создании пользователя. Его можно будет обновить позже в разделе редактирования.</p>
              </div>
            </div>
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
            {{ submitting ? 'Создание...' : 'Создать пользователя' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

const submitting = ref(false)

const form = ref({
  email: '',
  name: '',
  password: '',
  roles: ''
})

// Submit form
const submitForm = async () => {
  if (!form.value.email.trim() || !form.value.password.trim()) {
    toast.error('Email и пароль обязательны для заполнения')
    return
  }

  submitting.value = true
  
  try {
    const payload = {
      email: form.value.email.trim(),
      name: form.value.name.trim() || null,
      password: form.value.password,
      roles: form.value.roles.trim() || null
    }

    await $fetch('/api/panel/users', {
      method: 'POST',
      body: payload
    })

    toast.success('Пользователь успешно создан')
    await navigateTo('/panel/users')
  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error.statusCode === 400) {
      toast.error(error.statusMessage || 'Некорректные данные')
    } else {
      toast.error('Ошибка при создании пользователя')
    }
  } finally {
    submitting.value = false
  }
}
</script>