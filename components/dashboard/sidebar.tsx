"use client"

import { useState, useEffect } from "react"
import { Search, Building2, MapPin, FileText, Users, Landmark, ChevronRight, X, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type FederalDistrict, federalDistricts, type SRO, type Company } from "@/lib/data"
import { searchSROs as searchSROsFlat, searchCompanies as searchCompaniesFlat, type FlatSRO, type FlatCompany } from "@/lib/flat-data"
import { cn } from "@/lib/utils"

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} млрд ₽`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} млн ₽`
  return `${value.toLocaleString("ru-RU")} ₽`
}

// Fallback поиск СРО
function searchSROs(query: string): SRO[] {
  const results: SRO[] = []
  const lowerQuery = query.toLowerCase()
  for (const district of federalDistricts) {
    for (const region of district.regions) {
      for (const sro of region.sros) {
        if (sro.name.toLowerCase().includes(lowerQuery) || sro.inn.includes(query)) {
          results.push(sro)
        }
      }
    }
  }
  return results
}

// Fallback поиск компаний
function searchCompanies(query: string): { company: Company; sro: SRO }[] {
  const results: { company: Company; sro: SRO }[] = []
  const lowerQuery = query.toLowerCase()
  for (const district of federalDistricts) {
    for (const region of district.regions) {
      for (const sro of region.sros) {
        for (const company of sro.companies) {
          if (company.name.toLowerCase().includes(lowerQuery) || company.inn.includes(query)) {
            results.push({ company, sro })
          }
        }
      }
    }
  }
  return results
}

const federalStats = {
  totalSro: federalDistricts.reduce((sum, d) => sum + d.totalSro, 0),
  totalMembers: federalDistricts.reduce((sum, d) => sum + d.totalMembers, 0),
  totalKfOdo: federalDistricts.reduce((sum, d) => sum + d.kfOdo, 0),
  totalKfVv: federalDistricts.reduce((sum, d) => sum + d.kfVv, 0),
  totalCourtCases: federalDistricts.reduce((sum, d) => sum + d.courtCases, 0),
  courtClaimsGrowth: { from: 1800000000, to: 4200000000, yearStart: "2024", yearEnd: "2027" }
}

interface SidebarProps {
  onSROSelect: (sroId: string) => void
  onCompanySelect: (companyId: string) => void
  onDistrictSelect: (district: FederalDistrict) => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ onSROSelect, onCompanySelect, onDistrictSelect, isOpen, onClose }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sroResults, setSroResults] = useState<FlatSRO[]>([])
  const [companyResults, setCompanyResults] = useState<FlatCompany[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        try {
          const sros = searchSROsFlat(searchQuery)
          const companies = searchCompaniesFlat(searchQuery)
          setSroResults(sros.slice(0, 5))
          setCompanyResults(companies.slice(0, 5))
        } catch {
          const sros = searchSROs(searchQuery)
          const companies = searchCompanies(searchQuery)
          setSroResults(sros.slice(0, 5) as any)
          setCompanyResults(companies.map(c => ({
            ...c.company,
            sroId: c.sro.id,
            sroName: c.sro.name,
            sroRegistrationNumber: c.sro.registrationNumber
          })) as any)
        }
        setIsSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSroResults([])
      setCompanyResults([])
    }
  }, [searchQuery])

  const sortedDistricts = [...federalDistricts].sort((a, b) => b.kfOdo - a.kfOdo)

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-sidebar-foreground">НОСТРОЙ</h1>
                <p className="text-xs text-muted-foreground">Ситуационный центр</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по ИНН или названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchQuery.length >= 2 ? (
            <div className="p-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (sroResults.length > 0 || companyResults.length > 0) ? (
                <div className="space-y-4">
                  {sroResults.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">СРО ({sroResults.length})</h3>
                      <div className="space-y-2">
                        {sroResults.map(sro => (
                          <button key={sro.id} onClick={() => { onSROSelect(sro.id); setSearchQuery("") }} className="w-full text-left p-3 rounded-lg glass-hover">
                            <div className="flex items-start gap-3">
                              <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <div className="min-w-0"><p className="text-sm font-medium truncate">{sro.name}</p><p className="text-xs text-muted-foreground">ИНН: {sro.inn}</p></div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {companyResults.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Организации ({companyResults.length})</h3>
                      <div className="space-y-2">
                        {companyResults.map(company => (
                          <button key={company.id} onClick={() => { onCompanySelect(company.id); setSearchQuery("") }} className={cn(
                            "w-full text-left p-3 rounded-lg glass-hover",
                            company.riskLevel === "red" && "border-l-2 border-l-red-500",
                            company.riskLevel === "yellow" && "border-l-2 border-l-yellow-500",
                            company.riskLevel === "green" && "border-l-2 border-l-green-500"
                          )}>
                            <div className="flex items-start gap-3">
                              <RiskIndicator riskLevel={company.riskLevel} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{company.name}</p>
                                <p className="text-xs text-muted-foreground">ИНН: {company.inn}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{company.sroName}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">Ничего не найдено</div>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Федеральный уровень</h3>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard icon={<Building2 />} label="Всего СРО" value={federalStats.totalSro.toString()} color="text-chart-1" />
                  <StatCard icon={<Users />} label="Членов" value={`${(federalStats.totalMembers / 1000).toFixed(0)}K`} color="text-chart-2" />
                  <StatCard icon={<Landmark />} label="КФ ОДО" value={`${(federalStats.totalKfOdo / 1000000000).toFixed(1)}B`} color="text-chart-3" />
                  <StatCard icon={<FileText />} label="Суд. дела" value={federalStats.totalCourtCases.toString()} color="text-chart-5" trend="up" />
                </div>
              </div>

              <button className="w-full text-left bg-red-500/10 border border-red-500/20 rounded-lg p-3 hover:bg-red-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-400 flex items-center gap-1">Прогноз роста исков <TrendingUp className="w-3 h-3" /></p>
                    <p className="text-xs text-muted-foreground mt-1">С {formatCurrency(federalStats.courtClaimsGrowth.from)} до {formatCurrency(federalStats.courtClaimsGrowth.to)}</p>
                    <p className="text-[10px] text-muted-foreground">{federalStats.courtClaimsGrowth.yearStart} → {federalStats.courtClaimsGrowth.yearEnd}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400 shrink-0 ml-auto" />
                </div>
              </button>

              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center justify-between">
                  <span>Федеральные округа</span>
                  <span className="text-[10px] font-normal">по КФ ОДО</span>
                </h3>
                <div className="space-y-1">
                  {sortedDistricts.map((district, index) => (
                    <button key={district.id} onClick={() => { onDistrictSelect(district); onClose() }} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">#{index + 1}</span>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: district.color }} />
                        <span className="text-sm">{district.shortName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{district.totalSro} СРО</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground text-center">Данные актуальны на {new Date().toLocaleDateString('ru-RU')}</div>
        </div>
      </aside>
    </>
  )
}

function RiskIndicator({ riskLevel }: { riskLevel: "green" | "yellow" | "red" }) {
  const bg = riskLevel === "red" ? "rgba(239,68,68,0.2)" : riskLevel === "yellow" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"
  return (
    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
      {riskLevel === "red" ? <AlertTriangle className="w-4 h-4 text-red-400" /> : riskLevel === "yellow" ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
    </div>
  )
}

function StatCard({ icon, label, value, color, trend }: { icon: React.ReactNode; label: string; value: string; color: string; trend?: "up" | "down" }) {
  return (
    <div className="glass rounded-lg p-3 cursor-pointer hover:border-primary/30 border border-transparent">
      <div className={cn("mb-1 flex items-center justify-between", color)}>{icon}{trend && <TrendingUp className={cn("w-3 h-3", trend === "up" ? "text-red-400" : "text-green-400")} />}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}