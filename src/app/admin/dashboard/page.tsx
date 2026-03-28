import { supabase } from '@/lib/supabase';
import { Gift, Ticket, CheckCircle, Clock, Undo2 } from 'lucide-react';
import Link from 'next/link';
import UndoVoucherButton from '@/components/admin/UndoVoucherButton';

export const dynamic = 'force-dynamic';

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
  const availableVouchers = totalVouchers - totalUsed;

  // Lấy thống kê từng chiến dịch
  const { data: campaignStats } = await supabase
    .from('campaigns')
    .select(`
      id, 
      sponsor_name,
      vouchers(status)
    `)
    .order('created_at', { ascending: false });

  // Tính toán số lượng unused/used cho từng campaign thủ công vì Supabase JS không hỗ trợ group by dễ dàng như SQL
  const parsedCampaignStats = (campaignStats || []).map(campaign => {
    const vouchers = campaign.vouchers || [];
    const total = vouchers.length;
    const used = vouchers.filter((v: any) => v.status === 'used').length;
    const unused = total - used;
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0;
    
    return {
      id: campaign.id,
      sponsor_name: campaign.sponsor_name,
      total,
      used,
      unused,
      percentage
    };
  }).filter(c => c.total > 0); // Chỉ hiển thị chiến dịch có voucher

  // Lấy các vouchers mới được sử dụng gần đây
  const { data: recentVouchers } = await supabase
    .from('vouchers')
    .select(`
      id, 
      code, 
      used_at,
      campaign_id,
      campaigns(sponsor_name, sponsor_short)
    `)
    .eq('status', 'used')
    .not('used_at', 'is', null)
    .order('used_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tổng Quan Hệ Thống</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg shadow-indigo-500/20 text-white flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start">
            <h3 className="text-4xl font-black">{totalCampaigns}</h3>
            <div className="p-3 bg-white/20 rounded-xl">
              <Gift className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-indigo-100 font-medium mt-4">Tổng Chiến Dịch</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-4xl font-black text-gray-800">{totalVouchers}</h3>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Ticket className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-gray-500 font-medium mt-4">Tổng E-Vouchers Phát Hành</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-green-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-4xl font-black text-gray-800">{totalUsed}</h3>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-gray-500 font-medium mt-4">Đã Sử Dụng (Quét thành công)</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-orange-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-4xl font-black text-gray-800">{availableVouchers}</h3>
            <div className="p-3 bg-orange-50 rounded-xl">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-gray-500 font-medium mt-4">Còn Lại (Chưa dùng)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Campaign Stats */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Tiến độ Chiến Dịch
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {parsedCampaignStats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Chưa có dữ liệu chiến dịch.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {parsedCampaignStats.map(campaign => (
                  <div key={campaign.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{campaign.sponsor_name}</h4>
                        <div className="flex gap-4 text-sm mt-1">
                          <span className="text-gray-500">Tổng: <span className="font-bold">{campaign.total}</span></span>
                          <span className="text-green-600">Còn lại: <span className="font-bold">{campaign.unused}</span></span>
                          <span className="text-red-500">Đã dùng: <span className="font-bold">{campaign.used}</span></span>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-48 flex-shrink-0">
                        <div className="flex justify-between text-xs mb-1 font-medium text-gray-500">
                          <span>Sử dụng</span>
                          <span>{campaign.percentage}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              campaign.percentage > 75 ? 'bg-red-500' : campaign.percentage > 50 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.max(campaign.percentage, 2)}%` }} // Tối thiểu 2% để thấy border radius
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Lịch sử Quét thẻ (Gần đây)
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {(!recentVouchers || recentVouchers.length === 0) ? (
              <div className="p-8 text-center text-gray-500">Chưa có voucher nào được quét.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentVouchers.map(voucher => {
                  const sponsorObj = Array.isArray(voucher.campaigns) ? voucher.campaigns[0] : voucher.campaigns;
                  const sponsorShort = sponsorObj?.sponsor_short || '';
                  const sponsorName = sponsorObj?.sponsor_name || 'Chiến dịch không rõ';
                  const fullCode = `${sponsorShort}${voucher.code}`;
                  
                  const usedDateObj = new Date(voucher.used_at);
                  const timeStr = usedDateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  const dateStr = usedDateObj.toLocaleDateString('vi-VN');

                  return (
                    <div key={voucher.id} className="p-4 flex items-center justify-between group hover:bg-gray-50">
                      <div>
                        <div className="font-semibold text-gray-900">{sponsorName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{fullCode}</span>
                          <span className="opacity-50">•</span>
                          <span>{timeStr} {dateStr}</span>
                        </div>
                      </div>
                      
                      {/* Component Undo Button xử lý phía Client */}
                      <UndoVoucherButton voucherId={voucher.id} />
                    </div>
                  );
                })}
              </div>
            )}
            
            {(recentVouchers && recentVouchers.length > 0) && (
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <Link href="/admin/vouchers" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Xem tất cả danh sách →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
