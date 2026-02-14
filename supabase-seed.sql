-- ============================================
-- AUREUM BEAUTY Seed Data
-- Supabase SQL Editor에서 실행해주세요
-- ============================================

-- 1) HOSPITALS (20개 — clinics.ts 기반)
INSERT INTO hospitals (id, name, category, description, detail_description, image_url, address, rank) VALUES
-- DERMATOLOGY
('d1', 'Aureum Clinic', 'DERMATOLOGY', 'ソウル大出身の皮膚科専門医による1:1オーダーメイド治療。最新レーザー機器完備。', '最新のピコレーザー、オリジオ、ジュベルックなど、日本で人気の施術を韓国価格で提供。完全個室でプライバシーも安心です。', 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 論峴洞 123-45', 1),
('d2', 'Muse Clinic', 'DERMATOLOGY', '全国ネットワークを持つ有名クリニック。リーズナブルで通いやすい。', '韓国全国に展開する大手皮膚科チェーン。統一された高品質サービスとリーズナブルな価格が魅力。初めての方にもおすすめです。', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 新沙洞 456-78', 2),
('d3', 'Toxnfill', 'DERMATOLOGY', 'ボトックス・フィラー専門。短時間で自然な美しさを。', 'ボトックスとフィラーに特化した専門クリニック。5分程度の施術で自然な若返り効果を実感できます。', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 駅三洞 789-12', 3),
('d4', 'Ppeum Clinic', 'DERMATOLOGY', '可愛らしいインテリアと親切なサービス。若者に人気。', 'SNS映えする美しい院内と親切なカウンセリングが特徴。20-30代女性に圧倒的な人気を誇ります。', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 清潭洞 234-56', 4),
('d5', 'Abijou Clinic', 'DERMATOLOGY', 'トータルビューティーケア。エステと医療の融合。', '医療レベルのスキンケアとエステティックサービスを融合。リラックスしながら本格的な肌治療が受けられます。', 'https://images.unsplash.com/photo-1606166317789-d12521c7d3d7?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 狎鷗亭洞 345-67', 5),
-- PLASTIC
('p1', 'LienJang Plastic Surgery', 'PLASTIC', '江南駅直結。リーズナブルな価格で最高の技術力を提供。外国人対応チーム常駐。', '整形大国・韓国の中でもコストパフォーマンスNo.1。日本語通訳常駐で安心。ボトックスからフェイスリフトまで対応。', 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 江南大路 456', 1),
('p2', 'ID Hospital', 'PLASTIC', 'アジア最大級の美容病院。輪郭手術のスペシャリスト。', '輪郭3点セット（頬骨・エラ・オトガイ）で世界的に有名。年間数万件の手術実績を持つ大規模病院。', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 三成洞 567-89', 2),
('p3', 'Banobagi', 'PLASTIC', '「レッツ美人」公式ドクター。自然な変身をサポート。', 'テレビ番組「レッツ美人」でおなじみの実力派クリニック。自然な仕上がりにこだわった施術方針。', 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 新沙洞 678-90', 3),
('p4', 'View Plastic Surgery', 'PLASTIC', '安全第一、無事故記録更新中。胸部整形の権威。', '安全管理の徹底と高い技術力で知られる。特に豊胸手術では韓国トップクラスの実績を誇ります。', 'https://images.unsplash.com/photo-1538108149393-fbbd8189718c?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 論峴洞 789-01', 4),
('p5', 'JK Plastic Surgery', 'PLASTIC', '韓国唯一の政府認定外国人患者誘致優秀医療機関。', '政府認定の外国人対応優秀病院。40か国以上からの海外患者を受け入れた実績。多言語対応チーム完備。', 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 狎鷗亭洞 890-12', 5),
-- DENTISTRY
('t1', 'White Style Dental', 'DENTISTRY', 'インプラント、矯正歯科、審美歯科の専門医が常駐。痛くない治療を優先。', '最新のデジタル歯科技術と無痛麻酔システムを導入。インプラントからホワイトニングまでワンストップで対応。', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 三成洞 123-45', 1),
('t2', 'Minish Dental', 'DENTISTRY', 'ラミネートベニア「ミニッシュ」専門。1日で終わる審美歯科。', '独自開発のミニッシュ技術で歯を削らずに美しいスマイルラインを実現。1日で完了する時短治療。', 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 新沙洞 234-56', 2),
('t3', 'Live Dental', 'DENTISTRY', '江南・仁川に展開。透明矯正インビザラインのダイヤモンドプロバイダー。', 'インビザライン韓国トップクラスの症例数。マウスピース矯正で見えない矯正治療を提供します。', 'https://images.unsplash.com/photo-1588776814546-1ffcf4722e99?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 駅三洞 345-67', 3),
('t4', 'Good Life Dental', 'DENTISTRY', '良心的な診療と丁寧な説明。虫歯治療からインプラントまで。', '患者第一主義の温かい雰囲気。デジタルレントゲンによる正確な診断で最適な治療プランを提案。', 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=400&q=80', 'ソウル市 瑞草区 方背洞 456-78', 4),
('t5', 'Yonsei U-Line', 'DENTISTRY', '延世大学出身の医療陣。リラックスできる院内環境。', '延世大学歯科大学出身の専門医チーム。アットホームな雰囲気で緊張せず治療を受けられます。', 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=400&q=80', 'ソウル市 瑞草区 盤浦洞 567-89', 5),
-- ORIENTAL
('o1', 'Jaseng Hospital', 'ORIENTAL', '非手術的脊椎・関節治療の世界的権威。漢方薬による体質改善。', 'SCI論文350件以上の研究力。ディスクや関節痛を手術なしで治療する独自の韓方統合医療プログラム。', 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 三成洞 678-90', 1),
('o2', 'Kwangdong Hospital', 'ORIENTAL', '伝統と現代医学の融合。五行センターでのプレミアムケア。', '100年以上の歴史を持つ名門韓方病院。デトックス、ダイエット、アンチエイジングの統合プログラムが人気。', 'https://images.unsplash.com/photo-1544367563-12123d832d34?auto=format&fit=crop&w=400&q=80', 'ソウル市 瑞草区 良才洞 789-01', 2),
('o3', 'Kyunghee Univ. Hospital', 'ORIENTAL', '大学病院ならではの専門性と信頼。難治性疾患の治療。', '慶熙大学韓方医学の純粋な学術力と最新設備の融合。難しい症例にも対応できる総合韓方病院。', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80', 'ソウル市 東大門区 回基洞 890-12', 3),
('o4', 'Lee Moon Won', 'ORIENTAL', '韓方頭皮ケア・脱毛治療専門。ヘッドスパも人気。', '韓方薬と最新技術を組み合わせた頭皮治療専門。男女の薄毛治療で高い効果を発揮しています。', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 清潭洞 901-23', 4),
('o5', 'She''s Clinic', 'ORIENTAL', '女性のための韓方婦人科。更年期障害や生理不順のケア。', '女性の体質に合わせたオーダーメイド韓方処方。更年期、不妊、生理痛などの婦人科系疾患を専門的に治療。', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80', 'ソウル市 江南区 狎鷗亭洞 012-34', 5);


-- 2) PRICING (主要病院に価格データ)

-- Aureum Clinic (d1)
INSERT INTO pricing (hospital_id, treatment_name, price_krw, price_jpy, event_price, discount_percent, sort_order) VALUES
('d1', 'ピコトーニング (1回)', 45000, 15000, 35000, 22, 1),
('d1', 'オリジオ (300shot)', 350000, 80000, NULL, 0, 2),
('d1', 'ジュベルック (2cc)', 250000, 60000, 199000, 20, 3),
('d1', 'アクアピーリング', 50000, 18000, NULL, 0, 4),
('d1', 'ポテンツァ (フルフェイス)', 400000, 100000, 320000, 20, 5),
('d1', 'スキンボトックス', 80000, 25000, NULL, 0, 6);

-- Muse Clinic (d2)
INSERT INTO pricing (hospital_id, treatment_name, price_krw, price_jpy, event_price, discount_percent, sort_order) VALUES
('d2', 'ピコトーニング (1回)', 39000, 15000, NULL, 0, 1),
('d2', 'レーザートーニング', 35000, 12000, 29000, 17, 2),
('d2', 'ボトックス (額)', 60000, 20000, NULL, 0, 3),
('d2', 'ヒアルロン酸 (1cc)', 150000, 45000, NULL, 0, 4);

-- Toxnfill (d3)
INSERT INTO pricing (hospital_id, treatment_name, price_krw, price_jpy, event_price, discount_percent, sort_order) VALUES
('d3', 'ボトックス (額)', 50000, 20000, 39000, 22, 1),
('d3', 'ボトックス (エラ)', 60000, 22000, 49000, 18, 2),
('d3', 'フィラー (法令線)', 180000, 50000, NULL, 0, 3),
('d3', 'フィラー (涙袋)', 150000, 40000, 120000, 20, 4);

-- LienJang (p1)
INSERT INTO pricing (hospital_id, treatment_name, price_krw, price_jpy, event_price, discount_percent, sort_order) VALUES
('p1', 'フルフェイスボトックス', 120000, 35000, NULL, 0, 1),
('p1', '唇フィラー (1cc)', 200000, 50000, 150000, 25, 2),
('p1', '二重手術 (埋没法)', 800000, 200000, NULL, 0, 3),
('p1', '鼻整形 (プチ)', 500000, 130000, NULL, 0, 4),
('p1', 'リフトアップ糸リフト', 600000, 150000, 480000, 20, 5);

-- ID Hospital (p2)
INSERT INTO pricing (hospital_id, treatment_name, price_krw, price_jpy, event_price, discount_percent, sort_order) VALUES
('p2', '輪郭3点セット', 8000000, 2000000, NULL, 0, 1),
('p2', '鼻整形 (本格)', 3500000, 900000, NULL, 0, 2),
('p2', '目整形 (切開)', 1500000, 400000, NULL, 0, 3),
('p2', 'フェイスリフト', 5000000, 1300000, NULL, 0, 4);

-- White Style Dental (t1)
INSERT INTO pricing (hospital_id, treatment_name, price_krw, price_jpy, event_price, discount_percent, sort_order) VALUES
('t1', 'ホワイトニング', 200000, 60000, 150000, 25, 1),
('t1', 'インプラント (1本)', 1200000, 350000, NULL, 0, 2),
('t1', 'ラミネートベニア (1本)', 400000, 120000, NULL, 0, 3),
('t1', 'セラミッククラウン', 350000, 100000, NULL, 0, 4);

-- Jaseng Hospital (o1)
INSERT INTO pricing (hospital_id, treatment_name, price_krw, price_jpy, event_price, discount_percent, sort_order) VALUES
('o1', '初診 + 韓方診断', 80000, 25000, NULL, 0, 1),
('o1', '鍼治療 (1回)', 50000, 15000, NULL, 0, 2),
('o1', '推拿療法 (1回)', 60000, 18000, NULL, 0, 3),
('o1', 'デトックスプログラム (3日)', 500000, 150000, 400000, 20, 4);


-- 3) FAQS (主要病院にFAQ)

-- Aureum Clinic (d1)
INSERT INTO faqs (hospital_id, question, answer, sort_order) VALUES
('d1', '日本語で対応できますか？', 'はい、日本語通訳スタッフが常駐しております。LINEでの事前相談も日本語で対応可能です。', 1),
('d1', '施術後のダウンタイムはどれくらいですか？', 'ピコトーニングはダウンタイムなく、直後からメイクが可能です。ジュベルックは1-2日赤みが出る場合があります。', 2),
('d1', '予約はどうすればいいですか？', 'LINEまたは当サイトの予約フォームから簡単に予約できます。24時間以内にスタッフからご連絡差し上げます。', 3),
('d1', '支払い方法は？', 'クレジットカード（VISA, Mastercard, JCB, AMEX）、現金（ウォン・円）、電子決済に対応しています。', 4),
('d1', '施術前に注意することはありますか？', '日焼け止めを落とした状態でお越しください。レーザー施術の場合は2週間前から日焼けを避けてください。', 5);

-- LienJang (p1)
INSERT INTO faqs (hospital_id, question, answer, sort_order) VALUES
('p1', '空港からの送迎はありますか？', 'はい、仁川空港からの送迎サービスを提供しています。予約時にお申し付けください。', 1),
('p1', '術後のケアはどうなりますか？', '帰国後もLINEを通じてアフターケアの相談が可能です。術後の経過写真をお送りいただければ、担当医師が確認します。', 2),
('p1', 'カウンセリングは無料ですか？', 'はい、初回カウンセリングは完全無料です。オンラインでの事前カウンセリングも可能です。', 3),
('p1', '手術の場合、入院は必要ですか？', '施術内容によります。ボトックスやフィラーは日帰り可能です。手術の場合は1-2日の入院をお勧めします。', 4);

-- White Style Dental (t1)
INSERT INTO faqs (hospital_id, question, answer, sort_order) VALUES
('t1', '治療期間はどのくらいですか？', 'ホワイトニングは1回約1時間です。インプラントは3-6ヶ月の通院が必要です。短期集中プランもあります。', 1),
('t1', '痛みはありますか？', '最新の無痛麻酔システムを導入していますので、ほとんど痛みを感じません。', 2),
('t1', '保証はありますか？', 'インプラントは10年保証、セラミック補綴物は5年保証をお付けしています。', 3);

-- Jaseng Hospital (o1)
INSERT INTO faqs (hospital_id, question, answer, sort_order) VALUES
('o1', '韓方治療は安全ですか？', 'はい、当院で使用する韓方薬はすべて厳格な品質管理を通過したものです。WHO認定の安全基準に準拠しています。', 1),
('o1', '効果はどのくらいで実感できますか？', '個人差がありますが、鍼治療は1-2回で効果を感じる方が多いです。体質改善プログラムは2-4週間が目安です。', 2),
('o1', '西洋医学との併用は可能ですか？', 'はい可能です。当院は統合医療を推進しており、必要に応じて現代医学的処置も行っています。', 3);


-- 4) REVIEWS

-- Aureum Clinic (d1)
INSERT INTO reviews (hospital_id, author_name, rating, content, created_at) VALUES
('d1', 'Yuki T.', 5, '日本語対応が完璧で、とても安心して施術を受けられました。ピコトーニングの効果に大満足です！', '2026-01-20'),
('d1', 'Mika S.', 4, '院内がとても清潔で、先生の説明がわかりやすかったです。リピートしたいです。', '2026-01-15'),
('d1', 'Rina K.', 5, 'ジュベルックを受けましたが、肌のキメが劇的に改善しました。コスパ最高！', '2026-01-10'),
('d1', 'Sora N.', 5, 'ポテンツァが日本の1/3の価格で受けられました。効果も抜群で肌がツルツルです。', '2026-01-05'),
('d1', 'Kana M.', 4, '予約もLINEで簡単にでき、カウンセリングも丁寧でした。次はオリジオに挑戦したいです。', '2025-12-28');

-- LienJang (p1)
INSERT INTO reviews (hospital_id, author_name, rating, content, created_at) VALUES
('p1', 'Saki M.', 5, 'ボトックスがとても自然な仕上がりでした。日本の半額以下で驚きました。', '2026-02-01'),
('p1', 'Hana Y.', 4, '日本語通訳の方がずっと付き添ってくれて、不安なく施術できました。', '2026-01-25'),
('p1', 'Aoi F.', 5, '糸リフトを受けました。フェイスラインがシャープになって大満足です！', '2026-01-18'),
('p1', 'Mei T.', 5, '江南駅直結でアクセス最高。友人にもおすすめしたいクリニックです。', '2026-01-12');

-- ID Hospital (p2)
INSERT INTO reviews (hospital_id, author_name, rating, content, created_at) VALUES
('p2', 'Yuna W.', 5, '輪郭手術で人生が変わりました。チームの対応も最高でした。', '2026-01-30'),
('p2', 'Riko H.', 4, '大規模病院なのでシステムが整っています。待ち時間は少しありました。', '2026-01-22');

-- White Style Dental (t1)
INSERT INTO reviews (hospital_id, author_name, rating, content, created_at) VALUES
('t1', 'Mio K.', 5, 'ホワイトニングで歯が別人のように白くなりました！痛みもゼロ！', '2026-02-05'),
('t1', 'Nana S.', 4, 'インプラントの技術力が素晴らしい。日本の1/3以下の費用で受けられました。', '2026-01-28'),
('t1', 'Haruka I.', 5, 'スタッフの方々がとても親切で、治療計画もしっかり説明してくれました。', '2026-01-15');

-- Jaseng Hospital (o1)
INSERT INTO reviews (hospital_id, author_name, rating, content, created_at) VALUES
('o1', 'Tomoko A.', 5, '長年の腰痛が韓方治療で改善しました。鍼治療の技術がすごいです。', '2026-02-03'),
('o1', 'Keiko M.', 4, 'デトックスプログラムで体が軽くなりました。食事指導も参考になりました。', '2026-01-20');


-- 5) CHATBOT CONFIGS

INSERT INTO chatbot_configs (hospital_id, system_prompt, welcome_message, is_active) VALUES
('d1', 'あなたはAureum Clinicの専属AIカウンセラーです。当院は韓国ソウル江南にある皮膚科専門クリニックで、ピコトーニング、ジュベルック、オリジオ、ポテンツァなどの最新レーザー施術を得意としています。日本からのお客様に韓国美容の魅力を親切に案内してください。価格、ダウンタイム、効果について質問に答え、予約を促してください。', 'こんにちは！Aureum Clinicです✨ ピコトーニング、ジュベルック、オリジオなど、日本で話題の施術を韓国価格でご案内しています。何でもお気軽にどうぞ😊', true),
('p1', 'あなたはLienJang Plastic Surgeryの専属AIカウンセラーです。当院は韓国ソウル江南駅直結の美容外科で、ボトックス、フィラー、二重手術、鼻整形、糸リフトなどを専門としています。リーズナブルな価格と高い技術力が特徴です。外国人患者のケアに力を入れています。', 'こんにちは！LienJang美容外科です💫 江南駅直結の当院では、ボトックスから本格整形まで幅広くご対応しています。お気軽にご相談ください！', true),
('t1', 'あなたはWhite Style Dentalの専属AIカウンセラーです。当院はソウル江南にある審美歯科で、ホワイトニング、インプラント、ラミネートベニアを専門としています。最新の無痛治療技術を導入しています。', 'こんにちは！White Style Dentalです🦷 ホワイトニングやインプラントなど、美しいスマイルラインを一緒に作りましょう！何でもご質問ください😊', true),
('o1', 'あなたはJaseng Hospitalの専属AIカウンセラーです。当院は韓方（漢方）と現代医学を融合した統合医療病院で、特に脊椎・関節の非手術治療で世界的に有名です。鍼治療、推拿、韓方薬、デトックスプログラムなどを提供しています。', 'こんにちは！Jaseng韓方病院です🌿 腰痛、関節痛の治療からデトックスまで、韓方の力で健康と美をサポートします。何でもお気軽にどうぞ！', true);
