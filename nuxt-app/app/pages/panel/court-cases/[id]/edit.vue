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
        <h1 class="text-2xl font-bold text-gray-900">Редактировать судебное дело</h1>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
    </div>

    <div v-else-if="!courtCase" class="bg-white rounded-lg shadow p-6">
      <div class="text-center text-gray-500">
        Судебное дело не найдено
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow p-6">
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
            >
            <select
              v-model="form.claimantCompanyId"
              class="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите компанию истца (опционально)</option>
              <option v-for="company in companies" :key="company.id" :value="company.id">
                {{ company.name }} {{ company.unp ? `(${company.unp})` : '' }}
              </option>
            </select>
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
            >
            <select
              v-model="form.debtorCompanyId"
              class="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите компанию ответчика (опционально)</option>
              <option v-for="company in companies" :key="company.id" :value="company.id">
                {{ company.name }} {{ company.unp ? `(${company.unp})` : '' }}
              </option>
            </select>
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
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  </div>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const courtCase = ref(null)
const companies = ref([])

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

// Fetch court case data
const fetchCourtCase = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/court-cases/${route.params.id}`)
    courtCase.value = data
    
    // Fill form
    form.value = {
      caseNumber: data.caseNumber || '',
      incomingNumber: data.incomingNumber || '',
      receiptDate: data.receiptDate ? new Date(data.receiptDate).toISOString().split('T')[0] : '',
      claimant: data.claimant || '',
      claimantCompanyId: data.claimantCompanyId || '',
      debtor: data.debtor || '',
      debtorCompanyId: data.debtorCompanyId || '',
      debtAmount: data.debtAmount || '',
      courtName: data.courtName || '',
      decision: data.decision || '',
      notes: data.notes || '',
      track: data.track || false
    }
  } catch (error) {
    console.error('Error fetching court case:', error)
    toast.error('Ошибка при загрузке судебного дела')
  } finally {
    loading.value = false
  }
}

// Submit form
const submitForm = async () => {
  submitting.value = true
  
  try {
    const payload = {
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

    await $fetch(`/api/panel/court-cases/${route.params.id}`, {
      method: 'PUT',
      body: payload
    })

    toast.success('Судебное дело успешно обновлено')
    await navigateTo('/panel/court-cases')
  } catch (error) {
    console.error('Error updating court case:', error)
    toast.error('Ошибка при обновлении судебного дела')
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    fetchCompanies(),
    fetchCourtCase()
  ])
})
</script>