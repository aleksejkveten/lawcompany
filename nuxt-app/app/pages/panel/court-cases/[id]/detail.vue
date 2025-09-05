<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <!-- Navigation and Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/panel/court-cases" 
                      class="flex items-center text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад к списку
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ courtCase?.caseNumber || 'Дело №' + (courtCase?.id || 'Загрузка...') }}
            </h1>
          </div>
          
          <div class="flex space-x-3" v-if="courtCase">
            <NuxtLink :to="`/panel/court-cases/${courtCase.id}/edit`" 
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
      <div v-else-if="!courtCase" class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-gray-500">
          Судебное дело не найдено
        </div>
      </div>

      <!-- Court Case Details -->
      <div v-else class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Основная информация</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="courtCase.caseNumber">
              <label class="block text-sm font-medium text-gray-500 mb-1">Номер дела</label>
              <p class="text-gray-900 font-medium">{{ courtCase.caseNumber }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">UUID</label>
              <p class="text-gray-900 font-mono text-sm">{{ courtCase.uuid }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Входящий номер</label>
              <p class="text-gray-900">{{ courtCase.incomingNumber }}</p>
            </div>
            
            <div v-if="courtCase.receiptDate">
              <label class="block text-sm font-medium text-gray-500 mb-1">Дата поступления</label>
              <p class="text-gray-900">{{ formatDate(courtCase.receiptDate) }}</p>
            </div>
            
            <div v-if="courtCase.debtAmount">
              <label class="block text-sm font-medium text-gray-500 mb-1">Сумма долга</label>
              <p class="text-gray-900 font-medium">{{ formatCurrency(courtCase.debtAmount) }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус отслеживания</label>
              <span :class="courtCase.track ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ courtCase.track ? 'Отслеживается' : 'Не отслеживается' }}
              </span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Дата создания</label>
              <p class="text-gray-900">{{ formatDate(courtCase.createdAt) }}</p>
            </div>
          </div>
          
          <div v-if="courtCase.decision" class="mt-6">
            <label class="block text-sm font-medium text-gray-500 mb-2">Решение о принятии заявления</label>
            <div class="bg-blue-50 rounded-md p-4">
              <p class="text-gray-900">{{ courtCase.decision }}</p>
            </div>
          </div>
          
          <div v-if="courtCase.notes" class="mt-6">
            <label class="block text-sm font-medium text-gray-500 mb-2">Заметки</label>
            <div class="bg-gray-50 rounded-md p-4">
              <p class="text-gray-900 whitespace-pre-wrap">{{ courtCase.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Court Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Суд</h3>
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Наименование суда</label>
            <p class="text-gray-900">{{ courtCase.courtName }}</p>
          </div>
        </div>

        <!-- Parties Information -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Claimant -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              <span class="text-green-600">Истец (Взыскатель)</span>
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Наименование</label>
                <p class="text-gray-900">{{ courtCase.claimant }}</p>
              </div>
              
              <div v-if="courtCase.claimantCompany">
                <label class="block text-sm font-medium text-gray-500 mb-2">Связанная компания</label>
                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium text-gray-900">{{ courtCase.claimantCompany.name }}</p>
                      <p class="text-sm text-gray-600" v-if="courtCase.claimantCompany.unp">
                        УНП: {{ courtCase.claimantCompany.unp }}
                      </p>
                    </div>
                    <NuxtLink :to="`/panel/companies/${courtCase.claimantCompany.id}/detail`" 
                              class="text-blue-600 hover:text-blue-800 text-sm">
                      Подробнее
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Debtor -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              <span class="text-red-600">Ответчик (Должник)</span>
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Наименование</label>
                <p class="text-gray-900">{{ courtCase.debtor }}</p>
              </div>
              
              <div v-if="courtCase.debtorCompany">
                <label class="block text-sm font-medium text-gray-500 mb-2">Связанная компания</label>
                <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium text-gray-900">{{ courtCase.debtorCompany.name }}</p>
                      <p class="text-sm text-gray-600" v-if="courtCase.debtorCompany.unp">
                        УНП: {{ courtCase.debtorCompany.unp }}
                      </p>
                    </div>
                    <NuxtLink :to="`/panel/companies/${courtCase.debtorCompany.id}/detail`" 
                              class="text-blue-600 hover:text-blue-800 text-sm">
                      Подробнее
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Временная шкала</h3>
          <div class="flow-root">
            <ul class="-mb-8">
              <li>
                <div class="relative pb-8">
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5">
                      <div>
                        <p class="text-sm text-gray-500">Дело создано в системе</p>
                        <p class="text-xs text-gray-400">{{ formatDate(courtCase.createdAt) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              
              <li v-if="courtCase.receiptDate">
                <div class="relative pb-8">
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5">
                      <div>
                        <p class="text-sm text-gray-500">Дело поступило в суд</p>
                        <p class="text-xs text-gray-400">{{ formatDate(courtCase.receiptDate) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              
              <li>
                <div class="relative">
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5">
                      <div>
                        <p class="text-sm text-gray-500">Последнее обновление</p>
                        <p class="text-xs text-gray-400">{{ formatDate(courtCase.updatedAt) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const courtCase = ref(null)
const loading = ref(true)

const fetchCourtCase = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/court-cases/${route.params.id}`)
    courtCase.value = data
  } catch (error) {
    console.error('Error fetching court case:', error)
    courtCase.value = null
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

const formatCurrency = (amount) => {
  if (!amount) return 'Не указано'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN'
  }).format(amount)
}

onMounted(() => {
  fetchCourtCase()
})
</script>