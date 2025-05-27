import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/components/views/Dashboard';
import Inbox from '@/components/views/Inbox';
import Orders from '@/components/views/Orders';
import InvoiceCreator from '@/components/views/InvoiceCreator';
import EmailComposer from '@/components/views/EmailComposer';
import { MessageProvider } from '@/context/MessageContext';
import { OrderProvider } from '@/context/OrderContext';
import { UserProvider } from '@/context/UserContext';
import { useUser } from '@/context/UserContext';

// Admin route protection component
function RequireAdmin({ children }: { children: JSX.Element }) {
  const { currentUser } = useUser();
  
  // Check if user is logged in and is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    // Redirect non-admin users to the orders page
    return <Navigate to="/orders" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <UserProvider>
        <MessageProvider>
          <OrderProvider>
            
              <Layout>
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <RequireAdmin>
                        <Dashboard />
                      </RequireAdmin>
                    } 
                  />
                  <Route path="/inbox" element={<Inbox />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/invoice-creator" element={<InvoiceCreator />} />
                  <Route path="/email-composer" element={<EmailComposer />} />
                </Routes>
              </Layout>
          </OrderProvider>
        </MessageProvider>
      </UserProvider>
      <Toaster />
    </Router>
  );
}

export default App;