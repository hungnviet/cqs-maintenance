export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';

export default function MaintenanceRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force dynamic rendering
  cookies();
  
  return children;
}
