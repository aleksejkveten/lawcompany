<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Управление компаниями</h1>
        <NuxtLink to="/panel/companies/new" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Добавить компанию
        </NuxtLink>
      </div>
      
      <!-- Search and filters -->
      <div class="mt-4 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск по названию или УНП..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedSearch"
          >
        </div>
      </div>
    </div>

    <!-- Companies table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
      
      <div v-else-if="companies.length === 0" class="p-8 text-center text-gray-500">
        Компании не найдены
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">УНП</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакты</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дела</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="company in companies" :key="company.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ company.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ company.unp || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ company.contactPersons?.length || 0 }} контактов
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ (company._count?.courtCasesAsClaimant || 0) + (company._count?.courtCasesAsDebtor || 0) }} дел
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(company.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink :to="`/panel/companies/${company.id}/edit`" 
                        class="text-indigo-600 hover:text-indigo-900 mr-3" title="Редактировать">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </NuxtLink>
              <button @click="deleteCompany(company)" 
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
    <div v-if="pagination.pages > 1" class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Показано {{ companies.length }} из {{ pagination.total }} компаний
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
const companies = ref([])
const loading = ref(false)
const searchQuery = ref('')

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// Fetch companies
const fetchCompanies = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/panel/companies', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value
      }
    })
    
    companies.value = data.data
    pagination.value = data.pagination
  } catch (error) {
    console.error('Error fetching companies:', error)
    toast.error('Ошибка при загрузке компаний')
  } finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  fetchCompanies()
}, 300)

// Change page
const changePage = (page) => {
  pagination.value.page = page
  fetchCompanies()
}

// Delete company
const deleteCompany = async (company) => {
  if (!confirm(`Вы уверены, что хотите удалить компанию "${company.name}"?`)) {
    return
  }
  
  try {
    await $fetch(`/api/panel/companies/${company.id}`, {
      method: 'DELETE'
    })
    
    toast.success('Компания успешно удалена')
    fetchCompanies()
  } catch (error) {
    console.error('Error deleting company:', error)
    toast.error('Ошибка при удалении компании')
  }
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
  fetchCompanies()
})
</script>