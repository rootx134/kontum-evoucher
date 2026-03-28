"use client";

import { useState } from 'react';
import { Save, AlertCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface CampaignTake {
  id: number;
  sponsor_name: string;
  sponsor_short: string;
  total_unused: number;
  taken_quantity: number;
}

export default function TakeVouchersClient({ initialData }: { initialData: CampaignTake[] }) {
  const router = useRouter();
  const [data, setData] = useState<CampaignTake[]>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const totalTaken = data.reduce((sum, item) => sum + item.taken_quantity, 0);

  const handleQuantityChange = (id: number, value: string) => {
    let num = parseInt(value || '0', 10);
    const campaign = data.find(c => c.id === id);
    if (!campaign) return;
    
    // Giới hạn max là số thẻ chưa dùng
    if (num > campaign.total_unused) num = campaign.total_unused;
    if (num < 0) num = 0;

    setData(prev => prev.map(c => c.id === id ? { ...c, taken_quantity: num } : c));
  };

  const handleSave = async () => {
    if (!confirm('Lưu số liệu chiết xuất thẻ (Take) vào hệ thống? Thông tin cũ sẽ được ghi đè.')) return;

    try {
      setIsSubmitting(true);
      
      // 1. Delete old taken_vouchers to mimic old PHP logic 'DELETE FROM taken_vouchers;'
      // In Supabase, can delete all since we have full rights or RLS is relaxed for admin.
      // But passing an actual condition is safer if RLS requires it. We just delete where ID is NOT NULL.
      // Or simply delete all where campaign_id IN (list of IDs).
      const campaignIds = data.map(c => c.id);
      
      const { error: delErr } = await supabase
        .from('taken_vouchers')
        .delete()
        .in('campaign_id', campaignIds); // Hoặc neq('id', 0) nếu muốn xoá toàn cục

      if (delErr) throw delErr;

      // 2. Insert new ones that have quantity > 0
      const insertData = data
        .filter(c => c.taken_quantity > 0)
        .map(c => ({
          campaign_id: c.id,
          quantity: c.taken_quantity
        }));

      if (insertData.length > 0) {
        const { error: insErr } = await supabase
          .from('taken_vouchers')
          .insert(insertData);
          
        if (insErr) throw insErr;
      }

      alert('Lưu số lượng trích xuất thành công!');
      router.refresh();
      
    } catch (err: any) {
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm(`Bạn có chắc muốn xóa tất cả ${totalTaken} e-voucher đã lấy từ các chiến dịch?`)) return;

    try {
      setIsClearing(true);
      
      const { error } = await supabase
        .from('taken_vouchers')
        .delete()
        .neq('id', 0); // Smart way to delete all rows

      if (error) throw error;

      setData(prev => prev.map(c => ({ ...c, taken_quantity: 0 })));
      alert('Đã clear trạng thái Taken!');
      router.refresh();

    } catch (err: any) {
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cấu hình lấy thẻ E-Voucher</h2>
          <p className="text-sm text-gray-500 mt-1">Hệ thống ghi nhận số thẻ bạn trích xuất đi phân phối. Không ảnh hưởng đến dữ liệu thực của thẻ.</p>
        </div>
        
        <div className="flex bg-orange-50 items-center gap-3 border border-orange-100 px-4 py-2 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-orange-600 uppercase">Tổng thẻ đã lấy</span>
            <span className="text-2xl font-black text-orange-700 leading-none">{totalTaken}</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Không có Chiến dịch nào khả dụng (Còn thẻ Chưa Dùng).
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
            <div className="col-span-5">Tên Chiến Dịch (Prefix)</div>
            <div className="col-span-2 text-center">Đang Cấu Hình Lấy</div>
            <div className="col-span-2 text-center">Khả dụng (Chưa dùng)</div>
            <div className="col-span-3 text-right">Hành động</div>
          </div>

          <div className="space-y-3">
            {data.map(campaign => (
              <div key={campaign.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-200 transition-colors rounded-xl p-4 md:p-2">
                <div className="col-span-1 md:col-span-5 font-semibold text-gray-800 flex items-center justify-between md:justify-start">
                  <span className="md:hidden text-xs text-gray-400 font-medium">Chiến dịch: </span>
                  <div>
                    {campaign.sponsor_name}
                    <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                      {campaign.sponsor_short}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between md:justify-center">
                    <span className="md:hidden text-xs text-gray-400 font-medium">Số lượng lấy: </span>
                    <input 
                      type="number" 
                      min="0" 
                      max={campaign.total_unused}
                      value={campaign.taken_quantity || ''}
                      onChange={(e) => handleQuantityChange(campaign.id, e.target.value)}
                      className="w-24 text-center py-1.5 px-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-gray-700 bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between md:justify-center">
                    <span className="md:hidden text-xs text-gray-400 font-medium">Thẻ có sẵn: </span>
                    <span className="text-gray-500 font-medium">{campaign.total_unused}</span>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 pb-2 md:pb-0 border-b border-gray-200 md:border-0 border-dashed md:text-right">
                  <div className="hidden md:block text-xs text-gray-400">Tự cập nhật khi bấm Lưu Tập Trung</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
            <button 
              onClick={handleClearAll}
              disabled={isClearing || totalTaken === 0}
              className="w-full sm:w-auto px-5 py-2.5 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:bg-transparent"
            >
              {isClearing ? (
                <span className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              Xoá (Reset) Số Liệu
            </button>

            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Save className="w-5 h-5" />
              )}
              Lưu Tập Trung
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
