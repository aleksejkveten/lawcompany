<template>
  <NuxtLayout :name="admin-login">
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Grid pattern overlay -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px); background-size: 50px 50px;"></div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 text-center max-w-4xl mx-auto">



      <!-- Main heading -->
      <h1 class="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight">
        <span class="block">Юридическая фирма</span>
      </h1>

      <!-- Subtitle -->
      <p class="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
        Современная платформа для работы юридической фирмы
      </p>

      <!-- Status indicator -->
      <div class="mb-12">
        <div class="inline-flex items-center bg-white bg-opacity-10 backdrop-blur-md rounded-full px-8 py-4 border border-white border-opacity-20">
          <div class="flex items-center mr-4">
            <div class="w-3 h-3 bg-amber-400 rounded-full animate-pulse mr-3"></div>
            <span class="text-slate-700 font-semibold text-lg">В разработке</span>
          </div>
            <div class="w-3 h-3 bg-slate-400 rounded-full"></div>
          <div class="ml-4 text-lg text-slate-400">Скоро запуск</div>
        </div>
      </div>

      <!-- Coming soon message -->
      <div class="bg-white bg-opacity-5 backdrop-blur-xl rounded-3xl p-10 mb-12 border border-white border-opacity-10 shadow-2xl">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">
          Мы создаем что-то особенное
        </h2>
        <p class="text-slate-500 text-lg leading-relaxed mb-8">
          Наша команда разрабатывает инновационное решение для цифровизации судебных процессов. 
          Следите за обновлениями!
        </p>
        
        <!-- Progress indicator -->
        <div class="max-w-md mx-auto">
          <div class="flex justify-between text-sm text-slate-400 mb-2">
            <span>Прогресс</span>
            <span>85%</span>
          </div>
          <div class="w-full bg-slate-700 bg-opacity-50 rounded-full h-3">
            <div class="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-3 rounded-full relative overflow-hidden" style="width: 85%">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

     

      <!-- Footer -->
      <div class="text-slate-400 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} Система работы с клиентами. Все права защищены.</p>
      </div>
    </div>
  </div>
</NuxtLayout>
</template>

<script setup>


// Set page meta
useHead({
  title: 'Система работы с клиентами юридической фирмы - В разработке',
  meta: [
    { name: 'description', content: '' },
    { name: 'keywords', content: '' }
  ]
})
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes gradient-x {
  0%, 100% {
    background-size: 200% 200%;
    background-position: left center;
  }
  50% {
    background-size: 200% 200%;
    background-position: right center;
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.animate-gradient-x {
  animation: gradient-x 3s ease infinite;
}
</style>