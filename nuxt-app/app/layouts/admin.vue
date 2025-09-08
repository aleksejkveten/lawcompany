<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Left Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 z-30 bg-white shadow-xl transition-all duration-300 ease-in-out"
      :class="sidebarCollapsed ? 'w-16' : 'w-64'"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div v-if="!sidebarCollapsed" class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span class="text-lg font-bold text-gray-900">Суд Админ</span>
        </div>
        <div v-else class="w-full flex justify-center">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="mt-6 px-3">
        <ul class="space-y-1">
          <li>
            <NuxtLink 
              to="/panel/dashboard" 
              class="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group" 
              active-class="bg-blue-100 text-blue-700 shadow-sm"
              :title="sidebarCollapsed ? 'Дашборд' : ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 group-hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              <span v-if="!sidebarCollapsed" class="ml-3 font-medium">Дашборд</span>
            </NuxtLink>
          </li>
          
          <li>
            <NuxtLink 
              to="/panel/companies" 
              class="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group" 
              active-class="bg-blue-100 text-blue-700 shadow-sm"
              :title="sidebarCollapsed ? 'Компании' : ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 group-hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span v-if="!sidebarCollapsed" class="ml-3 font-medium">Компании</span>
            </NuxtLink>
          </li>
          
          <li>
            <NuxtLink 
              to="/panel/court-cases" 
              class="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group" 
              active-class="bg-blue-100 text-blue-700 shadow-sm"
              :title="sidebarCollapsed ? 'Судебные дела' : ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 group-hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span v-if="!sidebarCollapsed" class="ml-3 font-medium">Судебные дела</span>
            </NuxtLink>
          </li>
          
          <li>
            <NuxtLink 
              to="/panel/users" 
              class="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group" 
              active-class="bg-blue-100 text-blue-700 shadow-sm"
              :title="sidebarCollapsed ? 'Пользователи' : ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 group-hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span v-if="!sidebarCollapsed" class="ml-3 font-medium">Пользователи</span>
            </NuxtLink>
          </li>
        </ul>
        
        <!-- Logout Button -->
        <div class="absolute bottom-6 left-3 right-3">
          <button 
            @click="logout" 
            class="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
            :title="sidebarCollapsed ? 'Выйти' : ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span v-if="!sidebarCollapsed" class="ml-3 font-medium">Выйти</span>
          </button>
        </div>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 transition-all duration-300 ease-in-out" :class="sidebarCollapsed ? 'ml-16' : 'ml-64'">
      <!-- Top Header -->
      <header class="bg-white shadow-sm h-16 sticky top-0 z-10">
        <div class="flex items-center justify-between h-full px-6">
          <div class="flex items-center space-x-4">
            <!-- Sidebar Toggle Button -->
            <button 
              @click="toggleSidebar"
              class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              :title="sidebarCollapsed ? 'Развернуть меню' : 'Свернуть меню'"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 transition-transform duration-200" 
                :class="sidebarCollapsed ? 'rotate-180' : ''"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            <div class="border-l border-gray-300 h-6"></div>
            
            <h1 class="text-xl font-semibold text-gray-900">Админ Панель Юридической фирмы</h1>
          </div>
          
          <!-- User Info -->
          <div class="flex items-center space-x-4">
            <div class="hidden sm:block text-right">
              <div class="text-sm font-medium text-gray-900">{{ user?.name || 'Администратор' }}</div>
              <div class="text-xs text-gray-500">{{ user?.email || '' }}</div>
            </div>
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-md">
              {{ getInitials(user?.name || 'Admin') }}
            </div>
          </div>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="flex-1">
        <slot></slot>
      </main>
    </div>
  </div>
  
  <!-- Toast Container -->
  <ToastContainer 
    :toasts="toasts" 
    @remove="removeToast" 
  />
</template>

<script setup>
import { ref } from 'vue'

const { toasts, remove: removeToast } = useToast()
const sidebarCollapsed = ref(false)
const { user, session, clear } = useUserSession()

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function getInitials(name) {
  if (!name) return 'A'
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

async function logout() {
  try {
    await clear()
    const toast = useToast()
    toast.success('Вы успешно вышли из системы')
    await navigateTo('/authpage/login')
  } catch (error) {
    console.error('Logout error:', error)
    const toast = useToast()
    toast.error('Ошибка при выходе из системы')
  }
}
</script> 