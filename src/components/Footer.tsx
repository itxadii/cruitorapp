import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react'; // Removed the broken brand imports

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#000000] text-gray-300 py-16 px-6 border-t border-white/10 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        
        {/* Column 1: Brand & Mission */}
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-6 group inline-flex">
            <div className="w-10 h-10 bg-[#8e3afc] rounded-xl flex items-center justify-center group-hover:bg-[#7a2edb] transition-colors shadow-lg shadow-[#8e3afc]/20">
              <Rocket size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight font-['Merriweather']">
              Cruitor<span className="text-[#8e3afc]">.com</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-8 font-['Lato']">
            Automating the outreach process for modern job seekers. Find verified HR contacts and send your resume in seconds using your own Gmail.
          </p>
          
          {/* Social Media Icons (Using the custom SVGs from the bottom of the file) */}
          <div className="flex gap-4">
            <SocialLink href="#" icon={<TwitterIcon size={18} />} />
            <SocialLink href="#" icon={<LinkedinIcon size={18} />} />
            <SocialLink href="#" icon={<GithubIcon size={18} />} />
          </div>
        </div>

        {/* Column 2: Product Links */}
        <div>
          <h4 className="text-white font-bold mb-6 font-['Montserrat'] tracking-wide uppercase text-sm">Product</h4>
          <ul className="space-y-4 text-sm font-['Lato']">
            <li><FooterLink to="/signup">Get Started</FooterLink></li>
            <li><FooterLink to="/about">How it works</FooterLink></li>
            <li><FooterLink to="/pricing">Pricing</FooterLink></li>
          </ul>
        </div>

        {/* Column 3: Company & Legal Links */}
        <div>
          <h4 className="text-white font-bold mb-6 font-['Montserrat'] tracking-wide uppercase text-sm">Company</h4>
          <ul className="space-y-4 text-sm font-['Lato']">
            <li><FooterLink to="/about">About Us</FooterLink></li>
            <li><FooterLink to="/contact">Contact</FooterLink></li>
            <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-gray-500 font-['Lato']">
          © {currentYear} Cruitor. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// Helper component for clean text links
function FooterLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <Link to={to} className="text-gray-400 hover:text-[#8e3afc] hover:translate-x-1 inline-block transition-all duration-200">
      {children}
    </Link>
  );
}

// Helper component for the round social buttons
function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#8e3afc] hover:text-white hover:border-[#8e3afc] hover:-translate-y-1 transition-all duration-300 shadow-sm"
    >
      {icon}
    </a>
  );
}

// --- Custom Brand SVG Icons (Replacing Lucide's removed brand icons) ---

function TwitterIcon({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  );
}

function LinkedinIcon({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect width="4" height="12" x="2" y="9"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  );
}

function GithubIcon({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
      <path d="M9 18c-4.51 2-5-2-7-2"></path>
    </svg>
  );
}