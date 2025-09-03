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
                    Номер дела *
                  </label>
                  <input 
                    v-model="form.caseNumber" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите номер дела"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Номер регистрации *
                  </label>
                  <input 
                    v-model="form.registrationNumber" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите номер регистрации"
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
                    Дата поступления *
                  </label>
                  <input 
                    v-model="form.receiptDate" 
                    type="date" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Сумма долга (BYN) *
                  </label>
                  <input 
                    v-model="form.debtAmount" 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
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
                  <select 
                    v-model="form.claimantCompanyId" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <select 
                    v-model="form.debtorCompanyId" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Решение о принятии заявления *
                  </label>
                  <textarea 
                    v-model="form.decision" 
                    required
                    rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите решение о принятии заявления"
                  ></textarea>
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

const form = ref({
  claimant: '',
  claimantCompanyId: '',
  debtor: '',
  debtorCompanyId: '',
  registrationNumber: '',
  caseNumber: '',
  incomingNumber: '',
  receiptDate: '',
  debtAmount: '',
  decision: '',
  courtName: ''
})

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
      registrationNumber: props.courtCase.registrationNumber || '',
      caseNumber: props.courtCase.caseNumber || '',
      incomingNumber: props.courtCase.incomingNumber || '',
      receiptDate: props.courtCase.receiptDate ? new Date(props.courtCase.receiptDate).toISOString().split('T')[0] : '',
      debtAmount: props.courtCase.debtAmount || '',
      decision: props.courtCase.decision || '',
      courtName: props.courtCase.courtName || ''
    }
  } else {
    form.value = {
      claimant: '',
      claimantCompanyId: '',
      debtor: '',
      debtorCompanyId: '',
      registrationNumber: '',
      caseNumber: '',
      incomingNumber: '',
      receiptDate: '',
      debtAmount: '',
      decision: '',
      courtName: ''
    }
  }
}

// Обработка отправки
const handleSubmit = () => {
  // Подготовка данных для отправки
  const submitData = {
    ...form.value,
    claimantCompanyId: form.value.claimantCompanyId || null,
    debtorCompanyId: form.value.debtorCompanyId || null,
    debtAmount: parseFloat(form.value.debtAmount)
  }
  
  emit('submit', submitData)
}

// Отслеживаем изменения props
watch([() => props.isOpen, () => props.courtCase], () => {
  if (props.isOpen) {
    resetForm()
  }
})

// Загружаем компании при монтировании
onMounted(() => {
  fetchCompanies()
})
</script>