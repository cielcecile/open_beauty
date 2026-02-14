
export const CLINIC_CATEGORIES = [
    { id: 'DERMATOLOGY', label: '皮膚科' },
    { id: 'PLASTIC', label: '美容外科' },
    { id: 'DENTISTRY', label: '歯科' },
    { id: 'ORIENTAL', label: '韓医院' },
];

export interface Clinic {
    id: string;
    name: string;
    category: 'DERMATOLOGY' | 'PLASTIC' | 'DENTISTRY' | 'ORIENTAL';
    description: string;
    detailDescription?: string;
    image: string;
    rank: number;
    chatbotStatus?: 'ACTIVE' | 'INACTIVE';
    chatbotPrompt?: string;
    pricing?: { id: string; title: string; price: string; eventPrice?: string; discountPercent?: number }[];
    faqs?: { id: string; question: string; answer: string }[];
    chatbotTrainingFiles?: string[];
    address?: string;
    location?: { lat: number; lng: number };
}

export const INITIAL_CLINICS: Clinic[] = [
    // DERMATOLOGY
    { id: 'd1', name: 'Aureum Clinic', category: 'DERMATOLOGY', description: 'ソウル大出身の皮膚科専門医による1:1オーダーメイド治療。最新レーザー機器完備。', image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=400&q=80', rank: 1 },
    { id: 'd2', name: 'Muse Clinic', category: 'DERMATOLOGY', description: '全国ネットワークを持つ有名クリニック。リーズナブルで通いやすい。', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80', rank: 2 },
    { id: 'd3', name: 'Toxnfill', category: 'DERMATOLOGY', description: 'ボトックス・フィラー専門。短時間で自然な美しさを。', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80', rank: 3 },
    { id: 'd4', name: 'Ppeum Clinic', category: 'DERMATOLOGY', description: '可愛らしいインテリアと親切なサービス。若者に人気。', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80', rank: 4 },
    { id: 'd5', name: 'Abijou Clinic', category: 'DERMATOLOGY', description: 'トータルビューティーケア。エステと医療の融合。', image: 'https://images.unsplash.com/photo-1606166317789-d12521c7d3d7?auto=format&fit=crop&w=400&q=80', rank: 5 },

    // PLASTIC
    { id: 'p1', name: 'LienJang Plastic Surgery', category: 'PLASTIC', description: '江南駅直結。リーズナブルな価格で最高の技術力を提供。外国人対応チーム常駐。', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80', rank: 1 },
    { id: 'p2', name: 'ID Hospital', category: 'PLASTIC', description: 'アジア最大級の美容病院。輪郭手術のスペシャリスト。', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80', rank: 2 },
    { id: 'p3', name: 'Banobagi', category: 'PLASTIC', description: '「レッツ美人」公式ドクター。自然な変身をサポート。', image: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=400&q=80', rank: 3 },
    { id: 'p4', name: 'View Plastic Surgery', category: 'PLASTIC', description: '安全第一、無事故記録更新中。胸部整形の権威。', image: 'https://images.unsplash.com/photo-1538108149393-fbbd8189718c?auto=format&fit=crop&w=400&q=80', rank: 4 },
    { id: 'p5', name: 'JK Plastic Surgery', category: 'PLASTIC', description: '韓国唯一の政府認定外国人患者誘致優秀医療機関。', image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=400&q=80', rank: 5 },

    // DENTISTRY
    { id: 't1', name: 'White Style Dental', category: 'DENTISTRY', description: 'インプラント、矯正歯科、審美歯科の専門医が常駐。痛くない治療を優先。', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80', rank: 1 },
    { id: 't2', name: 'Minish Dental', category: 'DENTISTRY', description: 'ラミネートベニア「ミニッシュ」専門。1日で終わる審美歯科。', image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=400&q=80', rank: 2 },
    { id: 't3', name: 'Live Dental', category: 'DENTISTRY', description: '江南・仁川に展開。透明矯正インビザラインのダイヤモンドプロバイダー。', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf4722e99?auto=format&fit=crop&w=400&q=80', rank: 3 },
    { id: 't4', name: 'Good Life Dental', category: 'DENTISTRY', description: '良心的な診療と丁寧な説明。虫歯治療からインプラントまで。', image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=400&q=80', rank: 4 },
    { id: 't5', name: 'Yonsei U-Line', category: 'DENTISTRY', description: '延世大学出身の医療陣。リラックスできる院内環境。', image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=400&q=80', rank: 5 },

    // ORIENTAL
    { id: 'o1', name: 'Jaseng Hospital', category: 'ORIENTAL', description: '非手術的脊椎・関節治療の世界的権威。漢方薬による体質改善。', image: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&w=400&q=80', rank: 1 },
    { id: 'o2', name: 'Kwangdong Hospital', category: 'ORIENTAL', description: '伝統と現代医学の融合。五行センターでのプレミアムケア。', image: 'https://images.unsplash.com/photo-1544367563-12123d832d34?auto=format&fit=crop&w=400&q=80', rank: 2 },
    { id: 'o3', name: 'Kyunghee Univ. Hospital', category: 'ORIENTAL', description: '大学病院ならではの専門性と信頼。難治性疾患の治療。', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80', rank: 3 },
    { id: 'o4', name: 'Lee Moon Won', category: 'ORIENTAL', description: '韓方頭皮ケア・脱毛治療専門。ヘッドスパも人気。', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80', rank: 4 },
    { id: 'o5', name: 'She\'s Clinic', category: 'ORIENTAL', description: '女性のための韓方婦人科。更年期障害や生理不順のケア。', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80', rank: 5 },
];
