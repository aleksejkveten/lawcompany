// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Получаем путь к корню проекта
const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  runtimeConfig: {
    prismaUrl: process.env.PRISMA_URL,
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || '6379',
      password: process.env.REDIS_PASSWORD,
    },
    yandexMail: {
      login: process.env.YANDEX_MAIL_LOGIN,
      password: process.env.YANDEX_MAIL_PASSWORD,
    },
    smsby: {
      token: process.env.SMS_BY_API_TOKEN,
      alphaname: process.env.SMS_BY_ALPHANAME
    },
    public: {
      // Public variables that will be exposed to the client
    }
  },
//alias: {
//    '~prisma-client': join(projectRoot, 'prisma', 'generated', 'client')
//  },

  

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    //'@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
    "@prisma/nuxt",
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  css: ['~/assets/css/main.css'],
})
