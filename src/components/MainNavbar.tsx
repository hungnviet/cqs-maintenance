'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Building2, Wrench, Cog, Package, Calendar, Info, ClipboardList } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Building2 },
  { label: 'Machine Types', href: '/machine-types', icon: Cog },
  { label: 'Machines', href: '/machines', icon: Wrench },
  { label: 'Spare Parts', href: '/spare-parts', icon: Package },
  { label: 'Schedule', href: '/schedule', icon: Calendar },
  { label: 'Maintenance Requests', href: '/maintenance-requests', icon: ClipboardList },
  { label: 'About Us', href: '/about', icon: Info },
];

export default function MainNavbar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-60 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col fixed h-full shadow-xl border-r border-gray-700">
      {/* Header */}
      <div className="p-4 h-24 border-b border-gray-700 flex items-center justify-center">
        <div className="w-full h-full relative">
          <Image 
            src="/cqs_logo.png" 
            alt="CQS Logo" 
            fill
            className="object-contain"
          />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-400">@by Robotnext</p>
          <div className="w-full h-8 relative">
            <Image 
              src="/robotnext-logo.jpg" 
              alt="Robotnext Logo" 
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </aside>
  );
} 