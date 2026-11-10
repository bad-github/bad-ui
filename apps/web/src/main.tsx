import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@workspace/ui/styles';
import { App } from './App.tsx';
import { ThemeProvider, PreferenceProvider } from '@workspace/ui/providers';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PreferenceProvider>
        <App />
      </PreferenceProvider>
    </ThemeProvider>
  </StrictMode>
);
