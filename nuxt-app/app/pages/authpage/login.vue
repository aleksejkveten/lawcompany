<template>
  <div>
  <NuxtLayout name="admin-login">
  <div class="flex min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 m-auto bg-white rounded-lg shadow-md">
      <div class="flex justify-center mb-8">
        <NuxtLink to="/" class="text-3xl font-bold text-900">Юридическая фирма</NuxtLink>
      </div>
      
      <h1 class="mb-6 text-2xl font-bold text-center text-gray-800">Вход в админ-панель</h1>
      
      <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block mb-2 text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:border-transparent"
            placeholder="admin@example.com"
          />
        </div>
        
        <div>
          <label for="password" class="block mb-2 text-sm font-medium text-gray-700">Пароль</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:border-transparent"
            placeholder="********"
          />
        </div>
        
        <div>
          <button
            type="submit"
            class="w-full cursor-pointer px-4 py-2 text-white bg-indigo-700 hover:bg-indigo-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-800"
            :disabled="loading"

          >
            <span v-if="loading">Загрузка...</span>
            <span v-else>Войти</span>
          </button>
        </div>
      </form>
      
      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-sm text-indigo-700 hover:underline">Вернуться на сайт</NuxtLink>
      </div>
    </div>
  </div>
  </NuxtLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
//import { useToastStore } from '@/stores/toast';
const { loggedIn, user, fetch: refreshSession } = useUserSession()

//const toast = useToastStore()

const form = ref({
  email: '',
  password: ''
})

onMounted(() => {
  if (loggedIn.value) {
    navigateTo('/panel/dashboard')
  }
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {

  try {
    loading.value = true
    error.value = ''
    
    const response = await $fetch('/api/auth-admin/login', {
      method: 'POST',
      body: form.value
    })


    
    if (response.success) {
      await refreshSession()
      //toast.success('Вход выполнен успешно')
      navigateTo('/panel/dashboard')
    } else {
      error.value = response.message || 'Произошла ошибка при входе'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Неверные учетные данные'
    //toast.error('Ошибка входа')
  } finally {
    loading.value = false
  }
}
</script>
