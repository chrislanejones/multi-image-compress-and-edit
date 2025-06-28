import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/start'
import { router } from './router'

const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <StartClient router={router} />
    </StrictMode>
  )
}
