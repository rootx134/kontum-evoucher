"use client";

import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function UndoVoucherButton({ voucherId }: { voucherId: number }) {
  const [isUndoing, setIsUndoing] = useState(false);
  const router = useRouter();

  const handleUndo = async () => {
    if (!confirm('Bạn có chắc chắn muốn HOÀN TÁC thẻ này về trạng thái Chưa Dùng không?')) return;
    
    try {
      setIsUndoing(true);
      
      const { error } = await supabase
        .from('vouchers')
        .update({ 
          status: 'unused', 
          used_at: null 
        })
        .eq('id', voucherId);
        
      if (error) throw error;
      
      alert('Hoàn tác thành công! Thẻ đã trở về trạng thái Chưa Sử Dụng.');
      router.refresh(); // Tự động load lại danh sách mới
    } catch (err: any) {
      alert('Lỗi hoàn tác: ' + err.message);
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <button 
      onClick={handleUndo} 
      disabled={isUndoing}
      className="p-2 ml-4 flex-shrink-0 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 hover:shadow-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
      title="Khôi phục trạng thái Chưa Dùng"
    >
      <Undo2 className={`w-5 h-5 ${isUndoing ? 'animate-spin' : 'group-hover/btn:-rotate-12 transition-transform'}`} />
    </button>
  );
}
