<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <!-- Navigation and Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/panel/companies" 
                      class="flex items-center text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад к списку
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ company?.name || 'Загрузка...' }}
            </h1>
          </div>
          
          <div class="flex space-x-3" v-if="company">
            <NuxtLink :to="`/panel/companies/${company.id}/edit`" 
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
      <div v-else-if="!company" class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-gray-500">
          Компания не найдена
        </div>
      </div>

      <!-- Company Details -->
      <div v-else class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Основная информация</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Название компании</label>
              <p class="text-gray-900 font-medium">{{ company.name }}</p>
            </div>
            
            <div v-if="company.unp">
              <label class="block text-sm font-medium text-gray-500 mb-1">УНП</label>
              <p class="text-gray-900">{{ company.unp }}</p>
            </div>
            
            <div v-if="company.aliases">
              <label class="block text-sm font-medium text-gray-500 mb-1">Псевдонимы</label>
              <p class="text-gray-900">{{ company.aliases }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус отслеживания</label>
              <span :class="company.track ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ company.track ? 'Отслеживается' : 'Не отслеживается' }}
              </span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Дата создания</label>
              <p class="text-gray-900">{{ formatDate(company.createdAt) }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Дата обновления</label>
              <p class="text-gray-900">{{ formatDate(company.updatedAt) }}</p>
            </div>
          </div>
          
          <div v-if="company.notes" class="mt-6">
            <label class="block text-sm font-medium text-gray-500 mb-2">Заметки</label>
            <div class="bg-gray-50 rounded-md p-4">
              <p class="text-gray-900 whitespace-pre-wrap">{{ company.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Persons -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Контактные лица</h3>
          <div v-if="company.contactPersons?.length">
            <div class="space-y-4">
              <div v-for="contact in company.contactPersons" :key="contact.id" 
                   class="border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">{{ contact.name }}</h4>
                
                <!-- Phones -->
                <div v-if="contact.phones?.length" class="mb-3">
                  <label class="block text-sm font-medium text-gray-500 mb-2">Телефоны:</label>
                  <div class="space-y-1">
                    <div v-for="phone in contact.phones" :key="phone.id" class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a :href="`tel:${phone.number}`" class="text-blue-600 hover:text-blue-800">
                        {{ phone.number }}
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- Emails -->
                <div v-if="contact.emails?.length">
                  <label class="block text-sm font-medium text-gray-500 mb-2">Email адреса:</label>
                  <div class="space-y-1">
                    <div v-for="email in contact.emails" :key="email.id" class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <a :href="`mailto:${email.address}`" class="text-blue-600 hover:text-blue-800">
                        {{ email.address }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 italic">
            Контактные лица не добавлены
          </div>
        </div>

        <!-- Related Court Cases -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- As Claimant -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Судебные дела (как истец)
              <span class="ml-2 text-sm text-green-600">{{ company.courtCasesAsClaimant?.length || 0 }}</span>
            </h3>
            <div v-if="company.courtCasesAsClaimant?.length" class="space-y-3 max-h-80 overflow-y-auto">
              <div v-for="courtCase in company.courtCasesAsClaimant" :key="courtCase.id" 
                   class="bg-green-50 border border-green-200 rounded-lg p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">{{ courtCase.caseNumber || 'Номер не указан' }}</p>
                    <p class="text-sm text-gray-600">Должник: {{ courtCase.debtor }}</p>
                    <p class="text-sm text-gray-600">Сумма: {{ formatCurrency(courtCase.debtAmount) }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(courtCase.receiptDate) }}</p>
                  </div>
                  <NuxtLink :to="`/panel/court-cases/${courtCase.id}/detail`" 
                            class="text-blue-600 hover:text-blue-800 text-sm">
                    Подробнее
                  </NuxtLink>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              Дела как истец не найдены
            </div>
          </div>

          <!-- As Debtor -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Судебные дела (как должник)
              <span class="ml-2 text-sm text-red-600">{{ company.courtCasesAsDebtor?.length || 0 }}</span>
            </h3>
            <div v-if="company.courtCasesAsDebtor?.length" class="space-y-3 max-h-80 overflow-y-auto">
              <div v-for="courtCase in company.courtCasesAsDebtor" :key="courtCase.id" 
                   class="bg-red-50 border border-red-200 rounded-lg p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">{{ courtCase.caseNumber || 'Номер не указан' }}</p>
                    <p class="text-sm text-gray-600">Истец: {{ courtCase.claimant }}</p>
                    <p class="text-sm text-gray-600">Сумма: {{ formatCurrency(courtCase.debtAmount) }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(courtCase.receiptDate) }}</p>
                  </div>
                  <NuxtLink :to="`/panel/court-cases/${courtCase.id}/detail`" 
                            class="text-blue-600 hover:text-blue-800 text-sm">
                    Подробнее
                  </NuxtLink>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              Дела как должник не найдены
            </div>
          </div>
        </div>

        <!-- Communication History -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Sent SMS -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Отправленные SMS
              <span class="ml-2 text-sm text-blue-600">{{ company.sentSms?.length || 0 }}</span>
            </h3>
            <div v-if="company.sentSms?.length" class="space-y-3 max-h-80 overflow-y-auto">
              <div v-for="sms in company.sentSms" :key="sms.id" 
                   class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">{{ sms.phone }}</p>
                    <p class="text-sm text-gray-600 mt-1">{{ sms.content }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(sms.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              SMS не отправлялись
            </div>
          </div>

          <!-- Sent Emails -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Отправленные Email
              <span class="ml-2 text-sm text-purple-600">{{ company.sentEmails?.length || 0 }}</span>
            </h3>
            <div v-if="company.sentEmails?.length" class="space-y-3 max-h-80 overflow-y-auto">
              <div v-for="email in company.sentEmails" :key="email.id" 
                   class="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">{{ email.email }}</p>
                    <p class="text-sm text-gray-800 font-medium">{{ email.subject }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(email.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              Email не отправлялись
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const company = ref(null)
const loading = ref(true)

const fetchCompany = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/companies/${route.params.id}`)
    company.value = data
  } catch (error) {
    console.error('Error fetching company:', error)
    company.value = null
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
  fetchCompany()
})
</script>