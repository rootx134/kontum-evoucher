import { supabase } from '@/lib/supabase';
import { Gift, Ticket, Users, CheckCircle } from 'lucide-react';

export default async function AdminDashboard() {
  // Lấy thống kê cơ bản từ Database
  const [campaignsRes, vouchersRes, usedVouchersRes] = await Promise.all([
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
    supabase.from('vouchers').select('id', { count: 'exact', head: true }),
    supabase.from('vouchers').select('id', { count: 'exact', head: true }).eq('status', 'used')
  ]);

  const totalCampaigns = campaignsRes.count || 0;
  const totalVouchers = vouchersRes.count || 0;
  const totalUsed = usedVouchersRes.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan Hệ thống</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Chiến dịch</p>
            <h3 className="text-2xl font-black text-gray-800">{totalCampaigns}</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng Voucher</p>
            <h3 className="text-2xl font-black text-gray-800">{totalVouchers}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-green-500">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Đã sử dụng</p>
            <h3 className="text-2xl font-black text-gray-800">{totalUsed}</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-purple-500">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tỷ lệ đổi (Chưa tính)</p>
            <h3 className="text-2xl font-black text-gray-800">
              {totalVouchers > 0 ? Math.round((totalUsed / totalVouchers) * 100) : 0}%
            </h3>
          </div>
        </div>
      </div>

      {/* Ghi chú hệ thống */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Chào mừng đến với Admin Dashboard!</h2>
        <p className="text-gray-600">
          Cơ sở dữ liệu đã kết nối thành công với Supabase. Bạn có thể xem các thông số chi tiết ở góc trên. Tính năng tạo Campaigns và quản lý chi tiết Vouchers sẽ được mở rộng qua các module cài đặt riêng.
        </p>
      </div>
    </div>
  );
}
