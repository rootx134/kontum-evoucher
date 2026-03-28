"use client";

import { BarChart3, LogOut, Ticket, Gift, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', icon: BarChart3, label: 'Tổng quan' },
    { href: '/admin/campaigns', icon: Gift, label: 'Chiến dịch (Campaigns)' },
    { href: '/admin/vouchers', icon: Ticket, label: 'Mã E-Voucher' },
    { href: '/admin/take', icon: Sparkles, label: 'Nhận thẻ (Take)' },
    { href: '/admin/free-vouchers', icon: Send, label: 'Tặng tự do (Give)' },
  ];

  return (
    <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
          E-VOUCHER
        </h2>
        <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="flex w-full items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-bold">
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
