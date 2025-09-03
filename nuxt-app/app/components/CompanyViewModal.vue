<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Фон -->
      <div 
        class="fixed inset-0 transition-opacity" 
        @click="$emit('close')"
      >
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Модальное окно -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-xl font-medium text-gray-900 mb-2">{{ company?.name }}</h3>
              <p v-if="company?.unp" class="text-sm text-gray-600">УНП: {{ company.unp }}</p>
            </div>
            <button 
              @click="$emit('close')" 
              class="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Контактные лица -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">Контактные лица</h4>
              
              <div v-if="!company?.contactPersons?.length" class="text-gray-500 italic">
                Контактные лица не добавлены
              </div>
              
              <div 
                v-else 
                v-for="contact in company.contactPersons" 
                :key="contact.id"
                class="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <h5 class="font-medium text-gray-800 mb-3">{{ contact.name }}</h5>
                
                <!-- Телефоны -->
                <div v-if="contact.phones?.length" class="mb-3">
                  <h6 class="text-sm font-medium text-gray-700 mb-2">Телефоны:</h6>
                  <div class="space-y-1">
                    <a 
                      v-for="phone in contact.phones" 
                      :key="phone.id"
                      :href="`tel:${phone.number}`"
                      class="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      {{ phone.number }}
                    </a>
                  </div>
                </div>
                
                <!-- Email адреса -->
                <div v-if="contact.emails?.length" class="mb-3">
                  <h6 class="text-sm font-medium text-gray-700 mb-2">Email адреса:</h6>
                  <div class="space-y-1">
                    <a 
                      v-for="email in contact.emails" 
                      :key="email.id"
                      :href="`mailto:${email.address}`"
                      class="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      {{ email.address }}
                    </a>
                  </div>
                </div>
                
                <div v-if="!contact.phones?.length && !contact.emails?.length" class="text-sm text-gray-500 italic">
                  Контактная информация не добавлена
                </div>
              </div>
            </div>

            <!-- Судебные дела -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">Судебные дела</h4>
              
              <!-- Дела как истец -->
              <div v-if="company?.courtCasesAsClaimant?.length" class="mb-4">
                <h5 class="text-sm font-medium text-green-700 mb-2">Как истец ({{ company.courtCasesAsClaimant.length }}):</h5>
                <div class="space-y-2">
                  <div 
                    v-for="courtCase in company.courtCasesAsClaimant" 
                    :key="courtCase.id"
                    class="bg-green-50 border border-green-200 rounded-md p-3"
                  >
                    <div class="text-sm font-medium text-gray-900">{{ courtCase.caseNumber }}</div>
                    <div class="text-xs text-gray-600">Сумма: {{ formatCurrency(courtCase.debtAmount) }}</div>
                    <div class="text-xs text-gray-500">{{ formatDate(courtCase.createdAt) }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Дела как ответчик -->
              <div v-if="company?.courtCasesAsDebtor?.length" class="mb-4">
                <h5 class="text-sm font-medium text-red-700 mb-2">Как ответчик ({{ company.courtCasesAsDebtor.length }}):</h5>
                <div class="space-y-2">
                  <div 
                    v-for="courtCase in company.courtCasesAsDebtor" 
                    :key="courtCase.id"
                    class="bg-red-50 border border-red-200 rounded-md p-3"
                  >
                    <div class="text-sm font-medium text-gray-900">{{ courtCase.caseNumber }}</div>
                    <div class="text-xs text-gray-600">Сумма: {{ formatCurrency(courtCase.debtAmount) }}</div>
                    <div class="text-xs text-gray-500">{{ formatDate(courtCase.createdAt) }}</div>
                  </div>
                </div>
              </div>
              
              <div v-if="!company?.courtCasesAsClaimant?.length && !company?.courtCasesAsDebtor?.length" class="text-gray-500 italic">
                Судебных дел нет
              </div>
            </div>
          </div>

          <!-- Информация о создании -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span class="font-medium">Дата создания:</span>
                {{ formatDate(company?.createdAt) }}
              </div>
              <div>
                <span class="font-medium">Последнее обновление:</span>
                {{ formatDate(company?.updatedAt) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка закрытия -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="$emit('close')" 
            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  company: Object
})

const emit = defineEmits(['close'])

// Форматирование даты
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Форматирование валюты
const formatCurrency = (amount) => {
  if (!amount) return '0 BYN'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN'
  }).format(amount)
}
</script>