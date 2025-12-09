import type { Language } from '../data/questions'
import { init, id as instantId } from '@instantdb/core'

export type SurveyRecord = {
  id: string
  nickname: string
  emoji: string
  x: number
  y: number
  createdAt: string
  language: Language
  slogan?: string
  sloganColor?: string
  sloganWeight?: 'normal' | 'bold'
}

const LOCAL_KEY = 'pq_results_cache'
const APP_ID = import.meta.env.VITE_INSTANT_DB_APP_ID || ''
const INSTANT_ENABLED = Boolean(APP_ID)
const db = INSTANT_ENABLED ? init({ appId: APP_ID }) : null

function loadLocal(): SurveyRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as SurveyRecord[]) : []
  } catch {
    return []
  }
}

function saveLocal(data: SurveyRecord[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
  } catch {
    // ignore quota errors
  }
}

function makeId() {
  return `local-${crypto.randomUUID?.() || Date.now().toString(36)}`
}

function asRecord(data: Omit<SurveyRecord, 'id' | 'createdAt'>): SurveyRecord {
  return {
    ...data,
    id: makeId(),
    createdAt: new Date().toISOString(),
  }
}

export async function fetchResults(): Promise<SurveyRecord[]> {
  if (db) {
    try {
      await db.auth.signInAsGuest().catch(() => null)
      const res = await db.queryOnce({
        records: {
          $: {},
        },
      })
      const list = (res?.data as any)?.records ?? []
      if (list.length) {
        saveLocal(list)
        return list
      }
      console.warn('[instantdb] empty/unknown response', res)
    } catch (err) {
      console.warn('[instantdb] fetch failed, falling back to local', err)
    }
  }
  return loadLocal()
}

export async function saveResult(
  data: Omit<SurveyRecord, 'id' | 'createdAt'>
): Promise<SurveyRecord> {
  const record = asRecord(data)

  if (db) {
    try {
      await db.auth.signInAsGuest().catch(() => null)
      const newId = instantId()
      await db.transact([
        db.tx.records[newId].update({
          nickname: record.nickname,
          emoji: record.emoji,
          x: record.x,
          y: record.y,
          createdAt: record.createdAt,
          language: record.language,
          slogan: record.slogan,
          sloganColor: record.sloganColor,
          sloganWeight: record.sloganWeight,
        }),
      ])
      const saved = { ...record, id: newId }
      saveLocal([...loadLocal(), saved])
      return saved
    } catch (err) {
      console.warn('[instantdb] save failed, persisting locally', err)
    }
  }

  const localData = [...loadLocal(), record]
  saveLocal(localData)
  return record
}

export function jitteredPoint(
  record: SurveyRecord,
  spread = 2.2
): { x: number; y: number } {
  const seed = [...record.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const rand = (n: number) => {
    const x = Math.sin(seed * (n + 1) * 999) * 10000
    return x - Math.floor(x)
  }
  const offsetX = (rand(1) - 0.5) * spread * 2
  const offsetY = (rand(2) - 0.5) * spread * 2
  const clamp = (v: number) => Math.min(100, Math.max(0, v))
  return {
    x: clamp(record.x + offsetX),
    y: clamp(record.y + offsetY),
  }
}

