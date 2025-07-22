import './globals.css';
import MainNavbar from '@/components/MainNavbar';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'Robot Maintenance System',
  description: 'Manage machines, spare parts, and maintenance schedules',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <MainNavbar />
        <main className="ml-64 min-h-screen overflow-auto">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
