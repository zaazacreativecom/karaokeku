<template>
  <router-view></router-view>
  <ChatWidget />
</template>

<script setup>
import ChatWidget from './components/chat/ChatWidget.vue';
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Cek apakah ada token tersimpan
  authStore.checkAuth()
})
</script>

<style>
/* Global styles sudah di main.css */
</style>
