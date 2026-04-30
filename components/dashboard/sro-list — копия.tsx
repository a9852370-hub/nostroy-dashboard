"use client"

import { ArrowLeft, Building2, Users, FileText, CheckCircle2, AlertCircle, XCircle, ChevronRight, Info, TrendingDown, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Region, type SRO } from "@/lib/data"
import { cn } from "@/lib/utils"

// Функция форматирования валюты
function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)} млрд ₽`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} млн ₽`
  }
  return `${value.toLocaleString("ru-RU")} ₽`
}

interface SROListProps {
  region: Region
  districtColor: string
  onBack: () => void
  onSROSelect: (sro: SRO) => void
  onSROCardOpen: (sro: SRO) => void
  selectedSRO: SRO | null
}

export function SROList({ region, districtColor, onBack, onSROSelect, onSROCardOpen, selectedSRO }: SROListProps) {
  // Sort SROs by KF size descending
  const sortedSROs = [...region.sros].sort((a, b) => b.kfOdo - a.kfOdo)

  return (
    <div className="glass rounded-xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-9 w-9 p-0 hover:bg-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary"
          >
            <span className="text-sm font-bold text-secondary-foreground">{region.code}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{region.name}</h2>
            <p className="text-sm text-muted-foreground">{region.sroCount} организаций</p>
          </div>
        </div>
      </div>

      {/* Region Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4" style={{ color: districtColor }} />
            <span className="text-xs text-muted-foreground">КФ ОДО</span>
          </div>
          <div className="text-sm font-bold text-foreground">{formatCurrency(region.kfOdo)}</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4" style={{ color: districtColor }} />
            <span className="text-xs text-muted-foreground">КФ ВВ</span>
          </div>
          <div className="text-sm font-bold text-foreground">{formatCurrency(region.kfVv)}</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: districtColor }} />
            <span className="text-xs text-muted-foreground">Членов</span>
          </div>
          <div className="text-sm font-bold text-foreground">{region.totalMembers.toLocaleString("ru-RU")}</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4" style={{ color: districtColor }} />
            <span className="text-xs text-muted-foreground">Суд. дела</span>
          </div>
          <div className="text-sm font-bold text-foreground">{region.courtCases}</div>
        </div>
      </div>

      {/* SRO List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Список СРО
          </h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Сортировка по КФ
          </span>
        </div>
        
        {region.sros.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Данные о СРО в этом регионе пока недоступны
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {sortedSROs.map((sro, index) => (
              <div
                key={sro.id}
                className={cn(
                  "p-4 rounded-lg transition-all",
                  selectedSRO?.id === sro.id
                    ? "bg-primary/20 border border-primary/40 glow"
                    : "glass-hover hover:border-primary/20 border border-transparent"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => onSROSelect(sro)}
                    className="flex items-start gap-3 min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-muted-foreground w-5">
                        #{index + 1}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {sro.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ИНН: {sro.inn}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {sro.memberCount}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: districtColor }}>
                          <Landmark className="w-3 h-3" />
                          {formatCurrency(sro.kfOdo)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {sro.courtCases} дел
                        </span>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={sro.status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSROCardOpen(sro)
                      }}
                      className="h-8 w-8 p-0 hover:bg-primary/20"
                      title="Подробная информация"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      selectedSRO?.id === sro.id ? "text-primary rotate-90" : "text-muted-foreground"
                    )} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: SRO["status"] }) {
  const config = {
    active: { label: "Активна", icon: CheckCircle2, className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
    suspended: { label: "Приостановлена", icon: AlertCircle, className: "bg-chart-4/20 text-chart-4 border-chart-4/30" },
    liquidated: { label: "Ликвидирована", icon: XCircle, className: "bg-chart-5/20 text-chart-5 border-chart-5/30" }
  }[status]

  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", config.className)}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  )
}