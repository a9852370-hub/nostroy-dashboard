"use client"

import { 
  X, Building2, User, Phone, Mail, MapPin, FileText, 
  CheckCircle2, AlertCircle, XCircle, Hash, Calendar,
  Shield, TrendingUp, Gavel, AlertTriangle, Award, ClipboardCheck, FileCheck, Users, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Company, type SRO, type FederalDistrict } from "@/lib/data"
import { getCompaniesBySroId, type FlatCompany } from "@/lib/flat-data"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

type RiskLevel = "green" | "yellow" | "red"

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} млрд ₽`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} млн ₽`
  return `${value.toLocaleString("ru-RU")} ₽`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Н/Д"
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU')
  } catch {
    return dateStr
  }
}

interface CompanyCardProps {
  company: Company
  sro: SRO
  district: FederalDistrict
  onClose: () => void
}

export function CompanyCard({ company, sro, district, onClose }: CompanyCardProps) {
  const allCompanies = getCompaniesBySroId(sro.id)
  const fullCompany = allCompanies.find(c => c.id === company.id) as FlatCompany | undefined
  
  const riskConfig = {
    green: { label: "Низкий риск", icon: CheckCircle2, color: "#10b981", bgClass: "bg-green-500/20", textClass: "text-green-400", borderClass: "border-green-500/30" },
    yellow: { label: "Средний риск", icon: AlertCircle, color: "#f59e0b", bgClass: "bg-yellow-500/20", textClass: "text-yellow-400", borderClass: "border-yellow-500/30" },
    red: { label: "Высокий риск", icon: XCircle, color: "#ef4444", bgClass: "bg-red-500/20", textClass: "text-red-400", borderClass: "border-red-500/30" }
  }[company.riskLevel]

  const RiskIcon = riskConfig.icon
  const kfUsagePercent = (company.kfUsed / company.kfLimit) * 100
  const kfRemaining = company.kfLimit - company.kfUsed

  // Реальные данные из members_full_data.json
  const insurance = (fullCompany as any)?.insurance || []
  const certificates = (fullCompany as any)?.certificates || []
  const checks = (fullCompany as any)?.checks || []
  const contracts = (fullCompany as any)?.contracts || []
  const experts = (fullCompany as any)?.experts || []
  const totalLiability = (fullCompany as any)?.members_total_liability

  // Демонстрационные данные (отмечены *)
  const isDemoData = true

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className={cn(
        "relative w-full max-w-3xl bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto",
        company.riskLevel === "red" && "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]",
        company.riskLevel === "yellow" && "border-yellow-500/30",
        company.riskLevel === "green" && "border-border"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-border" style={{ background: `linear-gradient(135deg, ${riskConfig.color}15 0%, transparent 100%)` }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <TrafficLight riskLevel={company.riskLevel} />
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{company.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{sro.name}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 hover:bg-destructive/20 shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <Badge variant="outline" className={cn("px-2 py-1", riskConfig.bgClass, riskConfig.textClass, riskConfig.borderClass)}>
              <RiskIcon className="w-3.5 h-3.5 mr-1.5" />{riskConfig.label}
            </Badge>
            <Badge variant="outline" className={cn("px-2 py-1", company.insuranceStatus === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              {company.insuranceStatus === "active" ? "Застрахован" : company.insuranceStatus === "expired" ? "Страховка истекла" : "Нет страховки"}
            </Badge>
            {totalLiability && (
              <Badge variant="outline" className="px-2 py-1 bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Award className="w-3.5 h-3.5 mr-1.5" />
                Уровень ответственности: {totalLiability}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Финансовые показатели (ДЕМО) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-secondary/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                Объём контрактов vs Лимит КФ
                <span className="text-amber-400 text-xs font-normal flex items-center"><Sparkles className="w-3 h-3 mr-0.5" />демо*</span>
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Использовано {kfUsagePercent.toFixed(1)}% от лимита КФ</p>
              <GaugeChart value={kfUsagePercent} riskLevel={company.riskLevel} />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Использовано*</div>
                  <div className="text-sm font-bold text-foreground italic">{formatCurrency(company.kfUsed)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Остаток*</div>
                  <div className="text-sm font-bold text-foreground italic">{formatCurrency(kfRemaining)}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  Финансовые показатели
                  <span className="text-amber-400 text-xs font-normal flex items-center"><Sparkles className="w-3 h-3 mr-0.5" />демо*</span>
                </h3>
                <div className="space-y-3">
                  <MetricRow icon={<TrendingUp />} label="Объём контрактов*" value={formatCurrency(company.contractVolume)} color={district.color} demo />
                  <MetricRow icon={<Building2 />} label="Лимит КФ*" value={formatCurrency(company.kfLimit)} color={district.color} demo />
                  <MetricRow icon={<Shield />} label="Сумма страховки*" value={formatCurrency(company.insuranceAmount)} color={district.color} demo />
                </div>
              </div>
            </div>
          </div>

          {/* УРОВЕНЬ ОТВЕТСТВЕННОСТИ */}
          {totalLiability ? (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />Уровень ответственности
              </h3>
              <p className="text-2xl font-bold text-foreground">{totalLiability}</p>
              <p className="text-xs text-muted-foreground mt-1">Уровень ответственности члена СРО</p>
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Нет данных об уровне ответственности</p>
            </div>
          )}

          {/* СТРАХОВКИ */}
          {insurance.length > 0 ? (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />Договоры страхования ({insurance.length})
              </h3>
              <div className="space-y-3">
                {insurance.map((ins: any, idx: number) => (
                  <div key={idx} className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground">
                      {ins.insurance_company || ins.company || ins.name || 'Страховая компания'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Полис: {ins.policy_number || ins.number || 'Н/Д'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Сумма: {formatCurrency(ins.amount || ins.insurance_amount || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Период: {formatDate(ins.start_date || ins.date_from)} – {formatDate(ins.end_date || ins.date_to)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Нет данных о страховании</p>
            </div>
          )}

          {/* СВИДЕТЕЛЬСТВА О ДОПУСКЕ */}
          {certificates.length > 0 ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />Свидетельства о допуске ({certificates.length})
              </h3>
              <div className="space-y-3">
                {certificates.map((cert: any, idx: number) => (
                  <div key={idx} className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground">
                      {cert.number || cert.certificate_number || `Свидетельство №${idx + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Выдано: {formatDate(cert.date || cert.issue_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Статус: {cert.status || 'Действует'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Нет свидетельств о допуске</p>
            </div>
          )}

          {/* ПРОВЕРКИ СРО */}
          {checks.length > 0 ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />Проверки СРО ({checks.length})
              </h3>
              <div className="space-y-3">
                {checks.map((check: any, idx: number) => (
                  <div key={idx} className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground">
                      {check.type || check.check_type || 'Плановая проверка'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Дата: {formatDate(check.date || check.check_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Результат: {check.result || check.status || 'Н/Д'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Нет данных о проверках</p>
            </div>
          )}

          {/* ДОГОВОРЫ */}
          {contracts.length > 0 ? (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />Договоры ({contracts.length})
              </h3>
              <div className="space-y-3">
                {contracts.map((contract: any, idx: number) => (
                  <div key={idx} className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground">
                      {contract.number || `Договор №${idx + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Дата: {formatDate(contract.date || contract.sign_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Сумма: {formatCurrency(contract.amount || contract.price || 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Нет данных о договорах</p>
            </div>
          )}

          {/* ЭКСПЕРТЫ НОСТРОЙ */}
          {experts.length > 0 ? (
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />Эксперты НОСТРОЙ ({experts.length})
              </h3>
              <div className="space-y-3">
                {experts.map((expert: any, idx: number) => (
                  <div key={idx} className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground">
                      {expert.name || expert.full_name || `Эксперт ${idx + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Специализация: {expert.specialization || 'Н/Д'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Сертификат: {expert.certificate || 'Н/Д'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Нет данных об экспертах</p>
            </div>
          )}

          {/* СУДЕБНЫЕ ДЕЛА */}
          {company.courtCases.length > 0 ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <Gavel className="w-4 h-4" />Судебные дела ({company.courtCases.length})
              </h3>
              <div className="space-y-2">
                {company.courtCases.map((caseItem) => (
                  <div key={caseItem.id} className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-foreground">{caseItem.number}</p>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", caseItem.status === "active" ? "bg-red-500/20 text-red-400" : caseItem.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400")}>
                        {caseItem.status === "active" ? "Активно" : caseItem.status === "pending" ? "Ожидание" : "Завершено"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{caseItem.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{formatDate(caseItem.date)}</span>
                      <span className="text-red-400">{formatCurrency(caseItem.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Нет судебных дел</p>
            </div>
          )}

          {/* Реквизиты */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Реквизиты</h3>
              <DetailRow icon={<Hash />} label="ИНН" value={company.inn} />
              <DetailRow icon={<Hash />} label="ОГРН" value={company.ogrn} />
              <DetailRow icon={<Calendar />} label="Дата регистрации" value={formatDate(company.registrationDate)} />
              <DetailRow icon={<User />} label="Руководитель" value={company.director} />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Контакты</h3>
              <DetailRow icon={<MapPin />} label="Адрес" value={company.address} />
              <DetailRow icon={<Phone />} label="Телефон" value={company.phone} />
              <DetailRow icon={<Mail />} label="Email" value={company.email} />
            </div>
          </div>

          {/* Пояснение о демо-данных */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-xs text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>
                <span className="font-semibold">* Данные, отмеченные звёздочкой, являются демонстрационными.</span> 
                {' '}Представлены для иллюстрации функциональных возможностей системы. 
                При одобрении концепции проекта будет выполнена интеграция с официальными источниками 
                (ЕИС, ФНС, Арбитраж) для отображения актуальных данных.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Данные актуальны на {new Date().toLocaleDateString('ru-RU')}</p>
          <Button variant="outline" size="sm" onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  )
}

function TrafficLight({ riskLevel }: { riskLevel: RiskLevel }) {
  return (
    <div className="flex flex-col gap-1.5 p-1.5 bg-secondary rounded-lg">
      <div className={cn("w-4 h-4 rounded-full", riskLevel === "red" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]" : "bg-red-500/20")} />
      <div className={cn("w-4 h-4 rounded-full", riskLevel === "yellow" ? "bg-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]" : "bg-yellow-500/20")} />
      <div className={cn("w-4 h-4 rounded-full", riskLevel === "green" ? "bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" : "bg-green-500/20")} />
    </div>
  )
}

function GaugeChart({ value, riskLevel }: { value: number; riskLevel: RiskLevel }) {
  const color = riskLevel === "red" ? "#ef4444" : riskLevel === "yellow" ? "#f59e0b" : "#10b981"
  const data = [{ name: "Used", value: Math.min(value, 100) }, { name: "Remaining", value: Math.max(100 - value, 0) }]
  return (
    <div className="relative h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={50} outerRadius={70} dataKey="value">
            <Cell fill={color} /><Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center"><div className="text-2xl font-bold" style={{ color }}>{value.toFixed(0)}%</div></div>
    </div>
  )
}

function MetricRow({ icon, label, value, color, demo }: { icon: React.ReactNode; label: string; value: string; color: string; demo?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs">{label}</span>
      </div>
      <span className={cn("text-sm font-medium text-foreground", demo && "italic")}>{value}</span>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div className="min-w-0"><div className="text-xs text-muted-foreground">{label}</div><div className="text-sm text-foreground break-words">{value}</div></div>
    </div>
  )
}