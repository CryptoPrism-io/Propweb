import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import Results from './pages/Results';
import ListingDetail from './pages/ListingDetail';
import OwnerWizard from './pages/OwnerWizard';

export default function App() {
  return (
    <div className="relative overflow-x-hidden">
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/owner/new" element={<OwnerWizard />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
