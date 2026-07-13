import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import ListingDetail from './pages/ListingDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
    </Routes>
  );
}
