import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ForgotUsername from './pages/ForgotUsername';
import ResetPassword from './pages/ResetPassword';
import Users from './pages/Users';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Menus from './pages/Menus';
import Settings from './pages/Settings';
import HomeSections from './pages/HomeSections';
import Pages from './pages/Pages';
import Faculty from './pages/Faculty';
import News from './pages/News';
import MediaLibrary from './pages/MediaLibrary';
import TranslationLanguages from './pages/TranslationLanguages';
import ResearchCenters from './pages/ResearchCenters';
import ResearchFacilities from './pages/ResearchFacilities';
import Programmes from './pages/Programmes';
import FooterLinks from './pages/FooterLinks';
import HeroSlides from './pages/HeroSlides';
import PreFooterLinks from './pages/PreFooterLinks';
import MarqueeItems from './pages/MarqueeItems';
import Notifications from './pages/Notifications';
import LifeAtTHSTI from './pages/LifeAtTHSTI';
import InternationalCollaboration from './pages/InternationalCollaboration';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-username" element={<ForgotUsername />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="menus" element={<Menus />} />
          <Route path="sections" element={<HomeSections />} />
          <Route path="pages" element={<Pages />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="news" element={<News />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="settings" element={<Settings />} />
          <Route path="languages" element={<TranslationLanguages />} />
          <Route path="research-centers" element={<ResearchCenters />} />
          <Route path="research-facilities" element={<ResearchFacilities />} />
          <Route path="programmes" element={<Programmes />} />
          <Route path="footer-links" element={<FooterLinks />} />
          <Route path="hero-slides" element={<HeroSlides />} />
          <Route path="pre-footer-links" element={<PreFooterLinks />} />
          <Route path="marquee" element={<MarqueeItems />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="life-at-thsti" element={<LifeAtTHSTI />} />
          <Route path="international-collaboration" element={<InternationalCollaboration />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
