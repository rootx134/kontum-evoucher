import { supabase } from '@/lib/supabase';
import CampaignClient from '@/components/admin/CampaignClient';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  // Fetch campaigns with voucher counts
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      vouchers(id, status)
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching campaigns:', error);
  }

  // Parse total and used counts for each campaign
  const formattedCampaigns = (campaigns || []).map(campaign => {
    const total_vouchers = campaign.vouchers ? campaign.vouchers.length : 0;
    const used_vouchers = campaign.vouchers ? campaign.vouchers.filter((v: any) => v.status === 'used').length : 0;
    
    // Remove the full vouchers array to save payload size to client component
    const { vouchers, ...rest } = campaign;
    
    return {
      ...rest,
      total_vouchers,
      used_vouchers
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Chiến Dịch Quà Tặng</h1>
          <p className="text-gray-500 mt-1">Quản lý các chương trình ưu đãi E-Voucher của đối tác.</p>
        </div>
      </div>

      <CampaignClient initialData={formattedCampaigns} />
    </div>
  );
}
