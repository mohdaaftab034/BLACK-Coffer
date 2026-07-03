const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function parseDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const cleaned = dateStr.trim();
  const regex = /^(\w+),\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/;
  const match = cleaned.match(regex);

  if (!match) {
    const fallback = new Date(cleaned);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  const monthName = match[1].toLowerCase();
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  const hours = parseInt(match[4], 10);
  const minutes = parseInt(match[5], 10);
  const seconds = parseInt(match[6], 10);

  const month = MONTHS[monthName];
  if (month === undefined) return null;

  return new Date(year, month, day, hours, minutes, seconds);
}

module.exports = { parseDateString };
