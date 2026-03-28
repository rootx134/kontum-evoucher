"use client";

import { useState } from 'react';
import { Search, Filter, Trash2, Undo2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Voucher {
  id: number;
  code: string;
  status: string;
  used_at: string | null;
}

export default function VoucherListClient({
  campaignId,
  sponsorShort,
  initialData,
}: {
  campaignId: number;
  sponsorShort: string;
  initialData: Voucher[];
}) {
  const router = useRouter();
  const [data, setData] = useState<Voucher[]>(initialData);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unused', 'used'
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // Lọc dữ liệu
  const filteredData = data.filter((item) => {
    const matchesSearch = item.code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Phân trang đơn giản (Client side - vì dữ liệu campaign thường < 1000 thẻ)
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Bạn có chắc muốn xoá vĩnh viễn thẻ ${sponsorShort}${code}?`)) return;

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Actions */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
        <div className="flex gap-3 w-full md:w-auto">
           <button 
             onClick={() => router.back()}
             className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
           >
             <ArrowLeft className="w-4 h-4" />
             Quay lại
           </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo Mã..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="relative w-full sm:w-40">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select 
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors appearance-none cursor-pointer"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả</option>
              <option value="unused">Chưa dùng</option>
              <option value="used">Đã dùng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/80 text-gray-800 uppercase text-xs border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Mã Đầy Đủ (Prefix + Code)</th>
              <th className="px-6 py-4 font-semibold">Trạng Thái</th>
              <th className="px-6 py-4 font-semibold">Thời gian sử dụng</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy dữ liệu phù hợp.
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">
                    <span className="text-gray-400">{sponsorShort}</span>
                    <span className="text-indigo-600">{item.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'used' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                        Đã Dùng
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-600 border border-green-100">
                        Chưa Dùng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.used_at 
                      ? new Date(item.used_at).toLocaleString('vi-VN') 
                      : '-'}
                  </td>
                  <td className="px-6 py-4 space-x-2 text-right">
                    {item.status === 'used' && (
                      <button 
                        onClick={() => handleUndo(item.id)}
                        disabled={isProcessing === item.id}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        title="Hoàn tác (Đổi thành chưa dùng)"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(item.id, item.code)}
                      disabled={isProcessing === item.id}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                      title="Xoá vĩnh viễn"
                    >
                      {isProcessing === item.id ? (
                        <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <span className="text-sm text-gray-500">
            Đang hiển thị <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> trong tổng số <span className="font-semibold text-gray-900">{filteredData.length}</span> thẻ
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 bg-white"
            >
              Trước
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 bg-white"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
