<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-3 max-w-lg w-full">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-3"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'w-full bg-white shadow-xl rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 transform transition-all duration-300 hover:scale-105',
            toastClasses[toast.type]
          ]"
        >
          <div class="p-5">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <!-- Success Icon -->
                <div v-if="toast.type === 'success'" :class="iconBgClasses[toast.type]" class="rounded-full p-2">
                  <svg :class="iconClasses[toast.type]" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <!-- Error Icon -->
                <div v-else-if="toast.type === 'error'" :class="iconBgClasses[toast.type]" class="rounded-full p-2">
                  <svg :class="iconClasses[toast.type]" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <!-- Warning Icon -->
                <div v-else-if="toast.type === 'warning'" :class="iconBgClasses[toast.type]" class="rounded-full p-2">
                  <svg :class="iconClasses[toast.type]" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <!-- Info Icon -->
                <div v-else :class="iconBgClasses[toast.type]" class="rounded-full p-2">
                  <svg :class="iconClasses[toast.type]" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <p class="text-base font-semibold text-gray-900 leading-5">
                  {{ getTitle(toast.type) }}
                </p>
                <p class="mt-1 text-sm text-gray-600 leading-relaxed">
                  {{ toast.message }}
                </p>
              </div>
              <div class="ml-4 flex-shrink-0">
                <button
                  class="bg-white rounded-lg inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1 transition-colors duration-200"
                  @click="$emit('remove', toast.id)"
                >
                  <span class="sr-only">Закрыть</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

defineProps<{
  toasts: ToastItem[]
}>()

defineEmits<{
  remove: [id: string]
}>()

const toastClasses = {
  success: 'border-green-500 bg-gradient-to-r from-green-50 to-green-100',
  error: 'border-red-500 bg-gradient-to-r from-red-50 to-red-100',
  warning: 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100',
  info: 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100'
}

const iconClasses = {
  success: 'h-5 w-5 text-green-600',
  error: 'h-5 w-5 text-red-600',
  warning: 'h-5 w-5 text-yellow-600',
  info: 'h-5 w-5 text-blue-600'
}

const iconBgClasses = {
  success: 'bg-green-100',
  error: 'bg-red-100', 
  warning: 'bg-yellow-100',
  info: 'bg-blue-100'
}

const getTitle = (type: string) => {
  switch (type) {
    case 'success':
      return 'Успешно'
    case 'error':
      return 'Ошибка'
    case 'warning':
      return 'Предупреждение'
    default:
      return 'Информация'
  }
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>