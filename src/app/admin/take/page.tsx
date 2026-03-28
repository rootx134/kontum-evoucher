import TakeVouchersClient from '@/components/admin/TakeVouchersClient';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function TakePage() {
  // Lấy danh sách Campaign, đếm voucher chưa dùng (status = 'unused')
  // Và lấy thông tin đã Take từ bảng taken_vouchers
  const { data: campaigns, error: campErr } = await supabase
    .from('campaigns')
    .select(`
      id,
      sponsor_name,
      sponsor_short,
      vouchers (status),
      taken_vouchers (quantity)
    `)
    .order('created_at', { ascending: false });

  if (campErr) {
    console.error('Lỗi lấy dữ liệu chiến dịch Take:', campErr);
  }

  // Parse dữ liệu thủ công
  const parsedData = (campaigns || []).map(c => {
    const vouchersArray = c.vouchers || [];
    const totalVouchers = vouchersArray.length;
    const unusedVouchers = vouchersArray.filter((v: any) => v.status === 'unused').length;
    
    // taken_vouchers is often an array or single object due to joins
    const takenArr = Array.isArray(c.taken_vouchers) ? c.taken_vouchers : (c.taken_vouchers ? [c.taken_vouchers] : []);
    const takenCount = takenArr.reduce((sum: number, tv: any) => sum + (tv.quantity || 0), 0);
    
    return {
      id: c.id,
      sponsor_name: c.sponsor_name,
      sponsor_short: c.sponsor_short,
      total_unused: unusedVouchers,
      taken_quantity: takenCount
    };
  }).filter(c => c.total_unused > 0); // Chỉ hiển thị Campaign còn thẻ

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Chiết Xuất Danh Sách Thẻ (Take)</h1>
          <p className="text-gray-500 mt-1">Cấp phát số lượng E-Voucher để đem đi in hoặc cấp cho đại lý offline.</p>
        </div>
      </div>

      <TakeVouchersClient initialData={parsedData} />
    </div>
  );
}
