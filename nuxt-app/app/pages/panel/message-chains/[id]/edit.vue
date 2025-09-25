<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/panel/message-chains"
                  class="flex items-center text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Редактировать цепочку сообщений</h1>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
    </div>

    <div v-else-if="!chain" class="bg-white rounded-lg shadow p-6">
      <div class="text-center text-gray-500">
        Цепочка не найдена
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Basic info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              v-model="form.name"
              type="text"
              id="name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название цепочки"
            >
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <input
              v-model="form.description"
              type="text"
              id="description"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите описание"
            >
          </div>
        </div>

        <!-- Chains management -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <label class="block text-sm font-medium text-gray-700">
              Шаги цепочки *
            </label>
            <button
              type="button"
              @click="addChainStep"
              class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              + Добавить шаг
            </button>
          </div>

          <div v-if="form.chains.length === 0" class="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
            Нет шагов. Нажмите "Добавить шаг" для начала.
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(chainItem, index) in form.chains"
              :key="index"
              class="border border-gray-200 rounded-md p-4 bg-gray-50"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-700">Шаг {{ index + 1 }}</span>
                <button
                  type="button"
                  @click="removeChainStep(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Тип</label>
                  <select
                    v-model="chainItem.type"
                    required
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Шаблон</label>
                  <select
                    v-model="chainItem.templateId"
                    required
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Выберите шаблон</option>
                    <option
                      v-for="template in getTemplatesForType(chainItem.type)"
                      :key="template.id"
                      :value="template.id"
                    >
                      {{ template.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Дни задержки</label>
                  <input
                    v-model.number="chainItem.daysOffset"
                    type="number"
                    min="0"
                    required
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <NuxtLink to="/panel/message-chains"
                    class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Отмена
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ submitting ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const chain = ref(null)
const emailTemplates = ref([])
const smsTemplates = ref([])

const form = ref({
  name: '',
  description: '',
  chains: []
})

// Fetch chain data
const fetchChain = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/message-chains/${route.params.id}`)
    chain.value = data

    // Fill form
    form.value = {
      name: data.name || '',
      description: data.description || '',
      chains: data.chains || []
    }
  } catch (error) {
    console.error('Error fetching chain:', error)
    toast.error('Ошибка загрузки цепочки')
  } finally {
    loading.value = false
  }
}

// Load templates
const fetchTemplates = async () => {
  try {
    const [emailResponse, smsResponse] = await Promise.all([
      $fetch('/api/panel/email-templates'),
      $fetch('/api/panel/sms-templates')
    ])
    emailTemplates.value = emailResponse?.data || []
    smsTemplates.value = smsResponse?.data || []
  } catch (error) {
    console.error('Error loading templates:', error)
    toast.error('Ошибка загрузки шаблонов')
  }
}

// Methods
const addChainStep = () => {
  form.value.chains.push({
    type: 'email',
    templateId: '',
    daysOffset: 0
  })
}

const removeChainStep = (index) => {
  form.value.chains.splice(index, 1)
}

const getTemplatesForType = (type) => {
  return type === 'email' ? emailTemplates.value : smsTemplates.value
}

// Submit form
const submitForm = async () => {
  if (!form.value.name.trim()) {
    toast.error('Название обязательно')
    return
  }

  if (form.value.chains.length === 0) {
    toast.error('Добавьте хотя бы один шаг цепочки')
    return
  }

  // Validate chains
  for (let i = 0; i < form.value.chains.length; i++) {
    const chainItem = form.value.chains[i]
    if (!chainItem.type || !chainItem.templateId || chainItem.daysOffset < 0) {
      toast.error(`Шаг ${i + 1}: заполните все поля корректно`)
      return
    }
  }

  submitting.value = true

  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || null,
      chains: form.value.chains
    }

    const { data } = await $fetch(`/api/panel/message-chains/${route.params.id}`, {
      method: 'PUT',
      body: payload
    })

    // Update chain data
    chain.value = data

    toast.success('Цепочка успешно обновлена')
  } catch (error) {
    console.error('Error updating chain:', error)

    if (error.statusCode === 400) {
      toast.error(error.statusMessage || 'Некорректные данные')
    } else {
      toast.error('Ошибка обновления цепочки')
    }
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(async () => {
  await Promise.all([fetchChain(), fetchTemplates()])
})
</script>
