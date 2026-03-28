import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then(() => setIsAuthed(true))
      .catch(() => setIsAuthed(false));
  }, []);

  const handleSignOut = async () => {
    await amplifySignOut();
    setIsAuthed(false);
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="fixed w-full top-6 z-50 px-4 flex justify-center">
      <nav className={`w-full max-w-5xl backdrop-blur-2xl border border-slate-500 shadow-[0_8px_32px_0_rgba(155,142,199,0.15)] transition-all duration-300 bg-white/20 ${isOpen ? 'rounded-3xl' : 'rounded-full'}`}>
        <div className="px-6 py-2">
          <div className="flex justify-between items-center h-12">

            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden relative z-10">
                <img src="/cruitor.png" alt="Cruitor Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black text-[#4A4458] tracking-tight font-['Merriweather']">
                Cruitor<span className="text-[#9B8EC7]">.com</span>
              </span>
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-8 text-slate-700 font-['Lato']">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="text-sm font-bold text-[#4A4458]/70 hover:text-[#9B8EC7] transition-colors">
                  {link.name}
                </Link>
              ))}
              <div className="h-6 w-px bg-[#BDA6CE]/30 mx-2" />
              {isAuthed ? (
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/app')} className="cursor-pointer text-sm font-bold text-[#9B8EC7] hover:text-[#BDA6CE]">Dashboard</button>
                  <button onClick={handleSignOut} className="cursor-pointer bg-[#4A4458] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#9B8EC7] transition-all shadow-md">Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/login')} className="cursor-pointer text-sm font-bold text-[#4A4458] hover:text-[#9B8EC7]">Log in</button>
                  <button onClick={() => navigate('/signup')} className="cursor-pointer bg-[#8864ff] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1050ff] transition-all shadow-md">Get Started</button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-[#4A4458] hover:text-[#9B8EC7]">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isOpen && (
            <div className="md:hidden pt-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-4 text-slate-700">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="block px-4 py-3 text-base font-bold text-[#4A4458] hover:bg-[#BDA6CE]/10 rounded-xl transition-colors">
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-[#BDA6CE]/20 flex flex-col gap-3">
                {isAuthed ? (
                  <>
                    <button onClick={() => { navigate('/app'); setIsOpen(false); }} className="w-full bg-[#9B8EC7] text-white py-4 rounded-2xl font-bold text-center">
                      Dashboard
                    </button>
                    <button onClick={handleSignOut} className="w-full bg-[#4A4458] text-white py-4 rounded-2xl font-bold text-center">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { navigate('/login'); setIsOpen(false); }} className="w-full border border-[#9B8EC7] text-[#4A4458] py-4 rounded-2xl font-bold text-center">
                      Log in
                    </button>
                    <button onClick={() => { navigate('/signup'); setIsOpen(false); }} className="w-full bg-[#6e41ff] text-white py-4 rounded-2xl font-bold text-center">
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;