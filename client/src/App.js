import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AdminPanel from './pages/AdminPanel';
import RestaurantMenu from './pages/RestaurantMenu';
import KitchenDashboard from './pages/KitchenDashboard';

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
