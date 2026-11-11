import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@workspace/ui/styles/index.css';
import '@workspace/ui/styles/body.css';
import '@workspace/ui/styles/font/geist.css';
import { App } from './App.tsx';
import { ThemeProvider, PreferenceProvider } from '@workspace/ui/providers';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider keyboardShortcut='d'>
      <PreferenceProvider>
        <App />
      </PreferenceProvider>
    </ThemeProvider>
  </StrictMode>
);
