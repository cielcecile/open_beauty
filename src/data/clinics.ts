
export const CLINIC_CATEGORIES = [
    { id: 'DERMATOLOGY', label: '皮膚科', name: '피부과' },
    { id: 'PLASTIC', label: '美容外科', name: '성형외과' },
    { id: 'DENTISTRY', label: '歯科', name: '치과' },
    { id: 'ORIENTAL', label: '韓医院', name: '한의원' },
];

export interface Clinic {
    id: string;
    name: string;
    category: 'DERMATOLOGY' | 'PLASTIC' | 'DENTISTRY' | 'ORIENTAL';
    description: string;
    image: string;
    rank: number;
}

export const INITIAL_CLINICS: Clinic[] = [
    {
        id: '1',
        name: 'アウルムクリニック (Aureum Clinic)',
        category: 'DERMATOLOGY',
        description: 'ソウル大出身の皮膚科専門医による1:1オーダーメイド治療。最新レーザー機器完備。',
        image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop',
        rank: 1
    },
    {
        id: '2',
        name: 'リエンジャン美容外科 (LienJang)',
        category: 'PLASTIC',
        description: '江南駅直結。リーズナブルな価格で最高の技術力を提供。外国人対応チーム常駐。',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop',
        rank: 2
    },
    {
        id: '3',
        name: 'ホワイトスタイル歯科 (White Style)',
        category: 'DENTISTRY',
        description: 'インプラント、矯正歯科、審美歯科の専門医が常駐。痛くない治療を優先。',
        image: 'https://images.unsplash.com/photo-1588776814546-1ffcf4722e99?w=600&h=400&fit=crop',
        rank: 3
    },
    {
        id: '4',
        name: '自生韓方病院 (Jaseng)',
        category: 'ORIENTAL',
        description: '非手術的脊椎・関節治療の世界的権威。漢方薬による体質改善と美容鍼。',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop',
        rank: 4
    },
];
