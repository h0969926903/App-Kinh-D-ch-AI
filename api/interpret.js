// api/interpret.js - Backend WITH AUTHENTICATION
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Phiên đăng nhập hết hạn' });
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) return res.status(404).json({ error: 'Không tìm thấy user' });

    if (profile.credits_remaining <= 0 && profile.subscription_tier === 'free') {
      return res.status(403).json({ error: 'Hết lượt miễn phí' });
    }

    const { question, datetime, mainHexName, mainHexNumber, mainHexPalace, mainHexElement, changedHexName, changedHexNumber, changingLine, shiYao, yingYao } = req.body;

    if (!question || !mainHexName) return res.status(400).json({ error: 'Thiếu thông tin' });

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Server chưa cấu hình' });

    const prompt = `Chuyên gia Kinh Dịch 30 năm: "${question}"
Quẻ ${mainHexName}→${changedHexName}|Động:${changingLine}|Thế:${shiYao},Ứng:${yingYao}|${mainHexPalace},${mainHexElement}
10 bước văn xuôi 1200-1500 từ chi tiết.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Chuyên gia Kinh Dịch 30 năm. Văn xuôi chi tiết.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    const openaiData = await openaiRes.json();
    if (!openaiRes.ok) return res.status(500).json({ error: 'Lỗi AI: ' + (openaiData.error?.message || 'Unknown') });

    const interpretation = openaiData.choices?.[0]?.message?.content;
    if (!interpretation) return res.status(500).json({ error: 'Không nhận được lời giải' });

    await supabase.from('divinations').insert([{
      user_id: user.id, question, datetime: new Date(datetime), main_hex_number: mainHexNumber,
      main_hex_name: mainHexName, changed_hex_number: changedHexNumber, changed_hex_name: changedHexName,
      changing_line: changingLine, shi_yao: shiYao, ying_yao: yingYao, interpretation,
      tokens_used: openaiData.usage?.total_tokens
    }]);

    if (profile.subscription_tier === 'free') {
      await supabase.rpc('decrement_credits', { user_id: user.id });
    }

    return res.status(200).json({ 
      interpretation,
      credits_remaining: profile.subscription_tier === 'free' ? Math.max(0, profile.credits_remaining - 1) : 999
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Lỗi: ' + error.message });
  }
}
