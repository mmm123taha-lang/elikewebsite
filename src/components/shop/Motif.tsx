import type { MotifKind } from '@/lib/catalog'
const paths: Partial<Record<MotifKind, string>> = {
  heart: 'M50 85C40 73 8 56 8 32C8 9 36 4 50 27C64 4 92 9 92 32C92 56 60 73 50 85Z',
  leaf: 'M15 85C-4 32 34 8 88 12C85 65 63 104 15 85ZM15 85L76 24M36 64L30 36M53 47L52 26M36 64L66 65',
  star: 'M50 7L62 35L93 38L69 58L76 89L50 73L24 89L31 58L7 38L38 35Z',
  moon: 'M76 12A42 42 0 1 0 87 72A35 35 0 0 1 76 12Z',
  diamond: 'M50 5L90 50L50 95L10 50ZM10 50H90M50 5L35 50L50 95L65 50Z',
  paisley: 'M70 9C64 41 19 32 17 64C15 95 65 100 81 74C96 48 79 24 70 9ZM64 46C45 49 32 57 35 70C39 85 64 80 68 67C71 58 67 51 64 46Z',
  vine: 'M11 89C28 77 73 77 88 12M31 76C4 63 8 44 33 58M46 65C31 35 47 23 57 44M64 47C83 55 94 39 79 34',
  sparkle: 'M50 5C54 36 63 45 95 50C63 54 54 64 50 95C45 64 36 54 5 50C36 45 45 36 50 5Z',
}
export function Motif({ kind }: { kind: MotifKind }) {
  if (paths[kind]) return <path d={paths[kind]} fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
  if (kind === 'dot') return <><circle cx="50" cy="50" r="13" fill="currentColor" /><circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" strokeWidth="3" /></>
  if (kind === 'sun') return <><circle cx="50" cy="50" r="21" fill="none" stroke="currentColor" strokeWidth="3" />{Array.from({ length: 12 }, (_, i) => <path key={i} d="M50 8V19" transform={`rotate(${i * 30} 50 50)`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />)}</>
  if (kind === 'rose') return <><path d="M50 12C18 5 4 31 16 49C1 74 26 98 49 85C73 101 103 75 85 51C103 23 76 1 50 12Z" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M63 27C35 14 18 46 32 62C42 85 80 67 70 45C60 24 38 38 42 52C45 65 63 57 55 47" fill="none" stroke="currentColor" strokeWidth="3" /></>
  return <>{Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx="50" cy="26" rx="13" ry="22" transform={`rotate(${i * 60} 50 50)`} fill="none" stroke="currentColor" strokeWidth="3" />)}<circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="3" /></>
}
