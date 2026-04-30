"use client"

import { type Region, type SRO } from "@/lib/data"

interface SROListProps {
  region: Region
  districtColor: string
  onBack: () => void
  onSROSelect: (sro: SRO) => void
  onSROCardOpen: (sro: SRO) => void
  selectedSRO: SRO | null
}

export function SROList({
  region,
  districtColor,
  onBack,
  onSROSelect,
  onSROCardOpen,
  selectedSRO,
}: SROListProps) {
  // Сортируем СРО по количеству членов (от большего к меньшему)
  const sortedSROs = [...region.sros].sort((a, b) => b.memberCount - a.memberCount)

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-primary">
          ← Назад к {region.name}
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold">{region.name}</h2>
        <p className="text-muted-foreground">СРО в регионе: {region.sros.length}</p>
      </div>

      <div className="space-y-3">
        {sortedSROs.map((sro) => (
          <div
            key={sro.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedSRO?.id === sro.id
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            style={{ borderLeftColor: districtColor, borderLeftWidth: "4px" }}
            onClick={() => onSROSelect(sro)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{sro.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span>Членов: <strong>{sro.memberCount}</strong></span>
                  <span>КФ ВВ: {sro.kfVv.toLocaleString("ru-RU")} ₽</span>
                  <span>КФ ОДО: {sro.kfOdo.toLocaleString("ru-RU")} ₽</span>
                  <span>Судебных дел: {sro.courtCases}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    sro.status === "active" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {sro.status === "active" ? "Активна" : "Неактивна"}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSROCardOpen(sro)
                }}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Подробнее →
              </button>
            </div>
          </div>
        ))}

        {sortedSROs.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            В этом регионе нет СРО с компаниями
          </p>
        )}
      </div>
    </div>
  )
}