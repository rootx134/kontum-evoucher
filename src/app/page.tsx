import Image from "next/image";
import Link from "next/link";
import { Gift, Smartphone, Heart } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://fc.kontumplus.com/bg_voucher.jpeg')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/30 rounded-full blur-3xl" />

          {/* Header */}
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 uppercase tracking-wider drop-shadow-sm">
              E-Voucher
            </h1>
            <p className="text-white/90 text-sm font-medium uppercase tracking-widest">
              Tri ân khách hàng
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 gap-4 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-4 hover:bg-white/10 transition-colors cursor-default group">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Nhận quà ưu đãi</h3>
                <p className="text-white/60 text-xs text-left">Hàng ngàn voucher làm đẹp</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-4 hover:bg-white/10 transition-colors cursor-default group">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Sử dụng dễ dàng</h3>
                <p className="text-white/60 text-xs text-left">Quét mã QR tại cửa hàng</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-4 hover:bg-white/10 transition-colors cursor-default group">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Trao gửi yêu thương</h3>
                <p className="text-white/60 text-xs text-left">Tặng voucher cho người thân</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="https://facebook.com/kontumplus.vn" 
              target="_blank"
              className="w-full block text-center py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transform transition-all"
            >
              Theo dõi Fanpage
            </Link>
            
            {/* TODO: Update login link later based on auth structure */}
            <Link 
              href="/admin/login" 
              className="w-full block text-center py-3 px-6 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Đăng nhập Đối tác
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} Cung cấp bởi <span className="text-white/60">Kon Tum +</span>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
