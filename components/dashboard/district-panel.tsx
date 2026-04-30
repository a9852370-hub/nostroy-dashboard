"use client"

import { ArrowLeft, Building2, Users, Landmark, FileText, MapPin, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type FederalDistrict, type Region, formatCurrency } from "@/lib/data"
import { cn } from "@/lib/utils"

interface DistrictPanelProps {
  district: FederalDistrict
  onBack: () => void
  onRegionSelect: (region: Region) => void
  selectedRegion: Region | null
}

export function DistrictPanel({ district, onBack, onRegionSelect, selectedRegion }: DistrictPanelProps) {
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
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${district.color}20` }}
          >
            <MapPin className="w-5 h-5" style={{ color: district.color }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{district.name}</h2>
            <p className="text-sm text-muted-foreground">{district.shortName}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatBox
          icon={<Building2 className="w-4 h-4" />}
          label="СРО"
          value={district.totalSro.toString()}
          color={district.color}
        />
        <StatBox
          icon={<Users className="w-4 h-4" />}
          label="Членов"
          value={district.totalMembers.toLocaleString("ru-RU")}
          color={district.color}
        />
        <StatBox
          icon={<Landmark className="w-4 h-4" />}
          label="КФ ОДО"
          value={formatCurrency(district.kfOdo)}
          color={district.color}
        />
        <StatBox
          icon={<FileText className="w-4 h-4" />}
          label="Суд. дела"
          value={district.courtCases.toString()}
          color={district.color}
        />
      </div>

      {/* Regions List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Субъекты ({district.regions.length})
        </h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {district.regions.map((region) => (
            <button
              key={region.id}
              onClick={() => onRegionSelect(region)}
              className={cn(
                "w-full text-left p-4 rounded-lg transition-all",
                selectedRegion?.id === region.id
                  ? "bg-primary/20 border border-primary/40 glow"
                  : "glass-hover hover:border-primary/20 border border-transparent"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-secondary-foreground">
                      {region.code}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{region.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {region.sroCount} СРО
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {region.totalMembers.toLocaleString("ru-RU")} членов
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform",
                  selectedRegion?.id === region.id ? "text-primary rotate-90" : "text-muted-foreground"
                )} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface StatBoxProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}

function StatBox({ icon, label, value, color }: StatBoxProps) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  )
}
