"use client"

import { ArrowLeft, Building2, AlertTriangle, CheckCircle, XCircle, TrendingUp, Shield, Gavel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type SRO, type Company } from "@/lib/data"
import { getCompaniesBySroId } from "@/lib/flat-data"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

type RiskLevel = "green" | "yellow" | "red"

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

interface CompanyListProps {
  sro: SRO
  districtColor: string
  onBack: () => void
  onCompanySelect: (company: Company) => void
  selectedCompany: Company | null
}

export function CompanyList({ sro, districtColor, onBack, onCompanySelect, selectedCompany }: CompanyListProps) {
  // ЕДИНСТВЕННОЕ ИЗМЕНЕНИЕ: получаем компании через flat-data вместо sro.companies
  const companies = getCompaniesBySroId(sro.id)
  
  const riskData = [
    { name: "Низкий", value: companies.filter(c => c.riskLevel === "green").length, color: "#10b981" },
    { name: "Средний", value: companies.filter(c => c.riskLevel === "yellow").length, color: "#f59e0b" },
    { name: "Высокий", value: companies.filter(c => c.riskLevel === "red").length, color: "#ef4444" }
  ].filter(d => d.value > 0)

  const sortedCompanies = [...companies].sort((a, b) => {
    const riskOrder: Record<RiskLevel, number> = { red: 0, yellow: 1, green: 2 }
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
  })

  return (
    <div className="glass rounded-xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-9 w-9 p-0 hover:bg-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${districtColor}20` }}
          >
            <Building2 className="w-5 h-5" style={{ color: districtColor }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{sro.name}</h2>
            <p className="text-sm text-muted-foreground">Организации-члены ({companies.length})</p>
          </div>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">Распределение рисков</h3>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass rounded-lg px-3 py-2 text-xs">
                          <span style={{ color: payload[0].payload.color }}>{payload[0].name}: {payload[0].value}</span>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <RiskStatCard 
            icon={<CheckCircle className="w-4 h-4" />}
            label="Низкий"
            value={companies.filter(c => c.riskLevel === "green").length}
            color="#10b981"
          />
          <RiskStatCard 
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Средний"
            value={companies.filter(c => c.riskLevel === "yellow").length}
            color="#f59e0b"
          />
          <RiskStatCard 
            icon={<XCircle className="w-4 h-4" />}
            label="Высокий"
            value={companies.filter(c => c.riskLevel === "red").length}
            color="#ef4444"
          />
        </div>
      </div>

      {/* Company List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          Организации
          <span className="text-xs text-muted-foreground font-normal">(сортировка по риску)</span>
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {sortedCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => onCompanySelect(company)}
              className={cn(
                "w-full text-left p-4 rounded-lg transition-all",
                selectedCompany?.id === company.id
                  ? "bg-primary/20 border border-primary/40 glow"
                  : "glass-hover hover:border-primary/20 border border-transparent",
                company.riskLevel === "red" && "border-l-2 border-l-red-500",
                company.riskLevel === "yellow" && "border-l-2 border-l-yellow-500",
                company.riskLevel === "green" && "border-l-2 border-l-green-500"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <TrafficLight riskLevel={company.riskLevel} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {company.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ИНН: {company.inn}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {formatCurrency(company.contractVolume)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {company.insuranceStatus === "active" ? "Застрахован" : "Нет страховки"}
                      </span>
                      {company.courtCases.length > 0 && (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                          <Gavel className="w-3 h-3" />
                          {company.courtCases.length} дел
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <RiskBadge riskLevel={company.riskLevel} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function TrafficLight({ riskLevel }: { riskLevel: RiskLevel }) {
  return (
    <div className="flex flex-col gap-1 p-1 bg-secondary rounded-md">
      <div className={cn(
        "w-3 h-3 rounded-full transition-all",
        riskLevel === "red" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-red-500/20"
      )} />
      <div className={cn(
        "w-3 h-3 rounded-full transition-all",
        riskLevel === "yellow" ? "bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-yellow-500/20"
      )} />
      <div className={cn(
        "w-3 h-3 rounded-full transition-all",
        riskLevel === "green" ? "bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-green-500/20"
      )} />
    </div>
  )
}

function RiskBadge({ riskLevel }: { riskLevel: RiskLevel }) {
  const config = {
    green: { label: "Низкий", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    yellow: { label: "Средний", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    red: { label: "Высокий", className: "bg-red-500/20 text-red-400 border-red-500/30" }
  }[riskLevel]

  return (
    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 shrink-0", config.className)}>
      {config.label}
    </Badge>
  )
}

function RiskStatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3 text-center">
      <div className="w-8 h-8 rounded-md mx-auto mb-1 flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}