-- Drop tables if they exist to reset (for development)
DROP TABLE IF EXISTS public.wishlist_treatments;
DROP TABLE IF EXISTS public.treatments;

-- Create treatments table
CREATE TABLE public.treatments (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL,
    description TEXT,
    price_range TEXT,
    effect TEXT,
    concerns TEXT[], -- Array of concerns this treatment addresses
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for treatments
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to treatments
CREATE POLICY "Allow public read access to treatments"
ON public.treatments FOR SELECT
USING (true);

-- Create wishlist_treatments table
CREATE TABLE public.wishlist_treatments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    treatment_id TEXT REFERENCES public.treatments(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, treatment_id)
);

-- Enable RLS for wishlist_treatments
ALTER TABLE public.wishlist_treatments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own wishlist
CREATE POLICY "Users can view their own treatment wishlist"
ON public.wishlist_treatments FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert into their own wishlist
CREATE POLICY "Users can add to their own treatment wishlist"
ON public.wishlist_treatments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete from their own wishlist
CREATE POLICY "Users can remove from their own treatment wishlist"
ON public.wishlist_treatments FOR DELETE
USING (auth.uid() = user_id);

-- Seed initial treatments data
INSERT INTO public.treatments (id, name, description, price_range, effect, concerns) VALUES
('t1', 'オリジオ (Oligio)', '強力な高周波で即時的なリフトアップ効果', '30~50万ウォン', '即時リフトアップ', ARRAY['たるみ/弾力']),
('t2', 'シュリンクユニバース', '超音波でフェイスラインを引き締め', '10~30万ウォン', '引き締め', ARRAY['たるみ/弾力']),
('t3', 'ボトックス', '表情ジワの改善', '5~15万ウォン', 'シワ改善', ARRAY['シワ']),
('t4', 'フィラー', '深いシワのボリューム改善', '20~50万ウォン', 'ボリュームアップ', ARRAY['シワ', 'たるみ/弾力']),
('t5', 'ジュベルック', 'コラーゲン生成を促進し毛穴を縮小', '30~60万ウォン', '毛穴縮小・肌再生', ARRAY['毛穴/傷跡', 'たるみ/弾力']),
('t6', 'ポテンツァ', 'マイクロニードルで肌質改善', '25~50万ウォン', '肌質改善', ARRAY['毛穴/傷跡', 'ニキビ']),
('t7', 'ピコトーニング', 'シミを薄くし肌のトーンアップ', '10~20万ウォン', 'トーンアップ', ARRAY['シミ/肝斑']),
('t8', '美白点滴', '体の内側から輝く肌へ', '5~10万ウォン', '疲労回復・美白', ARRAY['シミ/肝斑']),
('t9', 'アグネス', '繰り返すニキビの根源を破壊', '15~30万ウォン', 'ニキビ治療', ARRAY['ニキビ']),
('t10', 'PDT治療', '皮脂分泌を抑制', '10~20万ウォン', '皮脂抑制', ARRAY['ニキビ']);
