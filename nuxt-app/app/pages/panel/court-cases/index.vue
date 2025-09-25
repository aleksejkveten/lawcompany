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
          <button
            @click="searchDefendants"
            :disabled="searchingDefendants"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center mr-2"
          >
            <svg v-if="searchingDefendants" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {{ searchingDefendants ? 'Поиск ответчиков...' : 'Поиск ответчиков' }}
          </button>

          <button
            @click="searchParties"
            :disabled="searchingParties"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center mr-2"
          >
            <svg v-if="searchingParties" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {{ searchingParties ? 'Поиск сторон...' : 'Поиск сторон' }}
          </button>

          <NuxtLink to="/panel/court-cases/new"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Добавить дело
          </NuxtLink>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Добавлено в базу:</label>
            <input 
              v-model="filters.dateAddedFrom" 
              type="date" 
              class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="debouncedSearch"
            >
            <span class="text-gray-500">—</span>
            <input 
              v-model="filters.dateAddedTo" 
              type="date" 
              class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="debouncedSearch"
            >
          </div>

          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Дата регистрации:</label>
            <input 
              v-model="filters.dateCreatedFrom" 
              type="date" 
              class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="debouncedSearch"
            >
            <span class="text-gray-500">—</span>
            <input 
              v-model="filters.dateCreatedTo" 
              type="date" 
              class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="debouncedSearch"
            >
          </div>
          
          <button 
            @click="clearFilters" 
            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline cursor-pointer"
          >
            Очистить фильтры
          </button>
        </div>
      </div>
    </div>

    <!-- Court cases table -->
    <div class="bg-white rounded-lg shadow ">
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
              <div class="flex items-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Сумма</span>
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
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Дата добавления</span>
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
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ courtCase.claimant }}</div>
              <div v-if="courtCase.claimantCompany" class="text-xs text-gray-500">{{ courtCase.claimantCompany.name }}</div>
              <div v-if="courtCase.claimantCompany && courtCase.claimantCompany.unp" class="text-xs text-gray-400">{{ courtCase.claimantCompany.unp }}</div>
              <div v-else-if="!courtCase.claimantCompany" class="text-xs text-red-500">Не найдена</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ courtCase.debtor }}</div>
              <div v-if="courtCase.debtorCompany" class="text-xs text-gray-500">{{ courtCase.debtorCompany.name }}</div>
              <div v-if="courtCase.debtorCompany && courtCase.debtorCompany.unp" class="text-xs text-gray-400">{{ courtCase.debtorCompany.unp }}</div>
              <div v-else-if="!courtCase.debtorCompany" class="text-xs text-red-500">Не найдена</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatCurrency(courtCase.debtAmount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ courtCase.courtName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(courtCase.receiptDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(courtCase.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <div class="flex items-center justify-center space-x-2">
                <!-- Подробно button -->
                <NuxtLink :to="`/panel/court-cases/${courtCase.id}/detail`"
                          class="group relative inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors duration-150"
                          title="Посмотреть детали">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span class="ml-1">Подробно</span>
                </NuxtLink>

                <!-- Еще dropdown menu -->
                <div class="relative">
                  <button @click.stop="toggleDropdown(courtCase.id)"
                          class="group relative inline-flex items-center cursor-pointer px-2.5 py-1.5 rounded-md text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                          title="Дополнительные действия">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    <span class="ml-1">Еще</span>
                  </button>

                  <!-- Dropdown menu -->
                  <div v-if="dropdownOpen === courtCase.id"
                       @click.stop
                       class="absolute right-0 mt-2 w-[14rem] bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 border border-gray-100">
                    <div class="py-2">
                      <button @click="searchDefendantForCase(courtCase.id); dropdownOpen = null"
                              :disabled="courtCase.searchingDefendant"
                              class="cursor-pointer group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-800 transition-all duration-200 ease-in-out disabled:opacity-50">
                        <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors duration-200 disabled:bg-gray-100">
                          <svg v-if="courtCase.searchingDefendant" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <span>{{ courtCase.searchingDefendant ? 'Поиск ответчика...' : 'Поиск ответчика в ЕГР' }}</span>
                      </button>

                      <button @click="searchPartiesForCase(courtCase.id); dropdownOpen = null"
                              :disabled="courtCase.searchingParties"
                              class="cursor-pointer group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-800 transition-all duration-200 ease-in-out disabled:opacity-50">
                        <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors duration-200 disabled:bg-gray-100">
                          <svg v-if="courtCase.searchingParties" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <span>{{ courtCase.searchingParties ? 'Поиск в ЕГР...' : 'Поиск сторон в ЕГР' }}</span>
                      </button>

                      <NuxtLink :to="`/panel/court-cases/${courtCase.id}/edit`"
                                class="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-all duration-200 ease-in-out">
                        <div class="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-yellow-200 transition-colors duration-200">
                          <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <span>Редактировать</span>
                      </NuxtLink>

                      <button @click="deleteCourtCase(courtCase); dropdownOpen = null"
                              class="group flex items-center w-full px-4 cursor-pointer py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-800 transition-all duration-200 ease-in-out">
                        <div class="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors duration-200">
                          <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                        <span>Удалить</span>
                      </button>

                      <div class="border-t border-gray-100 my-2"></div>

                      <button class="group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-400 cursor-not-allowed" disabled>
                        <div class="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span>Отправить SMS</span>

                      </button>

                      <button class="group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-400 cursor-not-allowed" disabled>
                        <div class="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <span>Отправить Email</span>

                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
const dropdownOpen = ref(null)
const searchingDefendants = ref(false)
const searchingParties = ref(false)

// Filters
const filters = ref({
  dateAddedFrom: '',
  dateAddedTo: '',
  dateCreatedFrom: '',
  dateCreatedTo: ''
})

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// Fetch court cases
const fetchCourtCases = async () => {
  loading.value = true
  try {
    const queryParams = {
      page: pagination.value?.page || 1,
      limit: pagination.value?.limit || 10,
      search: searchQuery.value || ''
    }
    
    // Add date filters if they exist
    if (filters.value.dateAddedFrom) {
      queryParams.dateAddedFrom = filters.value.dateAddedFrom
    }
    if (filters.value.dateAddedTo) {
      queryParams.dateAddedTo = filters.value.dateAddedTo
    }
    if (filters.value.dateCreatedFrom) {
      queryParams.dateCreatedFrom = filters.value.dateCreatedFrom
    }
    if (filters.value.dateCreatedTo) {
      queryParams.dateCreatedTo = filters.value.dateCreatedTo
    }
    
    const response = await $fetch('/api/panel/court-cases', {
      query: queryParams
    })
    
    courtCases.value = response?.data || []
    if (response?.pagination) {
      pagination.value = {
        ...pagination.value,
        ...response.pagination
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

// Toggle dropdown
const toggleDropdown = (courtCaseId) => {
  if (dropdownOpen.value === courtCaseId) {
    dropdownOpen.value = null
  } else {
    dropdownOpen.value = courtCaseId
  }
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  dropdownOpen.value = null
}

// Clear filters
const clearFilters = () => {
  filters.value = {
    dateAddedFrom: '',
    dateAddedTo: '',
    dateCreatedFrom: '',
    dateCreatedTo: ''
  }
  if (pagination.value) {
    pagination.value.page = 1
  }
  fetchCourtCases()
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

// Search defendants
const searchDefendants = async () => {
  searchingDefendants.value = true
  try {
    const response = await $fetch('/api/panel/court-cases/search-defendants', {
      method: 'POST',
      body: {
        courtCaseIds: courtCases.value.map(c => c.id)
      }
    })
    // For bulk search, show the API message (wait 5 minutes)
    toast.success(response.message)
  } catch (error) {
    console.error('Error searching defendants:', error)
    toast.error('Ошибка при поиске ответчиков')
  } finally {
    searchingDefendants.value = false
  }
}

// Search parties
const searchParties = async () => {
  searchingParties.value = true
  try {
    const response = await $fetch('/api/panel/court-cases/search-parties', {
      method: 'POST',
      body: {
        courtCaseIds: courtCases.value.map(c => c.id)
      }
    })
    // For bulk search, show the API message (wait 5 minutes)
    toast.success(response.message)
  } catch (error) {
    console.error('Error searching parties:', error)
    toast.error('Ошибка при поиске сторон')
  } finally {
    searchingParties.value = false
  }
}

// Search defendant for a specific case
const searchDefendantForCase = async (courtCaseId) => {
  // Find the court case in the array and set searching flag
  const courtCase = courtCases.value.find(c => c.id === courtCaseId)
  if (courtCase) {
    courtCase.searchingDefendant = true
  }

  try {
    const response = await $fetch('/api/panel/court-cases/search-single-defendant', {
      method: 'POST',
      body: {
        courtCaseId
      }
    })

    if (response.success) {
      toast.success(response.message)
      // Update the local court case data instead of full refresh
      if (courtCase && response.foundCompany) {
        courtCase.debtorCompany = response.foundCompany
        courtCase.debtorCompanyId = response.foundCompany.id
      }
    } else {
      toast.error(response.message)
    }

    // Log debug information
    console.log('Sent to EGR:', response.sentToEGR)
    console.log('Received from EGR:', response.receivedFromEGR)

  } catch (error) {
    console.error('Error searching defendant for case:', error)
    toast.error('Ошибка при поиске ответчика')
  } finally {
    if (courtCase) {
      courtCase.searchingDefendant = false
    }
  }
}

// Search parties for a specific case
const searchPartiesForCase = async (courtCaseId) => {
  // Find the court case in the array and set searching flag
  const courtCase = courtCases.value.find(c => c.id === courtCaseId)
  if (courtCase) {
    courtCase.searchingParties = true
  }

  try {
    const response = await $fetch('/api/panel/court-cases/search-single-parties', {
      method: 'POST',
      body: {
        courtCaseId
      }
    })

    if (response.success) {
      toast.success(response.message)
      // Update the local court case data instead of full refresh
      if (courtCase && response.results) {
        response.results.forEach(result => {
          if (result.found && result.company) {
            if (result.party === 'claimant') {
              courtCase.claimantCompany = result.company
              courtCase.claimantCompanyId = result.company.id
            } else if (result.party === 'debtor') {
              courtCase.debtorCompany = result.company
              courtCase.debtorCompanyId = result.company.id
            }
          }
        })
      }
    } else {
      toast.error(response.message)
    }

    // Log debug information
    console.log('Sent to EGR:', response.sentToEGR)
    console.log('Received from EGR:', response.receivedFromEGR)
    console.log('Search results:', response.results)

  } catch (error) {
    console.error('Error searching parties for case:', error)
    toast.error('Ошибка при поиске сторон')
  } finally {
    if (courtCase) {
      courtCase.searchingParties = false
    }
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
  fetchCourtCases()
  
  // Add click outside listener to close dropdown
  document.addEventListener('click', closeDropdown)
})

// Cleanup event listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>
