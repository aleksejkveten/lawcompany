<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/panel/sms-templates"
                  class="flex items-center text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Редактировать SMS шаблон</h1>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
    </div>

    <div v-else-if="!template" class="bg-white rounded-lg shadow p-6">
      <div class="text-center text-gray-500">
        Шаблон не найден
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Template basic info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="Введите название шаблона"
            >
          </div>

          <div>
            <label for="channelCategoryId" class="block text-sm font-medium text-gray-700 mb-2">
              Категория канала *
            </label>
            <select
              v-model="form.channelCategoryId"
              id="channelCategoryId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите категорию</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            Содержимое *
          </label>
          <textarea
            v-model="form.content"
            id="content"
            required
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите текст SMS"
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">{{ form.content.length }}/160 символов</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <NuxtLink to="/panel/sms-templates"
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
const template = ref(null)
const categories = ref([])

const form = ref({
  name: '',
  content: '',
  channelCategoryId: ''
})

// Fetch template data
const fetchTemplate = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/sms-templates/${route.params.id}`)
    template.value = data

    // Fill form
    form.value = {
      name: data.name || '',
      content: data.content || '',
      channelCategoryId: data.channelCategoryId || ''
    }
  } catch (error) {
    console.error('Error fetching template:', error)
    toast.error('Ошибка загрузки шаблона')
  } finally {
    loading.value = false
  }
}

// Load categories
const fetchCategories = async () => {
  try {
    const response = await $fetch('/api/panel/channel-categories')
    categories.value = response?.data || []
  } catch (error) {
    console.error('Error loading categories:', error)
    toast.error('Ошибка загрузки категорий')
  }
}

// Submit form
const submitForm = async () => {
  if (!form.value.name.trim() || !form.value.content.trim() || !form.value.channelCategoryId) {
    toast.error('Все поля обязательны для заполнения')
    return
  }

  if (form.value.content.length > 160) {
    toast.error('SMS не может превышать 160 символов')
    return
  }

  submitting.value = true

  try {
    const payload = {
      name: form.value.name.trim(),
      content: form.value.content.trim(),
      channelCategoryId: form.value.channelCategoryId
    }

    const { data } = await $fetch(`/api/panel/sms-templates/${route.params.id}`, {
      method: 'PUT',
      body: payload
    })

    // Update template data
    template.value = data

    toast.success('Шаблон успешно обновлен')
  } catch (error) {
    console.error('Error updating template:', error)

    if (error.statusCode === 400) {
      toast.error(error.statusMessage || 'Некорректные данные')
    } else {
      toast.error('Ошибка обновления шаблона')
    }
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(async () => {
  await Promise.all([fetchTemplate(), fetchCategories()])
})
</script>
