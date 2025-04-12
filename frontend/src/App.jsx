import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InfluencerList from './pages/InfluencerList';
import InfluencerDetail from './pages/InfluencerDetail';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="influencers" element={<InfluencerList />} />
        <Route path="influencers/:id" element={<InfluencerDetail />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;