"use client"

import { useState, useEffect } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps"
import { type FederalDistrict, type Region } from "@/lib/data"

const RUSSIA_GEO_URL = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/russia.geojson"
const MAP_COLOR = "#3B82F6"

// Новые территории (точки)
const newTerritories = [
  { id: "crimea", name: "Республика Крым", coordinates: [34.1, 45.0] as [number, number], districtId: "yufo" },
  { id: "sevastopol", name: "Севастополь", coordinates: [33.5, 44.6] as [number, number], districtId: "yufo" },
  { id: "donetsk", name: "ДНР", coordinates: [37.8, 48.0] as [number, number], districtId: "yufo" },
  { id: "luhansk", name: "ЛНР", coordinates: [39.3, 48.6] as [number, number], districtId: "yufo" },
  { id: "zaporozhye", name: "Запорожская обл.", coordinates: [35.2, 47.2] as [number, number], districtId: "yufo" },
  { id: "kherson", name: "Херсонская обл.", coordinates: [33.4, 46.6] as [number, number], districtId: "yufo" }
]

function getRealDistrictId(district: FederalDistrict): string {
  if (district.name.includes("Уральский") || district.shortName === "УФО") return "ufo"
  if (district.name.includes("Южный") || district.shortName === "ЮФО") return "yufo"
  if (["cfo", "szfo", "yufo", "skfo", "pfo", "ufo", "sfo", "dfo"].includes(district.id)) return district.id
  const map: Record<string, string> = { "цfo": "cfo", "сзfo": "szfo", "скfo": "skfo", "пfo": "pfo", "сfo": "sfo", "дfo": "dfo" }
  return map[district.id] || district.id
}

const regionToDistrict: Record<string, string> = {
  "Москва": "cfo", "Московская область": "cfo", "Белгородская область": "cfo", "Брянская область": "cfo",
  "Владимирская область": "cfo", "Воронежская область": "cfo", "Ивановская область": "cfo", "Калужская область": "cfo",
  "Костромская область": "cfo", "Курская область": "cfo", "Липецкая область": "cfo", "Орловская область": "cfo",
  "Рязанская область": "cfo", "Смоленская область": "cfo", "Тамбовская область": "cfo", "Тверская область": "cfo",
  "Тульская область": "cfo", "Ярославская область": "cfo",
  "Санкт-Петербург": "szfo", "Ленинградская область": "szfo", "Республика Карелия": "szfo", "Республика Коми": "szfo",
  "Архангельская область": "szfo", "Вологодская область": "szfo", "Калининградская область": "szfo", "Мурманская область": "szfo",
  "Новгородская область": "szfo", "Псковская область": "szfo", "Ненецкий автономный округ": "szfo",
  "Краснодарский край": "yufo", "Ростовская область": "yufo", "Астраханская область": "yufo", "Волгоградская область": "yufo",
  "Адыгея": "yufo", "Республика Калмыкия": "yufo", "Республика Крым": "yufo", "Крым": "yufo", "Севастополь": "yufo",
  "Донецкая Народная Республика": "yufo", "Луганская Народная Республика": "yufo", "Запорожская область": "yufo", "Херсонская область": "yufo",
  "Ставропольский край": "skfo", "Дагестан": "skfo", "Ингушетия": "skfo", "Кабардино-Балкарская республика": "skfo",
  "Карачаево-Черкесская республика": "skfo", "Северная Осетия - Алания": "skfo", "Чеченская республика": "skfo",
  "Башкортостан": "pfo", "Марий Эл": "pfo", "Республика Мордовия": "pfo", "Татарстан": "pfo",
  "Удмуртская республика": "pfo", "Чувашия": "pfo", "Кировская область": "pfo", "Нижегородская область": "pfo",
  "Оренбургская область": "pfo", "Пензенская область": "pfo", "Пермский край": "pfo", "Самарская область": "pfo",
  "Саратовская область": "pfo", "Ульяновская область": "pfo",
  "Свердловская область": "ufo", "Челябинская область": "ufo", "Курганская область": "ufo", "Тюменская область": "ufo",
  "Ханты-Мансийский автономный округ - Югра": "ufo", "Ямало-Ненецкий автономный округ": "ufo",
  "Новосибирская область": "sfo", "Омская область": "sfo", "Томская область": "sfo", "Алтайский край": "sfo",
  "Алтай": "sfo", "Кемеровская область": "sfo", "Красноярский край": "sfo", "Иркутская область": "sfo",
  "Республика Хакасия": "sfo", "Тыва": "sfo",
  "Приморский край": "dfo", "Хабаровский край": "dfo", "Амурская область": "dfo", "Магаданская область": "dfo",
  "Сахалинская область": "dfo", "Еврейская автономная область": "dfo", "Чукотский автономный округ": "dfo",
  "Республика Саха (Якутия)": "dfo", "Камчатский край": "dfo", "Забайкальский край": "dfo", "Бурятия": "dfo"
}

const districtCenters: Record<string, [number, number]> = {
  "cfo": [37.6, 55.8], "szfo": [30.3, 59.9], "yufo": [39.7, 47.2], "skfo": [43.5, 43.5],
  "pfo": [49.1, 55.8], "ufo": [60.6, 56.8], "sfo": [83.0, 55.0], "dfo": [135.0, 48.5]
}

const districtScales: Record<string, number> = {
  "cfo": 1400, "szfo": 1100, "yufo": 1200, "skfo": 1600, "pfo": 950, "ufo": 800, "sfo": 500, "dfo": 350
}

interface FederalDistrictMapProps {
  district: FederalDistrict
  onRegionClick: (region: Region) => void
  selectedRegion: Region | null
  onBack: () => void
}

export function FederalDistrictMap({ district, onRegionClick, selectedRegion, onBack }: FederalDistrictMapProps) {
  const [tooltipContent, setTooltipContent] = useState("")
  const realDistrictId = getRealDistrictId(district)
  const [position, setPosition] = useState({ coordinates: districtCenters[realDistrictId] || [100, 65], zoom: 1 })

  useEffect(() => {
    const realId = getRealDistrictId(district)
    setPosition({ coordinates: districtCenters[realId] || [100, 65], zoom: 1 })
  }, [district])

  const findRegionByName = (geoName: string): Region | undefined => {
    return district.regions.find(r => r.name === geoName || r.name.includes(geoName) || geoName.includes(r.name))
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-background/50 rounded-xl overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <button onClick={onBack} className="glass rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Назад
        </button>
        <div className="glass rounded-lg px-3 py-2 text-sm font-medium" style={{ borderLeft: `4px solid ${MAP_COLOR}` }}>{district.name}</div>
      </div>
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: districtScales[realDistrictId] || 1000, center: districtCenters[realDistrictId] || [100, 65] }} className="w-full h-full">
        <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={(pos) => setPosition(pos)} maxZoom={3} minZoom={0.8}>
          <Geographies geography={RUSSIA_GEO_URL}>
            {({ geographies }) => geographies.map((geo) => {
              const regionName = geo.properties.name
              if (regionToDistrict[regionName] !== realDistrictId) return null
              const region = findRegionByName(regionName)
              const isSelected = selectedRegion?.id === region?.id
              let opacity = region ? 0.75 : 0.6
              if (isSelected) opacity = 0.95
              return (
                <Geography
                  key={geo.rsmKey} geography={geo}
                  onMouseEnter={() => { const n = region?.name || regionName; setTooltipContent(region ? `${n}\nСРО: ${region.sroCount} | Членов: ${region.totalMembers}` : n) }}
                  onMouseLeave={() => setTooltipContent("")}
                  onClick={() => { if (region) onRegionClick(region) }}
                  style={{
                    default: { fill: MAP_COLOR, fillOpacity: opacity, stroke: "#1e293b", strokeWidth: 0.5, outline: "none", cursor: region ? "pointer" : "default" },
                    hover: { fill: MAP_COLOR, fillOpacity: 0.9, stroke: "#60a5fa", strokeWidth: 1, outline: "none", cursor: region ? "pointer" : "default" },
                    pressed: { fill: MAP_COLOR, fillOpacity: 1, stroke: "#3b82f6", strokeWidth: 1.5, outline: "none" }
                  }}
                />
              )
            })}
          </Geographies>
          {/* ТОЧКИ ДЛЯ НОВЫХ ТЕРРИТОРИЙ (КЛИКАБЕЛЬНЫЕ) */}
          {realDistrictId === "yufo" && newTerritories.map((t) => {
            const region = district.regions.find(r => r.name.includes(t.name) || t.name.includes(r.name))
            return (
              <Marker key={t.id} coordinates={t.coordinates}>
                <circle
                  r={6 / position.zoom}
                  fill={MAP_COLOR}
                  fillOpacity={selectedRegion?.id === region?.id ? 0.95 : 0.75}
                  stroke="#1e293b"
                  strokeWidth={1 / position.zoom}
                  style={{ cursor: "pointer" }}
                  onClick={() => { if (region) onRegionClick(region) }}
                  onMouseEnter={() => setTooltipContent(`${t.name}\nСРО: ${region?.sroCount || 0} | Членов: ${region?.totalMembers || 0}`)}
                  onMouseLeave={() => setTooltipContent("")}
                />
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>
      {tooltipContent && <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2 text-sm text-foreground">{tooltipContent.split('\n').map((l,i)=><div key={i} className={i===0?"font-semibold":"text-muted-foreground text-xs"}>{l}</div>)}</div>}
      <div className="absolute top-4 right-4 glass rounded-lg p-3 max-h-[60%] overflow-y-auto">
        <div className="text-xs font-semibold text-foreground mb-2">Субъекты {district.shortName}</div>
        <div className="space-y-1">
          {district.regions.map(r => (
            <div key={r.id} className={`flex items-center gap-2 cursor-pointer hover:opacity-80 text-xs ${selectedRegion?.id === r.id ? 'text-primary font-medium' : 'text-muted-foreground'}`} onClick={() => onRegionClick(r)}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MAP_COLOR }} /><span>{r.name}</span><span className="ml-auto text-[10px] opacity-60">{r.sroCount}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 3) }))} className="glass rounded p-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
        <button onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 0.8) }))} className="glass rounded p-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
        <button onClick={() => setPosition({ coordinates: districtCenters[realDistrictId] || [100, 65], zoom: 1 })} className="glass rounded p-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button>
      </div>
    </div>
  )
}