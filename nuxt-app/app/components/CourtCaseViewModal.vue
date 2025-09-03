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
              <h3 class="text-xl font-medium text-gray-900 mb-2">Судебное дело № {{ courtCase?.caseNumber }}</h3>
              <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                <span><strong>Рег. №:</strong> {{ courtCase?.registrationNumber }}</span>
                <span><strong>Вх. №:</strong> {{ courtCase?.incomingNumber }}</span>
                <span><strong>UUID:</strong> {{ courtCase?.uuid }}</span>
              </div>
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
            <!-- Основная информация -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-lg font-medium text-gray-900 mb-3">Стороны дела</h4>
                
                <!-- Истец -->
                <div class="mb-4">
                  <h5 class="text-sm font-medium text-green-700 mb-2">Истец (взыскатель):</h5>
                  <div class="text-sm text-gray-900">{{ courtCase?.claimant }}</div>
                  <div v-if="courtCase?.claimantCompany" class="mt-1">
                    <div class="text-xs text-gray-600">
                      <strong>Компания:</strong> {{ courtCase.claimantCompany.name }}
                      <span v-if="courtCase.claimantCompany.unp">(УНП: {{ courtCase.claimantCompany.unp }})</span>
                    </div>
                    <!-- Контакты истца -->
                    <div v-if="courtCase.claimantCompany.contactPersons?.length" class="mt-2">
                      <div 
                        v-for="contact in courtCase.claimantCompany.contactPersons" 
                        :key="contact.id"
                        class="text-xs text-gray-600"
                      >
                        <strong>{{ contact.name }}</strong>
                        <div v-if="contact.phones?.length" class="ml-2">
                          Тел: 
                          <span v-for="(phone, index) in contact.phones" :key="phone.id">
                            <a :href="`tel:${phone.number}`" class="text-blue-600">{{ phone.number }}</a><span v-if="index < contact.phones.length - 1">, </span>
                          </span>
                        </div>
                        <div v-if="contact.emails?.length" class="ml-2">
                          Email: 
                          <span v-for="(email, index) in contact.emails" :key="email.id">
                            <a :href="`mailto:${email.address}`" class="text-blue-600">{{ email.address }}</a><span v-if="index < contact.emails.length - 1">, </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Ответчик -->
                <div>
                  <h5 class="text-sm font-medium text-red-700 mb-2">Ответчик (должник):</h5>
                  <div class="text-sm text-gray-900">{{ courtCase?.debtor }}</div>
                  <div v-if="courtCase?.debtorCompany" class="mt-1">
                    <div class="text-xs text-gray-600">
                      <strong>Компания:</strong> {{ courtCase.debtorCompany.name }}
                      <span v-if="courtCase.debtorCompany.unp">(УНП: {{ courtCase.debtorCompany.unp }})</span>
                    </div>
                    <!-- Контакты ответчика -->
                    <div v-if="courtCase.debtorCompany.contactPersons?.length" class="mt-2">
                      <div 
                        v-for="contact in courtCase.debtorCompany.contactPersons" 
                        :key="contact.id"
                        class="text-xs text-gray-600"
                      >
                        <strong>{{ contact.name }}</strong>
                        <div v-if="contact.phones?.length" class="ml-2">
                          Тел: 
                          <span v-for="(phone, index) in contact.phones" :key="phone.id">
                            <a :href="`tel:${phone.number}`" class="text-blue-600">{{ phone.number }}</a><span v-if="index < contact.phones.length - 1">, </span>
                          </span>
                        </div>
                        <div v-if="contact.emails?.length" class="ml-2">
                          Email: 
                          <span v-for="(email, index) in contact.emails" :key="email.id">
                            <a :href="`mailto:${email.address}`" class="text-blue-600">{{ email.address }}</a><span v-if="index < contact.emails.length - 1">, </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Финансовая информация -->
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="text-lg font-medium text-gray-900 mb-3">Финансовая информация</h4>
                <div class="text-2xl font-bold text-blue-600">
                  {{ formatCurrency(courtCase?.debtAmount) }}
                </div>
                <div class="text-sm text-gray-600 mt-1">Сумма долга</div>
              </div>
            </div>

            <!-- Процессуальная информация -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-lg font-medium text-gray-900 mb-3">Процессуальная информация</h4>
                
                <div class="space-y-3">
                  <div>
                    <div class="text-sm font-medium text-gray-700">Суд:</div>
                    <div class="text-sm text-gray-900">{{ courtCase?.courtName }}</div>
                  </div>
                  
                  <div>
                    <div class="text-sm font-medium text-gray-700">Дата поступления:</div>
                    <div class="text-sm text-gray-900">{{ formatDate(courtCase?.receiptDate) }}</div>
                  </div>
                  
                  <div>
                    <div class="text-sm font-medium text-gray-700">Решение о принятии заявления:</div>
                    <div class="text-sm text-gray-900 whitespace-pre-wrap">{{ courtCase?.decision }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Системная информация -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-lg font-medium text-gray-900 mb-3">Системная информация</h4>
                
                <div class="space-y-2 text-sm text-gray-600">
                  <div>
                    <span class="font-medium">Дата создания:</span>
                    {{ formatDate(courtCase?.createdAt) }}
                  </div>
                  <div>
                    <span class="font-medium">Последнее обновление:</span>
                    {{ formatDate(courtCase?.updatedAt) }}
                  </div>
                </div>
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
  courtCase: Object
})

const emit = defineEmits(['close'])

// Форматирование даты
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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