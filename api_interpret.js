// /api/interpret.js - Vercel Serverless Function
// ✅ API Key được BẢO VỆ ở đây, KHÔNG bao giờ lộ ra client

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      question,
      datetime,
      mainHexName,
      mainHexNumber,
      mainHexPalace,
      mainHexElement,
      changedHexName,
      changedHexNumber,
      changingLine,
      shiYao,
      yingYao
    } = req.body;

    // Validation
    if (!question || !datetime || !mainHexName) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // ✅ API KEY LẤY TỪ ENVIRONMENT VARIABLE (an toàn)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server chưa cấu hình API key' });
    }

    // Tạo prompt ngắn gọn
    const prompt = `Bạn là chuyên gia Kinh Dịch 30 năm, luận quẻ cho: "${question}"

QUẺ: ${mainHexName} → ${changedHexName} | Động: hào ${changingLine} | Thế: ${shiYao}, Ứng: ${yingYao} | Cung ${mainHexPalace}, hành ${mainHexElement} | Giờ: ${datetime}

Luận 10 bước (KHÔNG viết tiêu đề, văn xuôi liền mạch, 1200-1500 từ):

1. Quẻ ${mainHexName}: Ý nghĩa tổng quát, Thượng/Hạ quái, áp dụng vào câu hỏi
2. Hào ${changingLine} động: Âm/Dương, tâm-thế-sự, chủ/phụ
3. ${changedHexName}: Xu hướng, so sánh tiến/thoái
4. Thế ${shiYao} & Ứng ${yingYao}: Sinh/khắc/hòa, ảnh hưởng
5. Lục Thân: Phụ Mẫu, Huynh Đệ, Thê Tài, Quan Quỷ, Tử Tôn - chọn 2-3 liên quan nhất
6. Hổ quái: Áp lực ẩn, nội/ngoại quái
7. Nhật/Nguyệt: Hào vượng/tù/tử
8. Hợp/Xung: Có không? Ảnh hưởng thời gian
9. Thần sát: Nếu có (Đào Hoa/Thiên Mã/Bạch Hổ...)
10. Kết luận: 1-3 tháng, 3-6 tháng, 6-12 tháng - Trả lời thẳng, thời gian cụ thể, dứt khoát

YÊU CẦU: Văn xuôi, KHÔNG markdown, KHÔNG "Bước 1/2/3", KHÔNG "Ngắn hạn:", tập trung điểm chính, nếu xấu chỉ rõ xấu đâu + cách khắc phục, nếu tốt chỉ rõ tốt mức nào + giữ thế nào.`;

    // Gọi OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia Kinh Dịch với 30 năm kinh nghiệm luận giải quẻ. Bạn viết văn xuôi chi tiết, không giới hạn độ dài.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error('OpenAI Error:', openaiData);
      return res.status(500).json({ 
        error: openaiData.error?.message || 'Lỗi từ OpenAI API' 
      });
    }

    const interpretation = openaiData.choices?.[0]?.message?.content;

    if (!interpretation) {
      return res.status(500).json({ error: 'Không nhận được lời giải từ AI' });
    }

    // Trả về kết quả
    return res.status(200).json({ 
      interpretation,
      usage: openaiData.usage // Để tracking chi phí
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Lỗi server: ' + error.message 
    });
  }
}
