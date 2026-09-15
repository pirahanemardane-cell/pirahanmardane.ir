/** تبدیل ساده شمسی ↔ میلادی (بدون وابستگی) */

const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178]

function gy2jd(gy, gm, gd) {
  const a = Math.floor((14 - gm) / 12)
  const y = gy + 4800 - a
  const m = gm + 12 * a - 3
  return (
    gd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

function jalCal(jy) {
  const bl = breaks.length
  const gy = jy + 621
  let leapJ = -14
  let jp = breaks[0]
  let jump = 0
  for (let i = 1; i < bl; i += 1) {
    const jm = breaks[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + Math.floor(jump / 33) * 8 + Math.floor((jump % 33) / 4)
    jp = jm
  }
  let n = jy - jp
  leapJ = leapJ + Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4)
  if (jump % 33 === 4 && jump - n === 4) leapJ += 1
  const leapG = Math.floor(gy / 4) - Math.floor((Math.floor(gy / 100) + 1) * 3 / 4) - 150
  const march = 20 + leapJ - leapG
  if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 33) * 33
  let leap = (((n + 1) % 33) - 1) % 4
  if (leap === -1) leap = 4
  return { leap, gy, march }
}

function j2d(jy, jm, jd) {
  const r = jalCal(jy)
  return gy2jd(r.gy, 3, r.march) + (jm - 1) * 31 - Math.floor(jm / 7) * (jm - 7) + jd - 1
}

function d2g(jdn) {
  let j = 4 * jdn + 139361631
  j = j + Math.floor((Math.floor((4 * jdn + 183187720) / 146097) * 3) / 4) * 4 - 3908
  const i = Math.floor(((j % 1461) / 4) * 5 + 308)
  const gd = Math.floor((i % 153) / 5) + 1
  const gm = (Math.floor(i / 153) % 12) + 1
  const gy = Math.floor(j / 1461) - 100100 + Math.floor((8 - gm) / 6)
  return { gy, gm, gd }
}

function d2j(jdn) {
  const g = d2g(jdn)
  let jy = g.gy - 621
  const r = jalCal(jy)
  const jdn1f = gy2jd(g.gy, 3, r.march)
  let k = jdn - jdn1f
  if (k >= 0) {
    if (k <= 185) {
      const jm = 1 + Math.floor(k / 31)
      const jd = (k % 31) + 1
      return { jy, jm, jd }
    }
    k -= 186
  } else {
    jy -= 1
    k += 179
    if (r.leap === 1) k += 1
  }
  const jm = 7 + Math.floor(k / 30)
  const jd = (k % 30) + 1
  return { jy, jm, jd }
}

export function toJalaali(gy, gm, gd) {
  return d2j(gy2jd(gy, gm, gd))
}

export function toGregorian(jy, jm, jd) {
  return d2g(j2d(jy, jm, jd))
}

export function jalaaliMonthLength(jy, jm) {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  const { leap } = jalCal(jy)
  return leap === 1 ? 30 : 29
}

const FA_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

export function faMonthName(jm) {
  return FA_MONTHS[(jm || 1) - 1] || ''
}

/** jy,jm,jd, hour, minute (Tehran wall) → ISO UTC */
export function jalaliTehranToIso(jy, jm, jd, hour = 0, minute = 0) {
  const { gy, gm, gd } = toGregorian(Number(jy), Number(jm), Number(jd))
  // Asia/Tehran: approximate fixed +03:30 (no DST since 2022)
  const utcMs = Date.UTC(gy, gm - 1, gd, Number(hour) - 3, Number(minute) - 30, 0)
  return new Date(utcMs).toISOString()
}

export function nowJalaaliTehran() {
  const now = new Date()
  // shift to Tehran approx
  const t = new Date(now.getTime() + (3.5 * 60 - now.getTimezoneOffset()) * 60000)
  // better: use UTC+3:30 from UTC
  const tehran = new Date(now.getTime() + 3.5 * 60 * 60 * 1000)
  const gy = tehran.getUTCFullYear()
  const gm = tehran.getUTCMonth() + 1
  const gd = tehran.getUTCDate()
  const hour = tehran.getUTCHours()
  const minute = tehran.getUTCMinutes()
  const j = toJalaali(gy, gm, gd)
  return { ...j, hour, minute }
}
