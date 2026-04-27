import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'app-theme'
const VALID = ['light', 'dark']

const initial = (() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (VALID.includes(stored)) return stored
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
})()

const currentTheme = ref(initial)

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem(STORAGE_KEY, currentTheme.value)
})

export function useTheme() {
  const setTheme = (theme) => {
    if (VALID.includes(theme)) currentTheme.value = theme
  }
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  }
  return { currentTheme, setTheme, toggleTheme }
}
