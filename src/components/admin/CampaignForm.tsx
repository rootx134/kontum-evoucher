"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Shuffle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CampaignFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function CampaignForm({ initialData = {}, isEdit = false }: CampaignFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sponsor_name: initialData.sponsor_name || '',
    sponsor_short: initialData.sponsor_short || '',
    start_date: initialData.start_date || new Date().toISOString().split('T')[0], // yyyy-mm-dd format
    end_date: initialData.end_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // +30 days
    description: initialData.description || 'TẶNG 1 LY NƯỚC',
    guide_content: initialData.guide_content || 'Đưa mã quà tặng cho thu ngân để được giảm giá\nMỗi mã chỉ áp dụng cho 1 hóa đơn',
    menu_content: initialData.menu_content || 'Menu cửa hàng',
    logo: initialData.logo || '',
  });

  const [codes, setCodes] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateRandomCodes = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generated = [];
    for (let i = 0; i < 25; i++) {
        let code = '';
        for (let j = 0; j < 5; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        generated.push(code);
    }
    setCodes(generated.join('\n'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!isEdit && !codes.trim()) {
        throw new Error('Vui lòng nhập ít nhất 1 mã Voucher (hoặc Sinh tự động) để tạo Chiến dịch!');
      }

      // 1. Lưu Campaign
      let campaignId = isEdit ? initialData.id : null;

      if (isEdit) {
        const { error: updateErr } = await supabase
          .from('campaigns')
          .update(formData)
          .eq('id', campaignId);
        if (updateErr) throw updateErr;
      } else {
        const { data: newCampaign, error: insertErr } = await supabase
          .from('campaigns')
          .insert([formData])
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        campaignId = newCampaign.id;
      }

      // 2. Nếu có nhập Codes thì lưu Vouchers (Chỉ áp dụng tốt nhất khi Thêm Mới, hoặc Edit muốn thêm thẻ)
      if (codes.trim() && campaignId) {
        const codeArray = codes.split('\n')
          .map(c => c.trim().toUpperCase())
          .filter(c => c.length > 0)
          // Loại bỏ phần prefix nếu user lỡ nhập (Ví dụ: TheDe3M4G2 -> 3M4G2)
          .map(c => c.startsWith(formData.sponsor_short.toUpperCase()) 
            ? c.substring(formData.sponsor_short.length) 
            : c);

        // Chuẩn bị batch insert
        const vouchersToInsert = codeArray.map(code => ({
          campaign_id: campaignId,
          code: code,
          status: 'unused'
        }));

        // Insert vào bảng vouchers
        if (vouchersToInsert.length > 0) {
          const { error: voucherErr } = await supabase
            .from('vouchers')
            .insert(vouchersToInsert);
          
          if (voucherErr) {
             console.error("Lỗi insert code:", voucherErr);
             throw new Error("Lỗi khi tạo mã: " + voucherErr.message + ". Các mã có thể bị trùng lặp.");
          }
        }
      }

      alert(isEdit ? 'Cập nhật thành công!' : 'Đã tạo Chiến Dịch và Mã Voucher thành công!');
      router.push('/admin/campaigns');
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
          <label className="text-sm font-bold text-gray-700">Tên Đối Tác / Chiến Dịch <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="sponsor_name" 
            value={formData.sponsor_name} 
            onChange={handleChange}
            required
            placeholder="VD: Trà Sữa CoCo"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-colors" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Mã Prefix (5 ký tự đầu) <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="sponsor_short" 
            value={formData.sponsor_short} 
            onChange={handleChange}
            required
            maxLength={10}
            placeholder="VD: COCO"
            className="w-full p-3 uppercase font-mono bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-colors" 
          />
          <p className="text-xs text-gray-500">Người dùng sẽ nhập mã COCO + 5 ký tự ngẫu nhiên.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Ngày Bắt Đầu <span className="text-red-500">*</span></label>
          <input 
            type="date" 
            name="start_date" 
            value={formData.start_date} 
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-colors" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Ngày Kết Thúc <span className="text-red-500">*</span></label>
          <input 
            type="date" 
            name="end_date" 
            value={formData.end_date} 
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-colors" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Logo (Đường dẫn File ảnh hoặc Base64)</label>
          <input 
            type="text" 
            name="logo" 
            value={formData.logo} 
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-colors" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Nội dung quà tặng (Banner)</label>
          <input 
            type="text" 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            placeholder="TẶNG 1 LY NƯỚC"
            className="w-full p-3 font-bold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-colors" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Hướng Dẫn Điều Khoản (Hỗ trợ HTML)</label>
          <textarea 
            name="guide_content" 
            rows={3}
            value={formData.guide_content} 
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-colors" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Menu Cửa Hàng (Hỗ trợ HTML)</label>
          <textarea 
            name="menu_content" 
            rows={3}
            value={formData.menu_content} 
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-colors" 
          />
        </div>

        {/* Voucher Codes Section */}
        <div className="space-y-2 md:col-span-2 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-gray-700">
              {isEdit ? 'Thêm mới Mã Code (Tuỳ chọn)' : 'Danh sách Mã Code'} 
              {!isEdit && <span className="text-red-500"> *</span>}
            </label>
            <button 
              type="button" 
              onClick={generateRandomCodes}
              className="text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Shuffle className="w-3 h-3" />
              Sinh Tự Động 25 Mã
            </button>
          </div>
          <textarea 
            value={codes} 
            onChange={(e) => setCodes(e.target.value)}
            rows={5}
            placeholder="Dán mã code vào đây, mỗi mã 1 dòng. Ví dụ:\nCODE1\nCODE2"
            className="w-full p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-colors"
          />
          <p className="text-xs text-gray-500">Lưu ý: Bạn không cần nhập phần Prefix. Hệ thống sẽ tự động thêm Prefix ({formData.sponsor_short}) vào các mã khi người dùng quét.</p>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
        >
          Hủy Bỏ
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isEdit ? 'Lưu Thay Đổi' : 'Tạo Chiến Dịch'}
        </button>
      </div>
    </form>
  );
}
