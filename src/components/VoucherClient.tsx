'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, AlertCircle, Clock, MapPin, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type VoucherWithCampaign = {
  id: number;
  code: string;
  status: 'unused' | 'used';
  used_at: string | null;
  phone_number: string | null;
  campaigns: {
    sponsor_name: string;
    description: string;
    logo_url: string;
    background_url: string;
    value: string;
    locations: string;
    terms: string;
    guide_content: string;
    menu_content: string;
  };
};

export default function VoucherClient({ 
  initialVoucher, 
}: { 
  initialVoucher: VoucherWithCampaign 
}) {
  const [voucher, setVoucher] = useState(initialVoucher);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isUsed = voucher.status === 'used';
  const campaign = voucher.campaigns;

  const handleUseVoucher = async () => {
    if (!confirm('Bạn có chắc chắn muốn sử dụng E-Voucher này? Hành động này không thể hoàn tác.')) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .update({ status: 'used', used_at: new Date().toISOString() })
        .eq('code', voucher.code)
        .select('*, campaigns(*)')
        .single();

      if (error) throw error;
      if (data) {
        setVoucher(data as unknown as VoucherWithCampaign);
        alert('Sử dụng E-Voucher thành công!');
      }
    } catch (err: any) {
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat fixed"
        style={{ backgroundImage: `url('${campaign.background_url || 'https://fc.kontumplus.com/bg_voucher.jpeg'}')` }}
      />
      <div className="absolute inset-0 z-0 bg-black/70 backdrop-blur-md fixed" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-md mx-auto py-8">
        
        {/* Status Badge */}
        {isUsed && (
          <div className="bg-red-500 text-white text-center py-2 px-4 rounded-xl mb-6 font-bold shadow-lg shadow-red-500/50 flex items-center justify-center space-x-2 animate-bounce-short">
            <CheckCircle2 className="w-5 h-5" />
            <span>ĐÃ SỬ DỤNG</span>
          </div>
        )}

        {/* Voucher Card */}
        <div className={`bg-white rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-500 ${isUsed ? 'opacity-80 grayscale-[0.2]' : ''}`}>
          
          {/* Logo Section */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-pink-500 relative flex items-center justify-center">
            {campaign.logo_url ? (
              <img src={campaign.logo_url} alt="Logo" className="absolute top-4 w-24 h-24 object-contain bg-white rounded-full p-2 shadow-lg" />
            ) : (
              <div className="absolute top-4 w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-black text-orange-500 shadow-lg">
                {campaign.sponsor_name?.charAt(0) || 'V'}
              </div>
            )}
          </div>

          <div className="pt-16 pb-8 px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{campaign.sponsor_name}</h2>
            <p className="text-gray-500 text-sm mb-6">{campaign.description}</p>
            
            <div className="border-t border-b border-gray-100 py-4 mb-6 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-orange-500">
                <Tag className="w-5 h-5" />
                <span className="font-bold text-xl">{campaign.value}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{campaign.locations || 'Áp dụng toàn hệ thống'}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{campaign.terms || 'Không áp dụng cùng CTKM khác'}</span>
              </div>
              {isUsed && voucher.used_at && (
                <div className="flex items-center justify-center space-x-2 text-red-500 text-sm font-semibold mt-4 bg-red-50 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>Dùng lúc: {new Date(voucher.used_at).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isUsed ? (
              <button 
                onClick={handleUseVoucher}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100 uppercase tracking-wider"
              >
                {loading ? 'Đang xử lý...' : 'Sử Dụng E-Voucher'}
              </button>
            ) : (
              <button 
                disabled
                className="w-full bg-gray-300 text-gray-600 py-4 rounded-xl font-bold text-lg cursor-not-allowed uppercase tracking-wider"
              >
                E-Voucher Đã Sử Dụng
              </button>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button 
                onClick={() => setShowGuide(true)}
                className="py-2 px-4 rounded-lg bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm border border-gray-200"
              >
                Hướng dẫn
              </button>
              <button 
                onClick={() => setShowMenu(true)}
                className="py-2 px-4 rounded-lg bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm border border-gray-200"
              >
                Xem Menu
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-6 mt-4">
              Mã bảo mật: <span className="font-mono">{voucher.code}</span>
            </p>

          </div>
        </div>

        {/* Modals */}
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowGuide(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 text-lg">Hướng dẫn sử dụng</h3>
                <button onClick={() => setShowGuide(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <div className="p-6 overflow-y-auto prose prose-sm" dangerouslySetInnerHTML={{ __html: campaign.guide_content || '<p>Đưa mã này cho nhân viên thu ngân để áp dụng ưu đãi.</p>' }} />
            </div>
          </div>
        )}

        {showMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowMenu(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 text-lg">Menu Đối tác</h3>
                <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <div className="p-6 overflow-y-auto prose prose-sm" dangerouslySetInnerHTML={{ __html: campaign.menu_content || '<p>Đang cập nhật menu...</p>' }} />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
