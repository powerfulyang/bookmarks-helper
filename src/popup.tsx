import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';
import { Bookmarks } from '@/components/Bookmarks';
import { queryClient } from '@/utils';
import './styles/base.scss';

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <div className="w-[700px]">
            <Bookmarks />
          </div>
        </QueryClientProvider>
      </StrictMode>,
    );
  }
});
