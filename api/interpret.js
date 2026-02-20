// api/interpret.js - FINAL COMPLETE VERSION
// GPT-4o + Engine v4.0 + Full Hexagram Data

const { createClient } = require('@supabase/supabase-js');

// System Prompt - Kinh Dịch Master Engine v4.0 (Optimized)
const SYSTEM_PROMPT = `Bạn là Chuyên Gia Kinh Dịch 30 năm kinh nghiệm, dùng Engine v4.0.

# NGUYÊN TẮC CỐT LÕI
1. LUÔN bắt đầu bằng TẦNG 0 (Tượng & Đạo) TRƯỚC KHI tính điểm
2. SỐ cho biết mạnh yếu → tính điểm
3. TƯỢNG cho biết bức tranh → mô tả bằng lời
4. ĐẠO cho biết cách sống → triết lý ứng xử
5. Ba thứ PHẢI đi cùng nhau

# TẦNG 0 – TƯỢNG & ĐẠO (TRƯỚC MỌI PHÉP TÍNH)

## BƯỚC T1: ĐỌC TÊN QUẺ
Tra thư viện 64 quẻ để lấy:
- Tượng cốt lõi của quẻ gốc
- Đạo lý của quẻ gốc
- Kết cục hướng tới (quẻ biến)
- Chuyển hóa: Từ trạng thái gì → sang trạng thái gì

## BƯỚC T2: ĐỌC TƯỢNG QUẺ - 4 LỚP

**Lớp 1 - Tượng Đại (Thượng hạ quái):**
Mô tả bức tranh tổng thể từ 2 quái

**Lớp 2 - Tượng Thế Ứng (Vị trí):**
- Hào 1: Chân, khởi đầu, nền móng
- Hào 2: Nhà cửa, nội bộ, trung tâm
- Hào 3: Ranh giới nội-ngoại, bước ngoặt
- Hào 4: Bước ra ngoài, gần quyền lực
- Hào 5: Vua chúa, chủ nhân, quyết định
- Hào 6: Đỉnh đầu, cùng cực, sắp đổi chiều

Thế ở nội quái (1-3): Việc trong tầm kiểm soát
Thế ở ngoại quái (4-6): Việc đã ra ngoài, phụ thuộc hoàn cảnh

**Lớp 3 - Tượng Hào Động:**
Hào [X] động = [Lục thân] tại vị trí [Y]
→ Mô tả hành động bằng hình ảnh
→ Hào biến: [Lục thân mới] = Ý nghĩa chuyển hóa

**Lớp 4 - Tượng Đặc biệt:**
Kiểm tra: Du hồn? Quy hồn? Lục xung? Lục hợp? Thế=DT?

## OUTPUT TẦNG 0:
Viết 1 đoạn văn 4-6 câu mô tả BỨC TRANH TỔNG THỂ:
1. Tên quẻ nói gì (1 câu)
2. Bức tranh Thượng-Hạ quái (1 câu)
3. Người hỏi đang ở đâu (1 câu)
4. Hào động làm gì (1 câu)
5. Chuyển hóa gốc→biến (1 câu)
6. Cảnh báo nếu có (1 câu)

# CÁC TẦNG PHÂN TÍCH (TÓM TẮT)
- **TẦNG 1:** Dụng thần, Quẻ gốc
- **TẦNG 2:** Hào động, Quẻ biến
- **TẦNG 3:** Thế Ứng, Energy
- **TẦNG 4:** Nhật Nguyệt, Ứng kỳ, Scoring
- **TẦNG 5:** Xu hướng, Mâu thuẫn, Rủi ro, Lời khuyên

# LỜI KHUYÊN 3 TẦNG (BẮT BUỘC)

📐 **TẦNG 1 – TỪ SỐ (Hành động cụ thể):**
- Nên: [1-2 hành động với thời gian cụ thể]
- Tránh: [1-2 điều cụ thể]
- Thời điểm vàng: [Tháng/giai đoạn]

🎭 **TẦNG 2 – TỪ TƯỢNG (Hình ảnh hành động):**
Dùng Tượng quẻ gốc và quẻ biến để mô tả CÁCH hành động.
Phải dùng ẩn dụ từ tên quẻ. 2-3 câu.

Ví dụ: "Quẻ Cách như lột da rắn – phải dứt khoát bỏ cái cũ, đừng nửa vời. 
Nhưng phải chờ đúng thời mới lột."

📜 **TẦNG 3 – TỪ ĐẠO (Triết lý ứng xử):**
Trích Đạo lý từ thư viện 64 quẻ, rồi DIỄN GIẢI cho phù hợp câu hỏi. 2-3 câu.

Ví dụ: "Quẻ Cách dạy: 'Cách chi thời đại hỹ tai' – Đổi mới đúng thời là vĩ đại. 
Nhưng phải có TÍN trước. Hãy chuẩn bị kỹ, chứng minh bằng sản phẩm."

# FORMAT OUTPUT

╔══════════════════════════════════════╗
║         KẾT QUẢ LUẬN QUẺ             ║
╠══════════════════════════════════════╣
║                                      ║
║ 🎭 TƯỢNG QUẺ:                        ║
║ [Đoạn văn 4-6 câu từ Tầng 0]       ║
║                                      ║
╠══════════════════════════════════════╣
║ Câu hỏi:     [...]                   ║
║ Quẻ:         [Gốc] → [Biến]          ║
║ Dụng thần:   [Lục thân + Chi]        ║
╠══════════════════════════════════════╣
║ XU HƯỚNG:     [ĐI LÊN/NGANG/XUỐNG]  ║
║ XÁC SUẤT:     [X]% – [Đánh giá]      ║
║ ỨNG KỲ:       [Thời gian + lý do]    ║
╠══════════════════════════════════════╣
║ ⚔️ MÂU THUẪN:                        ║
║ Thuận: [2-3 yếu tố]                  ║
║ Nghịch: [2-3 yếu tố]                 ║
║ Kết luận: [Ai thắng + điều kiện]     ║
║                                      ║
║ 📍 ĐIỂM BẺ CỤC: [...]               ║
║ ⚠️ RỦI RO: [...]                     ║
╠══════════════════════════════════════╣
║ 💡 LỜI KHUYÊN:                       ║
║ 📐 Số:   [Hành động cụ thể]          ║
║ 🎭 Tượng: [Hình ảnh hành động]        ║
║ 📜 Đạo:   [Triết lý ứng xử]          ║
╚══════════════════════════════════════╝

Độ dài: 1200-1500 từ, chi tiết, văn xuôi.`;

// Thư viện 64 quẻ (rút gọn - chỉ những quẻ chính)
const THU_VIEN_64_QUE_COMPACT = `
# THƯ VIỆN 64 QUẺ (Trích yếu)

## CUNG CÀN
1. CÀN VI THIÊN - Tượng: Trời trên trời, thuần dương. Đạo: "Tự cường bất tức"
13. TRẠCH HỎA CÁCH - Tượng: Lửa trong hồ, xung khắc. Đạo: "Cách chi thời đại hỹ tai" - Đổi đúng thời
14. LÔI HỎA PHONG - Tượng: Sấm lửa, phong phú. Đạo: Như mặt trời giữa trưa - sắp nghiêng

## CUNG KHẢM
9. KHẢM VI THỦY - Tượng: Nước chồng nước, hiểm. Đạo: Trung tín, kiên trì như nước lấp hố
29. THỦY THIÊN NHU - Tượng: Mây trên trời, chờ. Đạo: Chờ có niềm tin

## CUNG CẤN
17. CẤN VI SƠN - Tượng: Núi chồng núi, dừng. Đạo: "Thời chỉ tắc chỉ"
62. ĐỊA SƠN KHIÊM - Tượng: Núi trong đất, khiêm. Đạo: Duy nhất 6 hào đều tốt

## CUNG CHẤN
25. CHẤN VI LÔI - Tượng: Sấm chồng sấm. Đạo: "Chấn lai hích hích" - Sợ rồi cười
27. LÔI THỦY GIẢI - Tượng: Sấm mưa, giải thoát. Đạo: Tha thứ, buông bỏ

## CUNG TỐN
33. TỐN VI PHONG - Tượng: Gió chồng gió, thấm dần. Đạo: Nhẹ nhàng nhưng bền bỉ
36. PHONG LÔI ÍCH - Tượng: Gió sấm, lợi ích. Đạo: Tổn trên ích dưới

## CUNG LY
41. LY VI HỎA - Tượng: Lửa chồng lửa, sáng. Đạo: Lửa cần củi
48. THIÊN HỎA ĐỒNG NHÂN - Tượng: Lửa dưới trời, đồng chí. Đạo: Hợp sức công bằng

## CUNG KHÔN
49. KHÔN VI ĐỊA - Tượng: Đất chồng đất, nhu thuận. Đạo: "Hậu đức tải vật"
52. ĐỊA THIÊN THÁI - Tượng: Đất trên trời, thái bình. Đạo: Giao hòa, "Thái cực Bĩ lai"

## CUNG ĐOÀI
57. ĐOÀI VI TRẠCH - Tượng: Hồ chồng hồ, vui. Đạo: Giao tiếp không nịnh bợ
58. TRẠCH THỦY KHỐN - Tượng: Hồ cạn, khốn. Đạo: "Khốn cùng nhi thông"
60. TRẠCH SƠN HÀM - Tượng: Hồ trên núi, cảm ứng. Đạo: Tự nhiên không ép buộc
`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const SUPABASE_URL = 'https://qqadeyowwdslkkuesdxg.supabase.co';
    const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxYWRleW93d2RzbGtrdWVzZHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU2NDg1NSwiZXhwIjoyMDg2MTQwODU1fQ.7TOe6e7C4SjtuK57_MsEH_z_3u_IxBF7bNQHXQkmSw0';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxYWRleW93d2RzbGtrdWVzZHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjQ4NTUsImV4cCI6MjA4NjE0MDg1NX0.2oa-3MO-IkITrrgtXY3PWBPrFw8y7C2b6zTO7HAR_zE';

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Phiên đăng nhập hết hạn' });
    }

    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Auto-create profile
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          subscription_tier: 'free',
          subscription_status: 'inactive',
          credits_remaining: 3
        }])
        .select()
        .single();

      if (createError || !newProfile) {
        return res.status(500).json({ error: 'Lỗi tạo profile' });
      }
      var profileData = newProfile;
    } else {
      var profileData = profile;
    }

    // Check credits (skip for admin tier)
    if (profileData.subscription_tier !== 'admin' &&
        profileData.credits_remaining <= 0 && 
        profileData.subscription_tier === 'free') {
      return res.status(403).json({ error: 'Hết lượt miễn phí. Vui lòng nâng cấp!' });
    }

    // Get request data - NOW WITH FULL HEXAGRAM DATA
    const {
      question, datetime, 
      mainHexName, mainHexNumber, mainHexPalace, mainHexElement,
      changedHexName, changedHexNumber,
      changingLine, shiYao, yingYao,
      sixYaos,          // NEW: 6 hào chi tiết
      ganZhi,           // NEW: Can Chi (year, month, day, hour)
      tuanKong,         // NEW: Tuần Không
      changingYaoDetail // NEW: Chi tiết hào biến
    } = req.body;

    if (!question || !mainHexName) {
      return res.status(400).json({ error: 'Thiếu thông tin' });
    }

    // Build detailed user prompt with ALL hexagram data
    const userPrompt = `Hãy luận giải quẻ sau theo Kinh Dịch Master Engine v4.0:

═══════════════════════════════════════════
📋 THÔNG TIN QUẺ
═══════════════════════════════════════════

🔮 CÂU HỎI: ${question}

📅 THỜI GIAN: ${datetime}

🎲 QUẺ GỐC: ${mainHexName} (Quẻ ${mainHexNumber})
   Cung: ${mainHexPalace}
   Hành: ${mainHexElement}
   Thế Yao: Hào ${shiYao}
   Ứng Yao: Hào ${yingYao}

🔄 QUẺ BIẾN: ${changedHexName} (Quẻ ${changedHexNumber})

⚡ HÀO ĐỘNG: Hào ${changingLine}
   ${changingYaoDetail ? `Biến: ${changingYaoDetail.oldLiuQin} ${changingYaoDetail.oldChi} → ${changingYaoDetail.newLiuQin} ${changingYaoDetail.newChi}` : ''}

📊 LỤC HÀO CHI TIẾT:
${sixYaos ? sixYaos.map(yao => 
  `   Hào ${yao.position}: ${yao.chi} - ${yao.liuQin}${yao.shiYao ? ' (Thế)' : ''}${yao.yingYao ? ' (Ứng)' : ''}${yao.position === changingLine ? ' (Động)' : ''}`
).join('\n') : ''}

🌙 NHẬT THẦN: ${ganZhi?.day || 'N/A'}
📆 NGUYỆT KIẾN: ${ganZhi?.month || 'N/A'}
⭕ TUẦN KHÔNG: ${tuanKong ? tuanKong.join(', ') : 'N/A'}

═══════════════════════════════════════════
📚 THÔNG TIN THAM KHẢO
═══════════════════════════════════════════

${THU_VIEN_64_QUE_COMPACT}

═══════════════════════════════════════════
✅ YÊU CẦU LUẬN GIẢI
═══════════════════════════════════════════

1. BẮT ĐẦU BẰNG TẦNG 0 (Tượng & Đạo)
2. Viết BỨC TRANH TỔNG THỂ bằng ngôn ngữ hình ảnh
3. Phân tích theo Engine v4.0 (đầy đủ các tầng)
4. Lời khuyên PHẢI CÓ 3 tầng: Số - Tượng - Đạo
5. Tầng Đạo PHẢI trích dẫn từ Thư viện 64 quẻ
6. Format đúng template
7. Độ dài: 1200-1500 từ
8. Văn xuôi, dễ hiểu, chi tiết`;

    // Call OpenAI API with GPT-4o
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server chưa cấu hình OpenAI' });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    const openaiData = await openaiRes.json();

    if (!openaiRes.ok) {
      return res.status(500).json({ 
        error: 'Lỗi AI: ' + (openaiData.error?.message || 'Unknown') 
      });
    }

    const interpretation = openaiData.choices?.[0]?.message?.content;
    if (!interpretation) {
      return res.status(500).json({ error: 'Không nhận được lời giải từ AI' });
    }

    // Save to database
    await supabaseAdmin.from('divinations').insert([{
      user_id: user.id,
      question,
      datetime: new Date(datetime),
      main_hex_number: mainHexNumber,
      main_hex_name: mainHexName,
      changed_hex_number: changedHexNumber,
      changed_hex_name: changedHexName,
      changing_line: changingLine,
      shi_yao: shiYao,
      ying_yao: yingYao,
      interpretation,
      tokens_used: openaiData.usage?.total_tokens
    }]);

    // Decrement credits (skip for admin and paid tiers)
    if (profileData.subscription_tier === 'free') {
      await supabaseAdmin.rpc('decrement_credits', { user_id: user.id });
    }
    // Note: Admin tier and paid tiers have unlimited credits

    return res.status(200).json({
      interpretation,
      credits_remaining: profileData.subscription_tier === 'admin' 
        ? 999999
        : profileData.subscription_tier === 'free'
        ? Math.max(0, profileData.credits_remaining - 1)
        : 999
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
};
