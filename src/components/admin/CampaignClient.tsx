"use client";

import { useState } from 'react';
import { Gift, Search, Plus, Trash2, Edit, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CampaignClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const router = useRouter();

  const filteredData = initialData.filter(item => 
    item.sponsor_name.toLowerCase().includes(search.toLowerCase()) ||
    item.sponsor_short.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chiến dịch "${name}" không? Toàn bộ Vouchers của chiến dịch này cũng sẽ BỊ XÓA VĨNH VIỄN theo Ràng Buộc Cơ Sở Dữ Liệu.`)) {
      return;
    }

    try {
      setIsDeleting(id);
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      
      if (error) throw error;
      alert('Xoá thành công chiến dịch và voucher!');
      router.refresh();
    } catch (err: any) {
      alert('Lỗi xoá: ' + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm Chiến dịch hoặc Mã viết tắt..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link 
          href="/admin/campaigns/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo Chiến Dịch
        </Link>
      </div>

      {/* Grid of Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
            Không tìm thấy chiến dịch nào phú hợp với từ khoá.
          </div>
        ) : (
          filteredData.map((campaign) => {
            const startDate = new Date(campaign.start_date).toLocaleDateString('vi-VN');
            const endDate = new Date(campaign.end_date).toLocaleDateString('vi-VN');
            
            return (
              <div key={campaign.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                      <Gift className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      ID: {campaign.id}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2" title={campaign.sponsor_name}>
                    {campaign.sponsor_name}
                  </h3>
                  <div className="text-sm font-semibold text-indigo-600 mb-4 bg-indigo-50 inline-block px-2 py-1 rounded">
                    Prefix: {campaign.sponsor_short}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-900 w-20">Bắt đầu:</span> 
                      <span>{startDate}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-900 w-20">Kết thúc:</span> 
                      <span>{endDate}</span>
                    </div>
                    <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg mt-4 border border-gray-100">
                      <Ticket className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="font-medium">
                        <span className="text-indigo-600 font-bold">{campaign.total_vouchers}</span> thẻ tổng
                      </span>
                      <span className="mx-2 opacity-30">|</span>
                      <span className="text-red-500 font-medium">Đã dùng {campaign.used_vouchers}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2">
                  <Link 
                    href={`/admin/campaigns/${campaign.id}/vouchers`}
                    className="flex-1 inline-flex justify-center items-center py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 hover:text-indigo-600 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Xem thẻ
                  </Link>
                  <Link 
                    href={`/admin/campaigns/${campaign.id}/edit`}
                    className="inline-flex justify-center items-center p-2 bg-white border border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 text-gray-600 rounded-lg transition-colors"
                    title="Chỉnh sửa Chiếc Dịch"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(campaign.id, campaign.sponsor_name)}
                    disabled={isDeleting === campaign.id}
                    className="inline-flex justify-center items-center p-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 rounded-lg transition-colors disabled:opacity-50"
                    title="Xoá vĩnh viễn"
                  >
                    {isDeleting === campaign.id ? (
                      <span className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
