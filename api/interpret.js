// api/interpret.js - FINAL VERSION with Service Role Key

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const SUPABASE_URL = 'https://qqadeyowwdslkkuesdxg.supabase.co';
    
    // Anon key - dùng để verify user token
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxYWRleW93d2RzbGtrdWVzZHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjQ4NTUsImV4cCI6MjA4NjE0MDg1NX0.2oa-3MO-IkITrrgtXY3PWBPrFw8y7C2b6zTO7HAR_zE';
    
    // Service role key - dùng để đọc/ghi database (bypass RLS)
    const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxYWRleW93d2RzbGtrdWVzZHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU2NDg1NSwiZXhwIjoyMDg2MTQwODU1fQ.7TOe6e7C4SjtuK57_MsEH_z_3u_IxBF7bNQHXQkmSw0';

    // Client để verify token user
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Client để đọc/ghi database (bypass RLS)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
    }

    // Lấy profile dùng admin client (bypass RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Tự động tạo profile nếu chưa có
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
        return res.status(500).json({ error: 'Lỗi tạo profile: ' + (createError?.message || 'Unknown') });
      }

      // Dùng profile mới tạo
      var profileData = newProfile;
    } else {
      var profileData = profile;
    }

    // Check credits
    if (profileData.credits_remaining <= 0 && profileData.subscription_tier === 'free') {
      return res.status(403).json({ error: 'Hết lượt miễn phí. Vui lòng nâng cấp!' });
    }

    // Lấy data từ request
    const {
      question, datetime, mainHexName, mainHexNumber,
      mainHexPalace, mainHexElement, changedHexName,
      changedHexNumber, changingLine, shiYao, yingYao
    } = req.body;

    if (!question || !mainHexName) {
      return res.status(400).json({ error: 'Thiếu thông tin' });
    }

    // Gọi OpenAI
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server chưa cấu hình OpenAI' });
    }

    const prompt = `Chuyên gia Kinh Dịch 30 năm: "${question}"
Quẻ ${mainHexName}→${changedHexName}|Động:${changingLine}|Thế:${shiYao},Ứng:${yingYao}|${mainHexPalace},${mainHexElement}
Luận giải chi tiết 1200-1500 từ, văn xuôi, 10 bước.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Bạn là chuyên gia Kinh Dịch 30 năm kinh nghiệm. Luận giải chi tiết bằng văn xuôi.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    const openaiData = await openaiRes.json();

    if (!openaiRes.ok) {
      return res.status(500).json({ error: 'Lỗi AI: ' + (openaiData.error?.message || 'Unknown') });
    }

    const interpretation = openaiData.choices?.[0]?.message?.content;
    if (!interpretation) {
      return res.status(500).json({ error: 'Không nhận được lời giải từ AI' });
    }

    // Lưu vào database
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

    // Giảm credits
    if (profileData.subscription_tier === 'free') {
      await supabaseAdmin.rpc('decrement_credits', { user_id: user.id });
    }

    return res.status(200).json({
      interpretation,
      credits_remaining: profileData.subscription_tier === 'free'
        ? Math.max(0, profileData.credits_remaining - 1)
        : 999
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
};
