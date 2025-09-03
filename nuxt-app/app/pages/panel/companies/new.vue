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
        </div>

        <!-- Contact persons -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Контактные лица</h3>
            <button
              type="button"
              @click="addContactPerson"
              class="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Добавить контакт
            </button>
          </div>

          <div v-for="(contact, index) in form.contactPersons" :key="index" 
               class="p-4 border border-gray-200 rounded-lg mb-4">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-medium text-gray-900">Контакт {{ index + 1 }}</h4>
              <button
                type="button"
                @click="removeContactPerson(index)"
                class="text-red-600 hover:text-red-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  v-model="contact.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Имя контакта"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Телефоны (через запятую)
                </label>
                <input
                  v-model="contact.phonesText"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+375291234567, +375331234567"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Email адреса (через запятую)
                </label>
                <input
                  v-model="contact.emailsText"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email1@example.com, email2@example.com"
                >
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
  contactPersons: []
})

// Add contact person
const addContactPerson = () => {
  form.value.contactPersons.push({
    name: '',
    phonesText: '',
    emailsText: ''
  })
}

// Remove contact person
const removeContactPerson = (index) => {
  form.value.contactPersons.splice(index, 1)
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
      contactPersons: form.value.contactPersons.map(contact => ({
        name: contact.name.trim(),
        phones: contact.phonesText ? contact.phonesText.split(',').map(p => ({ number: p.trim() })).filter(p => p.number) : [],
        emails: contact.emailsText ? contact.emailsText.split(',').map(e => ({ address: e.trim() })).filter(e => e.address) : []
      })).filter(contact => contact.name)
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

// Add initial contact person
onMounted(() => {
  addContactPerson()
})
</script>