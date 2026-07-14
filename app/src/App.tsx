import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import ListingDetail from './pages/ListingDetail';
import OwnerWizard from './pages/OwnerWizard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/owner/new" element={<OwnerWizard />} />
    </Routes>
  );
}
