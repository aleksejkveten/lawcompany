<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Очередь сообщений</h1>
        <div class="flex items-center space-x-3">
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="fetchJobs"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="waiting">Ожидающие</option>
            <option value="completed">Завершенные</option>
            <option value="failed">Неудачные</option>
          </select>
          <NuxtLink to="/panel/message-queue/new"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Добавить задачу
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Jobs table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>

      <div v-else-if="jobs.length === 0" class="p-6 text-center text-gray-500">
        Задачи не найдены
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Шаблон
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Компания
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Запланировано
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ job.id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeBadgeClass(job.data.type)">
                    {{ getTypeLabel(job.data.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getTemplateName(job.data.templateId, job.data.type) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getCompanyName(job.data.companyId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(job.data.scheduledAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(getJobStatus(job))">
                    {{ getStatusLabel(getJobStatus(job)) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <NuxtLink
                      :to="`/panel/message-queue/${job.id}/detail`"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Просмотр
                    </NuxtLink>
                    <NuxtLink
                      :to="`/panel/message-queue/${job.id}/edit`"
                      class="text-green-600 hover:text-green-900"
                    >
                      Редактировать
                    </NuxtLink>
                    <button
                      @click="confirmDelete(job)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > pagination.limit" class="mt-4 flex justify-center">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Предыдущая
        </button>
        <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
          {{ pagination.page }} из {{ Math.ceil(pagination.total / pagination.limit) }}
        </span>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= Math.ceil(pagination.total / pagination.limit)"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Следующая
        </button>
      </nav>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="jobToDelete" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900">Подтвердить удаление</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Вы действительно хотите удалить задачу {{ jobToDelete.id }}?
              Это действие нельзя отменить.
            </p>
          </div>
          <div class="flex justify-center space-x-4 mt-4">
            <button
              @click="jobToDelete = null"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Отмена
            </button>
            <button
              @click="deleteJob"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

// Reactive data
const loading = ref(true)
const deleting = ref(false)
const jobs = ref([])
const templates = ref([])
const companies = ref([])
const statusFilter = ref('all')
const jobToDelete = ref(null)
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  counts: {}
})

// Methods
const fetchJobs = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/panel/message-queue', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        status: statusFilter.value
      }
    })

    jobs.value = response?.data || []
    pagination.value = {
      ...pagination.value,
      total: response?.pagination?.total || 0,
      counts: response?.pagination?.counts || {}
    }
  } catch (error) {
    console.error('Error fetching jobs:', error)
    toast.error('Ошибка загрузки задач')
    jobs.value = []
  } finally {
    loading.value = false
  }
}

const fetchTemplatesAndCompanies = async () => {
  try {
    const [emailTemplates, smsTemplates, companiesList] = await Promise.all([
      $fetch('/api/panel/email-templates'),
      $fetch('/api/panel/sms-templates'),
      $fetch('/api/panel/companies/list')
    ])
    templates.value = [...(emailTemplates?.data || []), ...(smsTemplates?.data || [])]
    companies.value = companiesList?.data || []
  } catch (error) {
    console.error('Error loading templates and companies:', error)
  }
}

const changePage = (page) => {
  pagination.value.page = page
  fetchJobs()
}

const confirmDelete = (job) => {
  jobToDelete.value = job
}

const deleteJob = async () => {
  if (!jobToDelete.value) return

  deleting.value = true
  try {
    await $fetch(`/api/panel/message-queue/${jobToDelete.value.id}`, {
      method: 'DELETE'
    })

    toast.success('Задача успешно удалена')
    jobToDelete.value = null
    await fetchJobs()
  } catch (error) {
    console.error('Error deleting job:', error)
    toast.error('Ошибка удаления задачи')
  } finally {
    deleting.value = false
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

const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Load data on mount
onMounted(async () => {
  await Promise.all([fetchJobs(), fetchTemplatesAndCompanies()])
})
</script>
