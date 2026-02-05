import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { translations, getNestedValue } from './translations'

const I18nContext = createContext(null)

const STORAGE_KEY = 'app_language'

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'ru'
    } catch {
      return 'ru'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore
    }
  }, [language])

  const toggleLanguage = useCallback(() => {
    setLanguage((l) => (l === 'ru' ? 'en' : 'ru'))
  }, [])

  const t = useCallback(
    (key, params = {}) => {
      const value = getNestedValue(translations[language], key)
      if (typeof value !== 'string') return key
      
      // Simple template replacement: {param}
      return value.replace(/\{(\w+)\}/g, (_, p) => {
        return params[p] !== undefined ? params[p] : `{${p}}`
      })
    },
    [language]
  )

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return ctx
}

export { translations }
