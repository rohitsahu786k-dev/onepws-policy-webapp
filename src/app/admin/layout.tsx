'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FolderTree, FileText, LogOut, Menu, X, User, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/components/ui/components';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'User Approval', icon: Users, path: '/admin/users' },
  { name: 'Categories', icon: FolderTree, path: '/admin/categories' },
  { name: 'Documents', icon: FileText, path: '/admin/documents' },
  { name: 'Settings', icon: SettingsIcon, path: '/admin/settings' },
  { name: 'Profile', icon: User, path: '/admin/profile' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // In a real app, you'd also hit an API to clear the cookie, but for simplicity:
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg md:hidden"
        aria-label="Toggle navigation"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transition-transform md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center px-2 py-6 mb-3">
            <img src="/uploads/onepws-logo.png" alt="OnePWS Logo" className="h-28 w-auto object-contain" />
          </div>

          <nav className="flex-1 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all group',
                    isActive
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(234,45,45,0.2)]'
                      : 'text-muted hover:bg-black hover:text-white'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-muted hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all mt-auto"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 pt-20 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
