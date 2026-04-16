import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { CampaignListPage } from './pages/CampaignListPage';
import { CampaignCreatePage } from './pages/CampaignCreatePage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/campaigns" element={<CampaignListPage />} />
              <Route path="/campaigns/new" element={<CampaignCreatePage />} />
              <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/campaigns" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
