import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@badnpm/ui/styles/index.css';
import '@badnpm/ui/styles/custom.css';
import '@badnpm/ui/styles/font/geist.css';
import { App } from './App.tsx';
import { ThemeProvider, PreferenceProvider } from '@badnpm/ui';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider keyboardShortcut='d'>
      <PreferenceProvider>
        <App />
      </PreferenceProvider>
    </ThemeProvider>
  </StrictMode>
);
