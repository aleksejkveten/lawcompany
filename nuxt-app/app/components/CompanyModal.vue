<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Фон -->
      <div 
        class="fixed inset-0 transition-opacity" 
        @click="$emit('close')"
      >
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Модальное окно -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                {{ isEditing ? 'Редактирование компании' : 'Создание компании' }}
              </h3>
            </div>

            <!-- Основные данные компании -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Название компании *
                </label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название компании"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  УНП
                </label>
                <input 
                  v-model="form.unp" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите УНП"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Псевдонимы
                </label>
                <input 
                  v-model="form.aliases" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Альтернативные названия"
                >
              </div>
              
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Заметки
                </label>
                <textarea 
                  v-model="form.notes" 
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Дополнительная информация"
                ></textarea>
              </div>
              
              <div class="sm:col-span-2">
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

            <!-- Контактные лица -->
            <div class="mb-4">
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
          </div>

          <!-- Кнопки -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="submit" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ isEditing ? 'Сохранить' : 'Создать' }}
            </button>
            <button 
              type="button" 
              @click="$emit('close')" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  company: Object,
  isEditing: Boolean
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  name: '',
  unp: '',
  notes: '',
  track: false,
  aliases: '',
  contactPersons: []
})

// Сброс формы
const resetForm = () => {
  if (props.company && props.isEditing) {
    form.value = {
      name: props.company.name || '',
      unp: props.company.unp || '',
      notes: props.company.notes || '',
      track: props.company.track || false,
      aliases: props.company.aliases || '',
      contactPersons: (props.company.contactPersons || []).map(cp => ({
        name: cp.name || '',
        phones: (cp.phones || []).map(p => ({ number: p.number || '' })),
        emails: (cp.emails || []).map(e => ({ address: e.address || '' }))
      }))
    }
  } else {
    form.value = {
      name: '',
      unp: '',
      notes: '',
      track: false,
      aliases: '',
      contactPersons: []
    }
  }
}

// Функции для управления контактными лицами
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
  form.value.contactPersons[contactIndex].phones.push({ number: '' })
}

const removePhone = (contactIndex, phoneIndex) => {
  form.value.contactPersons[contactIndex].phones.splice(phoneIndex, 1)
}

const addEmail = (contactIndex) => {
  form.value.contactPersons[contactIndex].emails.push({ address: '' })
}

const removeEmail = (contactIndex, emailIndex) => {
  form.value.contactPersons[contactIndex].emails.splice(emailIndex, 1)
}

// Обработка отправки
const handleSubmit = () => {
  // Фильтруем пустые значения
  const cleanedData = {
    ...form.value,
    contactPersons: form.value.contactPersons.map(cp => ({
      ...cp,
      phones: cp.phones.filter(p => p.number.trim()),
      emails: cp.emails.filter(e => e.address.trim())
    })).filter(cp => cp.name.trim())
  }
  
  emit('submit', cleanedData)
}

// Отслеживаем изменения props
watch([() => props.isOpen, () => props.company], () => {
  if (props.isOpen) {
    resetForm()
  }
})
</script>