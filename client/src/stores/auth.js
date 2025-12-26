/**
 * Auth Store - Pinia store untuk autentikasi
 * File: src/stores/auth.js
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'
import { firebaseSignOut } from '@/services/firebase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || 'Guest')
  
  // Actions
  
  /**
   * Cek auth dari localStorage saat app mount
   */
  const checkAuth = async () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      
      // Verify token masih valid
      try {
        const response = await authAPI.getMe()
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(user.value))
      } catch (err) {
        // Token tidak valid, logout
        logout()
      }
    }
  }
  
  /**
   * Register user baru
   */
  const register = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.register(userData)
      const { user: userData2, token: newToken } = response.data.data
      
      user.value = userData2
      token.value = newToken
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData2))
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Registrasi gagal'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Login user
   */
  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.login(credentials)
      const { user: userData, token: newToken } = response.data.data
      
      user.value = userData
      token.value = newToken
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login gagal'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Login/Register via Google Sign-In
   */
  const loginWithGoogle = async (idToken) => {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.googleLogin(idToken)
      const { user: userData, token: newToken } = response.data.data

      user.value = userData
      token.value = newToken

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login dengan Google gagal'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Logout user
   */
  const logout = () => {
    user.value = null
    token.value = null
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    firebaseSignOut().catch(() => {})
  }
  
  /**
   * Update profile
   */
  const updateProfile = async (data) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.updateProfile(data)
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal update profile'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isLoggedIn,
    isAdmin,
    userName,
    // Actions
    checkAuth,
    register,
    login,
    loginWithGoogle,
    logout,
    updateProfile
  }
})
