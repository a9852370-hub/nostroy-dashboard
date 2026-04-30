"use client"

import { useState } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps"
import { federalDistricts, type FederalDistrict } from "@/lib/data"

const RUSSIA_GEO_URL = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/russia.geojson"
const RUSSIA_COLOR = "#3B82F6"

// Функция получения РЕАЛЬНОГО ID округа
function getRealDistrictId(district: FederalDistrict | null): string | null {
  if (!district) return null
  if (["cfo", "szfo", "yufo", "skfo", "pfo", "ufo", "sfo", "dfo"].includes(district.id)) return district.id
  if (district.name.includes("Уральский") || district.shortName === "УФО") return "ufo"
  if (district.name.includes("Южный") || district.shortName === "ЮФО") return "yufo"
  const map: Record<string, string> = { "цfo": "cfo", "сзfo": "szfo", "скfo": "skfo", "пfo": "pfo", "сfo": "sfo", "дfo": "dfo" }
  return map[district.id] || district.id
}

function getRealDistrictIdFromString(id: string | null): string | null {
  if (!id) return null
  if (["cfo", "szfo", "yufo", "skfo", "pfo", "ufo", "sfo", "dfo"].includes(id)) return id
  const map: Record<string, string> = { "цfo": "cfo", "сзfo": "szfo", "уfo": "yufo", "скfo": "skfo", "пfo": "pfo", "сfo": "sfo", "дfo": "dfo" }
  return map[id] || id
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

const newTerritories = [
  { id: "crimea", name: "Республика Крым", coordinates: [34.1, 45.0] as [number, number], districtId: "yufo" },
  { id: "sevastopol", name: "Севастополь", coordinates: [33.5, 44.6] as [number, number], districtId: "yufo" },
  { id: "donetsk", name: "ДНР", coordinates: [37.8, 48.0] as [number, number], districtId: "yufo" },
  { id: "luhansk", name: "ЛНР", coordinates: [39.3, 48.6] as [number, number], districtId: "yufo" },
  { id: "zaporozhye", name: "Запорожская обл.", coordinates: [35.2, 47.2] as [number, number], districtId: "yufo" },
  { id: "kherson", name: "Херсонская обл.", coordinates: [33.4, 46.6] as [number, number], districtId: "yufo" }
]

const territoryPaths: Record<string, string> = {
  crimea: "M 33 44.2 L 34.5 44.8 L 35.8 45.2 L 36.2 45.5 L 36 46 L 35 46.2 L 33.8 45.8 L 32.8 45.3 L 32.5 44.8 L 33 44.2 Z",
  sevastopol: "M 33.2 44.5 L 33.6 44.6 L 33.5 44.9 L 33.1 44.8 Z",
  donetsk: "M 37 47.5 L 38.5 47.3 L 39 47.8 L 39.2 48.5 L 38.8 49 L 37.5 49.2 L 37 48.8 L 36.8 48 Z",
  luhansk: "M 38.5 48.2 L 40 48 L 40.5 48.5 L 40.2 49.5 L 39 49.8 L 38.2 49.3 L 38.5 48.2 Z",
  zaporozhye: "M 34.5 46.5 L 36.5 46.3 L 37 47 L 36.8 47.8 L 35.5 48 L 34.2 47.5 L 34.5 46.5 Z",
  kherson: "M 32.5 46 L 34.5 45.8 L 35 46.5 L 34.8 47.2 L 33.2 47.5 L 32.2 47 L 32.5 46 Z"
}

interface RussiaMapProps {
  onDistrictClick: (district: FederalDistrict) => void
  selectedDistrict: FederalDistrict | null
}

export function RussiaMap({ onDistrictClick, selectedDistrict }: RussiaMapProps) {
  const [tooltipContent, setTooltipContent] = useState("")
  const [position, setPosition] = useState({ coordinates: [100, 65] as [number, number], zoom: 1 })
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

  const getDistrictForRegion = (regionName: string): FederalDistrict | undefined => {
    const targetId = regionToDistrict[regionName]
    if (!targetId) return undefined
    return federalDistricts.find(d => getRealDistrictId(d) === targetId)
  }

  const getDistrictById = (id: string) => federalDistricts.find(d => getRealDistrictId(d) === id)

  const realSelectedId = getRealDistrictId(selectedDistrict)
  const realHoveredId = getRealDistrictIdFromString(hoveredDistrict)

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 350, center: [100, 65] }} className="w-full h-full">
        <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={(pos) => setPosition(pos)}>
          <Geographies geography={RUSSIA_GEO_URL}>
            {({ geographies }) => geographies.map((geo) => {
              const regionName = geo.properties.name
              const district = getDistrictForRegion(regionName)
              const districtId = district ? getRealDistrictId(district) : null
              const isSelected = realSelectedId === districtId
              const isHovered = realHoveredId === districtId
              let opacity = 0.6
              if (isSelected) opacity = 0.9
              else if (isHovered) opacity = 0.85
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => { setHoveredDistrict(districtId); setTooltipContent(district ? `${district.name}\n${regionName}` : regionName) }}
                  onMouseLeave={() => { setHoveredDistrict(null); setTooltipContent("") }}
                  onClick={() => { if (district) onDistrictClick(district) }}
                  style={{
                    default: { fill: RUSSIA_COLOR, fillOpacity: opacity, stroke: "#1e293b", strokeWidth: 0.5, outline: "none", cursor: district ? "pointer" : "default" },
                    hover: { fill: RUSSIA_COLOR, fillOpacity: 0.85, stroke: "#60a5fa", strokeWidth: 0.8, outline: "none", cursor: district ? "pointer" : "default" },
                    pressed: { fill: RUSSIA_COLOR, fillOpacity: 0.9, stroke: "#3b82f6", strokeWidth: 1, outline: "none" }
                  }}
                />
              )
            })}
          </Geographies>
          {newTerritories.map((t) => {
            const district = getDistrictById(t.districtId)
            const districtId = district ? getRealDistrictId(district) : null
            const isSelected = realSelectedId === t.districtId
            const isHovered = realHoveredId === t.districtId
            const path = territoryPaths[t.id]
            if (!path) return null
            let opacity = 0.6
            if (isSelected) opacity = 0.9
            else if (isHovered) opacity = 0.85
            return (
              <g key={t.id}>
                <path d={path} fill={RUSSIA_COLOR} fillOpacity={opacity} stroke="#1e293b" strokeWidth={0.3 / position.zoom} style={{ cursor: "pointer" }}
                  onMouseEnter={() => { setHoveredDistrict(t.districtId); setTooltipContent(`${district?.name || "ЮФО"}\n${t.name}`) }}
                  onMouseLeave={() => { setHoveredDistrict(null); setTooltipContent("") }}
                  onClick={() => { if (district) onDistrictClick(district) }} />
              </g>
            )
          })}
          {position.zoom < 3 && newTerritories.map((t) => {
            const district = getDistrictById(t.districtId)
            const isSelected = realSelectedId === t.districtId
            const isHovered = realHoveredId === t.districtId
            let opacity = 0.8
            if (isSelected) opacity = 1
            else if (isHovered) opacity = 0.95
            return (
              <Marker key={`m-${t.id}`} coordinates={t.coordinates}>
                <circle r={3 / position.zoom} fill={RUSSIA_COLOR} fillOpacity={opacity} stroke="#1e293b" strokeWidth={0.5 / position.zoom} style={{ cursor: "pointer" }}
                  onMouseEnter={() => { setHoveredDistrict(t.districtId); setTooltipContent(`${district?.name || "ЮФО"}\n${t.name}`) }}
                  onMouseLeave={() => { setHoveredDistrict(null); setTooltipContent("") }}
                  onClick={() => { if (district) onDistrictClick(district) }} />
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>
      {tooltipContent && <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2 text-sm text-foreground">{tooltipContent.split('\n').map((l,i)=><div key={i} className={i===0?"font-semibold":"text-muted-foreground text-xs"}>{l}</div>)}</div>}
      <div className="absolute top-4 right-4 glass rounded-lg p-3 space-y-1">
        <div className="text-xs font-semibold text-foreground mb-2">Федеральные округа</div>
        {federalDistricts.map(d => {
          const realId = getRealDistrictId(d)
          return (
            <div key={d.id} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onDistrictClick(d)} onMouseEnter={() => setHoveredDistrict(realId)} onMouseLeave={() => setHoveredDistrict(null)}>
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: RUSSIA_COLOR }} /><span className="text-xs text-muted-foreground">{d.shortName}</span>
            </div>
          )
        })}
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }))} className="glass rounded p-2 hover:bg-primary/20"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
        <button onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))} className="glass rounded p-2 hover:bg-primary/20"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
        <button onClick={() => setPosition({ coordinates: [100, 65], zoom: 1 })} className="glass rounded p-2 hover:bg-primary/20"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button>
      </div>
    </div>
  )
}