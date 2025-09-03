<template>
        <NuxtLayout name="admin">
  <div class="p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Дашборд</h1>
          <p class="text-gray-600 mt-2">Обзор системы управления судебными делами</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <p class="text-sm text-gray-500">Последнее обновление</p>
            <p class="text-sm font-medium text-gray-900">{{ formatDateTime(lastUpdated) }}</p>
          </div>
          <button 
            @click="refreshData" 
            :disabled="loading"
            class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg 
              :class="{ 'animate-spin': loading }" 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Обновить</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Users Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Пользователи</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalUsers }}</p>
            <div class="flex items-center mt-2">
              <span class="text-sm text-green-600 font-medium">{{ stats.activeUsers }} активных</span>
            </div>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Companies Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Компании</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalCompanies }}</p>
            <div class="flex items-center mt-2">
              <span class="text-sm text-blue-600 font-medium">{{ stats.companyEngagement }}% вовлечены</span>
            </div>
          </div>
          <div class="p-3 bg-green-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Court Cases Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Судебные дела</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalCourtCases }}</p>
            <div class="flex items-center mt-2">
              <span class="text-sm text-orange-600 font-medium">{{ stats.todaysCases }} сегодня</span>
            </div>
          </div>
          <div class="p-3 bg-orange-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Weekly Activity Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Активность за неделю</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.thisWeekCases }}</p>
            <div class="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span class="text-sm text-green-600 font-medium">+{{ stats.caseGrowth }}%</span>
            </div>
          </div>
          <div class="p-3 bg-purple-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Recent Court Cases -->
      <div class="xl:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Последние судебные дела</h3>
              <NuxtLink 
                to="/panel/court-cases" 
                class="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Посмотреть все
              </NuxtLink>
            </div>
          </div>
          <div class="p-6">
            <div v-if="recentActivities.recentCases.length === 0" class="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">Нет судебных дел</p>
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="case_ in recentActivities.recentCases" 
                :key="case_.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                @click="navigateTo(`/panel/court-cases/${case_.id}/edit`)"
              >
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ case_.claimant }} vs {{ case_.debtor }}</p>
                      <p class="text-xs text-gray-500 mt-1">{{ case_.caseNumber }} • {{ case_.courtName }}</p>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(case_.debtAmount) }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(case_.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Быстрые действия</h3>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <NuxtLink 
                to="/panel/court-cases/new"
                class="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div class="p-2 bg-blue-600 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-blue-900 group-hover:text-blue-700">Добавить дело</span>
              </NuxtLink>
              
              <NuxtLink 
                to="/panel/companies/new"
                class="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div class="p-2 bg-green-600 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-green-900 group-hover:text-green-700">Добавить компанию</span>
              </NuxtLink>
              
              <NuxtLink 
                to="/panel/users/new"
                class="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <div class="p-2 bg-purple-600 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-purple-900 group-hover:text-purple-700">Добавить пользователя</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Recent Companies -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Новые компании</h3>
              <NuxtLink 
                to="/panel/companies" 
                class="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Посмотреть все
              </NuxtLink>
            </div>
          </div>
          <div class="p-6">
            <div v-if="recentActivities.recentCompanies.length === 0" class="text-center py-4">
              <p class="text-sm text-gray-500">Нет новых компаний</p>
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="company in recentActivities.recentCompanies" 
                :key="company.id"
                class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                @click="navigateTo(`/panel/companies/${company.id}/edit`)"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ company.name }}</p>
                  <p class="text-xs text-gray-500">УНП: {{ company.unp || 'Не указан' }}</p>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-500">{{ getTotalCases(company) }} дел</div>
                  <div class="text-xs text-gray-500">{{ formatDate(company.createdAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Состояние системы</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span class="text-sm text-gray-700">API Сервер</span>
                </div>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Онлайн</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span class="text-sm text-gray-700">База данных</span>
                </div>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Подключена</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span class="text-sm text-gray-700">Расширение Chrome</span>
                </div>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Готово</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</NuxtLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Define layout
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Reactive data
const loading = ref(false)
const lastUpdated = ref(new Date())
const stats = ref({
  totalUsers: 0,
  totalCompanies: 0,
  totalCourtCases: 0,
  activeUsers: 0,
  recentCourtCases: 0,
  companiesWithCases: 0,
  todaysCases: 0,
  thisWeekCases: 0,
  thisMonthCases: 0,
  userGrowth: 0,
  caseGrowth: 0,
  companyEngagement: 0
})

const recentActivities = ref({
  recentCases: [],
  recentCompanies: [],
  recentUsers: []
})

// Methods
function formatCurrency(amount) {
  if (typeof amount !== 'number') return '0 ₽'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDateTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getTotalCases(company) {
  if (!company._count) return 0
  return (company._count.courtCasesAsClaimant || 0) + (company._count.courtCasesAsDebtor || 0)
}

async function fetchDashboardData() {
  loading.value = true
  try {
    const [statsResponse, recentResponse] = await Promise.all([
      $fetch('/api/panel/dashboard/stats'),
      $fetch('/api/panel/dashboard/recent')
    ])

    if (statsResponse.success) {
      stats.value = statsResponse.data
    }

    if (recentResponse.success) {
      recentActivities.value = recentResponse.data
    }

    lastUpdated.value = new Date()
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    const toast = useToast()
    toast.error('Ошибка загрузки данных дашборда')
  } finally {
    loading.value = false
  }
}

async function refreshData() {
  await fetchDashboardData()
  const toast = useToast()
  toast.success('Данные обновлены')
}

// Lifecycle
onMounted(async () => {
  await fetchDashboardData()
})
</script>