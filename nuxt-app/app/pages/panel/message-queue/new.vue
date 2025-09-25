<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/panel/message-queue"
                  class="flex items-center text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Добавить задачу в очередь</h1>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Type -->
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
            Тип сообщения *
          </label>
          <select
            v-model="form.type"
            id="type"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите тип</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </select>
        </div>

        <!-- Template -->
        <div>
          <label for="templateId" class="block text-sm font-medium text-gray-700 mb-2">
            Шаблон *
          </label>
          <select
            v-model="form.templateId"
            id="templateId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите шаблон</option>
            <optgroup v-if="form.type === 'email'" label="Email шаблоны">
              <option v-for="template in emailTemplates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </optgroup>
            <optgroup v-if="form.type === 'sms'" label="SMS шаблоны">
              <option v-for="template in smsTemplates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Company -->
        <div>
          <label for="companyId" class="block text-sm font-medium text-gray-700 mb-2">
            Компания *
          </label>
          <select
            v-model="form.companyId"
            id="companyId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите компанию</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>

        <!-- Scheduled At -->
        <div>
          <label for="scheduledAt" class="block text-sm font-medium text-gray-700 mb-2">
            Дата и время отправки *
          </label>
          <input
            v-model="form.scheduledAt"
            type="datetime-local"
            id="scheduledAt"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <!-- Key (optional) -->
        <div>
          <label for="key" class="block text-sm font-medium text-gray-700 mb-2">
            Ключ (опционально)
          </label>
          <input
            v-model="form.key"
            type="text"
            id="key"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Уникальный ключ для планирования"
          >
        </div>

        <!-- Channel (optional) -->
        <div>
          <label for="channel" class="block text-sm font-medium text-gray-700 mb-2">
            Канал (опционально)
          </label>
          <input
            v-model="form.channel"
            type="text"
            id="channel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Канал отправки"
          >
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <NuxtLink to="/panel/message-queue"
                    class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Отмена
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ submitting ? 'Создание...' : 'Создать задачу' }}
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

const toast = useToast()

const submitting = ref(false)
const emailTemplates = ref([])
const smsTemplates = ref([])
const companies = ref([])

const form = ref({
  type: '',
  templateId: '',
  companyId: '',
  scheduledAt: '',
  key: '',
  channel: ''
})

// Load templates and companies
const loadData = async () => {
  try {
    const [emailResponse, smsResponse, companiesResponse] = await Promise.all([
      $fetch('/api/panel/email-templates'),
      $fetch('/api/panel/sms-templates'),
      $fetch('/api/panel/companies/list')
    ])

    emailTemplates.value = emailResponse?.data || []
    smsTemplates.value = smsResponse?.data || []
    companies.value = companiesResponse?.data || []
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Ошибка загрузки данных')
  }
}

// Submit form
const submitForm = async () => {
  if (!form.value.type) {
    toast.error('Тип сообщения обязателен для заполнения')
    return
  }

  if (!form.value.templateId) {
    toast.error('Шаблон обязателен для заполнения')
    return
  }

  if (!form.value.companyId) {
    toast.error('Компания обязательна для заполнения')
    return
  }

  if (!form.value.scheduledAt) {
    toast.error('Дата и время отправки обязательны для заполнения')
    return
  }

  submitting.value = true

  try {
    const payload = {
      type: form.value.type,
      templateId: parseInt(form.value.templateId),
      companyId: parseInt(form.value.companyId),
      scheduledAt: form.value.scheduledAt,
      key: form.value.key || undefined,
      channel: form.value.channel || undefined
    }

    await $fetch('/api/panel/message-queue', {
      method: 'POST',
      body: payload
    })

    toast.success('Задача успешно создана')
    await navigateTo('/panel/message-queue')
  } catch (error) {
    console.error('Error creating job:', error)

    if (error.statusCode === 400) {
      toast.error(error.statusMessage || 'Некорректные данные')
    } else {
      toast.error('Ошибка создания задачи')
    }
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadData()
})
</script>
