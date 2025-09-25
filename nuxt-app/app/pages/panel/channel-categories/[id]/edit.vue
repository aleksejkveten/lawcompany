<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/panel/channel-categories"
                  class="flex items-center text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Редактировать категорию канала</h1>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
    </div>

    <div v-else-if="!category" class="bg-white rounded-lg shadow p-6">
      <div class="text-center text-gray-500">
        Категория не найдена
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Category info -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Название *
          </label>
          <input
            v-model="form.name"
            type="text"
            id="name"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите название категории"
          >
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <NuxtLink to="/panel/channel-categories"
                    class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Отмена
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ submitting ? 'Сохранение...' : 'Сохранить изменения' }}
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
const category = ref(null)

const form = ref({
  name: ''
})

// Fetch category data
const fetchCategory = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/channel-categories/${route.params.id}`)
    category.value = data

    // Fill form
    form.value = {
      name: data.name || ''
    }
  } catch (error) {
    console.error('Error fetching category:', error)
    toast.error('Ошибка загрузки категории')
  } finally {
    loading.value = false
  }
}

// Submit form
const submitForm = async () => {
  if (!form.value.name.trim()) {
    toast.error('Название обязательно для заполнения')
    return
  }

  submitting.value = true

  try {
    const payload = {
      name: form.value.name.trim()
    }

    const { data } = await $fetch(`/api/panel/channel-categories/${route.params.id}`, {
      method: 'PUT',
      body: payload
    })

    // Update category data
    category.value = data

    toast.success('Категория успешно обновлена')
  } catch (error) {
    console.error('Error updating category:', error)

    if (error.statusCode === 400) {
      toast.error(error.statusMessage || 'Некорректные данные')
    } else {
      toast.error('Ошибка обновления категории')
    }
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchCategory()
})
</script>
