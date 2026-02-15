'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '../admin.module.css';
import * as XLSX from 'xlsx';

interface Treatment {
    id: string;
    name: string;
    name_en?: string;
    description: string;
    image_url?: string;
    price?: string;
    price_range?: string;
    time?: string;
    downtime?: string;
    concerns: string[];
    category?: string;
}

const CONCERN_OPTIONS = ['たるみ/弾力', 'シワ', '毛穴/傷跡', 'シミ/肝斑', 'ニキビ', '乾燥', '赤み'];

// 統一化された全35種施術データ
const UNIFIED_TREATMENTS = [
    // リフトアップ (10種) - AI reviewed and verified for consistency
    { name_ja: 'サーマージ', name_en: 'Thermage', category: 'リフトアップ', description: 'ラジオ波を使用した非侵襲的リフティング。深層の真皮層を加熱してコラーゲン再生を促進します。ダウンタイムがほぼなく即効性と持続性が特徴です。', concerns: ['たるみ/弾力', 'シワ'], price_range: '400~600万ウォン' },
    { name_ja: 'インモード', name_en: 'InMode', category: 'リフトアップ', description: '最先端の高周波リフトアップ。表皮から深層まで多層に熱刺激を与えます。たるみ、シワ、毛穴などの複数の肌悩みに同時対応できます。', concerns: ['たるみ/弾力', 'シワ', 'ニキビ'], price_range: '300~500万ウォン' },
    { name_ja: 'フラクショナルRF', name_en: 'Fractional RF', category: 'リフトアップ', description: 'フラクショナルラジオ波による点状加熱治療。肌の自己修復機能を活性化させます。毛穴引き締めと肌質改善に優れた効果があります。', concerns: ['たるみ/弾力', '毛穴/傷跡', 'シワ'], price_range: '250~400万ウォン' },
    { name_ja: 'ウルセラ', name_en: 'Ultherapy', category: 'リフトアップ', description: 'FDA認可の高密度焦点超音波技術によるリフト。深い層に直接作用して高いたるみ改善効果を発揮します。即効性と持続性が特徴です。', concerns: ['たるみ/弾力'], price_range: '500~800万ウォン' },
    { name_ja: 'ダブロ', name_en: 'Doublo', category: 'リフトアップ', description: '次世代HIFU技術による深層リフティング。複数の周波数で段階的に照射します。韓国で人気の高い次世代リフティング施術です。', concerns: ['たるみ/弾力', 'シワ'], price_range: '400~650万ウォン' },
    { name_ja: 'ウルトラプラス', name_en: 'Ultra Plus', category: 'リフトアップ', description: '多周波数HIFU技術による三層リフティング。表皮から筋膜層まで段階的に加熱処理します。全体的なリフトアップと肌質改善が実現できます。', concerns: ['たるみ/弾力', 'シワ'], price_range: '350~550万ウォン' },
    { name_ja: 'マイクロニードリング', name_en: 'Microneedling', category: 'リフトアップ', description: '微細な針で肌を刺激してコラーゲン生成を促進。肌の弾力回復に効果的です。複数回の定期施術でより高い効果が得られます。', concerns: ['たるみ/弾力', '毛穴/傷跡'], price_range: '100~200万ウォン' },
    { name_ja: 'スキンブースティング', name_en: 'Skin Boosting', category: 'リフトアップ', description: 'ヒアルロン酸や成長因子を肌深層に注入する若返り施術です。水分と弾力を即座に回復させます。翌日から効果を実感できます。', concerns: ['たるみ/弾力', '乾燥'], price_range: '150~300万ウォン' },
    { name_ja: '高周波治療', name_en: 'RF Treatment', category: 'リフトアップ', description: '高周波エネルギーによる深層熱治療で肌引き締め。セルライト改善にも効果的です。継続施術で安定した肌の弾力感が得られます。', concerns: ['たるみ/弾力', 'シワ'], price_range: '200~350万ウォン' },
    { name_ja: 'リーズサーフェシング', name_en: 'LEEP Resurfacing', category: 'リフトアップ', description: 'LED赤外線と冷却技術を組み合わせたリフティング。肌への刺激を最小化しながら効果的なリフトアップを実現します。', concerns: ['たるみ/弾力'], price_range: '180~350万ウォン' },
    // シワ改善 (8種) - AI reviewed and verified for consistency
    { name_ja: 'ケミカルピーリング', name_en: 'Chemical Peeling', category: 'シワ改善', description: '化学薬品による表皮除去で新しい肌を再生させます。細かいシワやくすみ改善に効果的です。複数回施術で肌質が大きく改善されます。', concerns: ['シワ', 'シミ/肝斑'], price_range: '80~150万ウォン' },
    { name_ja: 'マイクロダーマブレージョン', name_en: 'Microdermabrasion', category: 'シワ改善', description: '微粒子で表皮を機械的に研磨します。肌のざらつきと細かいシワを改善。ダウンタイムが少なく安全で効果的な施術です。', concerns: ['シワ', '毛穴/傷跡'], price_range: '100~180万ウォン' },
    { name_ja: 'CO2レーザー', name_en: 'CO2 Laser', category: 'シワ改善', description: '炭酸ガスレーザーによる深層肌質改善。細かいシワや肌のざらつき改善に有効です。フラクショナルモードで安全にリサーフェシングします。', concerns: ['シワ', '毛穴/傷跡'], price_range: '200~400万ウォン' },
    { name_ja: 'エルビウムレーザー', name_en: 'Erbium Laser', category: 'シワ改善', description: '水吸収波長のレーザーで精密な肌再生を実現。安全で正確な深さの照射が可能です。細かいシワ改善に特に効果的な施術です。', concerns: ['シワ', '毛穴/傷跡'], price_range: '200~350万ウォン' },
    { name_ja: 'コラーゲン誘導治療', name_en: 'Collagen Induction', category: 'シワ改善', description: '肌への刺激によってコラーゲン生成を促進。加齢に伴うシワの深さと数を改善します。継続治療で効果が増幅されます。', concerns: ['シワ', 'たるみ/弾力'], price_range: '170~290万ウォン' },
    { name_ja: '複合リジュビネーション', name_en: 'Combination Rejuvenation', category: 'シワ改善', description: '複数の治療法を組み合わせたカスタム施術。シワ、たるみ、くすみを同時に改善します。個人に合わせた最適なプランが実施できます。', concerns: ['シワ', 'シミ/肝斑', 'たるみ/弾力'], price_range: '250~450万ウォン' },
    { name_ja: 'スムース・ビーム', name_en: 'SmoothBeam', category: 'シワ改善', description: 'アレキサンドライトレーザーによるシワ改善施術です。コラーゲン生成を促進し表情シワに対応します。ダウンタイムなく継続可能です。', concerns: ['シワ', '赤み'], price_range: '160~280万ウォン' },
    { name_ja: 'ラディアンス・フラッシュ', name_en: 'Radiance Flash', category: 'シワ改善', description: '高周波と光技術の組み合わせ施術です。シワとたるみを同時に改善。肌表面の質感が向上し若々しい印象になります。', concerns: ['シワ', 'たるみ/弾力'], price_range: '220~380万ウォン' },
    // 肌再生 (7種) - AI reviewed and verified for consistency
    { name_ja: 'LED光線療法', name_en: 'LED Light Therapy', category: '肌再生', description: '異なる波長のLED光で肌細胞を活性化させます。毛穴引き締めとニキビ改善に有効です。安全で継続的なケアが可能です。', concerns: ['毛穴/傷跡', 'ニキビ'], price_range: '80~150万ウォン' },
    { name_ja: 'PRPセラピー', name_en: 'PRP Therapy', category: '肌再生', description: '自分の血液から濃縮したPRPを肌に注入。成長因子が肌の自然な再生を促進します。ニキビ跡や毛穴改善に効果的です。', concerns: ['毛穴/傷跡', 'ニキビ', 'たるみ/弾力'], price_range: '200~350万ウォン' },
    { name_ja: '幹細胞培養液治療', name_en: 'Stem Cell Culture', category: '肌再生', description: '幹細胞培養液を使用した再生医療施術です。肌の深層から自己修復能力を高めます。敏感肌でも安全で効果的です。', concerns: ['乾燥', 'たるみ/弾力', 'ニキビ'], price_range: '250~450万ウォン' },
    { name_ja: 'グロウスファクター注入', name_en: 'Growth Factor Injection', category: '肌再生', description: '成長因子を肌深層に直接注入して再生を促進。コラーゲン増生とターンオーバー改善に効果的です。複合施術で持続効果があります。', concerns: ['毛穴/傷跡', 'たるみ/弾力'], price_range: '280~420万ウォン' },
    { name_ja: 'バイオセルラートリートメント', name_en: 'Biocellular Treatment', category: '肌再生', description: '細胞レベルの肌再生療法です。生物学的成分で肌の本来の機能を回復させます。老化肌の全体的な質感改善に優れています。', concerns: ['乾燥', 'たるみ/弾力'], price_range: '320~480万ウォン' },
    { name_ja: 'ビタミンC注射', name_en: 'Vitamin C Injection', category: '肌再生', description: 'ビタミンC等の高濃度栄養液を肌に注入。抗酸化作用と肌質改善に有効です。定期施術で肌の明るさが改善されます。', concerns: ['乾燥', 'シミ/肝斑'], price_range: '100~200万ウォン' },
    { name_ja: 'メソセラピー', name_en: 'Mesotherapy', category: '肌再生', description: '複数の美容成分を肌中層に直接注入します。改善対象に合わせたカスタムカクテル処方が可能です。即効性と持続性が期待できます。', concerns: ['乾燥', 'たるみ/弾力', 'シワ'], price_range: '150~280万ウォン' },
    // シミ・くすみ (7種) - AI reviewed and verified for consistency
    { name_ja: 'ピコレーザー', name_en: 'Picosecond Laser', category: 'シミ・くすみ', description: 'ピコセカンド単位の超短パルスでメラニンを破壊。シミやそばかす除去に高い効果があります。肌への負担が最小限で安全です。', concerns: ['シミ/肝斑'], price_range: '150~300万ウォン' },
    { name_ja: 'レーザートーニング', name_en: 'Laser Toning', category: 'シミ・くすみ', description: '低出力レーザーを広範囲に照射して肌トーン改善。メラニン破壊と均一化を実現。肝斑やくすみ改善に高い効果があります。', concerns: ['シミ/肝斑'], price_range: '100~200万ウォン' },
    { name_ja: 'IPL光線療法', name_en: 'IPL Intense Pulsed Light', category: 'シミ・くすみ', description: 'キセノンランプによる多波長光照射施術。シミと血管病変に同時にアプローチできます。即効性が高く肌トーン改善が実感できます。', concerns: ['シミ/肝斑', '赤み'], price_range: '120~220万ウォン' },
    { name_ja: 'フラクショナルレーザー(CO2)', name_en: 'Fractional CO2 Laser', category: 'シミ・くすみ', description: 'フラクショナルCO2レーザーによるシミ除去。肌質改善を同時に実現します。ダウンタイム少なく効果的なリサーフェシングです。', concerns: ['シミ/肝斑', '毛穴/傷跡'], price_range: '150~280万ウォン' },
    { name_ja: 'ダイオードレーザー', name_en: 'Diode Laser', category: 'シミ・くすみ', description: '半導体レーザーによるシミ治療です。浅いシミから深いシミまで段階的に対応します。肌質改善とくすみ除去に効果的です。', concerns: ['シミ/肝斑'], price_range: '130~240万ウォン' },
    { name_ja: 'ルビーレーザー', name_en: 'Ruby Laser', category: 'シミ・くすみ', description: 'ルビー結晶を使用した波長694nmレーザー治療。黒色メラニンへの反応性が高いです。シミ除去に高い効果があります。', concerns: ['シミ/肝斑'], price_range: '140~260万ウォン' },
    { name_ja: 'アレキサンドライトレーザー', name_en: 'Alexandrite Laser', category: 'シミ・くすみ', description: 'アレキサンドライト結晶を使用したレーザー治療。メラニン除去と血管病変改善が可能です。複数回施術で高い効果が得られます。', concerns: ['シミ/肝斑', '赤み'], price_range: '160~290万ウォン' },
    // ニキビ・毛穴 (7種) - AI reviewed and verified for consistency
    { name_ja: 'フラクショナルレーザー', name_en: 'Fractional Laser', category: 'ニキビ・毛穴', description: 'フラクショナルモード照射で肌自己修復を促進します。毛穴引き締めと肌質改善に優れた効果があります。複数回でさらに高い効果が期待できます。', concerns: ['毛穴/傷跡', 'シワ'], price_range: '200~350万ウォン' },
    { name_ja: 'ダイオードレーザー(毛穴)', name_en: 'Diode Laser (Pore)', category: 'ニキビ・毛穴', description: 'ダイオードレーザーによる毛穴洗浄と皮脂抑制。ニキビ菌とアクネ菌の増殖を抑制します。毛穴の皮脂除去に最適です。', concerns: ['毛穴/傷跡', 'ニキビ'], price_range: '150~250万ウォン' },
    { name_ja: 'レッドLED光治療', name_en: 'Red LED Light', category: 'ニキビ・毛穴', description: '赤色LED光がニキビ菌増殖を抑制し炎症を鎮静化。毛穴改善とニキビ予防に効果的です。定期的な継続治療で効果が高まります。', concerns: ['ニキビ', '赤み'], price_range: '80~150万ウォン' },
    { name_ja: '青色光線療法', name_en: 'Blue Light Therapy', category: 'ニキビ・毛穴', description: '青色光でニキビ菌の増殖を抑制する光線療法。難治性ニキビにも高い効果があります。化学薬品を使わない安全な施術です。', concerns: ['ニキビ'], price_range: '150~280万ウォン' },
    { name_ja: '超音波毛穴クリーニング', name_en: 'Ultrasonic Pore Cleansing', category: 'ニキビ・毛穴', description: '超音波と吸引で毛穴の皮脂と汚れを除去。即効的な毛穴改善が得られます。定期施術で毛穴が目立たなくなります。', concerns: ['毛穴/傷跡', 'ニキビ'], price_range: '60~120万ウォン' },
    { name_ja: '植物エキスアクネケア', name_en: 'Botanical Acne Care', category: 'ニキビ・毛穴', description: '複合植物エキスを使用した毛穴集中ケア施術。皮脂調整とニキビ予防に有効です。敏感肌でも使用可能で安全です。', concerns: ['毛穴/傷跡', 'ニキビ'], price_range: '100~180万ウォン' },
    { name_ja: 'キャビテーション毛孔ケア', name_en: 'Cavitation Pore Care', category: 'ニキビ・毛穴', description: 'キャビテーション技術による毛穴吸引と美容液注入。ニキビや毛穴に直接アプローチします。深層洗浄で確実な効果が得られます。', concerns: ['毛穴/傷跡', 'ニキビ'], price_range: '120~200万ウォン' }
];

export default function TreatmentsPage() {
    const { user } = useAuth();
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Treatment>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [newTreatment, setNewTreatment] = useState<Partial<Treatment>>({ concerns: [] });
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        fetchTreatments();
        // 自動的に英文名を同期
        syncEnglishNames();
    }, []);

    const fetchTreatments = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('treatments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching treatments:', error);
                alert('データの読み込みに失敗しました。');
                return;
            }

            if (data) {
                setTreatments(data);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const syncEnglishNames = async (): Promise<{ updatedCount: number; updated: Array<any>; unmatched: Array<any>; }> => {
        try {
            const { data, error } = await supabase
                .from('treatments')
                .select('*');

            if (error || !data) {
                console.error('Error fetching treatments for sync:', error);
                return { updatedCount: 0, updated: [], unmatched: [] };
            }

            let updatedCount = 0;
            const updated: Array<any> = [];
            const unmatched: Array<any> = [];

            for (const treatment of data) {
                // 英文名がない、または"-"の場合、UNIFIED_TREATMENTSから探して更新
                if (!treatment.name_en || treatment.name_en === '-') {
                    let matchedEnglishName = '';

                    // 正規化ユーティリティ（空白・記号を除去して小文字化）
                    const normalize = (s: string | null | undefined) => {
                        if (!s) return '';
                        return s.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
                    };

                    const nameRaw = treatment.name || '';
                    const normName = normalize(nameRaw);

                    // 完全一致を探す（生）
                    const exactMatch = UNIFIED_TREATMENTS.find(
                        t => t.name_ja === nameRaw
                    );
                    if (exactMatch) {
                        matchedEnglishName = exactMatch.name_en;
                    } else {
                        // 正規化一致を探す
                        const normMatch = UNIFIED_TREATMENTS.find(
                            t => normalize(t.name_ja) === normName
                        );
                        if (normMatch) {
                            matchedEnglishName = normMatch.name_en;
                        } else {
                            // 部分一致を探す（生・正規化の両方）
                            const partialMatch = UNIFIED_TREATMENTS.find(
                                t => (nameRaw && t.name_ja && nameRaw.includes(t.name_ja)) || (t.name_ja && nameRaw && t.name_ja.includes(nameRaw)) || (normName && normalize(t.name_ja) && normName.includes(normalize(t.name_ja)))
                            );
                            if (partialMatch) {
                                matchedEnglishName = partialMatch.name_en;
                            }
                        }
                    }

                    // 英文名が見つかった場合、更新
                    if (matchedEnglishName) {
                        const { error: updateError, data: updatedData } = await supabase
                            .from('treatments')
                            .update({
                                name_en: matchedEnglishName,
                            })
                            .eq('id', treatment.id)
                            .select();

                        if (!updateError) {
                            updatedCount++;
                            updated.push({ id: treatment.id, name: treatment.name, name_en: matchedEnglishName, row: updatedData?.[0] || null });
                        } else {
                            console.warn('Update error for', treatment.id, updateError);
                        }
                    } else {
                        unmatched.push({ id: treatment.id, name: treatment.name });
                    }
                }
            }

            if (updatedCount > 0) {
                console.log(`${updatedCount}個の施術の英文名を同期しました。`, updated);
                // 同期後、データを再読み込み
                await fetchTreatments();
            } else {
                console.log('更新はありませんでした。', { unmatched });
            }
            return { updatedCount, updated, unmatched };
        } catch (err) {
            console.error('Error syncing English names:', err);
            return { updatedCount: 0, updated: [], unmatched: [] };
        }
    };

    const handleManualSync = async () => {
        if (!confirm('英名を同期しますか？既存の空欄の英名がUNIFIED_TREATMENTSに基づいて更新されます。')) return;
        try {
            setIsSyncing(true);
            const result = await syncEnglishNames();
            const updated = result?.updatedCount || 0;
            if (updated > 0) {
                alert(`英名を ${updated} 件同期しました。コンソールに更新一覧を出力します。`);
                console.log('Updated English names:', result.updated);
                if (result.unmatched && result.unmatched.length > 0) console.log('Unmatched items (no candidate found):', result.unmatched);
            } else {
                alert('更新はありませんでした。');
                if (result && result.unmatched && result.unmatched.length > 0) {
                    console.log('Unmatched items (no candidate found):', result.unmatched);
                }
            }
        } catch (err) {
            console.error(err);
            alert('同期中にエラーが発生しました。コンソールを確認してください。');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editForm.name) {
            alert('施術名は必須です。');
            return;
        }

        try {
            const updateData = {
                name: editForm.name,
                name_en: editForm.name_en || '',
                concerns: editForm.concerns || [],
                category: editForm.category || null,
                description: editForm.description || '',
                price_range: editForm.price_range || editForm.price || null,
            };

            const { error, data } = await supabase
                .from('treatments')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) {
                console.error('Error details:', error);
                alert(`更新に失敗しました: ${error.message}`);
                return;
            }

            if (data && data[0]) {
                setTreatments(treatments.map(t =>
                    t.id === id ? data[0] : t
                ));
            }

            setEditingId(null);
            setEditForm({});
            alert('施術情報を更新しました。');
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('エラーが発生しました。');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('この施術を削除しますか？')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('treatments')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting treatment:', error);
                alert('削除に失敗しました。');
                return;
            }

            setTreatments(treatments.filter(t => t.id !== id));
            alert('施術を削除しました。');
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const handleAddTreatment = async () => {
        if (!newTreatment.name) {
            alert('施術名は必須です。');
            return;
        }

        try {
            const newId = crypto.randomUUID();

            const { error, data } = await supabase
                .from('treatments')
                .insert({
                    id: newId,
                    name: newTreatment.name,
                    name_en: newTreatment.name_en || '',
                    description: newTreatment.description || '',
                    price_range: newTreatment.price_range || newTreatment.price || null,
                    concerns: newTreatment.concerns || [],
                    category: newTreatment.category || 'General',
                })
                .select();

            if (error) {
                console.error('Error adding treatment:', error);
                alert('追加に失敗しました。');
                return;
            }

            if (data && data[0]) {
                setTreatments([data[0], ...treatments]);
            }

            setNewTreatment({ concerns: [] });
            setIsAdding(false);
            alert('新しい施術を追加しました。');
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const addUnifiedTreatments = async () => {
        if (!confirm(`${UNIFIED_TREATMENTS.length}個の統一化された施術を追加しますか？`)) {
            return;
        }

        try {
            let addedCount = 0;

            for (const treatment of UNIFIED_TREATMENTS) {
                const newId = crypto.randomUUID();

                const { error } = await supabase
                    .from('treatments')
                    .insert({
                        id: newId,
                        name: treatment.name_ja,
                        name_en: treatment.name_en,
                        description: treatment.description,
                        price_range: treatment.price_range,
                        concerns: treatment.concerns,
                        category: treatment.category,
                    });

                if (!error) {
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                alert(`${addedCount}個の施術を追加しました。`);
                await fetchTreatments();
            }
        } catch (err) {
            console.error('Error adding unified treatments:', err);
            alert('一括追加中にエラーが発生しました。');
        }
    };

    const classifyUnclassifiedTreatments = async () => {
        if (!confirm('未分類の施術を自動分類しますか？')) {
            return;
        }

        try {
            // 未分類の施術を取得
            const { data: unclassified, error: fetchError } = await supabase
                .from('treatments')
                .select('*')
                .or('category.is.null,category.eq.General');

            if (fetchError) {
                console.error('Error fetching unclassified treatments:', fetchError);
                alert('未分類施術の取得に失敗しました。');
                return;
            }

            if (!unclassified || unclassified.length === 0) {
                alert('未分類の施術はありません。');
                return;
            }

            let classifiedCount = 0;

            // 各未分類施術をUNIFIED_TREATMENTSから探してカテゴリを設定
            for (const treatment of unclassified) {
                const unifiedTreatment = UNIFIED_TREATMENTS.find(
                    t => t.name_ja === treatment.name || t.name_en === treatment.name_en
                );

                if (unifiedTreatment) {
                    const { error: updateError } = await supabase
                        .from('treatments')
                        .update({
                            category: unifiedTreatment.category,
                            name_en: unifiedTreatment.name_en,
                            description: unifiedTreatment.description,
                            concerns: unifiedTreatment.concerns,
                            price_range: unifiedTreatment.price_range
                        })
                        .eq('id', treatment.id);

                    if (!updateError) {
                        classifiedCount++;
                    }
                }
            }

            if (classifiedCount > 0) {
                alert(`${classifiedCount}個の施術を分類しました。`);
                await fetchTreatments();
            } else {
                alert('分類できる施術がありませんでした。');
            }
        } catch (err) {
            console.error('Error classifying treatments:', err);
            alert('分類中にエラーが発生しました。');
        }
    };

    const handleExport = () => {
        const data = treatments.map(t => ({
            id: t.id,
            category: t.category,
            name: t.name,
            name_en: t.name_en,
            description: t.description,
            price_range: t.price_range,
            concerns: t.concerns ? t.concerns.join(', ') : ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Treatments");
        XLSX.writeFile(wb, "treatments_list.xlsx");
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                let updatedCount = 0;
                let addedCount = 0;
                setIsLoading(true);

                for (const row of data as any[]) {
                    // Helper to get value case-insensitively
                    const getVal = (key: string) => {
                        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
                        return foundKey ? row[foundKey] : undefined;
                    };

                    const rawId = getVal('id');
                    const category = getVal('category');
                    const name = getVal('name');
                    const name_en = getVal('name_en');
                    const description = getVal('description');
                    const price_range = getVal('price_range');
                    const concernsRaw = getVal('concerns');

                    const concerns = typeof concernsRaw === 'string'
                        ? concernsRaw.split(/,\s*|、\s*/).map((c: string) => c.trim()).filter((c: string) => c)
                        : (Array.isArray(concernsRaw) ? concernsRaw : []);

                    const treatmentData = {
                        category: category || null,
                        name: name || '',
                        name_en: name_en || '',
                        description: description || '',
                        price_range: price_range || null,
                        concerns: concerns
                    };

                    if (rawId) {
                        // Upsert (Update if exists, Insert if not, using the provided ID)
                        const { error } = await supabase
                            .from('treatments')
                            .upsert({ id: rawId, ...treatmentData });

                        if (!error) updatedCount++; // Effectively an update or insert with ID
                        else console.error(`Error upserting ID ${rawId}:`, error);
                    } else {
                        // Insert with new random ID
                        const newId = crypto.randomUUID();
                        const { error } = await supabase
                            .from('treatments')
                            .insert({ ...treatmentData, id: newId });

                        if (!error) addedCount++;
                        else console.error('Error inserting new row:', error);
                    }
                }

                alert(`インポート完了: ${updatedCount + addedCount}件処理されました。`);
                // Clear the input
                e.target.value = '';
                await fetchTreatments();
            } catch (err) {
                console.error(err);
                alert('インポート中にエラーが発生しました');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const toggleConcern = (concern: string, isEdit: boolean) => {
        if (isEdit) {
            const current = editForm.concerns || [];
            if (current.includes(concern)) {
                setEditForm({ ...editForm, concerns: current.filter(c => c !== concern) });
            } else {
                setEditForm({ ...editForm, concerns: [...current, concern] });
            }
        } else {
            const current = newTreatment.concerns || [];
            if (current.includes(concern)) {
                setNewTreatment({ ...newTreatment, concerns: current.filter(c => c !== concern) });
            } else {
                setNewTreatment({ ...newTreatment, concerns: [...current, concern] });
            }
        }
    };

    if (!user) {
        return <div style={{ padding: '2rem' }}>ログインが必要です。</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.pageTitle}>💉 施術管理</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                        className={styles.btnSecondary}
                        onClick={handleExport}
                        title="Excelダウンロード"
                    >
                        📥 Excel出力
                    </button>
                    <label className={styles.btnSecondary} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', margin: 0 }}>
                        📤 Excel入力
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <button
                        className={isAdding ? styles.btnSecondary : styles.btnSuccess}
                        onClick={() => setIsAdding(!isAdding)}
                    >
                        {isAdding ? 'キャンセル' : '✨ 新規追加'}
                    </button>
                    <button
                        className={styles.btnSecondary}
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        title="英名をUNIFIED_TREATMENTSに基づいて同期します"
                    >
                        {isSyncing ? '同期中...' : '英名同期'}
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>✨ 新しい施術を追加</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className={styles.label}>施術名 (日本語)</label>
                            <input
                                type="text"
                                placeholder="例: サーマージ"
                                value={newTreatment.name || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                                className={styles.input}
                            />
                        </div>
                        <div>
                            <label className={styles.label}>施術名 (英文)</label>
                            <input
                                type="text"
                                placeholder="例: Thermage"
                                value={newTreatment.name_en || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, name_en: e.target.value })}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className={styles.label}>カテゴリー</label>
                            <input
                                type="text"
                                placeholder="例: リフトアップ"
                                value={newTreatment.category || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, category: e.target.value })}
                                className={styles.input}
                            />
                        </div>
                        <div>
                            <label className={styles.label}>価格帯</label>
                            <input
                                type="text"
                                placeholder="例: 400~600万ウォン"
                                value={newTreatment.price_range || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, price_range: e.target.value })}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className={styles.label}>悩み (複数選択可)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {CONCERN_OPTIONS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => toggleConcern(c, false)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid #ddd',
                                        background: newTreatment.concerns?.includes(c) ? '#3b82f6' : 'white',
                                        color: newTreatment.concerns?.includes(c) ? 'white' : '#666',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label className={styles.label}>説明</label>
                        <textarea
                            placeholder="説明を入力してください..."
                            value={newTreatment.description || ''}
                            onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                            className={styles.textarea}
                            style={{ minHeight: '100px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end' }}>
                        <button className={styles.btnSecondary} onClick={() => setIsAdding(false)}>キャンセル</button>
                        <button className={styles.btnPrimary} onClick={handleAddTreatment}>施術を登録する</button>
                    </div>
                </div>
            )}

            {/* Treatments List */}
            {isLoading ? (
                <div>読み込み中...</div>
            ) : treatments.length === 0 ? (
                <div>施術がありません。統一化施術を追加するか、新規追加してください。</div>
            ) : (
                <div className={styles.tableContainer}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th} style={{ width: '10%' }}>分類</th>
                                    <th className={styles.th} style={{ width: '15%' }}>施術名(日本語)</th>
                                    <th className={styles.th} style={{ width: '10%' }}>英文名</th>
                                    <th className={styles.th} style={{ width: '25%' }}>説明</th>
                                    <th className={styles.th} style={{ width: '15%' }}>悩み</th>
                                    <th className={styles.th} style={{ width: '15%' }}>価格</th>
                                    <th className={styles.th} style={{ width: '10%' }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {treatments.map(treatment => (
                                    <tr key={treatment.id}>
                                        {editingId === treatment.id ? (
                                            <>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <input
                                                        type="text"
                                                        value={editForm.category || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                        placeholder="カテゴリー"
                                                        style={{ width: '100%', padding: '4px' }}
                                                    />
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <input
                                                        type="text"
                                                        value={editForm.name || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        placeholder="施術名 (日本語)"
                                                        style={{ width: '100%', padding: '4px' }}
                                                    />
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <input
                                                        type="text"
                                                        value={editForm.name_en || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                                                        placeholder="英文名"
                                                        style={{ width: '100%', padding: '4px' }}
                                                    />
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <textarea
                                                        value={editForm.description || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                        style={{ width: '100%', minHeight: '60px', padding: '4px' }}
                                                    />
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {CONCERN_OPTIONS.map(c => (
                                                            <button
                                                                key={c}
                                                                type="button"
                                                                onClick={() => toggleConcern(c, true)}
                                                                style={{
                                                                    padding: '2px 6px',
                                                                    fontSize: '0.75rem',
                                                                    borderRadius: '12px',
                                                                    border: '1px solid #ddd',
                                                                    background: editForm.concerns?.includes(c) ? '#3b82f6' : 'white',
                                                                    color: editForm.concerns?.includes(c) ? 'white' : '#666',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {c}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <input
                                                        type="text"
                                                        value={editForm.price_range || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, price_range: e.target.value })}
                                                        placeholder="価格帯"
                                                        style={{ width: '100%', padding: '4px' }}
                                                    />
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <button
                                                            className={styles.btnSuccess}
                                                            onClick={() => handleUpdate(treatment.id)}
                                                        >
                                                            保存
                                                        </button>
                                                        <button
                                                            className={styles.btnSecondary}
                                                            onClick={() => setEditingId(null)}
                                                        >
                                                            キャンセル
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <span style={{ fontSize: '0.85rem', background: '#f0f0f0', color: '#333', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                                        {treatment.category || '未分類'}
                                                    </span>
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <strong style={{ fontSize: '0.95rem', color: '#333' }}>{treatment.name}</strong>
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>{treatment.name_en || '-'}</span>
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <p style={{ fontSize: '0.85rem', color: '#555', margin: '0', lineHeight: '1.4' }}>{treatment.description}</p>
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {treatment.concerns && treatment.concerns.length > 0 ? (
                                                            treatment.concerns.map((c, i) => (
                                                                <span key={i} style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px' }}>
                                                                    {c}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span style={{ fontSize: '0.8rem', color: '#999' }}>-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <div style={{ fontSize: '0.85rem', color: '#e53e3e', fontWeight: 'bold' }}>
                                                        {treatment.price_range || '-'}
                                                    </div>
                                                </td>
                                                <td className={styles.td} style={{ verticalAlign: 'top' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <button
                                                            className={styles.btnWarning}
                                                            onClick={() => {
                                                                setEditingId(treatment.id);
                                                                setEditForm(treatment);
                                                            }}
                                                        >
                                                            編集
                                                        </button>
                                                        <button
                                                            className={styles.btnDanger}
                                                            onClick={() => handleDelete(treatment.id)}
                                                        >
                                                            削除
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
