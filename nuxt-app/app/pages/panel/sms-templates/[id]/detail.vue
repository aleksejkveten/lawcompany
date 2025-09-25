<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <!-- Navigation and Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/panel/sms-templates"
                      class="flex items-center text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад к списку
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ template?.name || 'Загрузка...' }}
            </h1>
          </div>

          <div class="flex space-x-3" v-if="template">
            <NuxtLink :to="`/panel/sms-templates/${template.id}/edit`"
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
      <div v-else-if="!template" class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-gray-500">
          Шаблон не найден
        </div>
      </div>

      <!-- Template Details -->
      <div v-else class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Информация о шаблоне</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Название</label>
              <p class="text-gray-900 font-medium">{{ template.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Категория</label>
              <p class="text-gray-900">{{ template.channelCategory?.name || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <p class="text-gray-900 font-mono">{{ template.id }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус</label>
              <span :class="template.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ template.isDeleted ? 'Удален' : 'Активен' }}
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Создан</label>
              <p class="text-gray-900">{{ formatDate(template.createdAt) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Обновлен</label>
              <p class="text-gray-900">{{ formatDate(template.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Content Preview -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Содержимое</h2>
          <div class="bg-gray-50 border border-gray-300 rounded-md p-4">
            <pre class="whitespace-pre-wrap text-sm text-gray-900">{{ template.content }}</pre>
          </div>
          <div class="mt-2 text-sm text-gray-500">
            Длина: {{ template.content?.length || 0 }} символов
          </div>
        </div>

        <!-- Statistics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Статистика</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ template.content?.length || 0 }}</div>
              <div class="text-sm text-gray-500">символов</div>
            </div>

            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ (template.content?.match(/\n/g) || []).length + 1 }}</div>
              <div class="text-sm text-gray-500">строк</div>
            </div>

            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ getDaysFromCreation(template.createdAt) }}</div>
              <div class="text-sm text-gray-500">дней назад</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()

const template = ref(null)
const loading = ref(true)

const fetchTemplate = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/sms-templates/${route.params.id}`)
    template.value = data
  } catch (error) {
    console.error('Error fetching template:', error)
    template.value = null
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

const getDaysFromCreation = (createdAt) => {
  if (!createdAt) return 0
  const now = new Date()
  const created = new Date(createdAt)
  const diffTime = Math.abs(now - created)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

onMounted(() => {
  fetchTemplate()
})
</script>
