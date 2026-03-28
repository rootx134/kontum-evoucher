import AllVouchersClient from '@/components/admin/AllVouchersClient';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AllVouchersPage() {
  // Lấy dữ liệu tất cả vouchers kèm thông tin campaign (Join bảng)
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select(`
      id, code, status, used_at,
      campaigns!inner(id, sponsor_name, sponsor_short)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Lỗi khi tải tất cả vouchers:", error);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tất Cả E-Voucher</h1>
          <p className="text-gray-500 mt-1">Tra cứu, tìm kiếm và quản lý toàn bộ kho thẻ trên hệ thống.</p>
        </div>
      </div>

      <AllVouchersClient initialData={vouchers || []} />
    </div>
  );
}
