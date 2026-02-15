const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Define the new treatments based on GangnamUnni & Creatrip references
const newTreatments = [
    // --- 1. Plastic Surgery (整形外科) ---
    {
        name_ja: "二重整形 (埋没法)",
        name_en: "Double Eyelid (Non-incisional)",
        category: "整形外科",
        description: "皮膚を切らずに糸で二重のラインを作る施術です。ダウンタイムが短く、自然な仕上がりが特徴です。",
        price_range: "50~150万ウォン",
        concerns: ["たるみ/弾力"]
    },
    {
        name_ja: "二重整形 (切開法)",
        name_en: "Double Eyelid (Incision)",
        category: "整形外科",
        description: "まぶたの皮膚を切開して二重ラインを作る施術です。くっきりとしたラインが半永久的に持続します。",
        price_range: "150~300万ウォン",
        concerns: ["たるみ/弾力"]
    },
    {
        name_ja: "目頭切開",
        name_en: "Epicanthoplasty",
        category: "整形外科",
        description: "目頭の蒙古襞を取り除き、目を大きく見せる施術です。離れ目の改善にも効果的です。",
        price_range: "80~150万ウォン",
        concerns: []
    },
    {
        name_ja: "目尻切開",
        name_en: "Lateral Canthoplasty",
        category: "整形外科",
        description: "目尻を切開して目の横幅を広げる施術です。優しい印象の目元を作ります。",
        price_range: "80~150万ウォン",
        concerns: []
    },
    {
        name_ja: "目つき矯正",
        name_en: "Ptosis Correction",
        category: "整形外科",
        description: "眠そうな目をパッチリさせる手術です。眼瞼下垂を改善し、黒目を大きく見せます。",
        price_range: "150~300万ウォン",
        concerns: ["たるみ/弾力"]
    },
    {
        name_ja: "鼻整形 (隆鼻術)",
        name_en: "Rhinoplasty",
        category: "整形外科",
        description: "プロテーゼや自家組織を使用して鼻を高くする手術です。顔のバランスを整えます。",
        price_range: "300~500万ウォン",
        concerns: []
    },
    {
        name_ja: "小鼻縮小",
        name_en: "Alar Reduction",
        category: "整形外科",
        description: "広がった小鼻を小さく整える手術です。洗練された鼻の印象を作ります。",
        price_range: "100~200万ウォン",
        concerns: []
    },
    {
        name_ja: "あごプロテーゼ",
        name_en: "Chin Implant",
        category: "整形外科",
        description: "あごにプロテーゼを挿入し、シャープなフェイスラインを作る手術です。",
        price_range: "200~350万ウォン",
        concerns: ["たるみ/弾力"]
    },
    {
        name_ja: "顔の脂肪吸引",
        name_en: "Face Liposuction",
        category: "整形外科",
        description: "二重アゴや頬の余分な脂肪を吸引し、すっきりとした輪郭を作ります。",
        price_range: "150~300万ウォン",
        concerns: ["たるみ/弾力"]
    },
    {
        name_ja: "顔の脂肪移植",
        name_en: "Face Fat Grafting",
        category: "整形外科",
        description: "太ももなどから採取した脂肪を顔のくぼみ（額、頬など）に注入し、若々しいボリュームを与えます。",
        price_range: "150~300万ウォン",
        concerns: ["シワ", "たるみ/弾力"]
    },
    {
        name_ja: "豊胸手術",
        name_en: "Breast Augmentation",
        category: "整形外科",
        description: "シリコンバッグなどを挿入し、バストのボリュームと形を美しく整える手術です。",
        price_range: "800~1500万ウォン",
        concerns: []
    },
    {
        name_ja: "ボディ脂肪吸引",
        name_en: "Body Liposuction",
        category: "整形外科",
        description: "お腹、太もも、二の腕などの頑固な脂肪を除去し、理想のボディラインを作ります。",
        price_range: "300~800万ウォン",
        concerns: []
    },

    // --- 2. Skin Procedure (皮膚施術) ---
    // Removed specific Botox/Filler items to avoid keyword duplication with existing generic 'Botox' and 'Filler' entries
    /*
    {
        name_ja: "エラボトックス",
        name_en: "Jaw Botox",
        category: "皮膚施術",
        description: "発達したエラの筋肉を縮小させ、小顔効果を得る注射施術です。",
        price_range: "5~15万ウォン",
        concerns: ["たるみ/弾力"]
    },
    {
        name_ja: "肩ボトックス",
        name_en: "Trapezius Botox",
        category: "皮膚施術",
        description: "肩の筋肉の張りをほぐし、美しい首のラインを作ると同時に肩こりも解消します。",
        price_range: "15~30万ウォン",
        concerns: []
    },
    {
        name_ja: "ボディボトックス",
        name_en: "Body Botox",
        category: "皮膚施術",
        description: "ふくらはぎや太ももの筋肉を縮小させ、脚のラインを細く整えます。",
        price_range: "20~50万ウォン",
        concerns: []
    },
    {
        name_ja: "唇フィラー",
        name_en: "Lip Filler",
        category: "皮膚施術",
        description: "唇にボリュームを与え、理想的な形（M字リップなど）に整える施術です。",
        price_range: "20~40万ウォン",
        concerns: ["シワ"]
    },
      {
        name_ja: "額フィラー",
        name_en: "Forehead Filler",
        category: "皮膚施術",
        description: "平らな額に丸みを持たせ、立体的で女性らしい横顔を作ります。",
        price_range: "50~150万ウォン",
        concerns: ["シワ"]
    },
    {
        name_ja: "鼻フィラー",
        name_en: "Nose Filler",
        category: "皮膚施術",
        description: "鼻筋にヒアルロン酸を注入し、手軽に鼻を高く整える施術です。",
        price_range: "30~60万ウォン",
        concerns: []
    },
    */
    {
        name_ja: "糸リフト (ミントリフト等)",
        name_en: "Thread Lift",
        category: "皮膚施術",
        description: "医療用の糸を皮下に挿入し、たるみを物理的に引き上げる施術です。即効性があります。",
        price_range: "100~300万ウォン",
        concerns: ["たるみ/弾力", "シワ"]
    },
    {
        name_ja: "リジュランヒーラー",
        name_en: "Rejuran Healer",
        category: "皮膚施術",
        description: "サーモン由来の成分で肌の再生能力を高める施術です。ニキビ跡や肌質改善に効果的です。",
        price_range: "30~50万ウォン",
        concerns: ["毛穴/傷跡", "乾燥", "シワ"]
    },
    {
        name_ja: "水光注射",
        name_en: "Aqua Shining Injection",
        category: "皮膚施術",
        description: "ヒアルロン酸を肌の真皮層に直接注入し、内側から輝くような潤いを与えます。",
        price_range: "15~30万ウォン",
        concerns: ["乾燥", "シワ"]
    },
    {
        name_ja: "輪郭注射",
        name_en: "V-Line Injection",
        category: "皮膚施術",
        description: "顔の脂肪を溶かし、リンパ循環を促進して老廃物を排出させる小顔注射です。",
        price_range: "10~30万ウォン",
        concerns: ["たるみ/弾力"]
    },

    // --- 3. Skin Care (スキンケア) ---
    {
        name_ja: "アクアピーリング",
        name_en: "Aqua Peel",
        category: "スキンケア",
        description: "ペン型の吸引器と3種類の専用美容液を使用し、毛穴の汚れや角質を除去しながら保湿します。",
        price_range: "5~10万ウォン",
        concerns: ["毛穴/傷跡", "ニキビ"]
    },
    {
        name_ja: "ララピール",
        name_en: "Lala Peel",
        category: "スキンケア",
        description: "LHA成分を使用した低刺激なピーリング。角質除去と同時に肌のバリア機能を強化します。敏感肌にもおすすめ。",
        price_range: "10~20万ウォン",
        concerns: ["毛穴/傷跡", "乾燥"]
    },
    {
        name_ja: "LDM水玉リフティング",
        name_en: "LDM Water Drop Lifting",
        category: "スキンケア",
        description: "高密度の超音波エネルギーで、肌の保湿、弾力向上、トラブル鎮静を行う管理施術です。",
        price_range: "10~20万ウォン",
        concerns: ["乾燥", "赤み", "たるみ/弾力"]
    },
    {
        name_ja: "酸素テラピー",
        name_en: "Oxygen Therapy",
        category: "スキンケア",
        description: "純酸素と陰イオンを肌に供給し、細胞再生を促進して透明感のある肌を作ります。",
        price_range: "8~15万ウォン",
        concerns: ["乾燥", "シミ/肝斑"]
    },
    {
        name_ja: "ブラックヘッド管理",
        name_en: "Blackhead Care",
        category: "スキンケア",
        description: "鼻の黒ずみ（ブラックヘッド）を溶かして除去し、毛穴を引き締める集中ケアです。",
        price_range: "5~12万ウォン",
        concerns: ["毛穴/傷跡"]
    },
    {
        name_ja: "ビタミンイオン導入",
        name_en: "Vitamin Iontophoresis",
        category: "スキンケア",
        description: "微弱な電流を使ってビタミンCなどの有効成分を肌の深層部まで浸透させます。",
        price_range: "5~10万ウォン",
        concerns: ["シミ/肝斑", "乾燥"]
    },
    {
        name_ja: "クライオセル (冷却管理)",
        name_en: "Cryocell",
        category: "スキンケア",
        description: "冷却技術を使って肌を鎮静させながら、薬剤を浸透させる管理です。レーザー後の鎮静に最適です。",
        price_range: "5~10万ウォン",
        concerns: ["赤み", "乾燥"]
    }
];

function generateSQL() {
    let sql = `-- Add new treatments from GangnamUnni & Creatrip\n\n`;

    newTreatments.forEach((t, index) => {
        const id = 'gen_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

        const name_ja = t.name_ja.replace(/'/g, "''");
        const name_en = t.name_en.replace(/'/g, "''");
        const desc = t.description.replace(/'/g, "''");
        const cat = t.category.replace(/'/g, "''");
        const price = t.price_range.replace(/'/g, "''");

        const concernsList = t.concerns.map(c => `'${c.replace(/'/g, "''")}'`).join(',');
        const concernsSql = `ARRAY[${concernsList}]`;

        sql += `
INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '${name_ja}',
    '${name_en}',
    '${t.category}',
    '${desc}',
    '${price}',
    ${concernsSql}
);
`;
    });

    return sql;
}

const sqlContent = generateSQL();
fs.writeFileSync('scripts/add_more_treatments.sql', sqlContent);
console.log('SQL script generated at scripts/add_more_treatments.sql');
