import FreeVoucherForm from '@/components/admin/FreeVoucherForm';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditFreeVoucherPage({ params }: { params: { id: string } }) {
  const { data: voucher, error } = await supabase
    .from('free_vouchers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !voucher) {
    console.error("Lỗi khi tải Free Voucher:", error);
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Chỉnh Sửa Thẻ Tự Do</h1>
        <p className="text-gray-500 mt-1">Cập nhật thông tin hình ảnh và điều khoản của thẻ. Khuyến cáo không thay đổi mã Code.</p>
      </div>

      <FreeVoucherForm initialData={voucher} isEdit={true} />
    </div>
  );
}
