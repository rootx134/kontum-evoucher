import { BarChart3, Settings, LogOut, Ticket, Gift } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
            E-VOUCHER
          </h2>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/admin/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span>Tổng quan</span>
          </Link>
          <Link href="/admin/campaigns" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-medium">
            <Gift className="w-5 h-5" />
            <span>Chiến dịch Quà Tặng</span>
          </Link>
          <Link href="/admin/vouchers" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-medium">
            <Ticket className="w-5 h-5" />
            <span>Mã Voucher</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-medium">
            <Settings className="w-5 h-5" />
            <span>Cài đặt</span>
          </Link>
        </nav>

        <div className="p-4 mt-auto">
          {/* Form logout since no API needed for simply deleting cookie */}
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex w-full items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-bold">
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
