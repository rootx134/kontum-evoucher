import VoucherListClient from '@/components/admin/VoucherListClient';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CampaignVouchersPage({ params }: { params: { id: string } }) {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('id, sponsor_name, sponsor_short')
    .eq('id', params.id)
    .single();

  if (error || !campaign) {
    notFound();
  }

  // Pre-fetch data for first load
  const { data: initialVouchers } = await supabase
    .from('vouchers')
    .select('id, code, status, used_at')
    .eq('campaign_id', campaign.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Chi tiết Mã E-Voucher</h1>
        <p className="text-gray-500 mt-1">
          Chiến dịch: <span className="font-bold text-indigo-600">{campaign.sponsor_name}</span> (Prefix: {campaign.sponsor_short})
        </p>
      </div>

      <VoucherListClient 
        campaignId={campaign.id}
        sponsorShort={campaign.sponsor_short}
        initialData={initialVouchers || []} 
      />
    </div>
  );
}
