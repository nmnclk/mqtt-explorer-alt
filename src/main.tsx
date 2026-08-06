import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { I18nProvider, initLocale } from './i18n/I18nContext'
import { initTheme } from './theme/initTheme'
import './index.css'

initTheme()
initLocale()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
)
