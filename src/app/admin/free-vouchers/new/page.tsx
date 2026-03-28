import FreeVoucherForm from '@/components/admin/FreeVoucherForm';

export const dynamic = 'force-dynamic';

export default function NewFreeVoucherPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Thêm Thẻ Tự Do (Free Voucher)</h1>
        <p className="text-gray-500 mt-1">Hệ thống tạo ra một thẻ E-Voucher độc lập, sở hữu mã tự định nghĩa mà không thuộc bất kỳ Chiến dịch cố định nào.</p>
      </div>

      <FreeVoucherForm />
    </div>
  );
}
