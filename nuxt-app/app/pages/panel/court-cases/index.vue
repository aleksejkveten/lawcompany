<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Судебные дела</h1>
        <div class="flex items-center space-x-3">
          <div class="relative">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Поиск по номеру дела, истцу или ответчику..."
              class="w-64 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="debouncedSearch"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <NuxtLink to="/panel/court-cases/new" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Добавить дело
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Court cases table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
      
      <div v-else-if="!courtCases || courtCases.length === 0" class="p-8 text-center text-gray-500">
        Судебные дела не найдены
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Номер дела</span>
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Истец</span>
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Ответчик</span>
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Сумма долга</span>
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Суд</span>
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Дата создания</span>
              </div>
            </th>
            <th class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center justify-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                <span>Действия</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="courtCase in courtCases" :key="courtCase.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ courtCase.caseNumber || 'Номер не указан' }}</div>
              <div v-if="courtCase.incomingNumber" class="text-xs text-gray-500">Вх. № {{ courtCase.incomingNumber }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ courtCase.claimant }}</div>
              <div v-if="courtCase.claimantCompany" class="text-xs text-gray-500">{{ courtCase.claimantCompany.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ courtCase.debtor }}</div>
              <div v-if="courtCase.debtorCompany" class="text-xs text-gray-500">{{ courtCase.debtorCompany.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatCurrency(courtCase.debtAmount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ courtCase.courtName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(courtCase.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink :to="`/panel/court-cases/${courtCase.id}/edit`" 
                        class="text-indigo-600 hover:text-indigo-900 mr-3" title="Редактировать">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </NuxtLink>
              <button @click="deleteCourtCase(courtCase)" 
                      class="text-red-600 hover:text-red-900" title="Удалить">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination?.pages > 1" class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Показано {{ courtCases.length }} из {{ pagination.total }} дел
      </div>
      <div class="flex space-x-2">
        <button 
          @click="changePage(pagination.page - 1)" 
          :disabled="pagination.page === 1"
          class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Предыдущая
        </button>
        <span class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
          {{ pagination.page }} / {{ pagination.pages }}
        </span>
        <button 
          @click="changePage(pagination.page + 1)" 
          :disabled="pagination.page === pagination.pages"
          class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Следующая
        </button>
      </div>
    </div>
  </div>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

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

// Reactive data
const courtCases = ref([])
const loading = ref(false)
const searchQuery = ref('')

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// Fetch court cases
const fetchCourtCases = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/panel/court-cases', {
      query: {
        page: pagination.value?.page || 1,
        limit: pagination.value?.limit || 10,
        search: searchQuery.value || ''
      }
    })
    
    courtCases.value = data?.data || []
    if (data?.pagination) {
      pagination.value = {
        ...pagination.value,
        ...data.pagination
      }
    }
  } catch (error) {
    console.error('Error fetching court cases:', error)
    toast.error('Ошибка при загрузке судебных дел')
    courtCases.value = []
  } finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = debounce(() => {
  if (pagination.value) {
    pagination.value.page = 1
  }
  fetchCourtCases()
}, 300)

// Change page
const changePage = (page) => {
  if (pagination.value && page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    fetchCourtCases()
  }
}

// Delete court case
const deleteCourtCase = async (courtCase) => {
  if (!confirm(`Вы уверены, что хотите удалить дело "${courtCase.caseNumber}"?`)) {
    return
  }
  
  try {
    await $fetch(`/api/panel/court-cases/${courtCase.id}`, {
      method: 'DELETE'
    })
    
    toast.success('Судебное дело успешно удалено')
    fetchCourtCases()
  } catch (error) {
    console.error('Error deleting court case:', error)
    toast.error('Ошибка при удалении судебного дела')
  }
}

// Format currency
const formatCurrency = (amount) => {
  if (!amount) return '0 BYN'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format date
const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

// Load data on mount
onMounted(() => {
  fetchCourtCases()
})
</script>