'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ListOrdered, Settings, Tag, Menu, X, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const nav = [
    { href: "/admin/orders", icon: ListOrdered, label: "Đơn hàng" },
    { href: "/admin/nfc", icon: Tag, label: "Kho NFC" },
    { href: "/admin/products", icon: Package, label: "Sản phẩm" },
  ];

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden relative">
      {/* Background Blobs (Optional, for consistency) */}
      <div className="blob animate-pulse-glow" style={{ top: -120, left: -100, width: 420, height: 420, background: "var(--color-primary)", opacity: 0.15 }} />
      <div className="blob animate-pulse-glow" style={{ top: "40%", right: -140, width: 500, height: 500, background: "var(--color-secondary)", animationDelay: "1s", opacity: 0.15 }} />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`absolute md:relative z-50 w-64 h-full bg-card/85 backdrop-blur-md border-r border-border flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
          <h1 className="text-lg font-extrabold font-display gradient-text flex items-center gap-2">
            <img src="/image/logoweb.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-border shadow-sm object-cover" />
            Admin Panel
          </h1>
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {nav.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm border border-primary/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border shrink-0">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>Về trang khách</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="md:hidden h-16 border-b border-border bg-card/85 backdrop-blur-md flex items-center px-4 shrink-0 z-30 shadow-sm relative">
          <button className="p-2 text-muted-foreground hover:text-foreground bg-muted/50 rounded-lg active:scale-95 transition-transform" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-extrabold font-display gradient-text">Admin Panel</span>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
