import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import GuidePage from './GuidePage';

const AppWrapper: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/guide/:guideId" element={<GuidePage />} />
      </Routes>
    </Router>
  );
};

export default AppWrapper;
