<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Шаблоны SMS</h1>
        <div class="flex items-center space-x-3">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по названию или содержимому..."
              class="w-64 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="debouncedSearch"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <NuxtLink to="/panel/sms-templates/new"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Добавить шаблон
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Templates table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>

      <div v-else-if="templates.length === 0" class="p-6 text-center text-gray-500">
        Шаблоны не найдены
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Содержимое
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Создан
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="template in templates" :key="template.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ template.name }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-xs truncate">{{ template.content }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ template.channelCategory?.name || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(template.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <NuxtLink
                      :to="`/panel/sms-templates/${template.id}/detail`"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Просмотр
                    </NuxtLink>
                    <NuxtLink
                      :to="`/panel/sms-templates/${template.id}/edit`"
                      class="text-green-600 hover:text-green-900"
                    >
                      Редактировать
                    </NuxtLink>
                    <button
                      @click="confirmDelete(template)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="templateToDelete" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900">Подтвердить удаление</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Вы действительно хотите удалить шаблон "{{ templateToDelete.name }}"?
              Это действие нельзя отменить.
            </p>
          </div>
          <div class="flex justify-center space-x-4 mt-4">
            <button
              @click="templateToDelete = null"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Отмена
            </button>
            <button
              @click="deleteTemplate"
              :disabled="deleting"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {{ deleting ? 'Удаление...' : 'Удалить' }}
            </button>
          </div>
        </div>
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

// Reactive data
const loading = ref(true)
const deleting = ref(false)
const templates = ref([])
const searchQuery = ref('')
const templateToDelete = ref(null)

// Methods
const fetchTemplates = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/panel/sms-templates', {
      query: {
        search: searchQuery.value || ''
      }
    })

    templates.value = response?.data || []
  } catch (error) {
    console.error('Error fetching templates:', error)
    toast.error('Ошибка загрузки шаблонов')
    templates.value = []
  } finally {
    loading.value = false
  }
}

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

const debouncedSearch = debounce(() => {
  fetchTemplates()
}, 300)

const confirmDelete = (template) => {
  templateToDelete.value = template
}

const deleteTemplate = async () => {
  if (!templateToDelete.value) return

  deleting.value = true
  try {
    await $fetch(`/api/panel/sms-templates/${templateToDelete.value.id}`, {
      method: 'DELETE'
    })

    toast.success('Шаблон успешно удален')
    templateToDelete.value = null
    await fetchTemplates()
  } catch (error) {
    console.error('Error deleting template:', error)
    toast.error('Ошибка удаления шаблона')
  } finally {
    deleting.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Load data on mount
onMounted(() => {
  fetchTemplates()
})

// Watch search query
watch(searchQuery, () => {
  debouncedSearch()
})
</script>
