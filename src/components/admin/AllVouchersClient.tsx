"use client";

import { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Undo2, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface VoucherJoined {
  id: number;
  code: string;
  status: string;
  used_at: string | null;
  campaigns: {
    id: number;
    sponsor_name: string;
    sponsor_short: string;
  };
}

export default function AllVouchersClient({ initialData }: { initialData: VoucherJoined[] }) {
  const [data, setData] = useState<VoucherJoined[]>(initialData);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unused', 'used'
  const [campaignFilter, setCampaignFilter] = useState('all'); // 'all', or campaign_id string
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // Extract unique campaigns for the filter dropdown
  const uniqueCampaigns = useMemo(() => {
    const campaignsMap = new Map();
    initialData.forEach(v => {
      // In Join logic: campaigns can be object or array of 1 object due to FK
      const comp = Array.isArray(v.campaigns) ? v.campaigns[0] : v.campaigns;
      if (comp) {
        campaignsMap.set(comp.id, comp.sponsor_name);
      }
    });
    return Array.from(campaignsMap.entries()).map(([id, name]) => ({ id: id.toString(), name }));
  }, [initialData]);

  // Handle nested object structure from Supabase joins
  const getSponsorData = (campaignsObj: any) => {
    return Array.isArray(campaignsObj) ? campaignsObj[0] : campaignsObj;
  };

  // Filter Data
  const filteredData = data.filter((item) => {
    const sponsorObj = getSponsorData(item.campaigns);
    const sponsorShort = sponsorObj?.sponsor_short || '';
    const fullCode = `${sponsorShort}${item.code}`.toLowerCase();
    
    const matchesSearch = fullCode.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCampaign = campaignFilter === 'all' || sponsorObj?.id.toString() === campaignFilter;
    
    return matchesSearch && matchesStatus && matchesCampaign;
  });

  // Pagination
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: number, fullCode: string) => {
    if (!confirm(`Bạn có chắc muốn xoá vĩnh viễn thẻ ${fullCode}?`)) return;

    try {
      setIsProcessing(id);
      const { error } = await supabase.from('vouchers').delete().eq('id', id);
      if (error) throw error;
      
      setData((prev) => prev.filter((v) => v.id !== id));
      alert('Đã xoá thẻ thành công!');
    } catch (err: any) {
      alert('Lỗi xoá thẻ: ' + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUndo = async (id: number) => {
    if (!confirm('Chuyển trạng thái thẻ này về "Chưa Dùng"?')) return;

    try {
      setIsProcessing(id);
      const { error } = await supabase
        .from('vouchers')
        .update({ status: 'unused', used_at: null })
        .eq('id', id);
        
      if (error) throw error;
      
      setData((prev) => prev.map((v) => v.id === id ? { ...v, status: 'unused', used_at: null } : v));
      alert('Hoàn tác thành công!');
    } catch (err: any) {
      alert('Lỗi hoàn tác: ' + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
      {/* Header Filters */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-gray-50/50">
        <div className="relative w-full lg:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo Mã thẻ..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-56">
            <Gift className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select 
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-indigo-500 font-medium outline-none appearance-none cursor-pointer transition-colors text-gray-700"
              value={campaignFilter}
              onChange={(e) => {
                setCampaignFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả Chiến dịch</option>
              {uniqueCampaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-44">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select 
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-indigo-500 font-medium outline-none appearance-none cursor-pointer transition-colors text-gray-700"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unused">Chưa dùng</option>
              <option value="used">Đã dùng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-white text-gray-500 uppercase text-xs border-b border-gray-100 sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">Mã E-Voucher</th>
              <th className="px-6 py-4 font-bold tracking-wider">Chiến dịch</th>
              <th className="px-6 py-4 font-bold tracking-wider">Trạng Thái</th>
              <th className="px-6 py-4 font-bold tracking-wider">Lúc Quét Thẻ</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Quản lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Không tìm thấy mã thẻ nào.</p>
                </td>
              </tr>
            ) : (
              currentItems.map((item) => {
                const sponsorObj = getSponsorData(item.campaigns);
                const sponsorShort = sponsorObj?.sponsor_short || '';
                const sponsorName = sponsorObj?.sponsor_name || 'Không rõ';
                const fullCode = `${sponsorShort}${item.code}`;

                return (
                  <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-gray-900 bg-gray-100/80 group-hover:bg-white inline-block px-2 py-1 rounded transition-colors">
                        <span className="text-gray-400">{sponsorShort}</span>
                        <span className="text-indigo-600">{item.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 line-clamp-1" title={sponsorName}>
                        {sponsorName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'used' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-100/50">
                          Đã Dùng
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                          Chưa Dùng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.used_at 
                        ? <span className="font-medium">{new Date(item.used_at).toLocaleString('vi-VN')}</span>
                        : <span className="opacity-50">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {item.status === 'used' && (
                          <button 
                            onClick={() => handleUndo(item.id)}
                            disabled={isProcessing === item.id}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                            title="Hoàn tác trạng thái"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(item.id, fullCode)}
                          disabled={isProcessing === item.id}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Xoá vĩnh viễn"
                        >
                          {isProcessing === item.id ? (
                            <span className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin flex"></span>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + (currentItems.length > 0 ? 1 : 0)}</span> - <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> trên tổng số <span className="font-bold text-gray-900">{filteredData.length}</span> thẻ
          </div>
          
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-3 text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
