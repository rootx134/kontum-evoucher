"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FreeVoucherFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function FreeVoucherForm({ initialData = {}, isEdit = false }: FreeVoucherFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: initialData.code || '',
    sponsor_name: initialData.sponsor_name || '',
    start_date: initialData.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData.end_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    description: initialData.description || 'TẶNG 1 LY NƯỚC',
    guide_content: initialData.guide_content || 'Đưa mã quà tặng cho thu ngân để được giảm giá',
    menu_content: initialData.menu_content || 'Menu cửa hàng',
    logo: initialData.logo || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'FREE';
    for (let j = 0; j < 6; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.code.trim()) {
        throw new Error('Mã Code không được để trống!');
      }

      if (isEdit) {
        const { error: updateErr } = await supabase
          .from('free_vouchers')
          .update(formData)
          .eq('id', initialData.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('free_vouchers')
          .insert([{ ...formData, status: 'unused' }]);
        if (insertErr) {
          if (insertErr.code === '23505') throw new Error('Mã Code này đã tồn tại trong hệ thống!');
          throw insertErr;
        }
      }

      alert(isEdit ? 'Cập nhật thành công!' : 'Tạo Quà Tặng Tự Do thành công!');
      router.push('/admin/free-vouchers');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Mã Quà Tặng Độc Lập (Code) <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <input 
              type="text" 
              name="code" 
              value={formData.code} 
              onChange={handleChange}
              required
              disabled={isEdit}
              placeholder="Nhập mã hoặc sinh tự động..."
              className="w-full p-3 font-mono text-indigo-700 font-bold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none uppercase disabled:opacity-60" 
            />
            {!isEdit && (
              <button 
                type="button" 
                onClick={generateCode}
                className="px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors shrink-0 flex items-center justify-center"
                title="Sinh tự động"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
          {isEdit && <p className="text-xs text-orange-500 font-medium">Không thể sửa Mã Code sau khi đã tạo.</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Tên Đối Tác / Tên Chiến Dịch Nhỏ</label>
          <input 
            type="text" 
            name="sponsor_name" 
            value={formData.sponsor_name} 
            onChange={handleChange}
            placeholder="VD: KonTum Plus Giveaway"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Ngày Bắt Đầu</label>
          <input 
            type="date" 
            name="start_date" 
            value={formData.start_date} 
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Ngày Kết Thúc</label>
          <input 
            type="date" 
            name="end_date" 
            value={formData.end_date} 
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Chữ Khuyến Mãi (Banner chữ to)</label>
          <input 
            type="text" 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            placeholder="MUA 1 TẶNG 1"
            className="w-full p-3 font-bold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Logo Đối tác (Base64/Link URL)</label>
          <input 
            type="text" 
            name="logo" 
            value={formData.logo} 
            onChange={handleChange}
            placeholder="https://example.com/logo.jpg"
            className="w-full p-3 text-sm font-mono bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-gray-500" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Hướng Dẫn Điều Khoản (Hỗ trợ HTML)</label>
          <textarea 
            name="guide_content" 
            rows={3}
            value={formData.guide_content} 
            onChange={handleChange}
            className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Menu Cửa Hàng (Hỗ trợ HTML)</label>
          <textarea 
            name="menu_content" 
            rows={3}
            value={formData.menu_content} 
            onChange={handleChange}
            className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none" 
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-6 py-2.5 font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
        >
          Hủy Bỏ
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-70"
        >
          {isSubmitting ? (
             <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isEdit ? 'Lưu Thay Đổi' : 'Tạo Quà Tặng Mới'}
        </button>
      </div>
    </form>
  );
}
