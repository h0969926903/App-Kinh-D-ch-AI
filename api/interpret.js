// api/interpret.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get data from request
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
    if (!question || !mainHexName) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Get API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment');
      return res.status(500).json({ error: 'Server chưa cấu hình API key' });
    }

    // Create prompt
    const prompt = `Bạn là chuyên gia Kinh Dịch 30 năm, luận quẻ cho: "${question}"

QUẾ: ${mainHexName} → ${changedHexName} | Động: hào ${changingLine} | Thế: ${shiYao}, Ứng: ${yingYao} | Cung ${mainHexPalace}, hành ${mainHexElement} | Giờ: ${datetime}

Luận 10 bước (KHÔNG viết tiêu đề, văn xuôi liền mạch, 1200-1500 từ):

1. Quẻ ${mainHexName}: Ý nghĩa tổng quát, áp dụng vào câu hỏi
2. Hào ${changingLine} động: Âm/Dương, tâm-thế-sự
3. ${changedHexName}: Xu hướng, so sánh tiến/thoái
4. Thế ${shiYao} & Ứng ${yingYao}: Sinh/khắc/hòa
5. Lục Thân: Chọn 2-3 liên quan nhất
6. Hổ quái: Áp lực ẩn
7. Nhật/Nguyệt: Hào vượng/tù/tử
8. Hợp/Xung: Ảnh hưởng thời gian
9. Thần sát: Nếu có
10. Kết luận: 1-3 tháng, 3-6 tháng, 6-12 tháng - Thời gian cụ thể, dứt khoát

YÊU CẦU: Văn xuôi, KHÔNG markdown, KHÔNG "Bước 1/2/3", tập trung điểm chính.`;

    console.log('Calling OpenAI API...');

    // Call OpenAI
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
            content: 'Bạn là chuyên gia Kinh Dịch với 30 năm kinh nghiệm. Viết văn xuôi chi tiết.'
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

    console.log('Success! Returning interpretation...');

    // Return success
    return res.status(200).json({ 
      interpretation,
      usage: openaiData.usage
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Lỗi server: ' + error.message 
    });
  }
}
