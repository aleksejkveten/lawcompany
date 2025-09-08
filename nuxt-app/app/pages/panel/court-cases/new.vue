<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/panel/court-cases" 
                  class="flex items-center text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Добавить судебное дело</h1>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Court case basic info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="caseNumber" class="block text-sm font-medium text-gray-700 mb-2">
              Номер дела
            </label>
            <input
              v-model="form.caseNumber"
              type="text"
              id="caseNumber"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Номер дела"
            >
          </div>

          <div>
            <label for="incomingNumber" class="block text-sm font-medium text-gray-700 mb-2">
              Входящий номер *
            </label>
            <input
              v-model="form.incomingNumber"
              type="text"
              id="incomingNumber"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Входящий номер"
            >
          </div>

          <div>
            <label for="receiptDate" class="block text-sm font-medium text-gray-700 mb-2">
              Дата получения
            </label>
            <input
              v-model="form.receiptDate"
              type="date"
              id="receiptDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>

        <!-- Parties -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="claimant" class="block text-sm font-medium text-gray-700 mb-2">
              Истец *
            </label>
            <input
              v-model="form.claimant"
              type="text"
              id="claimant"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Имя истца"
            >
            <div class="flex gap-2 mt-2">
              <select
                v-model="form.claimantCompanyId"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите компанию истца (опционально)</option>
                <option v-for="company in companies" :key="company.id" :value="company.id">
                  {{ company.name }} {{ company.unp ? `(${company.unp})` : '' }}
                </option>
              </select>
              <button
                v-if="form.claimantCompanyId"
                type="button"
                @click="showClaimantDetails"
                class="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm whitespace-nowrap"
              >
                Подробнее
              </button>
            </div>
          </div>

          <div>
            <label for="debtor" class="block text-sm font-medium text-gray-700 mb-2">
              Ответчик *
            </label>
            <input
              v-model="form.debtor"
              type="text"
              id="debtor"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Имя ответчика"
            >
            <div class="flex gap-2 mt-2">
              <select
                v-model="form.debtorCompanyId"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите компанию ответчика (опционально)</option>
                <option v-for="company in companies" :key="company.id" :value="company.id">
                  {{ company.name }} {{ company.unp ? `(${company.unp})` : '' }}
                </option>
              </select>
              <button
                v-if="form.debtorCompanyId"
                type="button"
                @click="showDebtorDetails"
                class="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm whitespace-nowrap"
              >
                Подробнее
              </button>
            </div>
          </div>
        </div>

        <!-- Case details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="debtAmount" class="block text-sm font-medium text-gray-700 mb-2">
              Сумма долга
            </label>
            <input
              v-model="form.debtAmount"
              type="number"
              step="0.01"
              id="debtAmount"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            >
          </div>

          <div>
            <label for="courtName" class="block text-sm font-medium text-gray-700 mb-2">
              Наименование суда *
            </label>
            <input
              v-model="form.courtName"
              type="text"
              id="courtName"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Наименование суда"
            >
          </div>
        </div>

        <div>
          <label for="decision" class="block text-sm font-medium text-gray-700 mb-2">
            Решение
          </label>
          <textarea
            v-model="form.decision"
            id="decision"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Описание решения суда"
          ></textarea>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
              Заметки
            </label>
            <textarea
              v-model="form.notes"
              id="notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Дополнительная информация"
            ></textarea>
          </div>
          
          <div class="flex items-start pt-8">
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

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <NuxtLink to="/panel/court-cases" 
                    class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Отмена
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ submitting ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Company Details Modal -->
    <CompanyViewModal 
      :is-open="isCompanyModalOpen" 
      :company-id="selectedCompanyId" 
      @close="closeCompanyModal" 
    />
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
const companies = ref([])

// Company modal state
const isCompanyModalOpen = ref(false)
const selectedCompanyId = ref(null)

const form = ref({
  caseNumber: '',
  incomingNumber: '',
  receiptDate: '',
  claimant: '',
  claimantCompanyId: '',
  debtor: '',
  debtorCompanyId: '',
  debtAmount: '',
  courtName: '',
  decision: '',
  notes: '',
  track: false
})

// Fetch companies for dropdowns
const fetchCompanies = async () => {
  try {
    const { data } = await $fetch('/api/panel/companies/list')
    companies.value = data
  } catch (error) {
    console.error('Error fetching companies:', error)
  }
}

// Submit form
const submitForm = async () => {
  submitting.value = true
  
  try {
    const payload = {
      registrationNumber: `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Auto-generate since removed from form
      caseNumber: form.value.caseNumber.trim() || null,
      incomingNumber: form.value.incomingNumber.trim(),
      receiptDate: form.value.receiptDate || null,
      claimant: form.value.claimant.trim(),
      claimantCompanyId: form.value.claimantCompanyId ? parseInt(form.value.claimantCompanyId) : null,
      debtor: form.value.debtor.trim(),
      debtorCompanyId: form.value.debtorCompanyId ? parseInt(form.value.debtorCompanyId) : null,
      debtAmount: form.value.debtAmount ? parseFloat(form.value.debtAmount) : null,
      courtName: form.value.courtName.trim(),
      decision: form.value.decision.trim() || null,
      notes: form.value.notes.trim() || null,
      track: form.value.track
    }

    await $fetch('/api/panel/court-cases', {
      method: 'POST',
      body: payload
    })

    toast.success('Судебное дело успешно создано')
    await navigateTo('/panel/court-cases')
  } catch (error) {
    console.error('Error creating court case:', error)
    toast.error('Ошибка при создании судебного дела')
  } finally {
    submitting.value = false
  }
}

// Company modal functions
const showClaimantDetails = () => {
  if (form.value.claimantCompanyId) {
    selectedCompanyId.value = form.value.claimantCompanyId
    isCompanyModalOpen.value = true
  }
}

const showDebtorDetails = () => {
  if (form.value.debtorCompanyId) {
    selectedCompanyId.value = form.value.debtorCompanyId
    isCompanyModalOpen.value = true
  }
}

const closeCompanyModal = () => {
  isCompanyModalOpen.value = false
  selectedCompanyId.value = null
}

// Load data on mount
onMounted(() => {
  fetchCompanies()
})
</script>