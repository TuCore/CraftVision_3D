import Link from 'next/link';
import { Package, ListOrdered, Settings, Tag } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <ListOrdered className="w-5 h-5" />
            <span>Đơn hàng</span>
          </Link>
          <Link href="/admin/nfc" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <Tag className="w-5 h-5" />
            <span>Kho NFC</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <Package className="w-5 h-5" />
            <span>Sản phẩm</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <Settings className="w-5 h-5" />
            <span>Về trang khách</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
