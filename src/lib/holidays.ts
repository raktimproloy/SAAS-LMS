import prisma from "@/lib/db";

export async function getHolidays(country: string, year: number) {
  // 1. Check database cache first
  let cachedHolidays = await prisma.holidayCache.findMany({
    where: { country, year },
    orderBy: { date: "asc" }
  });

  if (cachedHolidays.length > 0) {
    return cachedHolidays;
  }

  // 2. Fetch from Calendarific
  const apiKey = process.env.CALENDARIFIC_API_KEY;
  if (!apiKey) {
    console.warn("CALENDARIFIC_API_KEY is not set.");
    return [];
  }

  try {
    const response = await fetch(`https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${country}&year=${year}`);
    
    if (!response.ok) {
      throw new Error(`Calendarific API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.meta.code !== 200) {
      throw new Error(`Calendarific API error: ${data.meta.error_detail}`);
    }

    const holidays = data.response.holidays;
    
    // Save to DB
    for (const h of holidays) {
      const dateStr = h.date.iso.split('T')[0];
      await prisma.holidayCache.upsert({
        where: { country_year_date: { country, year, date: new Date(dateStr) } },
        update: {},
        create: {
          country,
          year,
          date: new Date(dateStr),
          name: h.name,
          type: h.type && h.type.length > 0 ? h.type[0] : "National"
        }
      });
    }

    return await prisma.holidayCache.findMany({
      where: { country, year },
      orderBy: { date: "asc" }
    });
  } catch (error) {
    console.error("Failed to fetch holidays:", error);
    return [];
  }
}
