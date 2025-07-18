'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const subNavConfig: Record<string, { label: string, href: string }[]> = {
  '/dashboard': [],
  '/machine-types': [
    { label: 'List', href: '/machine-types' },
    { label: 'Add New', href: '/machine-types/add' },
  ],
  '/machines': [
    { label: 'List', href: '/machines' },
    { label: 'Add New', href: '/machines/add' },
    { label: 'History', href: '/machines/history' },
  ],
  '/spare-parts': [
    { label: 'List', href: '/spare-parts' },
  ],
  '/schedule': [
    { label: 'Calendar', href: '/schedule' },
    { label: 'Upcoming', href: '/schedule/upcoming' },
  ],
  '/about': [],
};

export default function SubNavbar() {
  const pathname = usePathname();
  const mainSection = Object.keys(subNavConfig).find(key => pathname.startsWith(key)) || '/dashboard';
  const subNav = subNavConfig[mainSection];

  if (!subNav || subNav.length === 0) return null;

  return (
    <nav className="flex gap-4 border-b pb-2 mb-4">
      {subNav.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-1 rounded ${pathname === item.href ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 