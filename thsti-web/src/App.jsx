import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Accessibility from './components/layout/Accessibility';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import Page from './pages/Page';

import Search from './pages/Search';
import FacultyProfile from './pages/FacultyProfile';

function App() {
  // Simple script to handle toggling accessibility sidebar if needed
  useEffect(() => {
    window.closeSidebar = () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('active');
    };
  }, []);

  return (
    <div className="page-wrapper">
      <Header />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page/:slug" element={<Page />} />
        <Route path="/faculty/:slug" element={<FacultyProfile />} />
        <Route path="/search" element={<Search />} />
      </Routes>

      <Footer />
      <Accessibility />

      {/* Scroll To Top */}
      <ScrollToTop />
    </div>
  );
}

export default App;
