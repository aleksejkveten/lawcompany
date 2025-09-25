<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <!-- Navigation and Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/panel/sent-emails"
                      class="flex items-center text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад к списку
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">
              Детали Email
            </h1>
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
      <div v-else-if="!message" class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-gray-500">
          Email не найден
        </div>
      </div>

      <!-- Message Details -->
      <div v-else class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Информация о Email</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Email адрес</label>
              <p class="text-gray-900 font-medium">{{ message.email }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Тема</label>
              <p class="text-gray-900">{{ message.subject }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус</label>
              <span :class="getStatusClass(message.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusText(message.status) }}
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <p class="text-gray-900 font-mono">{{ message.id }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Внешний ID</label>
              <p class="text-gray-900 font-mono">{{ message.externalId || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Отправлено</label>
              <p class="text-gray-900">{{ formatDate(message.createdAt) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Канал</label>
              <p class="text-gray-900">{{ message.channel || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Формат</label>
              <span :class="message.format === 'html' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                {{ message.format === 'html' ? 'HTML' : 'Простой текст' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Содержимое</h2>
          <div class="bg-gray-50 border border-gray-300 rounded-md p-4">
            <div v-if="message.format === 'html'" v-html="message.content" class="text-sm text-gray-900"></div>
            <pre v-else class="whitespace-pre-wrap text-sm text-gray-900">{{ message.content }}</pre>
          </div>
        </div>

        <!-- Template Info -->
        <div v-if="message.template" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Шаблон</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Название шаблона</label>
              <p class="text-gray-900">{{ message.template.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Категория</label>
              <p class="text-gray-900">{{ message.template.channelCategory?.name || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Company Info -->
        <div v-if="message.company" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Компания</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Название</label>
              <p class="text-gray-900">{{ message.company.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">УНП</label>
              <p class="text-gray-900">{{ message.company.unp || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()

const message = ref(null)
const loading = ref(true)

const fetchMessage = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/sent-emails/${route.params.id}`)
    message.value = data
  } catch (error) {
    console.error('Error fetching message:', error)
    message.value = null
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'sent':
      return 'Отправлено'
    case 'failed':
      return 'Ошибка'
    case 'pending':
      return 'В ожидании'
    default:
      return status
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

onMounted(() => {
  fetchMessage()
})
</script>
