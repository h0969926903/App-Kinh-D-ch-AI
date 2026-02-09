// api/interpret.js - IMPROVED VERSION
import crypto from 'crypto';

// Simple in-memory rate limiter (production nên dùng Redis)
const rateLimitMap = new Map();

// Rate limit helper
function checkRateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  
  // Lọc các request trong time window
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    const oldestRequest = recentRequests[0];
    const waitTime = Math.ceil((windowMs - (now - oldestRequest)) / 1000);
    return { limited: true, waitTime };
  }
  
  // Thêm request mới
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  
  // Cleanup old entries
  if (rateLimitMap.size > 10000) {
    const entries = Array.from(rateLimitMap.entries());
    entries.slice(0, 5000).forEach(([key]) => rateLimitMap.delete(key));
  }
  
  return { limited: false };
}

// Validation helpers
function validateQuestion(question) {
  if (!question || typeof question !== 'string') {
    return { valid: false, error: 'Câu hỏi không hợp lệ' };
  }
  
  const trimmed = question.trim();
  
  if (trimmed.length < 5) {
    return { valid: false, error: 'Câu hỏi quá ngắn (tối thiểu 5 ký tự)' };
  }
  
  if (trimmed.length > 500) {
    return { valid: false, error: 'Câu hỏi quá dài (tối đa 500 ký tự)' };
  }
  
  // Check for suspicious patterns
  if (/<script|javascript:|onerror=/i.test(trimmed)) {
    return { valid: false, error: 'Câu hỏi chứa nội dung không hợp lệ' };
  }
  
  return { valid: true, question: trimmed };
}

function validateDatetime(datetime) {
  if (!datetime) {
    return { valid: false, error: 'Thiếu thông tin thời gian' };
  }
  
  const date = new Date(datetime);
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Thời gian không hợp lệ' };
  }
  
  // Check if too far in past (> 100 years)
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
  
  if (date < hundredYearsAgo) {
    return { valid: false, error: 'Thời gian quá xa trong quá khứ' };
  }
  
  // Check if too far in future (> 10 years)
  const tenYearsLater = new Date();
  tenYearsLater.setFullYear(tenYearsLater.getFullYear() + 10);
  
  if (date > tenYearsLater) {
    return { valid: false, error: 'Thời gian quá xa trong tương lai' };
  }
  
  return { valid: true };
}

// Sanitize AI response
function sanitizeResponse(text) {
  if (!text) return '';
  
  // Remove potential HTML tags
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

// Optimized prompt (shorter = save tokens)
function createPrompt(data) {
  return `Chuyên gia Kinh Dịch 30 năm luận quẻ: "${data.question}"

Quẻ ${data.mainHexName}→${data.changedHexName}|Động:${data.changingLine}|Thế:${data.shiYao},Ứng:${data.yingYao}|${data.mainHexPalace},${data.mainHexElement}|${data.datetime}

10 bước văn xuôi 1200-1500 từ:
1.${data.mainHexName}:Tổng quát,Thượng/Hạ
2.Hào ${data.changingLine}:Âm/Dương,tâm-thế
3.${data.changedHexName}:Xu hướng
4.Thế&Ứng:Sinh/khắc
5.Lục Thân:2-3 quan trọng
6.Hổ quái:Ẩn
7.Nhật/Nguyệt:Vượng/tù
8.Hợp/Xung:Thời gian
9.Thần sát:Nếu có
10.Kết luận:1-3,3-6,6-12 tháng-Cụ thể,dứt khoát

Văn xuôi,KHÔNG markdown/tiêu đề,tập trung điểm chính,xấu→chỉ rõ+cách khắc,tốt→mức độ+giữ thế nào.`;
}

// Retry logic với exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Nếu rate limit từ OpenAI, retry sau
      if (response.status === 429 && i < maxRetries - 1) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '2');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      // Nếu là lần cuối, throw error
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Phương thức không được hỗ trợ',
      hint: 'Vui lòng sử dụng POST request'
    });
  }

  try {
    // ✅ 1. SERVER-SIDE RATE LIMITING
    const identifier = req.headers['x-forwarded-for'] || 
                      req.socket.remoteAddress || 
                      'unknown';
    
    const rateLimit = checkRateLimit(identifier, 5, 60000); // 5 requests/phút
    
    if (rateLimit.limited) {
      return res.status(429).json({ 
        error: `Vui lòng chờ ${rateLimit.waitTime} giây trước khi bốc quẻ tiếp`,
        hint: 'Giới hạn: 5 lần bốc quẻ mỗi phút',
        retryAfter: rateLimit.waitTime
      });
    }

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

    // ✅ 2. INPUT VALIDATION ĐẦY ĐỦ
    const questionValidation = validateQuestion(question);
    if (!questionValidation.valid) {
      return res.status(400).json({ 
        error: questionValidation.error,
        hint: 'Hãy nhập câu hỏi từ 5-500 ký tự'
      });
    }

    const datetimeValidation = validateDatetime(datetime);
    if (!datetimeValidation.valid) {
      return res.status(400).json({ 
        error: datetimeValidation.error,
        hint: 'Hãy chọn thời gian hợp lệ'
      });
    }

    // Validate hexagram data
    if (!mainHexName || !changedHexName || !changingLine) {
      return res.status(400).json({ 
        error: 'Thông tin quẻ không đầy đủ',
        hint: 'Vui lòng bốc quẻ lại'
      });
    }

    // Get API key
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Hệ thống đang bảo trì',
        hint: 'Vui lòng thử lại sau'
      });
    }

    // ✅ 7. OPTIMIZED PROMPT (tiết kiệm tokens)
    const prompt = createPrompt({
      question: questionValidation.question,
      datetime,
      mainHexName,
      mainHexPalace,
      mainHexElement,
      changedHexName,
      changingLine,
      shiYao,
      yingYao
    });

    console.log(`[${new Date().toISOString()}] Request from ${identifier}`);

    // ✅ 3. RETRY LOGIC
    const openaiResponse = await fetchWithRetry(
      'https://api.openai.com/v1/chat/completions',
      {
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
              content: 'Chuyên gia Kinh Dịch 30 năm. Văn xuôi chi tiết.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4096,
          temperature: 0.7
        })
      },
      3 // retry 3 lần
    );

    const openaiData = await openaiResponse.json();

    // ✅ 4. ERROR MESSAGES CHI TIẾT
    if (!openaiResponse.ok) {
      console.error('OpenAI Error:', openaiData);
      
      const errorMessages = {
        401: 'API key không hợp lệ. Vui lòng liên hệ quản trị viên.',
        429: 'Hệ thống đang quá tải. Vui lòng thử lại sau 1 phút.',
        500: 'Dịch vụ AI tạm thời gián đoạn. Vui lòng thử lại.',
        503: 'Dịch vụ AI đang bảo trì. Vui lòng thử lại sau.'
      };
      
      return res.status(openaiResponse.status).json({ 
        error: errorMessages[openaiResponse.status] || 'Lỗi từ dịch vụ AI',
        hint: 'Nếu lỗi tiếp tục, vui lòng liên hệ hỗ trợ',
        details: openaiData.error?.message
      });
    }

    let interpretation = openaiData.choices?.[0]?.message?.content;

    if (!interpretation) {
      return res.status(500).json({ 
        error: 'Không nhận được lời giải từ AI',
        hint: 'Vui lòng thử bốc quẻ lại'
      });
    }

    // ✅ 9. SANITIZE OUTPUT
    interpretation = sanitizeResponse(interpretation);

    console.log(`[${new Date().toISOString()}] Success - Tokens: ${openaiData.usage?.total_tokens || 'N/A'}`);

    // Return với thông tin usage
    return res.status(200).json({ 
      interpretation,
      metadata: {
        tokens: openaiData.usage?.total_tokens,
        model: 'gpt-3.5-turbo',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Server Error:', error);
    
    // ✅ 4. ERROR HANDLING CỤ THỂ
    const errorMessages = {
      'ECONNREFUSED': 'Không thể kết nối đến dịch vụ AI',
      'ETIMEDOUT': 'Kết nối bị timeout. Vui lòng thử lại',
      'ENOTFOUND': 'Không tìm thấy dịch vụ AI',
    };
    
    const errorType = error.code || 'UNKNOWN';
    const errorMessage = errorMessages[errorType] || 'Lỗi hệ thống không xác định';
    
    return res.status(500).json({ 
      error: errorMessage,
      hint: 'Vui lòng thử lại sau. Nếu lỗi tiếp tục, liên hệ hỗ trợ.',
      errorCode: errorType
    });
  }
}
