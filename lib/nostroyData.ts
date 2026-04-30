// lib/nostroyData.ts
import rawData from '@/public/data/nostroy.json' // положите ваш JSON сюда

export interface NostroyCompany {
  member_id: number
  inn: string
  name: string
  summary: {
    total_rows: number
    liability_vv: string | null
    liability_vv_status: string | null
    liability_odo: string | null
    liability_odo_status: string | null
    kf_vv_amount: string | null
    kf_odo_amount: string | null
    insurance_companies: string[]
    check_types: string[]
  }
}

// Загружаем данные
const data = rawData as { companies: NostroyCompany[] }

export const nostroyCompanies = data.companies

// Функции для поиска
export function findNostroyCompanyById(id: string): NostroyCompany | undefined {
  return nostroyCompanies.find(c => c.member_id.toString() === id)
}

export function findNostroyCompanyByInn(inn: string): NostroyCompany | undefined {
  return nostroyCompanies.find(c => c.inn === inn)
}

// Статистика по уровням ответственности
export function getLiabilityStats() {
  const vvLevels = { first: 0, second: 0, third: 0, simple: 0, other: 0 }
  const odoLevels = { first: 0, second: 0, third: 0, none: 0 }
  
  nostroyCompanies.forEach(c => {
    const vv = c.summary.liability_vv?.toLowerCase() || ''
    if (vv.includes('первый')) vvLevels.first++
    else if (vv.includes('второй')) vvLevels.second++
    else if (vv.includes('третий')) vvLevels.third++
    else if (vv.includes('простой')) vvLevels.simple++
    else vvLevels.other++
    
    const odo = c.summary.liability_odo?.toLowerCase() || ''
    if (odo.includes('первый')) odoLevels.first++
    else if (odo.includes('второй')) odoLevels.second++
    else if (odo.includes('третий')) odoLevels.third++
    else odoLevels.none++
  })
  
  return { vvLevels, odoLevels }
}