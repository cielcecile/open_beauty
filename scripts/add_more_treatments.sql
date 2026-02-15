-- Add new treatments from GangnamUnni & Creatrip


INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '二重整形 (埋没法)',
    'Double Eyelid (Non-incisional)',
    '整形外科',
    '皮膚を切らずに糸で二重のラインを作る施術です。ダウンタイムが短く、自然な仕上がりが特徴です。',
    '50~150万ウォン',
    ARRAY['たるみ/弾力']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '二重整形 (切開法)',
    'Double Eyelid (Incision)',
    '整形外科',
    'まぶたの皮膚を切開して二重ラインを作る施術です。くっきりとしたラインが半永久的に持続します。',
    '150~300万ウォン',
    ARRAY['たるみ/弾力']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '目頭切開',
    'Epicanthoplasty',
    '整形外科',
    '目頭の蒙古襞を取り除き、目を大きく見せる施術です。離れ目の改善にも効果的です。',
    '80~150万ウォン',
    ARRAY[]
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '目尻切開',
    'Lateral Canthoplasty',
    '整形外科',
    '目尻を切開して目の横幅を広げる施術です。優しい印象の目元を作ります。',
    '80~150万ウォン',
    ARRAY[]
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '目つき矯正',
    'Ptosis Correction',
    '整形外科',
    '眠そうな目をパッチリさせる手術です。眼瞼下垂を改善し、黒目を大きく見せます。',
    '150~300万ウォン',
    ARRAY['たるみ/弾力']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '鼻整形 (隆鼻術)',
    'Rhinoplasty',
    '整形外科',
    'プロテーゼや自家組織を使用して鼻を高くする手術です。顔のバランスを整えます。',
    '300~500万ウォン',
    ARRAY[]
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '小鼻縮小',
    'Alar Reduction',
    '整形外科',
    '広がった小鼻を小さく整える手術です。洗練された鼻の印象を作ります。',
    '100~200万ウォン',
    ARRAY[]
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    'あごプロテーゼ',
    'Chin Implant',
    '整形外科',
    'あごにプロテーゼを挿入し、シャープなフェイスラインを作る手術です。',
    '200~350万ウォン',
    ARRAY['たるみ/弾力']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '顔の脂肪吸引',
    'Face Liposuction',
    '整形外科',
    '二重アゴや頬の余分な脂肪を吸引し、すっきりとした輪郭を作ります。',
    '150~300万ウォン',
    ARRAY['たるみ/弾力']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '顔の脂肪移植',
    'Face Fat Grafting',
    '整形外科',
    '太ももなどから採取した脂肪を顔のくぼみ（額、頬など）に注入し、若々しいボリュームを与えます。',
    '150~300万ウォン',
    ARRAY['シワ','たるみ/弾力']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '豊胸手術',
    'Breast Augmentation',
    '整形外科',
    'シリコンバッグなどを挿入し、バストのボリュームと形を美しく整える手術です。',
    '800~1500万ウォン',
    ARRAY[]
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    'ボディ脂肪吸引',
    'Body Liposuction',
    '整形外科',
    'お腹、太もも、二の腕などの頑固な脂肪を除去し、理想のボディラインを作ります。',
    '300~800万ウォン',
    ARRAY[]
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '糸リフト (ミントリフト等)',
    'Thread Lift',
    '皮膚施術',
    '医療用の糸を皮下に挿入し、たるみを物理的に引き上げる施術です。即効性があります。',
    '100~300万ウォン',
    ARRAY['たるみ/弾力','シワ']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    'リジュランヒーラー',
    'Rejuran Healer',
    '皮膚施術',
    'サーモン由来の成分で肌の再生能力を高める施術です。ニキビ跡や肌質改善に効果的です。',
    '30~50万ウォン',
    ARRAY['毛穴/傷跡','乾燥','シワ']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '水光注射',
    'Aqua Shining Injection',
    '皮膚施術',
    'ヒアルロン酸を肌の真皮層に直接注入し、内側から輝くような潤いを与えます。',
    '15~30万ウォン',
    ARRAY['乾燥','シワ']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '輪郭注射',
    'V-Line Injection',
    '皮膚施術',
    '顔の脂肪を溶かし、リンパ循環を促進して老廃物を排出させる小顔注射です。',
    '10~30万ウォン',
    ARRAY['たるみ/弾力']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    'アクアピーリング',
    'Aqua Peel',
    'スキンケア',
    'ペン型の吸引器と3種類の専用美容液を使用し、毛穴の汚れや角質を除去しながら保湿します。',
    '5~10万ウォン',
    ARRAY['毛穴/傷跡','ニキビ']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    'ララピール',
    'Lala Peel',
    'スキンケア',
    'LHA成分を使用した低刺激なピーリング。角質除去と同時に肌のバリア機能を強化します。敏感肌にもおすすめ。',
    '10~20万ウォン',
    ARRAY['毛穴/傷跡','乾燥']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    'LDM水玉リフティング',
    'LDM Water Drop Lifting',
    'スキンケア',
    '高密度の超音波エネルギーで、肌の保湿、弾力向上、トラブル鎮静を行う管理施術です。',
    '10~20万ウォン',
    ARRAY['乾燥','赤み','たるみ/弾力']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    '酸素テラピー',
    'Oxygen Therapy',
    'スキンケア',
    '純酸素と陰イオンを肌に供給し、細胞再生を促進して透明感のある肌を作ります。',
    '8~15万ウォン',
    ARRAY['乾燥','シミ/肝斑']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    'ブラックヘッド管理',
    'Blackhead Care',
    'スキンケア',
    '鼻の黒ずみ（ブラックヘッド）を溶かして除去し、毛穴を引き締める集中ケアです。',
    '5~12万ウォン',
    ARRAY['毛穴/傷跡']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    'ビタミンイオン導入',
    'Vitamin Iontophoresis',
    'スキンケア',
    '微弱な電流を使ってビタミンCなどの有効成分を肌の深層部まで浸透させます。',
    '5~10万ウォン',
    ARRAY['シミ/肝斑','乾燥']
);

INSERT INTO public.treatments (id, name, name_en, category, description, price_range, concerns)
VALUES (
    gen_random_uuid()::text,
    'クライオセル (冷却管理)',
    'Cryocell',
    'スキンケア',
    '冷却技術を使って肌を鎮静させながら、薬剤を浸透させる管理です。レーザー後の鎮静に最適です。',
    '5~10万ウォン',
    ARRAY['赤み','乾燥']
);
