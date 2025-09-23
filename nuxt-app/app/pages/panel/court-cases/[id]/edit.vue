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

          <div>
            <label for="createdAt" class="block text-sm font-medium text-gray-700 mb-2">
              Дата внесения в базу
            </label>
            <input
              :value="courtCase?.createdAt ? new Date(courtCase.createdAt).toLocaleDateString('ru-RU') : ''"
              type="text"
              id="createdAt"
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            >
          </div>
        </div>

        <!-- Parties -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="claimant" class="block text-sm font-medium text-gray-700 mb-2">
              Взыскатель *
            </label>
            <input
              v-model="form.claimant"
              type="text"
              id="claimant"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <div class="relative">
              <div class="mb-2">
                <div v-if="form.claimantCompanyId" class="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-md">
                  <div>
                    <div class="font-medium text-gray-900">{{ getCompanyName(form.claimantCompanyId) }}</div>
                    <div class="text-sm text-gray-600">{{ getCompanyUnp(form.claimantCompanyId) }}</div>
                  </div>
                  <div class="flex gap-1">
                    <button
                      type="button"
                      @click="showClaimantDetails"
                      class="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm whitespace-nowrap"
                    >
                      Подробнее
                    </button>
                    <button
                      type="button"
                      @click="resetClaimantCompany"
                      class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm whitespace-nowrap"
                    >
                      Сбросить
                    </button>
                  </div>
                </div>
                <div v-else class="flex gap-1 mt-2">
                  <button
                    type="button"
                    @click="toggleClaimantCompanySearch"
                    class="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm whitespace-nowrap"
                  >
                    Поиск компании
                  </button>
                  <button
                    type="button"
                    @click="toggleClaimantUnpSearch"
                    class="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm whitespace-nowrap"
                  >
                    Поиск по УНП
                  </button>
                </div>
              </div>

              <!-- Company Search Dropdown -->
              <div v-if="showClaimantCompanySearch" class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                <div class="p-3">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-medium text-gray-700">Поиск компании для Взыскателя</h4>
                    <button @click="closeClaimantCompanySearch" class="text-gray-400 hover:text-gray-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <input
                    v-model="claimantSearchQuery"
                    type="text"
                    placeholder="Введите название компании или УНП..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    @input="debouncedClaimantSearch"
                  >
                  <div v-if="claimantSearchResults.length > 0" class="max-h-48 overflow-y-auto">
                    <div
                      v-for="company in claimantSearchResults"
                      :key="company.id"
                      @click="selectClaimantCompany(company)"
                      class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div class="font-medium text-gray-900">{{ company.name }}</div>
                      <div class="text-sm text-gray-600">{{ company.unp ? `УНП: ${company.unp}` : '' }}</div>
                    </div>
                  </div>
                  <div v-else-if="claimantSearchQuery.length >= 4" class="text-center text-gray-500 py-2">
                    Компании не найдены
                  </div>
                </div>
              </div>

              <!-- UNP Search Dropdown -->
              <div v-if="showClaimantUnpSearch" class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                <div class="p-3">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-medium text-gray-700">Поиск по УНП для Взыскателя</h4>
                    <button @click="closeClaimantUnpSearch" class="text-gray-400 hover:text-gray-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <div class="flex gap-2">
                    <input
                      v-model="claimantUnpInput"
                      type="text"
                      maxlength="9"
                      pattern="\d{9}"
                      placeholder="Введите 9 цифр УНП"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <button
                      @click="searchClaimantByUnp"
                      :disabled="!claimantUnpInput || claimantUnpInput.length !== 9 || claimantSearching"
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {{ claimantSearching ? 'Поиск...' : 'Найти' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label for="debtor" class="block text-sm font-medium text-gray-700 mb-2">
              Должник *
            </label>
            <input
              v-model="form.debtor"
              type="text"
              id="debtor"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <div class="relative">
              <div class="mb-2">
                <div v-if="form.debtorCompanyId" class="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-md">
                  <div>
                    <div class="font-medium text-gray-900">{{ getCompanyName(form.debtorCompanyId) }}</div>
                    <div class="text-sm text-gray-600">{{ getCompanyUnp(form.debtorCompanyId) }}</div>
                  </div>
                  <div class="flex gap-1">
                    <button
                      type="button"
                      @click="showDebtorDetails"
                      class="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm whitespace-nowrap"
                    >
                      Подробнее
                    </button>
                    <button
                      type="button"
                      @click="resetDebtorCompany"
                      class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm whitespace-nowrap"
                    >
                      Сбросить
                    </button>
                  </div>
                </div>
                <div v-else class="flex gap-1 mt-2">
                  <button
                    type="button"
                    @click="toggleDebtorCompanySearch"
                    class="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm whitespace-nowrap"
                  >
                    Поиск компании
                  </button>
                  <button
                    type="button"
                    @click="toggleDebtorUnpSearch"
                    class="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm whitespace-nowrap"
                  >
                    Поиск по УНП
                  </button>
                </div>
              </div>

              <!-- Company Search Dropdown -->
              <div v-if="showDebtorCompanySearch" class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                <div class="p-3">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-medium text-gray-700">Поиск компании для Должника</h4>
                    <button @click="closeDebtorCompanySearch" class="text-gray-400 hover:text-gray-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <input
                    v-model="companySearchQuery"
                    type="text"
                    placeholder="Введите название компании или УНП..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    @input="debouncedCompanySearch"
                  >
                  <div v-if="companySearchResults.length > 0" class="max-h-48 overflow-y-auto">
                    <div
                      v-for="company in companySearchResults"
                      :key="company.id"
                      @click="selectDebtorCompany(company)"
                      class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div class="font-medium text-gray-900">{{ company.name }}</div>
                      <div class="text-sm text-gray-600">{{ company.unp ? `УНП: ${company.unp}` : '' }}</div>
                      <div class="text-sm text-gray-500" v-if="company.address">{{ company.address.substring(0, 50) }}...</div>
                    </div>
                  </div>
                  <div v-else-if="companySearchQuery.length >= 4" class="text-center text-gray-500 py-2">
                    Компании не найдены
                  </div>
                </div>
              </div>

              <!-- UNP Search Dropdown -->
              <div v-if="showDebtorUnpSearch" class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                <div class="p-3">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-medium text-gray-700">Поиск по УНП для Должника</h4>
                    <button @click="closeDebtorUnpSearch" class="text-gray-400 hover:text-gray-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <div class="flex gap-2">
                    <input
                      v-model="debtorUnpInput"
                      type="text"
                      maxlength="9"
                      pattern="\d{9}"
                      placeholder="Введите 9 цифр УНП"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <button
                      @click="searchDebtorByUnp"
                      :disabled="!debtorUnpInput || debtorUnpInput.length !== 9 || debtorSearching"
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {{ debtorSearching ? 'Поиск...' : 'Найти' }}
                    </button>
                  </div>
                </div>
              </div>
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
        <div class="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
          <NuxtLink to="/panel/court-cases"
                    class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 text-center">
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
// Simple debounce implementation
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
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

// Company modal state
const isCompanyModalOpen = ref(false)
const selectedCompanyId = ref(null)


// Dropdown states for new UI
const showClaimantCompanySearch = ref(false)
const showClaimantUnpSearch = ref(false)
const showDebtorCompanySearch = ref(false)
const showDebtorUnpSearch = ref(false)

// UNP inputs for dropdowns
const claimantUnpInput = ref('')
const debtorUnpInput = ref('')
const claimantSearching = ref(false)
const debtorSearching = ref(false)



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

// Dropdown toggle functions
const toggleClaimantCompanySearch = () => {
  showClaimantCompanySearch.value = !showClaimantCompanySearch.value
  showClaimantUnpSearch.value = false
  if (showClaimantCompanySearch.value) {
    claimantSearchQuery.value = ''
  }
}

const toggleClaimantUnpSearch = () => {
  showClaimantUnpSearch.value = !showClaimantUnpSearch.value
  showClaimantCompanySearch.value = false
  if (showClaimantUnpSearch.value) {
    claimantUnpInput.value = ''
  }
}

const toggleDebtorCompanySearch = () => {
  showDebtorCompanySearch.value = !showDebtorCompanySearch.value
  showDebtorUnpSearch.value = false
  if (showDebtorCompanySearch.value) {
    companySearchQuery.value = ''
  }
}

const toggleDebtorUnpSearch = () => {
  showDebtorUnpSearch.value = !showDebtorUnpSearch.value
  showDebtorCompanySearch.value = false
  if (showDebtorUnpSearch.value) {
    debtorUnpInput.value = ''
  }
}

// Close dropdown functions
const closeClaimantCompanySearch = () => {
  showClaimantCompanySearch.value = false
  claimantSearchQuery.value = ''
}

const closeClaimantUnpSearch = () => {
  showClaimantUnpSearch.value = false
  claimantUnpInput.value = ''
}

const closeDebtorCompanySearch = () => {
  showDebtorCompanySearch.value = false
  companySearchQuery.value = ''
}

const closeDebtorUnpSearch = () => {
  showDebtorUnpSearch.value = false
  debtorUnpInput.value = ''
}

// New UNP search functions
const searchClaimantByUnp = async () => {
  if (!claimantUnpInput.value || claimantUnpInput.value.length !== 9) {
    return
  }

  claimantSearching.value = true

  try {
    const response = await $fetch(`/api/panel/court-cases/${route.params.id}/search-unp`, {
      method: 'POST',
      body: {
        unp: claimantUnpInput.value,
        isDebtor: false
      }
    })

    if (response.success && response.foundCompany) {
      form.value.claimantCompanyId = response.foundCompany.id
      await fetchCompanies() // Refresh companies list
      toast.success('Компания найдена и привязана')
      closeClaimantUnpSearch()
    } else {
      toast.error('Компания не найдена')
    }
  } catch (error) {
    console.error('Error searching by UNP:', error)
    toast.error('Ошибка при поиске компании')
  } finally {
    claimantSearching.value = false
  }
}

const searchDebtorByUnp = async () => {
  if (!debtorUnpInput.value || debtorUnpInput.value.length !== 9) {
    return
  }

  debtorSearching.value = true

  try {
    const response = await $fetch(`/api/panel/court-cases/${route.params.id}/search-unp`, {
      method: 'POST',
      body: {
        unp: debtorUnpInput.value,
        isDebtor: true
      }
    })

    if (response.success && response.foundCompany) {
      form.value.debtorCompanyId = response.foundCompany.id
      await fetchCompanies() // Refresh companies list
      toast.success('Компания найдена и привязана')
      closeDebtorUnpSearch()
    } else {
      toast.error('Компания не найдена')
    }
  } catch (error) {
    console.error('Error searching by UNP:', error)
    toast.error('Ошибка при поиске компании')
  } finally {
    debtorSearching.value = false
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


// Reset functions
const resetClaimantCompany = () => {
  form.value.claimantCompanyId = ''
}

const resetDebtorCompany = () => {
  form.value.debtorCompanyId = ''
}

// Helper functions for displaying company info
const getCompanyName = (companyId) => {
  if (!companyId) return ''
  const company = companies.value.find(c => c.id === parseInt(companyId))
  return company ? company.name : ''
}

const getCompanyUnp = (companyId) => {
  if (!companyId) return ''
  const company = companies.value.find(c => c.id === parseInt(companyId))
  return company && company.unp ? `УНП: ${company.unp}` : ''
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    fetchCompanies(),
    fetchCourtCase()
  ])
})
</script>
