<template>
    <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Управление компаниями</h1>
        <div class="flex items-center space-x-3">
          <div class="relative">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Поиск по названию или УНП..."
              class="w-64 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="debouncedSearch"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <NuxtLink to="/panel/companies/new" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Добавить компанию
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Companies table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
      
      <div v-else-if="!companies || companies.length === 0" class="p-8 text-center text-gray-500">
        Компании не найдены
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Компания</span>
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>УНП</span>
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Контакты</span>
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
                </svg>
                <span>Судебные дела</span>
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
          <tr v-for="company in companies" :key="company.id" class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <span class="text-sm font-medium text-white">{{ company.name.charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ company.name }}</div>
                  <div v-if="company.aliases" class="text-sm text-gray-500">Псевдоним: {{ company.aliases }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div v-if="company.unp" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ company.unp }}
                </div>
                <span v-else class="text-gray-400 text-sm">Не указан</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center space-x-2">
                <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ company.contactPersons?.length || 0 }} контактов
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center space-x-2">
                <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
                  </svg>
                  {{ (company._count?.courtCasesAsClaimant || 0) + (company._count?.courtCasesAsDebtor || 0) }} дел
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(company.createdAt) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <div class="flex items-center justify-center space-x-2">
                <NuxtLink :to="`/panel/companies/${company.id}/detail`" 
                          class="group relative inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors duration-150" 
                          title="Посмотреть детали">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span class="ml-1">Подробно</span>
                </NuxtLink>
                <NuxtLink :to="`/panel/companies/${company.id}/edit`" 
                          class="group relative inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors duration-150" 
                          title="Редактировать">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span class="ml-1">Редакт.</span>
                </NuxtLink>
                <button @click="deleteCompany(company)" 
                        class="group relative inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors duration-150" 
                        title="Удалить">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span class="ml-1">Удалить</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination?.pages > 1" class="mt-6 flex items-center justify-between">
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
const companies = ref([])
const loading = ref(false)
const searchQuery = ref('')

const pagination = ref({
  page: 1,
  limit: 2,
  total: 0,
  pages: 0
})

// Fetch companies
const fetchCompanies = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/panel/companies', {
      query: {
        page: pagination.value?.page || 1,
        limit: pagination.value?.limit || 10,
        search: searchQuery.value || ''
      }
    })
    console.log('Data:', data)
    companies.value = data?.data || []
    if (data?.pagination) {
      pagination.value = {
        ...pagination.value,
        ...data.pagination
      }
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
    toast.error('Ошибка при загрузке компаний')
    companies.value = []
  } finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = debounce(() => {
  if (pagination.value) {
    pagination.value.page = 1
  }
  fetchCompanies()
}, 300)

// Change page
const changePage = (page) => {
  if (pagination.value && page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    fetchCompanies()
  }
}

// Load data on mount
onMounted(() => {
  fetchCompanies()
})

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
</script>