/** "7:30", "12:30" — compact clock, no meridiem. */
export const clock = (minutes: number) => `${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, "0")}`
/** "10:00 AM". */
export const clockFull = (minutes: number) => `${clock(minutes)} ${minutes < 12 * 60 ? "AM" : "PM"}`
/** "7 AM". */
export const hourLabel = (hour: number) => `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`
export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
