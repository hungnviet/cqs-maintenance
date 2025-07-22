import { cookies } from 'next/headers';

export default async function SparePartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force dynamic by accessing server-side cookies
  await cookies();
  
  return children;
}
