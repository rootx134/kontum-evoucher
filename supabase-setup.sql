-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user'::TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Table: campaigns
CREATE TABLE public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_name TEXT NOT NULL,
  sponsor_short TEXT NOT NULL,
  description TEXT DEFAULT 'TẶNG 1 LY NƯỚC'::TEXT,
  logo_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guide_content TEXT,
  menu_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Table: vouchers
CREATE TABLE public.vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  status TEXT DEFAULT 'unused'::TEXT, -- 'unused', 'used', 'expired'
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(campaign_id, code)
);
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Table: free_vouchers
CREATE TABLE public.free_vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  sponsor_name TEXT,
  description TEXT DEFAULT 'TẶNG 1 LY NƯỚC'::TEXT,
  logo_url TEXT,
  start_date DATE,
  end_date DATE,
  guide_content TEXT,
  menu_content TEXT,
  status TEXT DEFAULT 'unused'::TEXT, -- 'unused', 'used', 'expired'
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);
ALTER TABLE public.free_vouchers ENABLE ROW LEVEL SECURITY;

-- Table: redemptions (History of vouchers)
CREATE TABLE public.redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE CASCADE,
  free_voucher_id UUID REFERENCES public.free_vouchers(id) ON DELETE CASCADE,
  redeemed_by UUID REFERENCES public.profiles(id),
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Admin can see all, Users can see basic things)
-- Note: Replace with actual robust policies later.
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Campaigns are viewable by everyone." ON campaigns FOR SELECT USING (true);
CREATE POLICY "Vouchers are viewable by everyone." ON vouchers FOR SELECT USING (true);
CREATE POLICY "Free Vouchers are viewable by everyone." ON free_vouchers FOR SELECT USING (true);
