export function readSaved<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}
export function save(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false } }
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('elike-private-designs', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('assets')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Your browser could not save this design. Please allow site storage and try again.'))
  })
}
export async function saveAsset(id: string, blob: Blob) {
  const db = await database()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('assets', 'readwrite'); tx.objectStore('assets').put(blob, id)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(new Error('Design storage is full. Please free some space and try again.')) }
  })
}
export async function getAsset(id: string): Promise<Blob | undefined> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const request = db.transaction('assets').objectStore('assets').get(id)
    request.onsuccess = () => { db.close(); resolve(request.result) }
    request.onerror = () => { db.close(); reject(new Error('Could not load your saved design.')) }
  })
}
