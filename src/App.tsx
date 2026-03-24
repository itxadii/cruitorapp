import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Components & Pages
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { NotFound } from './pages/NotFound';
import FlowPage from './pages/FlowPage';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* PROTECTED ROUTE: Only accessible after login */}
        <Route 
          path="/app" 
          element={
            <Authenticator>
                <FlowPage/>
            </Authenticator>
          } 
        />

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Note: You might want to wrap the whole App in <Authenticator.Provider> 
          if the Navbar needs to know the auth state globally.
      */}
      <Authenticator.Provider>
        <div className="flex min-h-screen flex-col bg-[#B4D3D9]">
          <Navbar />
          <main className="grow">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Authenticator.Provider>
    </BrowserRouter>
  );
}

export default App;