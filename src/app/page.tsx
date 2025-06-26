"use client";
import Link from "next/link";
import { useLanguage } from './LanguageProvider';

export default function Home() {
  const { language } = useLanguage();

  const links = [
    { href: '/routes', label: language === 'gu' ? 'રૂટ્સ મેનેજ કરો' : 'Manage Routes' },
    { href: '/vendors', label: language === 'gu' ? 'વિક્રેતાઓ મેનેજ કરો' : 'Manage Vendors' },
    { href: '/items', label: language === 'gu' ? 'વસ્તુઓ મેનેજ કરો' : 'Manage Items' },
    { href: '/billing', label: language === 'gu' ? 'બિલિંગ' : 'Billing' },
    { href: '/summary', label: language === 'gu' ? 'સારાંશ' : 'Summary' },
    { href: '/import', label: language === 'gu' ? 'આયાત' : 'Import' },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <main>
        <h1>{language === 'gu' ? 'રૂટ અને વિક્રેતા મેનેજમેન્ટ સિસ્ટમ' : 'Route & Vendor Management System'}</h1>
        <nav style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
          {links.map(link => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
