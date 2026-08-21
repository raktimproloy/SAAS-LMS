const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBengaliNumber = (num: string | number): string => {
  return num.toString().replace(/[0-9]/g, w => bengaliDigits[+w]);
};

export const translateDayToBengali = (day: string): string => {
  const map: Record<string, string> = {
    'Sun': 'রবিবার',
    'Mon': 'সোমবার',
    'Tue': 'মঙ্গলবার',
    'Wed': 'বুধবার',
    'Thu': 'বৃহস্পতিবার',
    'Fri': 'শুক্রবার',
    'Sat': 'শনিবার'
  };
  return map[day] || day;
};

export const formatTimeBengali = (time24: string): string => {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  let hour = parseInt(h, 10);
  
  let period = "সকাল"; // morning 6-11
  if (hour >= 12 && hour < 16) {
    period = "দুপুর"; // noon 12-15
  } else if (hour >= 16 && hour < 18) {
    period = "বিকাল"; // afternoon 16-17
  } else if (hour >= 18 && hour < 20) {
    period = "সন্ধ্যা"; // evening 18-19
  } else if (hour >= 20 || hour < 6) {
    period = "রাত"; // night 20-5
  }

  hour = hour % 12 || 12; // convert to 12 hour

  const hourBn = toBengaliNumber(hour.toString().padStart(2, '0'));
  const minBn = toBengaliNumber(m);

  return `${period} ${hourBn}:${minBn}`;
};

export const formatTimeRangeBengali = (start24: string, end24: string): string => {
  if (!start24 || !end24) return "";

  const parseTime = (time24: string) => {
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    
    let period = "সকাল";
    if (hour >= 12 && hour < 16) {
      period = "দুপুর";
    } else if (hour >= 16 && hour < 18) {
      period = "বিকাল";
    } else if (hour >= 18 && hour < 20) {
      period = "সন্ধ্যা";
    } else if (hour >= 20 || hour < 6) {
      period = "রাত";
    }

    hour = hour % 12 || 12;
    
    let timeStr = toBengaliNumber(hour.toString());
    timeStr += `:${toBengaliNumber(m)}`;
    
    return { period, timeStr };
  };

  const start = parseTime(start24);
  const end = parseTime(end24);

  if (start.period === end.period) {
    return `${start.period} ${start.timeStr} - ${end.timeStr}`;
  } else {
    return `${start.period} ${start.timeStr} - ${end.period} ${end.timeStr}`;
  }
};
