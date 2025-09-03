<script setup>
// Redirect to dashboard
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Redirect to dashboard immediately
await navigateTo('/panel/dashboard')
</script>

<template>
  <div class="flex items-center justify-center h-64">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Перенаправление на дашборд...</p>
    </div>
  </div>
</template>