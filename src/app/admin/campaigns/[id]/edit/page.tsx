import CampaignForm from '@/components/admin/CampaignForm';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !campaign) {
    console.error("Lỗi khi tải chiến dịch:", error);
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Chỉnh Sửa Chiến Dịch</h1>
        <p className="text-gray-500 mt-1">Cập nhật thông tin và thêm mã Voucher mới nếu cần thiết.</p>
      </div>

      <CampaignForm initialData={campaign} isEdit={true} />
    </div>
  );
}
