<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/panel/companies" 
                  class="flex items-center text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Редактировать компанию</h1>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
    </div>

    <div v-else-if="!company" class="bg-white rounded-lg shadow p-6">
      <div class="text-center text-gray-500">
        Компания не найдена
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Company basic info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Название компании *
            </label>
            <input
              v-model="form.name"
              type="text"
              id="name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название компании"
            >
          </div>

          <div>
            <label for="unp" class="block text-sm font-medium text-gray-700 mb-2">
              УНП
            </label>
            <input
              v-model="form.unp"
              type="text"
              id="unp"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите УНП"
            >
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <NuxtLink to="/panel/companies" 
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
  </div>
  </NuxtLayout>
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
const company = ref(null)

const form = ref({
  name: '',
  unp: ''
})

// Fetch company data
const fetchCompany = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/companies/${route.params.id}`)
    company.value = data
    
    // Fill form
    form.value.name = data.name || ''
    form.value.unp = data.unp || ''
  } catch (error) {
    console.error('Error fetching company:', error)
    toast.error('Ошибка при загрузке компании')
  } finally {
    loading.value = false
  }
}

// Submit form
const submitForm = async () => {
  if (!form.value.name.trim()) {
    toast.error('Название компании обязательно')
    return
  }

  submitting.value = true
  
  try {
    const payload = {
      name: form.value.name.trim(),
      unp: form.value.unp.trim() || null
    }

    await $fetch(`/api/panel/companies/${route.params.id}`, {
      method: 'PUT',
      body: payload
    })

    toast.success('Компания успешно обновлена')
    await navigateTo('/panel/companies')
  } catch (error) {
    console.error('Error updating company:', error)
    toast.error('Ошибка при обновлении компании')
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchCompany()
})
</script>