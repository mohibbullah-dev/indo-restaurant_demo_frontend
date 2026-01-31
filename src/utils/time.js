export function pad2(n) {
  return String(n).padStart(2, "0");
}

// Build "YYYY-MM-DD" in local device time (we’ll refine with timezone later if needed)
export function todayISODate() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Returns ISO string for selected date + time, interpreted in local device timezone
export function buildLocalISO(dateStr, timeStr) {
  // dateStr: "YYYY-MM-DD", timeStr: "HH:MM"
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
}

// Check lead time minutes
export function isAtLeastMinutesFromNow(dateStr, timeStr, minLeadMinutes) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const selected = new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
  const now = Date.now();
  const diffMin = (selected - now) / 60000;
  return diffMin >= (minLeadMinutes || 0);
}
