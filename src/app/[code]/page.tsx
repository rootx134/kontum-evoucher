import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import VoucherClient from '@/components/VoucherClient';

export const revalidate = 0; // Disable cache for this page since status can change

export default async function VoucherPage({ params }: { params: { code: string } }) {
  const { code } = params;

  // Fetch the voucher and inner join with campaign
  const { data: voucher, error } = await supabase
    .from('vouchers')
    .select(`
      id,
      code,
      status,
      used_at,
      phone_number,
      campaigns (
        sponsor_name,
        description,
        logo_url,
        background_url,
        value,
        locations,
        terms,
        guide_content,
        menu_content
      )
    `)
    .eq('code', code)
    .single();

  if (error || !voucher || !voucher.campaigns) {
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching voucher:', error);
    }
    notFound(); // Triggers 404 page
  }

  return <VoucherClient initialVoucher={voucher as any} />;
}
