/**
 * Firebase client initialization (Auth)
 * File: src/services/firebase.js
 */

import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
)

export const getFirebaseApp = () => {
  if (!isFirebaseConfigured) return null
  return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

export const getFirebaseAuth = () => {
  const app = getFirebaseApp()
  if (!app) return null
  return getAuth(app)
}

export const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}

export const firebaseSignOut = async () => {
  const auth = getFirebaseAuth()
  if (!auth) return

  try {
    await signOut(auth)
  } catch (_) {
    // ignore
  }
}

