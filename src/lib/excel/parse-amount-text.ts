const DIGIT_MAP: Record<string, string> = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9"
  };
  
  const ONES: Record<string, number> = {
    "صفر": 0, "یک": 1, "دو": 2, "سه": 3, "چهار": 4,
    "پنج": 5, "شش": 6, "شیش": 6, "هفت": 7, "هشت": 8, "نه": 9
  };
  
  const TEENS: Record<string, number> = {
    "ده": 10, "یازده": 11, "دوازده": 12, "سیزده": 13, "چهارده": 14,
    "پانزده": 15, "پونزده": 15, "شانزده": 16, "شونزده": 16,
    "هفده": 17, "هیفده": 17, "هجده": 18, "هیجده": 18, "نوزده": 19
  };
  
  const TENS: Record<string, number> = {
    "بیست": 20, "سی": 30, "چهل": 40, "پنجاه": 50,
    "شصت": 60, "هفتاد": 70, "هشتاد": 80, "نود": 90
  };
  
  const HUNDREDS: Record<string, number> = {
    "یکصد": 100, "صد": 100, "دویست": 200, "سیصد": 300, "چهارصد": 400,
    "پانصد": 500, "پونصد": 500, "ششصد": 600, "شیشصد": 600,
    "هفتصد": 700, "هشتصد": 800, "نهصد": 900
  };
  
  const SCALES: Record<string, number> = {
    "هزار": 1000,
    "میلیون": 1_000_000,
    "ملیون": 1_000_000,
    "میلیارد": 1_000_000_000
  };
  
  /**
   * متن فارسی/انگلیسی را به عدد تبدیل می‌کند.
   * پشتیبانی:
   *  - "120000" → 120000
   *  - "۱۲۰,۰۰۰" → 120000
   *  - "120 هزار تومان" → 120000
   *  - "1.5 میلیون" → 1500000
   *  - "یکصد و بیست هزار" → 120000
   *  - "صد و پنجاه هزار و پانصد" → 150500
   */
  export function parseAmountText(input: any): number | null {
    if (input == null) return null;
    if (typeof input === "number") return input;
  
    let s = String(input).trim();
    if (!s) return null;
  
    // تبدیل ارقام فارسی/عربی به انگلیسی
    s = s.replace(/[۰-۹٠-٩]/g, d => DIGIT_MAP[d] || d);
  
    // حذف واحدهای پولی و جداکننده‌ها (اما "هزار"، "میلیون"، "میلیارد" را نگه دار)
    s = s.replace(/[,،٬\s]+/g, " ").trim();
  
    // ابتدا: تلاش برای عدد خالص + مقیاس
    // مثال: "120 هزار تومان" یا "1.5 میلیون"
    const numericScale = s.match(/([\d.]+)\s*(هزار|میلیون|ملیون|میلیارد)/);
    if (numericScale) {
      const num = Number(numericScale[1]);
      const scale = SCALES[numericScale[2]] || 1;
      if (!isNaN(num)) return num * scale;
    }
  
    // فقط عدد خالص
    const pureNumber = s.replace(/[^\d.\-]/g, "");
    if (/^-?\d+(\.\d+)?$/.test(pureNumber)) {
      const n = Number(pureNumber);
      if (!isNaN(n)) return n;
    }
  
    // تبدیل کلمات فارسی به عدد
    return parseWordsToNumber(s);
  }
  
  function parseWordsToNumber(text: string): number | null {
    // کلمات را جدا کن
    const words = text
      .replace(/و\s+/g, " ")
      .replace(/[^\u0600-\u06FF\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
  
    if (words.length === 0) return null;
  
    let total = 0;
    let current = 0;
    let matchedAny = false;
  
    for (const w of words) {
      if (ONES[w] !== undefined) {
        current += ONES[w];
        matchedAny = true;
      } else if (TEENS[w] !== undefined) {
        current += TEENS[w];
        matchedAny = true;
      } else if (TENS[w] !== undefined) {
        current += TENS[w];
        matchedAny = true;
      } else if (HUNDREDS[w] !== undefined) {
        current += HUNDREDS[w];
        matchedAny = true;
      } else if (SCALES[w] !== undefined) {
        if (current === 0) current = 1;
        total += current * SCALES[w];
        current = 0;
        matchedAny = true;
      } else if (w === "و") {
        continue;
      } else {
        // کلمه ناشناخته (مثل "تومان" یا "ریال")
        // نادیده بگیر
      }
    }
  
    total += current;
  
    if (!matchedAny || total === 0) return null;
    return total;
  }
  