import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AdminPanel from './pages/AdminPanel';
import RestaurantMenu from './pages/RestaurantMenu';
import KitchenDashboard from './pages/KitchenDashboard';
import { PrivacyPolicy, TermsOfService, RefundPolicy } from './pages/Policies';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/restaurants/:slug" element={<RestaurantMenu />} />
            <Route path="/kitchens/:slug" element={<KitchenDashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund" element={<RefundPolicy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
