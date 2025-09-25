<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <!-- Navigation and Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/panel/message-queue"
                      class="flex items-center text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад к списку
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">
              Задача {{ job?.id || 'Загрузка...' }}
            </h1>
          </div>

          <div class="flex space-x-3" v-if="job">
            <NuxtLink :to="`/panel/message-queue/${job.id}/edit`"
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
      <div v-else-if="!job" class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-gray-500">
          Задача не найдена
        </div>
      </div>

      <!-- Job Details -->
      <div v-else class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Информация о задаче</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <p class="text-gray-900 font-mono">{{ job.id }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Тип</label>
              <span :class="getTypeBadgeClass(job.data.type)">
                {{ getTypeLabel(job.data.type) }}
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Шаблон</label>
              <p class="text-gray-900">{{ getTemplateName(job.data.templateId, job.data.type) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Компания</label>
              <p class="text-gray-900">{{ getCompanyName(job.data.companyId) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Запланировано</label>
              <p class="text-gray-900">{{ formatDate(job.data.scheduledAt) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус</label>
              <span :class="getStatusBadgeClass(getJobStatus(job))">
                {{ getStatusLabel(getJobStatus(job)) }}
              </span>
            </div>

            <div v-if="job.data.key">
              <label class="block text-sm font-medium text-gray-500 mb-1">Ключ</label>
              <p class="text-gray-900 font-mono">{{ job.data.key }}</p>
            </div>

            <div v-if="job.data.channel">
              <label class="block text-sm font-medium text-gray-500 mb-1">Канал</label>
              <p class="text-gray-900">{{ job.data.channel }}</p>
            </div>
          </div>
        </div>

        <!-- Job Options -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Настройки задачи</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Задержка (мс)</label>
              <p class="text-gray-900">{{ job.opts.delay || 0 }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Количество попыток</label>
              <p class="text-gray-900">{{ job.attemptsMade || 0 }}</p>
            </div>

            <div v-if="job.finishedOn">
              <label class="block text-sm font-medium text-gray-500 mb-1">Завершено</label>
              <p class="text-gray-900">{{ formatDate(job.finishedOn) }}</p>
            </div>

            <div v-if="job.processedOn">
              <label class="block text-sm font-medium text-gray-500 mb-1">Обработано</label>
              <p class="text-gray-900">{{ formatDate(job.processedOn) }}</p>
            </div>

            <div v-if="job.failedReason">
              <label class="block text-sm font-medium text-gray-500 mb-1">Причина неудачи</label>
              <p class="text-red-600">{{ job.failedReason }}</p>
            </div>
          </div>
        </div>

        <!-- Job Data -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Данные задачи</h2>
          <pre class="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">{{ JSON.stringify(job.data, null, 2) }}</pre>
        </div>

        <!-- Job Options Data -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Опции задачи</h2>
          <pre class="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">{{ JSON.stringify(job.opts, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()

const job = ref(null)
const loading = ref(true)
const templates = ref([])
const companies = ref([])

const fetchJob = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/message-queue/${route.params.id}`)
    job.value = data
  } catch (error) {
    console.error('Error fetching job:', error)
    job.value = null
  } finally {
    loading.value = false
  }
}

const fetchTemplatesAndCompanies = async () => {
  try {
    const [emailResponse, smsResponse, companiesResponse] = await Promise.all([
      $fetch('/api/panel/email-templates'),
      $fetch('/api/panel/sms-templates'),
      $fetch('/api/panel/companies/list')
    ])

    templates.value = [...(emailResponse?.data || []), ...(smsResponse?.data || [])]
    companies.value = companiesResponse?.data || []
  } catch (error) {
    console.error('Error loading templates and companies:', error)
  }
}

const getTemplateName = (templateId, type) => {
  const template = templates.value.find(t => t.id === templateId)
  return template ? template.name : `Шаблон ${templateId}`
}

const getCompanyName = (companyId) => {
  const company = companies.value.find(c => c.id === companyId)
  return company ? company.name : `Компания ${companyId}`
}

const getJobStatus = (job) => {
  if (job.finishedOn) {
    return job.failedReason ? 'failed' : 'completed'
  }
  if (job.processedOn) {
    return 'active'
  }
  return 'waiting'
}

const getTypeLabel = (type) => {
  return type === 'email' ? 'Email' : 'SMS'
}

const getTypeBadgeClass = (type) => {
  return type === 'email'
    ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
    : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
}

const getStatusLabel = (status) => {
  const labels = {
    waiting: 'Ожидает',
    active: 'Активна',
    completed: 'Завершена',
    failed: 'Неудачно'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    waiting: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    active: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    completed: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    failed: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  }
  return classes[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
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
  await Promise.all([fetchJob(), fetchTemplatesAndCompanies()])
})
</script>
