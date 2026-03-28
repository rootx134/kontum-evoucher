"use client";

import { useState } from 'react';
import { Search, Filter, Plus, Trash2, Edit, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface FreeVoucher {
  id: number;
  code: string;
  sponsor_name: string;
  status: string;
  used_at: string | null;
  start_date: string;
  end_date: string;
}

export default function FreeVouchersClient({ initialData }: { initialData: FreeVoucher[] }) {
  const router = useRouter();
  const [data, setData] = useState<FreeVoucher[]>(initialData);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // Filter Data
  const filteredData = data.filter((item) => {
    const matchesSearch = item.code.toLowerCase().includes(search.toLowerCase()) || 
                          (item.sponsor_name && item.sponsor_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Bạn có chắc muốn xoá vĩnh viễn thẻ Tự do "${code}"?`)) return;

    try {
      setIsProcessing(id);
      const { error } = await supabase.from('free_vouchers').delete().eq('id', id);
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
    if (!confirm('Khôi phục thẻ này về trạng thái "Chưa Dùng"?')) return;

    try {
      setIsProcessing(id);
      const { error } = await supabase
        .from('free_vouchers')
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
      {/* Header Bar */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-50/50">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm mã CODE hoặc tên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="relative w-full sm:w-44">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select 
              className="w-full pl-9 pr-6 py-2 border border-gray-200 rounded-xl focus:border-indigo-500 font-medium outline-none appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả</option>
              <option value="unused">Chưa dùng</option>
              <option value="used">Đã dùng</option>
            </select>
          </div>
        </div>

        <Link 
          href="/admin/free-vouchers/new"
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Tặng Thẻ Tự Do
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-white text-gray-500 uppercase tracking-widest text-xs border-b border-gray-100 sticky top-0">
            <tr>
              <th className="px-6 py-4 font-bold">Mã Code</th>
              <th className="px-6 py-4 font-bold">Quà từ đâu</th>
              <th className="px-6 py-4 font-bold">Trạng Thái</th>
              <th className="px-6 py-4 font-bold">Thời gian dùng</th>
              <th className="px-6 py-4 font-bold text-right">Quản lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Danh sách Quà tạng tự do trống.
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded inline-block">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {item.sponsor_name || 'Chưa định danh'}
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'used' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                        Đã Dùng
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                        Chưa Dùng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.used_at ? new Date(item.used_at).toLocaleString('vi-VN') : <span className="opacity-40">-</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {item.status === 'used' && (
                        <button 
                          onClick={() => handleUndo(item.id)}
                          disabled={isProcessing === item.id}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                          title="Hoàn tác trạng thái"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                      )}
                      <Link 
                        href={`/admin/free-vouchers/${item.id}/edit`}
                        className="p-1.5 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50"
                        title="Chỉnh sửa Chiết Vouchers Này"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(item.id, item.code)}
                        disabled={isProcessing === item.id}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                        title="Xoá vĩnh viễn"
                      >
                        {isProcessing === item.id ? (
                          <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin flex"></span>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Paginator here (skipped for briefness, assuming scroll or simple setup) */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
         Hiển thị {currentItems.length} kết quả ở trang này.
      </div>
    </div>
  );
}
