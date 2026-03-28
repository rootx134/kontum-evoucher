import FreeVouchersClient from '@/components/admin/FreeVouchersClient';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function FreeVouchersPage() {
  const { data: freeVouchers, error } = await supabase
    .from('free_vouchers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Lỗi khi lấy dữ liệu Quà tặng tự do:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quà Tặng Tự Do (Give)</h1>
          <p className="text-gray-500 mt-1">Quản lý kho thẻ mở rộng, không phụ thuộc vào Chiến Dịch Nhà Tài Trợ cá biệt.</p>
        </div>
      </div>

      <FreeVouchersClient initialData={freeVouchers || []} />
    </div>
  );
}
