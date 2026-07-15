import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TenantVerificationProvider } from './hooks/useTenantVerification';
import Home from './pages/Home';
import Results from './pages/Results';
import ListingDetail from './pages/ListingDetail';
import OwnerWizard from './pages/OwnerWizard';
import TenantKyc from './pages/TenantKyc';
import OwnerMatches from './pages/OwnerMatches';

export default function App() {
  return (
    <TenantVerificationProvider>
      <div className="relative overflow-x-hidden">
        <Navbar />
        <div className="pt-16 lg:pt-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/owner/new" element={<OwnerWizard />} />
            <Route path="/tenant/verify" element={<TenantKyc />} />
            <Route path="/owner/matches" element={<OwnerMatches />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </TenantVerificationProvider>
  );
}
