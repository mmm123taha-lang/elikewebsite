import test from 'node:test'
import assert from 'node:assert/strict'
import { linearLuminance, thicknessForLuminance, MIN_THICKNESS_MM, MAX_THICKNESS_MM, ATTENUATION } from '../src/lib/lithophane-simulation.ts'
test('bright photo regions are thinner and transmit more backlight than dark regions', () => {
  const bright = thicknessForLuminance(linearLuminance(245,245,245)), dark = thicknessForLuminance(linearLuminance(20,20,20))
  assert(bright < dark)
  assert(Math.exp(-ATTENUATION * bright) > Math.exp(-ATTENUATION * dark) * 8)
})
test('preview relief stays within the intended physical thickness range', () => {
  for (let value=0;value<=255;value++) { const t=thicknessForLuminance(linearLuminance(value,value,value)); assert(t >= MIN_THICKNESS_MM && t <= MAX_THICKNESS_MM) }
})
test('transparent image regions are treated as white rather than opaque black', () => {
  assert.equal(linearLuminance(0,0,0,0),linearLuminance(255,255,255))
})
