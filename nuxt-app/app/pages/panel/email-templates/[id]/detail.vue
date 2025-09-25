<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <!-- Navigation and Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/panel/email-templates"
                      class="flex items-center text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to list
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ template?.name || 'Loading...' }}
            </h1>
          </div>

          <div class="flex space-x-3" v-if="template">
            <NuxtLink :to="`/panel/email-templates/${template.id}/edit`"
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-6">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="!template" class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-gray-500">
          Template not found
        </div>
      </div>

      <!-- Template Details -->
      <div v-else class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Template Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Name</label>
              <p class="text-gray-900 font-medium">{{ template.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Subject</label>
              <p class="text-gray-900">{{ template.subject }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Format</label>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="template.format === 'html' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                {{ template.format }}
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Category</label>
              <p class="text-gray-900">{{ template.channelCategory?.name || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <p class="text-gray-900 font-mono">{{ template.id }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span :class="template.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ template.isDeleted ? 'Deleted' : 'Active' }}
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Created</label>
              <p class="text-gray-900">{{ formatDate(template.createdAt) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Updated</label>
              <p class="text-gray-900">{{ formatDate(template.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Content Preview -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Content Preview</h2>

          <!-- Tabs for format -->
          <div class="mb-4">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8">
                <button
                  @click="activeTab = 'plaintext'"
                  :class="[
                    activeTab === 'plaintext'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                  ]"
                >
                  Plain Text
                </button>
                <button
                  @click="activeTab = 'html'"
                  :class="[
                    activeTab === 'html'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                  ]"
                >
                  HTML Preview
                </button>
              </nav>
            </div>
          </div>

          <!-- Content display -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Editor side -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                v-model="template.content"
                readonly
                rows="15"
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
              ></textarea>
            </div>

            <!-- Preview side -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div class="border border-gray-300 rounded-md p-3 bg-gray-50 min-h-[250px]">
                <div v-if="activeTab === 'plaintext'" class="whitespace-pre-wrap text-sm">
                  {{ template.content }}
                </div>
                <div v-else-if="activeTab === 'html'" class="text-sm">
                  <div v-html="template.content"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ template.content?.length || 0 }}</div>
              <div class="text-sm text-gray-500">characters</div>
            </div>

            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ (template.content?.match(/\n/g) || []).length + 1 }}</div>
              <div class="text-sm text-gray-500">lines</div>
            </div>

            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ getDaysFromCreation(template.createdAt) }}</div>
              <div class="text-sm text-gray-500">days old</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()

const template = ref(null)
const loading = ref(true)
const activeTab = ref('plaintext')

const fetchTemplate = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/panel/email-templates/${route.params.id}`)
    template.value = data
  } catch (error) {
    console.error('Error fetching template:', error)
    template.value = null
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDaysFromCreation = (createdAt) => {
  if (!createdAt) return 0
  const now = new Date()
  const created = new Date(createdAt)
  const diffTime = Math.abs(now - created)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

onMounted(() => {
  fetchTemplate()
})
</script>
