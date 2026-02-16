export const CLINIC_CATEGORIES = [
  { id: 'DERMATOLOGY', label: '皮膚科' },
  { id: 'PLASTIC', label: '美容外科' },
  { id: 'DENTISTRY', label: '歯科' },
  { id: 'ORIENTAL', label: '韓方' },
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
  { id: 'd1', name: 'Aureum Clinic', category: 'DERMATOLOGY', description: 'ソウルの人気皮膚科。1:1オーダーメイド施術と丁寧なカウンセリングが特徴です。', image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=400&q=80', rank: 1 },
  { id: 'd2', name: 'Muse Clinic', category: 'DERMATOLOGY', description: 'トーンアップと毛穴管理に強い定番クリニック。初めての施術にもおすすめです。', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80', rank: 2 },
  { id: 'd3', name: 'Toxnfill', category: 'DERMATOLOGY', description: 'ボトックス・フィラー系の人気クリニック。短時間で相談しやすい施術構成です。', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80', rank: 3 },
  { id: 'd4', name: 'Ppeum Clinic', category: 'DERMATOLOGY', description: 'コストパフォーマンス重視の皮膚施術が豊富。アクセスの良さも魅力です。', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80', rank: 4 },
  { id: 'd5', name: 'Abijou Clinic', category: 'DERMATOLOGY', description: '美肌治療と再生ケアを中心に、幅広い肌悩みに対応します。', image: 'https://images.unsplash.com/photo-1606166317789-d12521c7d3d7?auto=format&fit=crop&w=400&q=80', rank: 5 },

  { id: 'p1', name: 'LienJang Plastic Surgery', category: 'PLASTIC', description: '韓国で知名度の高い美容外科。輪郭・目元・鼻施術の相談がしやすいです。', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80', rank: 1 },
  { id: 'p2', name: 'ID Hospital', category: 'PLASTIC', description: '大規模な設備と専門医チームを持つ美容外科。高難度施術にも対応します。', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80', rank: 2 },
  { id: 'p3', name: 'Banobagi', category: 'PLASTIC', description: '自然な変化を重視する美容外科。外国人向けサポートも充実しています。', image: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=400&q=80', rank: 3 },
  { id: 'p4', name: 'View Plastic Surgery', category: 'PLASTIC', description: '安全性を重視した診療体制。輪郭・リフト系の人気が高いクリニックです。', image: 'https://images.unsplash.com/photo-1538108149393-fbbd8189718c?auto=format&fit=crop&w=400&q=80', rank: 4 },
  { id: 'p5', name: 'JK Plastic Surgery', category: 'PLASTIC', description: '海外患者対応経験が豊富。丁寧な説明と術後フォローが強みです。', image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=400&q=80', rank: 5 },

  { id: 't1', name: 'White Style Dental', category: 'DENTISTRY', description: 'ホワイトニング・矯正・審美歯科に対応する人気歯科クリニックです。', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80', rank: 1 },
  { id: 't2', name: 'Minish Dental', category: 'DENTISTRY', description: '短期間での審美改善メニューが豊富。日本語相談にも対応します。', image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=400&q=80', rank: 2 },
  { id: 't3', name: 'Live Dental', category: 'DENTISTRY', description: '矯正と審美治療のバランスが良い歯科。丁寧なカウンセリングが特徴です。', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf4722e99?auto=format&fit=crop&w=400&q=80', rank: 3 },
  { id: 't4', name: 'Good Life Dental', category: 'DENTISTRY', description: '幅広い歯科メニューに対応。費用相談がしやすい安心プランを提供します。', image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=400&q=80', rank: 4 },
  { id: 't5', name: 'Yonsei U-Line', category: 'DENTISTRY', description: '大学病院出身医師による診療。機能性と審美性の両立を重視します。', image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=400&q=80', rank: 5 },

  { id: 'o1', name: 'Jaseng Hospital', category: 'ORIENTAL', description: '韓方ベースの体質改善と痛み管理に強いクリニックです。', image: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&w=400&q=80', rank: 1 },
  { id: 'o2', name: 'Kwangdong Hospital', category: 'ORIENTAL', description: '伝統韓方と現代的ケアを組み合わせた総合管理プログラムを提供します。', image: 'https://images.unsplash.com/photo-1544367563-12123d832d34?auto=format&fit=crop&w=400&q=80', rank: 2 },
  { id: 'o3', name: 'Kyunghee Univ. Hospital', category: 'ORIENTAL', description: '大学病院レベルの信頼性とデータに基づく韓方ケアが強みです。', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80', rank: 3 },
  { id: 'o4', name: 'Lee Moon Won', category: 'ORIENTAL', description: '頭皮・脱毛ケアに特化した韓方クリニック。男女問わず人気があります。', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80', rank: 4 },
  { id: 'o5', name: "She's Clinic", category: 'ORIENTAL', description: '女性向け韓方ケアに特化。コンディション管理を丁寧にサポートします。', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80', rank: 5 },
];
