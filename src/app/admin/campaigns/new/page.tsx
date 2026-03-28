import CampaignForm from '@/components/admin/CampaignForm';

export const dynamic = 'force-dynamic';

export default function NewCampaignPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Thêm Mới Chiến Dịch</h1>
        <p className="text-gray-500 mt-1">Cấu hình thông tin nhà tài trợ và sinh mã E-Voucher tự động.</p>
      </div>

      <CampaignForm />
    </div>
  );
}
