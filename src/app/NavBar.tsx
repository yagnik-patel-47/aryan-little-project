"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NavBar({ language, setLanguage }: { language?: string, setLanguage?: (lang: string) => void }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState(language || (typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en'));

  useEffect(() => {
    if (setLanguage) setLanguage(lang);
    if (typeof window !== 'undefined') localStorage.setItem('lang', lang);
  }, [lang, setLanguage]);

  const navItems = [
    { href: '/', label: lang === 'gu' ? 'હોમ' : 'Home' },
    { href: '/billing', label: lang === 'gu' ? 'બિલિંગ' : 'Billing' },
    { href: '/items', label: lang === 'gu' ? 'વસ્તુઓ' : 'Items' },
    { href: '/vendors', label: lang === 'gu' ? 'વિક્રેતાઓ' : 'Vendors' },
    { href: '/routes', label: lang === 'gu' ? 'રૂટ્સ' : 'Routes' },
    { href: '/summary', label: lang === 'gu' ? 'સારાંશ' : 'Summary' },
    { href: '/import', label: lang === 'gu' ? 'આયાત' : 'Import' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link href="/" className="brand-link">
            Jaiswal Sales
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ marginRight: 12, padding: '4px 8px', borderRadius: 4 }} title="Select language">
            <option value="en">English</option>
            <option value="gu">ગુજરાતી</option>
          </select>
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
        {/* Navigation links */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 60px;
        }

        .navbar-brand {
          flex-shrink: 0;
        }

        .brand-link {
          color: white;
          text-decoration: none;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          transition: opacity 0.2s ease;
        }

        .brand-link:hover {
          opacity: 0.8;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          position: relative;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .nav-link.active {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          font-weight: 600;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: white;
          border-radius: 1px;
        }

        .mobile-menu-button {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s ease;
        }

        .mobile-menu-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .hamburger-line {
          width: 24px;
          height: 2px;
          background: white;
          margin: 2px 0;
          transition: all 0.3s ease;
          border-radius: 1px;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: flex;
          }

          .navbar-links {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            flex-direction: column;
            padding: 1rem;
            gap: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .navbar-links.mobile-menu-open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-link {
            width: 100%;
            text-align: center;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
          }

          .nav-link:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: none;
          }

          .nav-link.active {
            background: rgba(255, 255, 255, 0.25);
          }

          .nav-link.active::after {
            display: none;
          }

          /* Hamburger animation */
          .mobile-menu-button[aria-expanded="true"] .hamburger-line:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
          }

          .mobile-menu-button[aria-expanded="true"] .hamburger-line:nth-child(2) {
            opacity: 0;
          }

          .mobile-menu-button[aria-expanded="true"] .hamburger-line:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
          }
        }

        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .navbar-container {
            padding: 0 1.5rem;
          }

          .navbar-links {
            gap: 1rem;
          }

          .nav-link {
            padding: 0.5rem 0.5rem;
            font-size: 0.9rem;
          }
        }

        /* Large screen styles */
        @media (min-width: 1025px) {
          .navbar-container {
            padding: 0 2rem;
          }

          .navbar-links {
            gap: 2rem;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .navbar {
            background: #2d3748;
            border-bottom: 2px solid #4a5568;
          }

          .nav-link {
            color: #e2e8f0;
          }

          .nav-link:hover {
            background: #4a5568;
          }

          .nav-link.active {
            background: #718096;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .nav-link,
          .nav-link:hover,
          .navbar-links,
          .hamburger-line {
            transition: none;
          }
        }

        /* Print styles */
        @media print {
          .navbar {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
} 