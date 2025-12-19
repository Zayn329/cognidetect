import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // This should now contain the globals.css content
import App from './App.jsx'

// Import the providers from your new architecture
import { ThemeProvider } from "./components/theme-provider.jsx";
import { LanguageProvider } from "./context/language-context.jsx";
import { Toaster } from "./components/ui/toaster.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ThemeProvider manages light/dark mode based on the globals.css variables */}
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {/* LanguageProvider handles multi-language support if integrated */}
      <LanguageProvider>
        <App />
        {/* Toaster enables the popup notifications used in the design system */}
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)