
<template>
  <NuxtLayout name="admin">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/panel/companies" 
                  class="flex items-center text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Редактировать компанию</h1>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка...</p>
      </div>
    </div>

    <div v-else-if="!company" class="bg-white rounded-lg shadow p-6">
      <div class="text-center text-gray-500">
        Компания не найдена
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Основная форма -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Основные данные</h2>
        <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Company basic info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Название компании *
            </label>
            <input
              v-model="form.name"
              type="text"
              id="name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название компании"
            >
          </div>

          <div>
            <label for="unp" class="block text-sm font-medium text-gray-700 mb-2">
              УНП
            </label>
            <input
              v-model="form.unp"
              type="text"
              id="unp"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите УНП"
            >
          </div>
          
          <div>
            <label for="aliases" class="block text-sm font-medium text-gray-700 mb-2">
              Псевдонимы
            </label>
            <input
              v-model="form.aliases"
              type="text"
              id="aliases"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Альтернативные названия"
            >
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
              Адрес
            </label>
            <input
              v-model="form.address"
              type="text"
              id="address"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Полный адрес компании"
            >
          </div>

          <div>
            <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
              Город
            </label>
            <input
              v-model="form.city"
              type="text"
              id="city"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Город"
            >
          </div>

          <div>
            <label for="site" class="block text-sm font-medium text-gray-700 mb-2">
              Сайт
            </label>
            <input
              v-model="form.site"
              type="url"
              id="site"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            >
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="form.track"
                type="checkbox"
                class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="text-sm font-medium text-gray-700">Отслеживать компанию</span>
            </label>
          </div>
        </div>
        
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
            Заметки
          </label>
          <textarea
            v-model="form.notes"
            id="notes"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Дополнительная информация"
          ></textarea>
        </div>

        <!-- Контактные лица -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-md font-medium text-gray-900">Контактные лица</h4>
            <button 
              type="button" 
              @click="addContactPerson"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Добавить контакт
            </button>
          </div>
          
          <div v-if="form.contactPersons.length === 0" class="text-sm text-gray-500 italic">
            Контактные лица не добавлены
          </div>
          
          <div 
            v-for="(contact, contactIndex) in form.contactPersons" 
            :key="contactIndex"
            class="border border-gray-200 rounded-md p-4 mb-3"
          >
            <div class="flex justify-between items-start mb-3">
              <h5 class="font-medium text-gray-800">Контактное лицо {{ contactIndex + 1 }}</h5>
              <button 
                type="button" 
                @click="removeContactPerson(contactIndex)"
                class="text-red-600 hover:text-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  v-model="contact.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите имя"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Источник
                </label>
                <input
                  v-model="contact.source"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: ЕГР"
                  readonly
                >
              </div>
            </div>
            
            <!-- Телефоны -->
            <div class="mb-3">
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700">Телефоны</label>
                <button 
                  type="button" 
                  @click="addPhone(contactIndex)"
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Добавить телефон
                </button>
              </div>
              <div 
                v-for="(phone, phoneIndex) in contact.phones" 
                :key="phoneIndex"
                class="flex gap-2 mb-2"
              >
                <input 
                  v-model="phone.number" 
                  type="tel" 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+375 (xx) xxx-xx-xx"
                >
                <button 
                  type="button" 
                  @click="removePhone(contactIndex, phoneIndex)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Email адреса -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700">Email адреса</label>
                <button 
                  type="button" 
                  @click="addEmail(contactIndex)"
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Добавить email
                </button>
              </div>
              <div 
                v-for="(email, emailIndex) in contact.emails" 
                :key="emailIndex"
                class="flex gap-2 mb-2"
              >
                <input 
                  v-model="email.address" 
                  type="email" 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example@company.com"
                >
                <button 
                  type="button" 
                  @click="removeEmail(contactIndex, emailIndex)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <NuxtLink to="/panel/companies" 
                    class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Отмена
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ submitting ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>
        
    <!-- Связанные данные -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Судебные дела -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Судебные дела</h3>
        <div v-if="company.courtCasesAsClaimant?.length || company.courtCasesAsDebtor?.length">
          <!-- Как истец -->
          <div v-if="company.courtCasesAsClaimant?.length" class="mb-4">
            <h4 class="text-sm font-medium text-green-700 mb-2">Как истец ({{ company.courtCasesAsClaimant.length }}):</h4>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <div v-for="courtCase in company.courtCasesAsClaimant" :key="courtCase.id" class="bg-green-50 border border-green-200 rounded p-2">
                <div class="text-sm font-medium">{{ courtCase.caseNumber || 'Номер не указан' }}</div>
                <div class="text-xs text-gray-600">Сумма: {{ formatCurrency(courtCase.debtAmount) }}</div>
              </div>
            </div>
          </div>
              
          <!-- Как ответчик -->
          <div v-if="company.courtCasesAsDebtor?.length">
            <h4 class="text-sm font-medium text-red-700 mb-2">Как ответчик ({{ company.courtCasesAsDebtor.length }}):</h4>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <div v-for="courtCase in company.courtCasesAsDebtor" :key="courtCase.id" class="bg-red-50 border border-red-200 rounded p-2">
                <div class="text-sm font-medium">{{ courtCase.caseNumber || 'Номер не указан' }}</div>
                <div class="text-xs text-gray-600">Сумма: {{ formatCurrency(courtCase.debtAmount) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic text-sm">
          Судебных дел нет
        </div>
      </div>
          
      <!-- Отправленные сообщения -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Отправленные сообщения</h3>
        <div class="text-gray-500 italic text-sm">
          Отправленные SMS и Email будут отображаться здесь после реализации соответствующих API эндпоинтов.
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

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const company = ref(null)

const form = ref({
  name: '',
  unp: '',
  notes: '',
  track: false,
  aliases: '',
  address: '',
  city: '',
  site: '',
  contactPersons: []
})

// Форматирование валюты
const formatCurrency = (amount) => {
  if (!amount) return '0 BYN'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN'
  }).format(amount)
}

// Fetch company data
const fetchCompany = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/companies/${route.params.id}`)
    company.value = data
    
    // Fill form
    form.value.name = data.name || ''
    form.value.unp = data.unp || ''
    form.value.notes = data.notes || ''
    form.value.track = data.track || false
    form.value.aliases = data.aliases || ''
    form.value.address = data.address || ''
    form.value.city = data.city || ''
    form.value.site = data.site || ''
    
    // Fill contact persons
    form.value.contactPersons = (data.contactPersons || []).map(contact => ({
      id: contact.id,
      name: contact.name,
      source: contact.source,
      phones: (contact.phones || []).map(phone => ({
        id: phone.id,
        number: phone.number
      })),
      emails: (contact.emails || []).map(email => ({
        id: email.id,
        address: email.address
      }))
    }))
  } catch (error) {
    console.error('Error fetching company:', error)
    toast.error('Ошибка при загрузке компании')
  } finally {
    loading.value = false
  }
}

// ContactPerson management functions
const addContactPerson = () => {
  form.value.contactPersons.push({
    name: '',
    phones: [],
    emails: []
  })
}

const removeContactPerson = (index) => {
  form.value.contactPersons.splice(index, 1)
}

const addPhone = (contactIndex) => {
  form.value.contactPersons[contactIndex].phones.push({
    number: ''
  })
}

const removePhone = (contactIndex, phoneIndex) => {
  form.value.contactPersons[contactIndex].phones.splice(phoneIndex, 1)
}

const addEmail = (contactIndex) => {
  form.value.contactPersons[contactIndex].emails.push({
    address: ''
  })
}

const removeEmail = (contactIndex, emailIndex) => {
  form.value.contactPersons[contactIndex].emails.splice(emailIndex, 1)
}

// Submit form
const submitForm = async () => {
  if (!form.value.name.trim()) {
    toast.error('Название компании обязательно')
    return
  }

  submitting.value = true
  
  try {
    const payload = {
      name: form.value.name.trim(),
      unp: form.value.unp.trim() || null,
      notes: form.value.notes.trim() || null,
      track: form.value.track,
      aliases: form.value.aliases.trim() || null,
      address: form.value.address.trim() || null,
      city: form.value.city.trim() || null,
      site: form.value.site.trim() || null,
      contactPersons: form.value.contactPersons.map(contact => ({
        id: contact.id || undefined,
        name: contact.name.trim(),
        phones: contact.phones.filter(phone => phone.number.trim()).map(phone => ({
          id: phone.id || undefined,
          number: phone.number.trim()
        })),
        emails: contact.emails.filter(email => email.address.trim()).map(email => ({
          id: email.id || undefined,
          address: email.address.trim()
        }))
      })).filter(contact => contact.name.trim())
    }

    await $fetch(`/api/panel/companies/${route.params.id}`, {
      method: 'PUT',
      body: payload
    })

    toast.success('Компания успешно обновлена')
    await navigateTo('/panel/companies')
  } catch (error) {
    console.error('Error updating company:', error)
    toast.error('Ошибка при обновлении компании')
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchCompany()
})
</script>
