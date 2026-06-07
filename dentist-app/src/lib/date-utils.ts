import { APPOINTMENTS } from "@/lib/appointments-data"

export const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

export const MONTHS_VN = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12"
]

export const HOUR_LABELS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00"
]

export const START_HOUR = 7
export const PX_PER_MIN = 1.5 // 1 hour = 90px

export function fmtCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(n)
}

export function getWeeksInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const weeks: Date[][] = []
  let current = new Date(firstDay)
  
  // start from Monday
  const dow = (current.getDay() + 6) % 7
  current.setDate(current.getDate() - dow)
  
  while (current <= lastDay || weeks.length < 5) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
    if (current > lastDay && weeks.length >= 4) break
  }
  return weeks
}

export function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

export function parseMin(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export type AptLayout = (typeof APPOINTMENTS)[0] & { col: number; totalCols: number }

export function layoutDayApts(apts: typeof APPOINTMENTS): AptLayout[] {
  if (!apts.length) return []
  const sorted = [...apts].sort((a, b) => parseMin(a.start) - parseMin(b.start))
  const result: AptLayout[] = sorted.map(a => ({ ...a, col: 0, totalCols: 1 }))
  
  // Assign columns
  for (let i = 0; i < result.length; i++) {
    const usedCols = result
      .slice(0, i)
      .filter(r => parseMin(r.start) < parseMin(result[i].end) && parseMin(result[i].start) < parseMin(r.end))
      .map(r => r.col)
    let col = 0
    while (usedCols.includes(col)) col++
    result[i].col = col
  }
  
  // Determine totalCols for each overlap group
  for (let i = 0; i < result.length; i++) {
    const overlaps = result.filter(r =>
      parseMin(r.start) < parseMin(result[i].end) && parseMin(result[i].start) < parseMin(r.end)
    )
    const maxCol = Math.max(...overlaps.map(r => r.col)) + 1
    overlaps.forEach(r => {
      r.totalCols = Math.max(r.totalCols, maxCol)
    })
  }
  return result
}
