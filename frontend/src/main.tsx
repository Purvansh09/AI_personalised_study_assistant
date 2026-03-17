import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

// Create a client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1f2937',
                        color: '#f9fafb',
                        borderRadius: '12px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#f9fafb',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#f9fafb',
                        },
                    },
                }}
            />
        </QueryClientProvider>
    </StrictMode>,
)
