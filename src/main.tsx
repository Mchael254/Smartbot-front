import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TabManagerProvider } from './context/tabContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TabManagerProvider>
      <App />
    </TabManagerProvider>

  </StrictMode>,
)