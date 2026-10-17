// Optical preview only: these values are not a calibrated manufacturing profile.
export const MIN_THICKNESS_MM = .65
export const MAX_THICKNESS_MM = 3.6
export const ATTENUATION = 1.6
export function thicknessForLuminance(linear: number) {
  return Math.min(MAX_THICKNESS_MM, Math.max(MIN_THICKNESS_MM, MIN_THICKNESS_MM - Math.log(.015 + .985 * Math.max(0, Math.min(1, linear))) / ATTENUATION))
}
export function linearLuminance(r: number, g: number, b: number, alpha = 255) {
  const a = alpha / 255
  const linear = (v: number) => { const s = (v * a + 255 * (1 - a)) / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4 }
  return .2126 * linear(r) + .7152 * linear(g) + .0722 * linear(b)
}
