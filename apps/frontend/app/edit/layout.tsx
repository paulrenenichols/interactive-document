'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getToken } from '@/lib/auth';

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      const returnUrl = encodeURIComponent(pathname ?? '/edit');
      window.location.href = `/login?returnUrl=${returnUrl}`;
    }
  }, [pathname]);

  return <>{children}</>;
}
