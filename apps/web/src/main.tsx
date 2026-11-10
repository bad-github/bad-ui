import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@workspace/ui/globals.css';
import { App } from './App.tsx';
import { ThemeProvider } from '@workspace/ui/providers/theme-provider';
import { PreferenceProvider } from '@workspace/ui/providers/preference-provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PreferenceProvider>
        <App />
      </PreferenceProvider>
    </ThemeProvider>
  </StrictMode>
);
