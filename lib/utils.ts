export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function formatShortDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

export function getDayOfWeek(): string {
  return new Date().toLocaleDateString("en-GB", { weekday: "long" });
}

export function calcDurationHours(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let minutes = wh * 60 + wm - (bh * 60 + bm);
  if (minutes < 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}

export function getPhaseColor(code: string): string {
  const map: Record<string, string> = {
    S: "#E8291C",
    T: "#F5A623",
    R: "#3B82F6",
    O: "#10B981",
    N: "#8B5CF6",
    G: "#F59E0B",
  };
  return map[code] ?? "#F5A623";
}

export function getProgrammeWeek(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.floor(days / 7) + 1, 13);
}
