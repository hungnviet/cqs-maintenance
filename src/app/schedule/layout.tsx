import { cookies } from 'next/headers';

export default async function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force dynamic by accessing server-side cookies
  await cookies();
  
  return children;
}
