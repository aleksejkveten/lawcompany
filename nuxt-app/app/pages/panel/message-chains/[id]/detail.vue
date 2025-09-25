<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <!-- Navigation and Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/panel/message-chains"
                      class="flex items-center text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад к списку
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ chain?.name || 'Загрузка...' }}
            </h1>
          </div>

          <div class="flex space-x-3" v-if="chain">
            <NuxtLink :to="`/panel/message-chains/${chain.id}/edit`"
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
      <div v-else-if="!chain" class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-gray-500">
          Цепочка не найдена
        </div>
      </div>

      <!-- Chain Details -->
      <div v-else class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Информация о цепочке</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Название</label>
              <p class="text-gray-900 font-medium">{{ chain.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Описание</label>
              <p class="text-gray-900">{{ chain.description || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <p class="text-gray-900 font-mono">{{ chain.id }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус</label>
              <span :class="chain.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ chain.isDeleted ? 'Удалена' : 'Активна' }}
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Создан</label>
              <p class="text-gray-900">{{ formatDate(chain.createdAt) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Обновлен</label>
              <p class="text-gray-900">{{ formatDate(chain.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Chain Steps -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Шаги цепочки</h2>

          <div v-if="!chain.chains || chain.chains.length === 0" class="text-center py-8 text-gray-500">
            Нет шагов в цепочке
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(step, index) in chain.chains"
              :key="index"
              class="border border-gray-200 rounded-md p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <span class="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {{ index + 1 }}
                  </span>
                  <span class="text-sm font-medium text-gray-700">Шаг {{ index + 1 }}</span>
                </div>
                <span :class="step.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ step.type.toUpperCase() }}
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Шаблон</label>
                  <p class="text-gray-900">{{ getTemplateName(step.templateId, step.type) }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Задержка</label>
                  <p class="text-gray-900">
                    {{ step.daysOffset === 0 ? 'Отправить сразу' : `Через ${step.daysOffset} ${getDaysText(step.daysOffset)}` }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Статистика</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ chain.chains?.length || 0 }}</div>
              <div class="text-sm text-gray-500">шагов</div>
            </div>

            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ getEmailStepsCount() }}</div>
              <div class="text-sm text-gray-500">email шагов</div>
            </div>

            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ getSmsStepsCount() }}</div>
              <div class="text-sm text-gray-500">SMS шагов</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()

const chain = ref(null)
const loading = ref(true)
const emailTemplates = ref([])
const smsTemplates = ref([])

const fetchChain = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/message-chains/${route.params.id}`)
    chain.value = data
  } catch (error) {
    console.error('Error fetching chain:', error)
    chain.value = null
  } finally {
    loading.value = false
  }
}

const fetchTemplates = async () => {
  try {
    const [emailResponse, smsResponse] = await Promise.all([
      $fetch('/api/panel/email-templates'),
      $fetch('/api/panel/sms-templates')
    ])
    emailTemplates.value = emailResponse?.data || []
    smsTemplates.value = smsResponse?.data || []
  } catch (error) {
    console.error('Error loading templates:', error)
  }
}

const getTemplateName = (templateId, type) => {
  const templates = type === 'email' ? emailTemplates.value : smsTemplates.value
  const template = templates.find(t => t.id === templateId)
  return template ? template.name : 'Шаблон не найден'
}

const getDaysText = (days) => {
  if (days === 1) return 'день'
  if (days >= 2 && days <= 4) return 'дня'
  return 'дней'
}

const getEmailStepsCount = () => {
  if (!chain.value?.chains) return 0
  return chain.value.chains.filter(step => step.type === 'email').length
}

const getSmsStepsCount = () => {
  if (!chain.value?.chains) return 0
  return chain.value.chains.filter(step => step.type === 'sms').length
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
  await Promise.all([fetchChain(), fetchTemplates()])
})
</script>
