// lib/hexagram-engine.js - KINH DỊCH CALCULATION ENGINE v1.0
// Tính toán đầy đủ: Quẻ gốc, Quẻ biến, Lục thân, Thế Ứng, Nhật Nguyệt, Tuần Không

// ==================== LUNAR CALENDAR ====================
// Chuyển đổi Dương lịch → Âm lịch (thuật toán đơn giản hóa)
function solarToLunar(year, month, day) {
  // Simplified lunar calendar conversion
  // Sử dụng offset cố định (chính xác ~85%)
  const lunarMonthDays = [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30];
  const lunarYearDays = lunarMonthDays.reduce((a, b) => a + b, 0);
  
  // Base date: 2000-01-01 = Lunar 1999-11-25
  const baseDate = new Date(2000, 0, 1);
  const inputDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((inputDate - baseDate) / (1000 * 60 * 60 * 24));
  
  // Tính năm âm lịch
  let lunarYear = 1999 + Math.floor(diffDays / 365);
  
  // Tính tháng âm lịch (đơn giản hóa)
  let remainDays = diffDays % 365;
  let lunarMonth = 1;
  for (let i = 0; i < 12; i++) {
    if (remainDays < lunarMonthDays[i]) {
      lunarMonth = i + 1;
      break;
    }
    remainDays -= lunarMonthDays[i];
  }
  
  let lunarDay = remainDays + 1;
  
  return { year: lunarYear, month: lunarMonth, day: lunarDay };
}

// ==================== CAN CHI (GANZHI) ====================
const THIEN_CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhám', 'Quý'];
const DIA_CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

function getYearGanZhi(year) {
  const canIndex = (year - 4) % 10;
  const chiIndex = (year - 4) % 12;
  return THIEN_CAN[canIndex] + ' ' + DIA_CHI[chiIndex];
}

function getMonthGanZhi(lunarMonth, yearCan) {
  // Tháng Can theo năm Can
  const monthCanBase = ['Bính', 'Mậu', 'Canh', 'Nhám', 'Giáp'];
  const yearCanIndex = THIEN_CAN.indexOf(yearCan.split(' ')[0]);
  const baseIndex = Math.floor(yearCanIndex / 2);
  const monthCanIndex = (baseIndex * 2 + lunarMonth - 1) % 10;
  const monthCan = THIEN_CAN[monthCanIndex];
  
  // Tháng Chi cố định: Dần=1, Mão=2, ...
  const monthChiIndex = (lunarMonth + 1) % 12;
  const monthChi = DIA_CHI[monthChiIndex];
  
  return monthCan + ' ' + monthChi;
}

function getDayGanZhi(year, month, day) {
  // Tính từ một ngày gốc: 1900-01-01 = Giáp Tuất
  const baseDate = new Date(1900, 0, 1);
  const baseGanIndex = 0; // Giáp
  const baseChiIndex = 10; // Tuất
  
  const inputDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((inputDate - baseDate) / (1000 * 60 * 60 * 24));
  
  const canIndex = (baseGanIndex + diffDays) % 10;
  const chiIndex = (baseChiIndex + diffDays) % 12;
  
  return THIEN_CAN[canIndex] + ' ' + DIA_CHI[chiIndex];
}

function getHourGanZhi(hour, dayCan) {
  // Giờ Chi cố định theo giờ
  const hourChiMap = {
    23: 0, 0: 0, 1: 0,      // Tý
    2: 1, 3: 1,             // Sửu
    4: 2, 5: 2,             // Dần
    6: 3, 7: 3,             // Mão
    8: 4, 9: 4,             // Thìn
    10: 5, 11: 5,           // Tị
    12: 6, 13: 6,           // Ngọ
    14: 7, 15: 7,           // Mùi
    16: 8, 17: 8,           // Thân
    18: 9, 19: 9,           // Dậu
    20: 10, 21: 10,         // Tuất
    22: 11                  // Hợi
  };
  
  const hourChiIndex = hourChiMap[hour];
  const hourChi = DIA_CHI[hourChiIndex];
  
  // Giờ Can theo Ngày Can
  const dayCanIndex = THIEN_CAN.indexOf(dayCan.split(' ')[0]);
  const hourCanBase = Math.floor(dayCanIndex / 5) * 5;
  const hourCanIndex = (hourCanBase + hourChiIndex) % 10;
  const hourCan = THIEN_CAN[hourCanIndex];
  
  return hourCan + ' ' + hourChi;
}

function getTuanKong(dayChi) {
  // 60 giáp tử, mỗi tuần có 2 chi không vong
  const chiIndex = DIA_CHI.indexOf(dayChi.split(' ')[1]);
  const tuanIndex = Math.floor(chiIndex / 10);
  
  const kongWang = {
    0: ['Tuất', 'Hợi'],  // Giáp Tý tuần
    1: ['Thân', 'Dậu'],  // Giáp Tuất tuần
    2: ['Ngọ', 'Mùi'],   // Giáp Thân tuần
    3: ['Thìn', 'Tị'],   // Giáp Ngọ tuần
    4: ['Dần', 'Mão'],   // Giáp Thìn tuần
    5: ['Tý', 'Sửu']     // Giáp Dần tuần
  };
  
  return kongWang[tuanIndex % 6];
}

// ==================== 64 HEXAGRAMS DATA ====================
const HEXAGRAMS = {
  1: { name: 'Càn Vi Thiên', palace: 'Càn', element: 'Kim', shiYao: 4, upperGua: 'Càn', lowerGua: 'Càn' },
  2: { name: 'Khôn Vi Địa', palace: 'Khôn', element: 'Thổ', shiYao: 1, upperGua: 'Khôn', lowerGua: 'Khôn' },
  3: { name: 'Thủy Lôi Truân', palace: 'Chấn', element: 'Mộc', shiYao: 2, upperGua: 'Khảm', lowerGua: 'Chấn' },
  4: { name: 'Sơn Thủy Mông', palace: 'Khảm', element: 'Thủy', shiYao: 3, upperGua: 'Cấn', lowerGua: 'Khảm' },
  5: { name: 'Thủy Thiên Nhu', palace: 'Càn', element: 'Thủy', shiYao: 5, upperGua: 'Khảm', lowerGua: 'Càn' },
  6: { name: 'Thiên Thủy Tụng', palace: 'Càn', element: 'Kim', shiYao: 5, upperGua: 'Càn', lowerGua: 'Khảm' },
  7: { name: 'Địa Thủy Sư', palace: 'Khôn', element: 'Thủy', shiYao: 2, upperGua: 'Khôn', lowerGua: 'Khảm' },
  8: { name: 'Thủy Địa Tỷ', palace: 'Khảm', element: 'Thủy', shiYao: 5, upperGua: 'Khảm', lowerGua: 'Khôn' },
  9: { name: 'Phong Thiên Tiểu Súc', palace: 'Càn', element: 'Mộc', shiYao: 4, upperGua: 'Tốn', lowerGua: 'Càn' },
  10: { name: 'Thiên Trạch Lý', palace: 'Càn', element: 'Kim', shiYao: 3, upperGua: 'Càn', lowerGua: 'Đoài' },
  11: { name: 'Địa Thiên Thái', palace: 'Khôn', element: 'Thổ', shiYao: 3, upperGua: 'Khôn', lowerGua: 'Càn' },
  12: { name: 'Thiên Địa Bĩ', palace: 'Càn', element: 'Thổ', shiYao: 3, upperGua: 'Càn', lowerGua: 'Khôn' },
  13: { name: 'Thiên Hỏa Đồng Nhân', palace: 'Càn', element: 'Hỏa', shiYao: 5, upperGua: 'Càn', lowerGua: 'Ly' },
  14: { name: 'Hỏa Thiên Đại Hữu', palace: 'Ly', element: 'Kim', shiYao: 2, upperGua: 'Ly', lowerGua: 'Càn' },
  15: { name: 'Địa Sơn Khiêm', palace: 'Khôn', element: 'Thổ', shiYao: 4, upperGua: 'Khôn', lowerGua: 'Cấn' },
  16: { name: 'Lôi Địa Dự', palace: 'Chấn', element: 'Thổ', shiYao: 1, upperGua: 'Chấn', lowerGua: 'Khôn' },
  17: { name: 'Trạch Lôi Tùy', palace: 'Đoài', element: 'Mộc', shiYao: 4, upperGua: 'Đoài', lowerGua: 'Chấn' },
  18: { name: 'Sơn Phong Cổ', palace: 'Cấn', element: 'Mộc', shiYao: 5, upperGua: 'Cấn', lowerGua: 'Tốn' },
  19: { name: 'Địa Trạch Lâm', palace: 'Khôn', element: 'Thổ', shiYao: 5, upperGua: 'Khôn', lowerGua: 'Đoài' },
  20: { name: 'Phong Địa Quan', palace: 'Tốn', element: 'Thổ', shiYao: 2, upperGua: 'Tốn', lowerGua: 'Khôn' },
  21: { name: 'Hỏa Lôi Phệ Hạp', palace: 'Chấn', element: 'Hỏa', shiYao: 4, upperGua: 'Ly', lowerGua: 'Chấn' },
  22: { name: 'Sơn Hỏa Bí', palace: 'Ly', element: 'Hỏa', shiYao: 3, upperGua: 'Cấn', lowerGua: 'Ly' },
  23: { name: 'Sơn Địa Bác', palace: 'Khôn', element: 'Thổ', shiYao: 6, upperGua: 'Cấn', lowerGua: 'Khôn' },
  24: { name: 'Địa Lôi Phục', palace: 'Chấn', element: 'Mộc', shiYao: 4, upperGua: 'Khôn', lowerGua: 'Chấn' },
  25: { name: 'Thiên Lôi Vô Vọng', palace: 'Càn', element: 'Kim', shiYao: 6, upperGua: 'Càn', lowerGua: 'Chấn' },
  26: { name: 'Sơn Thiên Đại Súc', palace: 'Càn', element: 'Kim', shiYao: 6, upperGua: 'Cấn', lowerGua: 'Càn' },
  27: { name: 'Sơn Lôi Di', palace: 'Cấn', element: 'Mộc', shiYao: 1, upperGua: 'Cấn', lowerGua: 'Chấn' },
  28: { name: 'Trạch Phong Đại Quá', palace: 'Đoài', element: 'Mộc', shiYao: 5, upperGua: 'Đoài', lowerGua: 'Tốn' },
  29: { name: 'Khảm Vi Thủy', palace: 'Khảm', element: 'Thủy', shiYao: 2, upperGua: 'Khảm', lowerGua: 'Khảm' },
  30: { name: 'Ly Vi Hỏa', palace: 'Ly', element: 'Hỏa', shiYao: 5, upperGua: 'Ly', lowerGua: 'Ly' },
  31: { name: 'Trạch Sơn Hàm', palace: 'Đoài', element: 'Kim', shiYao: 3, upperGua: 'Đoài', lowerGua: 'Cấn' },
  32: { name: 'Lôi Phong Hằng', palace: 'Chấn', element: 'Mộc', shiYao: 5, upperGua: 'Chấn', lowerGua: 'Tốn' },
  33: { name: 'Thiên Sơn Độn', palace: 'Càn', element: 'Kim', shiYao: 3, upperGua: 'Càn', lowerGua: 'Cấn' },
  34: { name: 'Lôi Thiên Đại Tráng', palace: 'Chấn', element: 'Kim', shiYao: 4, upperGua: 'Chấn', lowerGua: 'Càn' },
  35: { name: 'Hỏa Địa Tấn', palace: 'Ly', element: 'Hỏa', shiYao: 1, upperGua: 'Ly', lowerGua: 'Khôn' },
  36: { name: 'Địa Hỏa Minh Di', palace: 'Khôn', element: 'Hỏa', shiYao: 2, upperGua: 'Khôn', lowerGua: 'Ly' },
  37: { name: 'Phong Hỏa Gia Nhân', palace: 'Ly', element: 'Hỏa', shiYao: 3, upperGua: 'Tốn', lowerGua: 'Ly' },
  38: { name: 'Hỏa Trạch Quỵ', palace: 'Đoài', element: 'Hỏa', shiYao: 6, upperGua: 'Ly', lowerGua: 'Đoài' },
  39: { name: 'Thủy Sơn Kiển', palace: 'Khảm', element: 'Thủy', shiYao: 3, upperGua: 'Khảm', lowerGua: 'Cấn' },
  40: { name: 'Lôi Thủy Giải', palace: 'Chấn', element: 'Thủy', shiYao: 2, upperGua: 'Chấn', lowerGua: 'Khảm' },
  41: { name: 'Sơn Trạch Tổn', palace: 'Đoài', element: 'Kim', shiYao: 2, upperGua: 'Cấn', lowerGua: 'Đoài' },
  42: { name: 'Phong Lôi Ích', palace: 'Chấn', element: 'Mộc', shiYao: 1, upperGua: 'Tốn', lowerGua: 'Chấn' },
  43: { name: 'Trạch Thiên Quải', palace: 'Càn', element: 'Kim', shiYao: 4, upperGua: 'Đoài', lowerGua: 'Càn' },
  44: { name: 'Thiên Phong Cấu', palace: 'Tốn', element: 'Mộc', shiYao: 1, upperGua: 'Càn', lowerGua: 'Tốn' },
  45: { name: 'Trạch Địa Tụy', palace: 'Đoài', element: 'Thổ', shiYao: 3, upperGua: 'Đoài', lowerGua: 'Khôn' },
  46: { name: 'Địa Phong Thăng', palace: 'Tốn', element: 'Mộc', shiYao: 2, upperGua: 'Khôn', lowerGua: 'Tốn' },
  47: { name: 'Trạch Thủy Khốn', palace: 'Đoài', element: 'Thủy', shiYao: 5, upperGua: 'Đoài', lowerGua: 'Khảm' },
  48: { name: 'Thủy Phong Tỉnh', palace: 'Khảm', element: 'Mộc', shiYao: 4, upperGua: 'Khảm', lowerGua: 'Tốn' },
  49: { name: 'Trạch Hỏa Cách', palace: 'Ly', element: 'Hỏa', shiYao: 5, upperGua: 'Đoài', lowerGua: 'Ly' },
  50: { name: 'Hỏa Phong Đỉnh', palace: 'Ly', element: 'Mộc', shiYao: 4, upperGua: 'Ly', lowerGua: 'Tốn' },
  51: { name: 'Chấn Vi Lôi', palace: 'Chấn', element: 'Mộc', shiYao: 3, upperGua: 'Chấn', lowerGua: 'Chấn' },
  52: { name: 'Cấn Vi Sơn', palace: 'Cấn', element: 'Thổ', shiYao: 6, upperGua: 'Cấn', lowerGua: 'Cấn' },
  53: { name: 'Phong Sơn Tiệm', palace: 'Cấn', element: 'Mộc', shiYao: 5, upperGua: 'Tốn', lowerGua: 'Cấn' },
  54: { name: 'Lôi Trạch Quy Muội', palace: 'Chấn', element: 'Kim', shiYao: 6, upperGua: 'Chấn', lowerGua: 'Đoài' },
  55: { name: 'Lôi Hỏa Phong', palace: 'Chấn', element: 'Hỏa', shiYao: 4, upperGua: 'Chấn', lowerGua: 'Ly' },
  56: { name: 'Hỏa Sơn Lữ', palace: 'Cấn', element: 'Hỏa', shiYao: 4, upperGua: 'Ly', lowerGua: 'Cấn' },
  57: { name: 'Tốn Vi Phong', palace: 'Tốn', element: 'Mộc', shiYao: 1, upperGua: 'Tốn', lowerGua: 'Tốn' },
  58: { name: 'Đoài Vi Trạch', palace: 'Đoài', element: 'Kim', shiYao: 4, upperGua: 'Đoài', lowerGua: 'Đoài' },
  59: { name: 'Phong Thủy Hoán', palace: 'Khảm', element: 'Thủy', shiYao: 6, upperGua: 'Tốn', lowerGua: 'Khảm' },
  60: { name: 'Thủy Trạch Tiết', palace: 'Đoài', element: 'Thủy', shiYao: 2, upperGua: 'Khảm', lowerGua: 'Đoài' },
  61: { name: 'Phong Trạch Trung Phu', palace: 'Đoài', element: 'Mộc', shiYao: 3, upperGua: 'Tốn', lowerGua: 'Đoài' },
  62: { name: 'Lôi Sơn Tiểu Quá', palace: 'Cấn', element: 'Mộc', shiYao: 6, upperGua: 'Chấn', lowerGua: 'Cấn' },
  63: { name: 'Thủy Hỏa Ký Tế', palace: 'Khảm', element: 'Thủy', shiYao: 3, upperGua: 'Khảm', lowerGua: 'Ly' },
  64: { name: 'Hỏa Thủy Vị Tế', palace: 'Ly', element: 'Hỏa', shiYao: 6, upperGua: 'Ly', lowerGua: 'Khảm' }
};

// Bảng tra quẻ (Thượng quái x Hạ quái)
const HEXAGRAM_TABLE = [
  [1,34,5,26,11,9,14,43],  // Càn
  [25,51,3,27,24,42,21,17], // Chấn
  [6,40,29,4,7,59,64,47],   // Khảm
  [33,62,39,52,15,53,56,31],// Cấn
  [12,16,8,23,2,20,35,45],  // Khôn
  [44,32,48,18,46,57,50,28],// Tốn
  [13,55,63,22,36,37,30,49],// Ly
  [10,54,60,41,19,61,38,58] // Đoài
];

const GUA_INDEX = { 'Càn': 0, 'Chấn': 1, 'Khảm': 2, 'Cấn': 3, 'Khôn': 4, 'Tốn': 5, 'Ly': 6, 'Đoài': 7 };

// ==================== LỤC THÂN (6 Relatives) ====================
const LIU_QIN_ORDER = ['Tử Tôn', 'Thê Tài', 'Huynh Đệ', 'Tử Tôn', 'Thê Tài', 'Huynh Đệ'];

// Lục thân theo cung quẻ + vị trí hào
function getLiuQin(palace, yaoPosition) {
  const palaceStart = {
    'Càn': ['Tử Tôn', 'Thê Tài', 'Huynh Đệ', 'Quan Quỷ', 'Phụ Mẫu', 'Thê Tài'],
    'Đoài': ['Tử Tôn', 'Thê Tài', 'Huynh Đệ', 'Quan Quỷ', 'Phụ Mẫu', 'Thê Tài'],
    'Ly': ['Huynh Đệ', 'Tử Tôn', 'Thê Tài', 'Phụ Mẫu', 'Huynh Đệ', 'Quan Quỷ'],
    'Chấn': ['Thê Tài', 'Huynh Đệ', 'Tử Tôn', 'Quan Quỷ', 'Phụ Mẫu', 'Thê Tài'],
    'Tốn': ['Huynh Đệ', 'Tử Tôn', 'Thê Tài', 'Phụ Mẫu', 'Huynh Đệ', 'Quan Quỷ'],
    'Khảm': ['Huynh Đệ', 'Quan Quỷ', 'Phụ Mẫu', 'Thê Tài', 'Huynh Đệ', 'Tử Tôn'],
    'Cấn': ['Quan Quỷ', 'Phụ Mẫu', 'Thê Tài', 'Tử Tôn', 'Thê Tài', 'Huynh Đệ'],
    'Khôn': ['Tử Tôn', 'Thê Tài', 'Huynh Đệ', 'Quan Quỷ', 'Phụ Mẫu', 'Thê Tài']
  };
  
  return palaceStart[palace][yaoPosition - 1];
}

// ==================== CALCULATE HEXAGRAM ====================
function calculateHexagram(datetime) {
  const date = new Date(datetime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  // Lunar calendar
  const lunar = solarToLunar(year, month, day);
  
  // GanZhi
  const yearGZ = getYearGanZhi(lunar.year);
  const monthGZ = getMonthGanZhi(lunar.month, yearGZ);
  const dayGZ = getDayGanZhi(year, month, day);
  const hourGZ = getHourGanZhi(hour, dayGZ);
  
  // Tuần Không
  const tuanKong = getTuanKong(dayGZ);
  
  // Calculate hexagram (梅花易數 method)
  const upperNum = (lunar.year + lunar.month + lunar.day) % 8 || 8;
  const lowerNum = (lunar.year + lunar.month + lunar.day + hour) % 8 || 8;
  const changingLine = (lunar.year + lunar.month + lunar.day + hour + minute) % 6 || 6;
  
  // Get hexagram number
  const mainHexNum = HEXAGRAM_TABLE[upperNum - 1][lowerNum - 1];
  const mainHex = HEXAGRAMS[mainHexNum];
  
  // Calculate changed hexagram
  const changedLines = getHexagramLines(mainHexNum).map((line, i) => 
    i === changingLine - 1 ? 1 - line : line
  );
  let changedHexNum = mainHexNum;
  for (let i = 1; i <= 64; i++) {
    if (JSON.stringify(getHexagramLines(i)) === JSON.stringify(changedLines)) {
      changedHexNum = i;
      break;
    }
  }
  const changedHex = HEXAGRAMS[changedHexNum];
  
  // Generate 6 yaos with Liu Qin
  const sixYaos = [];
  const yaoChi = assignYaoChi(mainHexNum);
  for (let i = 1; i <= 6; i++) {
    const liuQin = getLiuQin(mainHex.palace, i);
    const chi = yaoChi[i - 1];
    const isShiYao = i === mainHex.shiYao;
    const isYingYao = (mainHex.shiYao <= 3 && i === mainHex.shiYao + 3) || 
                      (mainHex.shiYao > 3 && i === mainHex.shiYao - 3);
    
    sixYaos.push({
      position: i,
      chi: chi,
      liuQin: liuQin,
      shiYao: isShiYao,
      yingYao: isYingYao
    });
  }
  
  // Changing yao detail
  const changingYaoDetail = {
    position: changingLine,
    oldChi: yaoChi[changingLine - 1],
    oldLiuQin: getLiuQin(mainHex.palace, changingLine),
    newChi: assignYaoChi(changedHexNum)[changingLine - 1],
    newLiuQin: getLiuQin(changedHex.palace, changingLine)
  };
  
  return {
    question: '',
    datetime: datetime,
    datetimeFormatted: `${day}/${month}/${year} ${hour}:${minute < 10 ? '0' : ''}${minute}`,
    
    lunar: {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day
    },
    
    ganZhi: {
      year: yearGZ,
      month: monthGZ,
      day: dayGZ,
      hour: hourGZ
    },
    
    tuanKong: tuanKong,
    
    mainHexagram: {
      number: mainHexNum,
      name: mainHex.name,
      palace: mainHex.palace,
      element: mainHex.element,
      shiYao: mainHex.shiYao,
      yingYao: mainHex.shiYao <= 3 ? mainHex.shiYao + 3 : mainHex.shiYao - 3,
      upperGua: mainHex.upperGua,
      lowerGua: mainHex.lowerGua
    },
    
    changedHexagram: {
      number: changedHexNum,
      name: changedHex.name,
      palace: changedHex.palace,
      element: changedHex.element
    },
    
    changingLine: changingLine,
    changingYaoDetail: changingYaoDetail,
    
    sixYaos: sixYaos,
    
    summary: `Quẻ ${mainHex.name} → ${changedHex.name}, Hào ${changingLine} động`
  };
}

// Helper: Get binary lines for hexagram
function getHexagramLines(hexNum) {
  const hexBinary = {
    1:[1,1,1,1,1,1], 2:[0,0,0,0,0,0], 3:[1,0,0,0,1,0], 4:[0,1,0,0,0,1], 
    5:[0,1,0,1,1,1], 6:[1,1,1,0,1,0], 7:[0,1,0,0,0,0], 8:[0,0,0,0,1,0],
    9:[0,1,1,1,1,1], 10:[1,1,1,0,1,1], 11:[1,1,1,0,0,0], 12:[0,0,0,1,1,1],
    13:[1,0,1,1,1,1], 14:[1,1,1,1,0,1], 15:[0,0,1,0,0,0], 16:[0,0,0,1,0,0],
    17:[1,0,0,0,0,1], 18:[1,0,0,1,1,0], 19:[0,0,0,0,1,1], 20:[1,1,0,0,0,0],
    21:[1,0,1,0,0,1], 22:[1,0,0,1,0,1], 23:[1,0,0,0,0,0], 24:[0,0,0,0,0,1],
    25:[1,0,0,1,1,1], 26:[1,1,1,0,0,1], 27:[1,0,0,0,0,1], 28:[0,1,1,1,1,0],
    29:[0,1,0,0,1,0], 30:[1,0,1,1,0,1], 31:[0,0,1,1,1,0], 32:[0,1,1,1,0,0],
    33:[0,0,1,1,1,1], 34:[1,1,1,1,0,0], 35:[0,0,0,1,0,1], 36:[1,0,1,0,0,0],
    37:[1,0,1,0,1,1], 38:[1,1,0,1,0,1], 39:[0,0,1,0,1,0], 40:[0,1,0,1,0,0],
    41:[1,1,0,0,0,1], 42:[0,0,0,1,1,0], 43:[1,1,1,1,1,0], 44:[0,1,1,1,1,1],
    45:[0,0,0,1,1,0], 46:[0,1,1,0,0,0], 47:[0,1,1,0,1,0], 48:[0,1,0,1,1,0],
    49:[1,0,1,0,1,1], 50:[1,1,0,1,0,1], 51:[0,0,1,0,0,1], 52:[1,0,0,1,0,0],
    53:[0,0,1,1,1,0], 54:[0,1,1,0,0,1], 55:[1,0,1,0,0,1], 56:[1,0,0,1,0,1],
    57:[0,1,1,0,1,1], 58:[1,1,0,1,1,0], 59:[0,1,0,1,1,0], 60:[0,1,1,0,1,0],
    61:[1,1,0,0,1,1], 62:[0,0,1,1,0,0], 63:[1,0,1,0,1,0], 64:[0,1,0,1,0,1]
  };
  return hexBinary[hexNum] || [1,1,1,1,1,1];
}

// Helper: Assign Chi to 6 yaos
function assignYaoChi(hexNum) {
  const palace = HEXAGRAMS[hexNum].palace;
  const palaceChi = {
    'Càn': ['Tý', 'Tuất', 'Thân', 'Ngọ', 'Thìn', 'Dần'],
    'Đoài': ['Tị', 'Mão', 'Sửu', 'Hợi', 'Dậu', 'Mùi'],
    'Ly': ['Mão', 'Sửu', 'Hợi', 'Dậu', 'Mùi', 'Tị'],
    'Chấn': ['Tý', 'Tuất', 'Thân', 'Ngọ', 'Thìn', 'Dần'],
    'Tốn': ['Sửu', 'Hợi', 'Dậu', 'Mùi', 'Tị', 'Mão'],
    'Khảm': ['Dần', 'Tý', 'Tuất', 'Thân', 'Ngọ', 'Thìn'],
    'Cấn': ['Thìn', 'Dần', 'Tý', 'Tuất', 'Thân', 'Ngọ'],
    'Khôn': ['Mùi', 'Tị', 'Mão', 'Sửu', 'Hợi', 'Dậu']
  };
  return palaceChi[palace];
}

// ==================== EXPORTS ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateHexagram, HEXAGRAMS, DIA_CHI, THIEN_CAN };
}
