import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import ProductEdit from '@/pages/ProductEdit';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import Customers from '@/pages/Customers';
import PromoCodes from '@/pages/PromoCodes';
import Media from '@/pages/Media';
import Newsletter from '@/pages/Newsletter';
import ContactMessages from '@/pages/ContactMessages';
import Shipping from '@/pages/Shipping';
import Settings from '@/pages/Settings';
import BlogPosts from '@/pages/BlogPosts';
import Users from '@/pages/Users';
import Invoices from '@/pages/Invoices';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/new" element={<ProductEdit />} />
                        <Route path="/products/:id" element={<ProductEdit />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:id" element={<OrderDetail />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/promo-codes" element={<PromoCodes />} />
                        <Route path="/media" element={<Media />} />
                        <Route path="/newsletter" element={<Newsletter />} />
                        <Route path="/messages" element={<ContactMessages />} />
                        <Route path="/shipping" element={<Shipping />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/blog" element={<BlogPosts />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
