<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <!-- Navigation and Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/panel/channel-categories"
                      class="flex items-center text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад к списку
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ category?.name || 'Загрузка...' }}
            </h1>
          </div>

          <div class="flex space-x-3" v-if="category">
            <NuxtLink :to="`/panel/channel-categories/${category.id}/edit`"
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
      <div v-else-if="!category" class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-gray-500">
          Категория не найдена
        </div>
      </div>

      <!-- Category Details -->
      <div v-else class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Информация о категории</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Название</label>
              <p class="text-gray-900 font-medium">{{ category.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <p class="text-gray-900 font-mono">{{ category.id }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус</label>
              <span :class="category.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ category.isDeleted ? 'Удалена' : 'Активна' }}
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Создан</label>
              <p class="text-gray-900">{{ formatDate(category.createdAt) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Обновлен</label>
              <p class="text-gray-900">{{ formatDate(category.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Email Templates -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Email шаблоны ({{ emailTemplates.length }})</h2>

          <div v-if="emailTemplates.length === 0" class="text-center py-8 text-gray-500">
            Нет Email шаблонов в этой категории
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="template in emailTemplates"
              :key="template.id"
              class="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ template.name }}</h3>
                  <p class="text-xs text-gray-500">Тема: {{ template.subject }}</p>
                  <p class="text-xs text-gray-500">Формат: {{ template.format === 'html' ? 'HTML' : 'Простой текст' }}</p>
                </div>
                <NuxtLink :to="`/panel/email-templates/${template.id}/detail`"
                          class="text-blue-600 hover:text-blue-900 text-sm">
                  Просмотр
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- SMS Templates -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">SMS шаблоны ({{ smsTemplates.length }})</h2>

          <div v-if="smsTemplates.length === 0" class="text-center py-8 text-gray-500">
            Нет SMS шаблонов в этой категории
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="template in smsTemplates"
              :key="template.id"
              class="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ template.name }}</h3>
                  <p class="text-xs text-gray-500">Длина: {{ template.content?.length || 0 }} символов</p>
                </div>
                <NuxtLink :to="`/panel/sms-templates/${template.id}/detail`"
                          class="text-blue-600 hover:text-blue-900 text-sm">
                  Просмотр
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Статистика</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ emailTemplates.length }}</div>
              <div class="text-sm text-gray-500">Email шаблонов</div>
            </div>

            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ smsTemplates.length }}</div>
              <div class="text-sm text-gray-500">SMS шаблонов</div>
            </div>

            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ emailTemplates.length + smsTemplates.length }}</div>
              <div class="text-sm text-gray-500">всего шаблонов</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()

const category = ref(null)
const loading = ref(true)
const emailTemplates = ref([])
const smsTemplates = ref([])

const fetchCategory = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/channel-categories/${route.params.id}`)
    category.value = data
  } catch (error) {
    console.error('Error fetching category:', error)
    category.value = null
  } finally {
    loading.value = false
  }
}

const fetchTemplates = async () => {
  if (!category.value) return

  try {
    const [emailResponse, smsResponse] = await Promise.all([
      $fetch('/api/panel/email-templates'),
      $fetch('/api/panel/sms-templates')
    ])

    const allEmailTemplates = emailResponse?.data || []
    const allSmsTemplates = smsResponse?.data || []

    emailTemplates.value = allEmailTemplates.filter(template => template.channelCategoryId === category.value.id)
    smsTemplates.value = allSmsTemplates.filter(template => template.channelCategoryId === category.value.id)
  } catch (error) {
    console.error('Error loading templates:', error)
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

onMounted(async () => {
  await fetchCategory()
  if (category.value) {
    await fetchTemplates()
  }
})
</script>
