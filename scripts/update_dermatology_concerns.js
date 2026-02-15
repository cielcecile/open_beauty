const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 피부과 시술별 고민 매핑 데이터
const treatmentConcerns = [
    { name: 'ピコトーニング (Pico Toning)', concerns: ['シミ/肝斑', '毛穴/傷跡', '赤み'] },
    { name: 'ピコフラクセル (Pico Fractional)', concerns: ['毛穴/傷跡', 'ニキビ', 'たるみ/弾力'] },
    { name: 'ピコスポット (Pico Spot)', concerns: ['シミ/肝斑'] },
    { name: 'フラクセル (Fractional)', concerns: ['毛穴/傷跡', 'ニキビ', 'たるみ/弾力'] },
    { name: 'Nd:YAGレーザー', concerns: ['シミ/肝斑', '赤み'] },
    { name: 'IPL (光治療)', concerns: ['シミ/肝斑', '赤み', 'ニキビ'] },
    { name: 'ウルセラ (Ultherapy)', concerns: ['たるみ/弾力', 'シワ'] },
    { name: 'ダブロ (Doublo)', concerns: ['たるみ/弾力', 'シワ'] },
    { name: 'シュリンク (Shurink)', concerns: ['たるみ/弾力', 'シワ'] },
    { name: 'サーマジュ (Thermage)', concerns: ['たるみ/弾力', 'シワ', '毛穴/傷跡'] },
    { name: 'オリジオ (Oligio)', concerns: ['たるみ/弾力', 'シワ', '毛穴/傷跡'] },
    { name: 'インモード (InMode)', concerns: ['たるみ/弾力', 'シワ', '赤み'] },
    { name: 'ソフウェーブ (Sofwave)', concerns: ['たるみ/弾力', 'シワ'] },
    { name: 'ポテンツァ (Potenza)', concerns: ['ニキビ', '毛穴/傷跡', '赤み', 'たるみ/弾力'] },
    { name: 'アグネス (Agnes)', concerns: ['ニキビ', '毛穴/傷跡'] }, // 눈밑지방 removed from concerns list as it's not standard
    { name: 'ボトックス (Botox)', concerns: ['シワ', 'たるみ/弾力'] }, // 다한증 removed
    { name: 'ヒアルロン酸 (Hyaluronic Acid)', concerns: ['シワ', 'たるみ/弾力'] },
    { name: 'リジュラン (Rejuran)', concerns: ['乾燥', 'たるみ/弾力', 'シワ', '毛穴/傷跡'] },
    { name: 'ジュベルック (Juvelook)', concerns: ['毛穴/傷跡', 'シワ', 'たるみ/弾力'] },
    { name: 'スキンボトックス (Skin Botox)', concerns: ['毛穴/傷跡', 'シワ', 'たるみ/弾力'] },
    { name: '水光注射 (Skin Booster)', concerns: ['乾燥', 'たるみ/弾力'] },
    { name: 'スレッドリフト (Thread Lift)', concerns: ['たるみ/弾力', 'シワ'] },
    { name: 'PRP (自己多血小板血漿)', concerns: ['毛穴/傷跡', 'シワ', '乾燥'] }, // 탈모 removed
    { name: 'エクソソーム (Exosome)', concerns: ['乾燥', '赤み', 'ニキビ', '毛穴/傷跡'] },
    { name: '白玉注射 (Glutathione)', concerns: ['シミ/肝斑', '乾燥'] },
    { name: 'シンデレラ注射 (Cinderella)', concerns: ['乾燥'] }, // 피로회복 removed
    { name: 'アクアピール (Aqua Peel)', concerns: ['毛穴/傷跡', 'ニキビ'] },
    { name: 'ケミカルピーリング (Chemical Peeling)', concerns: ['ニキビ', '毛穴/傷跡', 'シミ/肝斑'] },
    { name: 'LED光線療法 (LED Light Therapy)', concerns: ['ニキビ', '赤み', '乾燥'] },
    { name: 'スカルプトラ (Sculptra)', concerns: ['たるみ/弾力', 'シワ'] },
    { name: 'ララピール (Lala Peel)', concerns: ['毛穴/傷跡', 'ニキビ', '乾燥'] }
];

async function updateConcerns() {
    console.log('Updating treatment concerns...');
    let updatedCount = 0;

    for (const item of treatmentConcerns) {
        // 이름으로 매칭 (부분 일치 또는 정확한 일치 고려)
        // 여기서는 이름이 정확히 일치하거나 포함되는 경우를 찾습니다.
        // 하지만 기존 데이터의 이름이 정확하지 않을 수 있으므로, like 검색을 사용합니다.

        // 1. 정확한 이름으로 검색 시도
        let { data, error } = await supabase
            .from('treatments')
            .select('id, name')
            .ilike('name', `%${item.name.split(' (')[0]}%`) // 괄호 앞부분 이름으로 검색 (예: ピコトーニング)

        if (error) {
            console.error(`Error searching for ${item.name}:`, error);
            continue;
        }

        if (data && data.length > 0) {
            for (const treatment of data) {
                // 업데이트
                const { error: updateError } = await supabase
                    .from('treatments')
                    .update({ concerns: item.concerns })
                    .eq('id', treatment.id);

                if (updateError) {
                    console.error(`Error updating ${treatment.name}:`, updateError);
                } else {
                    console.log(`Updated ${treatment.name} with concerns: ${item.concerns.join(', ')}`);
                    updatedCount++;
                }
            }
        } else {
            // 2. 괄호 안의 영어 이름으로 검색 시도 (보조)
            const engName = item.name.match(/\(([^)]+)\)/)?.[1];
            if (engName) {
                let { data: engData, error: engError } = await supabase
                    .from('treatments')
                    .select('id, name')
                    .ilike('name_en', `%${engName}%`);

                if (engData && engData.length > 0) {
                    for (const treatment of engData) {
                        const { error: updateError } = await supabase
                            .from('treatments')
                            .update({ concerns: item.concerns })
                            .eq('id', treatment.id);

                        if (updateError) {
                            console.error(`Error updating ${treatment.name} (by EN):`, updateError);
                        } else {
                            console.log(`Updated ${treatment.name} (by EN) with concerns: ${item.concerns.join(', ')}`);
                            updatedCount++;
                        }
                    }
                } else {
                    console.log(`Treatment not found: ${item.name}`);
                }
            } else {
                console.log(`Treatment not found: ${item.name}`);
            }
        }
    }

    console.log(`Update complete. Total updated: ${updatedCount}`);
}

updateConcerns();
