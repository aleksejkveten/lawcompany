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
        <h1 class="text-2xl font-bold text-gray-900">Добавить компанию</h1>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
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
            
            <div class="mb-3">
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
  </div>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

const submitting = ref(false)

const form = ref({
  name: '',
  unp: '',
  aliases: '',
  notes: '',
  track: false,
  contactPersons: []
})

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
      aliases: form.value.aliases.trim() || null,
      notes: form.value.notes.trim() || null,
      track: form.value.track,
      contactPersons: form.value.contactPersons.map(contact => ({
        name: contact.name.trim(),
        phones: contact.phones.filter(phone => phone.number.trim()).map(phone => ({
          number: phone.number.trim()
        })),
        emails: contact.emails.filter(email => email.address.trim()).map(email => ({
          address: email.address.trim()
        }))
      })).filter(contact => contact.name.trim())
    }

    await $fetch('/api/panel/companies', {
      method: 'POST',
      body: payload
    })

    toast.success('Компания успешно создана')
    await navigateTo('/panel/companies')
  } catch (error) {
    console.error('Error creating company:', error)
    toast.error('Ошибка при создании компании')
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(() => {
  // No automatic contact person addition
})
</script>