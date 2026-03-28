import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 bg-gray-900">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50" style={{ backgroundImage: "url('https://fc.kontumplus.com/bg_voucher.jpeg')" }} />
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-sm mx-auto text-center space-y-6 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 uppercase tracking-wider">
          Lỗi 404
        </h1>
        <p className="text-white/80 font-medium text-lg">
          E-Voucher không tồn tại hoặc đã bị xóa.
        </p>
        <p className="text-white/60 text-sm mb-8">
          Vui lòng kiểm tra lại liên kết hoặc mã quét QR của bạn.
        </p>

        <Link 
          href="/" 
          className="inline-block w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 px-8 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-blue-500/30"
        >
          Trở Về Trang Chủ
        </Link>
      </div>
    </main>
  );
}
