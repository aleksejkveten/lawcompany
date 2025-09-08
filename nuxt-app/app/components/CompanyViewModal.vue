<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="close">
    <div class="relative top-10 mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b">
        <h3 class="text-lg font-medium text-gray-900">
          Информация о компании
        </h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-8 text-center text-red-600">
        <p>{{ error }}</p>
      </div>

      <!-- Company Details -->
      <div v-else-if="company" class="pt-4 space-y-6 max-h-[70vh] overflow-y-auto">
        <!-- Basic Information -->
        <div>
          <h4 class="text-lg font-medium text-gray-900 mb-4">Основная информация</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Название компании</label>
              <p class="text-gray-900 font-medium">{{ company.name }}</p>
            </div>
            
            <div v-if="company.unp">
              <label class="block text-xs font-medium text-gray-500 mb-1">УНП</label>
              <p class="text-gray-900">{{ company.unp }}</p>
            </div>
            
            <div v-if="company.aliases">
              <label class="block text-xs font-medium text-gray-500 mb-1">Псевдонимы</label>
              <p class="text-gray-900">{{ company.aliases }}</p>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Статус отслеживания</label>
              <span :class="company.track ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ company.track ? 'Отслеживается' : 'Не отслеживается' }}
              </span>
            </div>
          </div>
          
          <div v-if="company.notes" class="mt-4">
            <label class="block text-xs font-medium text-gray-500 mb-2">Заметки</label>
            <div class="bg-gray-50 rounded-md p-3">
              <p class="text-gray-900 text-sm whitespace-pre-wrap">{{ company.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Persons -->
        <div v-if="company.contactPersons?.length">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Контактные лица</h4>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div v-for="contact in company.contactPersons" :key="contact.id" 
                 class="border border-gray-200 rounded-lg p-3">
              <h5 class="font-medium text-gray-900 mb-3">Контактное лицо</h5>
              <div class="text-sm font-semibold text-blue-700 mb-2">{{ contact.name }}</div>
              
              <!-- Phones -->
              <div v-if="contact.phones?.length" class="mb-2">
                <label class="block text-xs font-medium text-gray-500 mb-1">Телефоны:</label>
                <div class="space-y-1">
                  <div v-for="phone in contact.phones" :key="phone.id" class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a :href="`tel:${phone.number}`" class="text-blue-600 hover:text-blue-800 text-xs">
                      {{ phone.number }}
                    </a>
                  </div>
                </div>
              </div>
              
              <!-- Emails -->
              <div v-if="contact.emails?.length">
                <label class="block text-xs font-medium text-gray-500 mb-1">Email адреса:</label>
                <div class="space-y-1">
                  <div v-for="email in contact.emails" :key="email.id" class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <a :href="`mailto:${email.address}`" class="text-blue-600 hover:text-blue-800 text-xs">
                      {{ email.address }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div v-if="company.courtCasesAsClaimant?.length || company.courtCasesAsDebtor?.length" class="bg-gray-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Связанные судебные дела</h4>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="bg-green-100 rounded-md p-2">
              <div class="text-lg font-bold text-green-800">{{ company.courtCasesAsClaimant?.length || 0 }}</div>
              <div class="text-xs text-green-600">Как истец</div>
            </div>
            <div class="bg-red-100 rounded-md p-2">
              <div class="text-lg font-bold text-red-800">{{ company.courtCasesAsDebtor?.length || 0 }}</div>
              <div class="text-xs text-red-600">Как ответчик</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-between items-center pt-4 border-t mt-6">
        <div class="text-sm text-gray-500">
          Обновлено: {{ company ? formatDate(company.updatedAt) : '' }}
        </div>
        <div class="flex space-x-3">
          <button @click="close" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Закрыть
          </button>
          <NuxtLink v-if="company" :to="`/panel/companies/${company.id}/edit`" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Редактировать
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  companyId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['close'])

const company = ref(null)
const loading = ref(false)
const error = ref(null)

const close = () => {
  emit('close')
}

// Format date helper
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

const fetchCompany = async () => {
  if (!props.companyId) return
  
  try {
    loading.value = true
    error.value = null
    const { data } = await $fetch(`/api/panel/companies/${props.companyId}`)
    company.value = data
  } catch (err) {
    console.error('Error fetching company:', err)
    error.value = 'Ошибка при загрузке данных компании'
  } finally {
    loading.value = false
  }
}

// Watch for changes in companyId and isOpen
watch([() => props.companyId, () => props.isOpen], () => {
  if (props.isOpen && props.companyId) {
    fetchCompany()
  }
})

// Clear data when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    company.value = null
    error.value = null
  }
})
</script>