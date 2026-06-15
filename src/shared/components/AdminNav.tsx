'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/admin-auth/hooks/useLogout';

export function AdminNav() {
  const { logout, loading } = useLogout();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `text-sm font-medium px-3 py-1 rounded hover:bg-gray-100 ${
      pathname.startsWith(href) ? 'text-blue-600' : 'text-gray-700'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900 mr-4">Admin</span>
        <Link href="/dashboard" className={linkClass('/dashboard')}>
          Dashboard
        </Link>
        <Link href="/products" className={linkClass('/products')}>
          Products
        </Link>
        <Link href="/orders" className={linkClass('/orders')}>
          Orders
        </Link>
        <Link href="/categories" className={linkClass('/categories')}>
          Categories
        </Link>
        <Link href="/suggestions" className={linkClass('/suggestions')}>
          Suggestions
        </Link>
      </div>
      <button
        onClick={logout}
        disabled={loading}
        className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </nav>
  );
}
