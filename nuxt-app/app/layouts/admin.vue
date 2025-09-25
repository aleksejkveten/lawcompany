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

          <li>
            <div class="relative">
              <button
                @click="toggleSubmenu('marketing')"
                class="flex items-center w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                :class="{ 'bg-blue-100 text-blue-700': isMarketingActive }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 group-hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <span v-if="!sidebarCollapsed" class="ml-3 font-medium">Маркетинг</span>
                <svg v-if="!sidebarCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-auto transition-transform duration-200" :class="{ 'rotate-90': openSubmenus.marketing }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div v-if="openSubmenus.marketing && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
                <div class="relative">
                  <button
                    @click="toggleSubmenu('history')"
                    class="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                    :class="{ 'bg-blue-100 text-blue-700': isHistoryActive }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    История
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-auto transition-transform duration-200" :class="{ 'rotate-90': openSubmenus.history }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div v-if="openSubmenus.history" class="ml-6 mt-1 space-y-1">
                    <NuxtLink
                      to="/panel/sent-sms"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      Отправленные SMS
                    </NuxtLink>
                    <NuxtLink
                      to="/panel/sent-emails"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      Отправленные Email
                    </NuxtLink>
                  </div>
                </div>
                <NuxtLink
                  to="/panel/message-queue"
                  class="block px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                  active-class="bg-blue-100 text-blue-700"
                >
                  Очередь рассылки
                </NuxtLink>
                <NuxtLink
                  to="/panel/tasks"
                  class="block px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                  active-class="bg-blue-100 text-blue-700"
                >
                  Задачи
                </NuxtLink>
                <div class="relative">
                  <button
                    @click="toggleSubmenu('history')"
                    class="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                    :class="{ 'bg-blue-100 text-blue-700': isHistoryActive }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    История
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-auto transition-transform duration-200" :class="{ 'rotate-90': openSubmenus.history }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div v-if="openSubmenus.history" class="ml-6 mt-1 space-y-1">
                    <NuxtLink
                      to="/panel/sent-sms"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      Отправленные SMS
                    </NuxtLink>
                    <NuxtLink
                      to="/panel/sent-emails"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      Отправленные Email
                    </NuxtLink>
                    <NuxtLink
                      to="/panel/tasks/completed"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      Выполненные задачи
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <li>
            <div class="relative">
              <button
                @click="toggleSubmenu('settings')"
                class="flex items-center w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                :class="{ 'bg-blue-100 text-blue-700': isSettingsActive }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 group-hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span v-if="!sidebarCollapsed" class="ml-3 font-medium">Настройки</span>
                <svg v-if="!sidebarCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-auto transition-transform duration-200" :class="{ 'rotate-90': openSubmenus.settings }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div v-if="openSubmenus.settings && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
                <div class="relative">
                  <button
                    @click="toggleSubmenu('taskSettings')"
                    class="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                    :class="{ 'bg-blue-100 text-blue-700': isTaskSettingsActive }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Задачи
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-auto transition-transform duration-200" :class="{ 'rotate-90': openSubmenus.taskSettings }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div v-if="openSubmenus.taskSettings" class="ml-6 mt-1 space-y-1">
                    <NuxtLink
                      to="/panel/task-actions"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      Категории задач
                    </NuxtLink>
                  </div>
                </div>
                <div class="relative">
                  <button
                    @click="toggleSubmenu('templates')"
                    class="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                    :class="{ 'bg-blue-100 text-blue-700': isTemplatesActive }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Шаблоны
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-auto transition-transform duration-200" :class="{ 'rotate-90': openSubmenus.templates }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div v-if="openSubmenus.templates" class="ml-6 mt-1 space-y-1">
                    <NuxtLink
                      to="/panel/channel-categories"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      Категории шаблонов
                    </NuxtLink>
                    <NuxtLink
                      to="/panel/email-templates"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      Email шаблоны
                    </NuxtLink>
                    <NuxtLink
                      to="/panel/sms-templates"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      SMS шаблоны
                    </NuxtLink>
                    <NuxtLink
                      to="/panel/message-chains"
                      class="block px-3 py-2 text-xs text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                      active-class="bg-blue-100 text-blue-700"
                    >
                      Цепочки сообщений
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
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
            <button @click="logout" class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Выйти">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
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
const openSubmenus = ref({
  settings: false,
  templates: false,
  marketing: false,
  history: false,
  taskSettings: false
})

const route = useRoute()

const isSettingsActive = computed(() => {
  return route.path.includes('/panel/email-templates') ||
         route.path.includes('/panel/sms-templates') ||
         route.path.includes('/panel/message-chains')
})

const isTemplatesActive = computed(() => {
  return route.path.includes('/panel/email-templates') ||
         route.path.includes('/panel/sms-templates') ||
         route.path.includes('/panel/message-chains')
})

const isHistoryActive = computed(() => {
  return route.path.includes('/panel/sent-sms') ||
         route.path.includes('/panel/sent-emails') ||
         route.path.includes('/panel/tasks/completed')
})

const isMarketingActive = computed(() => {
  return route.path.includes('/panel/sent-sms') ||
         route.path.includes('/panel/sent-emails') ||
         route.path.includes('/panel/message-queue')
})

const isTaskSettingsActive = computed(() => {
  return route.path.includes('/panel/task-actions')
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleSubmenu(menu) {
  openSubmenus.value[menu] = !openSubmenus.value[menu]
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
