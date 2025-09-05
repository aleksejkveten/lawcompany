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
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                {{ isEditing ? 'Редактирование судебного дела' : 'Создание судебного дела' }}
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Левая колонка -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Номер дела
                  </label>
                  <input 
                    v-model="form.caseNumber" 
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите номер дела"
                  >
                </div>

                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Входящий номер *
                  </label>
                  <input 
                    v-model="form.incomingNumber" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите входящий номер"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Дата поступления
                  </label>
                  <input 
                    v-model="form.receiptDate" 
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Сумма долга (BYN)
                  </label>
                  <input 
                    v-model="form.debtAmount" 
                    type="number" 
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Наименование суда *
                  </label>
                  <input 
                    v-model="form.courtName" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите наименование суда"
                  >
                </div>
              </div>
              
              <!-- Правая колонка -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Истец (взыскатель) *
                  </label>
                  <input 
                    v-model="form.claimant" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите имя истца"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Компания истца
                  </label>
                  <div class="flex gap-2">
                    <select 
                      v-model="form.claimantCompanyId" 
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Выберите компанию</option>
                      <option 
                        v-for="company in companies" 
                        :key="company.id" 
                        :value="company.id"
                      >
                        {{ company.name }} {{ company.unp ? `(${company.unp})` : '' }}
                      </option>
                    </select>
                    <button 
                      v-if="form.claimantCompanyId"
                      type="button"
                      @click="showCompanyDetails(form.claimantCompanyId)"
                      class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Подробнее"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Ответчик (должник) *
                  </label>
                  <input 
                    v-model="form.debtor" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите имя ответчика"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Компания ответчика
                  </label>
                  <div class="flex gap-2">
                    <select 
                      v-model="form.debtorCompanyId" 
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Выберите компанию</option>
                      <option 
                        v-for="company in companies" 
                        :key="company.id" 
                        :value="company.id"
                      >
                        {{ company.name }} {{ company.unp ? `(${company.unp})` : '' }}
                      </option>
                    </select>
                    <button 
                      v-if="form.debtorCompanyId"
                      type="button"
                      @click="showCompanyDetails(form.debtorCompanyId)"
                      class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Подробнее"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Решение о принятии заявления
                  </label>
                  <textarea 
                    v-model="form.decision"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите решение о принятии заявления"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Заметки
                  </label>
                  <textarea 
                    v-model="form.notes"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Дополнительная информация"
                  ></textarea>
                </div>
                
                <div>
                  <label class="flex items-center">
                    <input 
                      v-model="form.track" 
                      type="checkbox" 
                      class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="text-sm font-medium text-gray-700">Отслеживать дело</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="submit" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ isEditing ? 'Сохранить' : 'Создать' }}
            </button>
            <button 
              type="button" 
              @click="$emit('close')" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Company Details Modal -->
    <div v-if="showingCompanyDetails" class="fixed inset-0 z-60 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Фон -->
        <div 
          class="fixed inset-0 transition-opacity" 
          @click="showingCompanyDetails = false"
        >
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Модальное окно -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                Подробно о компании
              </h3>
              <button 
                @click="showingCompanyDetails = false"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div v-if="selectedCompany" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-500">Название</label>
                <p class="text-sm text-gray-900">{{ selectedCompany.name }}</p>
              </div>
              
              <div v-if="selectedCompany.unp">
                <label class="block text-sm font-medium text-gray-500">УНП</label>
                <p class="text-sm text-gray-900">{{ selectedCompany.unp }}</p>
              </div>
              
              <div v-if="selectedCompany.aliases">
                <label class="block text-sm font-medium text-gray-500">Псевдонимы</label>
                <p class="text-sm text-gray-900">{{ selectedCompany.aliases }}</p>
              </div>
              
              <div v-if="selectedCompany.notes">
                <label class="block text-sm font-medium text-gray-500">Заметки</label>
                <p class="text-sm text-gray-900">{{ selectedCompany.notes }}</p>
              </div>
              
              <div v-if="selectedCompany.contactPersons && selectedCompany.contactPersons.length > 0">
                <label class="block text-sm font-medium text-gray-500 mb-2">Контактные лица</label>
                <div class="space-y-2">
                  <div v-for="contact in selectedCompany.contactPersons" :key="contact.id" class="text-sm">
                    <p class="font-medium text-gray-900">{{ contact.name }}</p>
                    <div v-if="contact.phones && contact.phones.length > 0" class="ml-2">
                      <p class="text-gray-600">Телефоны: {{ contact.phones.map(p => p.number).join(', ') }}</p>
                    </div>
                    <div v-if="contact.emails && contact.emails.length > 0" class="ml-2">
                      <p class="text-gray-600">Email: {{ contact.emails.map(e => e.address).join(', ') }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 pt-3 border-t">
                <p class="text-xs text-gray-500">
                  Дата создания: {{ formatDate(selectedCompany.createdAt) }}
                </p>
              </div>
            </div>
            
            <div v-else class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p class="mt-2 text-sm text-gray-600">Загрузка...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  courtCase: Object,
  isEditing: Boolean
})

const emit = defineEmits(['close', 'submit'])

const companies = ref([])
const showingCompanyDetails = ref(false)
const selectedCompany = ref(null)

const form = ref({
  claimant: '',
  claimantCompanyId: '',
  debtor: '',
  debtorCompanyId: '',
  caseNumber: '',
  incomingNumber: '',
  receiptDate: '',
  debtAmount: '',
  decision: '',
  courtName: '',
  notes: '',
  track: false
})

// Показать детали компании
const showCompanyDetails = async (companyId) => {
  if (!companyId) return
  
  showingCompanyDetails.value = true
  selectedCompany.value = null
  
  try {
    const { data } = await $fetch(`/api/panel/companies/${companyId}`)
    selectedCompany.value = data
  } catch (error) {
    console.error('Error fetching company details:', error)
    showingCompanyDetails.value = false
  }
}

// Форматирование даты
const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

// Загрузка списка компаний
const fetchCompanies = async () => {
  try {
    const { data } = await $fetch('/api/panel/companies/list')
    companies.value = data.data
  } catch (error) {
    console.error('Error fetching companies:', error)
  }
}

// Сброс формы
const resetForm = () => {
  if (props.courtCase && props.isEditing) {
    form.value = {
      claimant: props.courtCase.claimant || '',
      claimantCompanyId: props.courtCase.claimantCompanyId || '',
      debtor: props.courtCase.debtor || '',
      debtorCompanyId: props.courtCase.debtorCompanyId || '',
      caseNumber: props.courtCase.caseNumber || '',
      incomingNumber: props.courtCase.incomingNumber || '',
      receiptDate: props.courtCase.receiptDate ? new Date(props.courtCase.receiptDate).toISOString().split('T')[0] : '',
      debtAmount: props.courtCase.debtAmount || '',
      decision: props.courtCase.decision || '',
      courtName: props.courtCase.courtName || '',
      notes: props.courtCase.notes || '',
      track: props.courtCase.track || false
    }
  } else {
    form.value = {
      claimant: '',
      claimantCompanyId: '',
      debtor: '',
      debtorCompanyId: '',
      caseNumber: '',
      incomingNumber: '',
      receiptDate: '',
      debtAmount: '',
      decision: '',
      courtName: '',
      notes: '',
      track: false
    }
  }
}

// Обработка отправки формы
const handleSubmit = () => {
  const submitData = {
    ...form.value,
    claimantCompanyId: form.value.claimantCompanyId || null,
    debtorCompanyId: form.value.debtorCompanyId || null,
    receiptDate: form.value.receiptDate ? new Date(form.value.receiptDate).toISOString() : null,
    debtAmount: form.value.debtAmount ? parseFloat(form.value.debtAmount) : null
  }
  
  emit('submit', submitData)
}

// Watchers
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    resetForm()
    fetchCompanies()
  }
})

// Mount
onMounted(() => {
  if (props.isOpen) {
    fetchCompanies()
  }
})
</script>