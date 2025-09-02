<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1 mr-64">
      <!-- Header -->
      <header class="bg-white shadow-sm h-16 fixed top-0 z-20 right-64 left-0">
        <div class="flex items-center justify-between h-full px-6">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold text-gray-900">Админ Панель Суда</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button 
              class="p-2 rounded-md xl:hidden"
              @click="toggleSidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div class="text-right hidden sm:block">
              <div class="text-sm font-medium text-gray-900">{{ user?.name || 'Администратор' }}</div>
              <div class="text-xs text-gray-500">{{ user?.email || '' }}</div>
            </div>
            <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {{ getInitials(user?.name || 'Admin') }}
            </div>
          </div>
        </div>
      </header>
      
      <!-- Content -->
      <main class="pt-16 h-screen overflow-auto">
        <slot></slot>
      </main>
    </div>

    <!-- Right Sidebar -->
    <aside class="fixed inset-y-0 right-0 z-30 w-64 bg-white shadow-xl transform xl:transform-none xl:opacity-100 transition-transform duration-300" 
           :class="sidebarOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'">
      <div class="flex items-center justify-center h-16 border-b border-gray-200">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span class="text-lg font-bold text-gray-900">Меню</span>
        </div>
      </div>
      
      <nav class="mt-8 px-4">
        <ul class="space-y-2">
          <li>
            <NuxtLink 
              to="/panel" 
              class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group" 
              active-class="bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              exact
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              Дашборд
            </NuxtLink>
          </li>
          
          <li>
            <NuxtLink 
              to="/panel/companies" 
              class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group" 
              active-class="bg-blue-50 text-blue-700 border-r-2 border-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Компании
            </NuxtLink>
          </li>
          
          <li>
            <NuxtLink 
              to="/panel/court-cases" 
              class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group" 
              active-class="bg-blue-50 text-blue-700 border-r-2 border-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Судебные дела
            </NuxtLink>
          </li>
          
          <li>
            <NuxtLink 
              to="/panel/users" 
              class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group" 
              active-class="bg-blue-50 text-blue-700 border-r-2 border-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Пользователи
            </NuxtLink>
          </li>
          
          <li>
            <NuxtLink 
              to="/panel/data" 
              class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group" 
              active-class="bg-blue-50 text-blue-700 border-r-2 border-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Данные
            </NuxtLink>
          </li>
        </ul>
        
        <div class="absolute bottom-4 left-4 right-4">
          <button 
            @click="logout" 
            class="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Выйти
          </button>
        </div>
      </nav>
    </aside>
    
    <!-- Overlay for mobile sidebar -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 z-20 bg-black bg-opacity-50 xl:hidden"
      @click="toggleSidebar"
    ></div>
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
const sidebarOpen = ref(false)
const { user, session, clear } = useUserSession()

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
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