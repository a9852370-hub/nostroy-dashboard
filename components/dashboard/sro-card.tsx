"use client"

import { 
  X, Building2, Users, Phone, Mail, MapPin, FileText, 
  CheckCircle2, AlertCircle, XCircle, Landmark, Hash, 
  Calendar, User, ExternalLink, PieChart 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type SRO, type Region, type FederalDistrict } from "@/lib/data"
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

interface SROCardProps {
  sro: SRO
  region: Region
  district: FederalDistrict
  onClose: () => void
}

export function SROCard({ sro, region, district, onClose }: SROCardProps) {
  const statusConfig = {
    active: { 
      label: "Активна", 
      icon: CheckCircle2, 
      className: "bg-chart-3/20 text-chart-3 border-chart-3/30" 
    },
    suspended: { 
      label: "Приостановлена", 
      icon: AlertCircle, 
      className: "bg-chart-4/20 text-chart-4 border-chart-4/30" 
    },
    liquidated: { 
      label: "Ликвидирована", 
      icon: XCircle, 
      className: "bg-chart-5/20 text-chart-5 border-chart-5/30" 
    }
  }[sro.status]

  const StatusIcon = statusConfig.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Card */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div 
          className="p-6 border-b border-border"
          style={{ background: `linear-gradient(135deg, ${district.color}15 0%, transparent 100%)` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${district.color}30` }}
              >
                <Building2 className="w-7 h-7" style={{ color: district.color }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{sro.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{region.name}, {district.shortName}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-destructive/20 shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <Badge variant="outline" className={cn("px-2 py-1", statusConfig.className)}>
              <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="px-2 py-1 bg-secondary/50">
              {sro.registrationNumber}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricBox
              icon={<Users className="w-5 h-5" />}
              label="Членов СРО"
              value={sro.memberCount.toLocaleString("ru-RU")}
              color={district.color}
            />
            <MetricBox
              icon={<Landmark className="w-5 h-5" />}
              label="КФ ОДО"
              value={formatCurrency(sro.kfOdo)}
              color={district.color}
            />
            <MetricBox
              icon={<Landmark className="w-5 h-5" />}
              label="КФ ВВ"
              value={formatCurrency(sro.kfVv)}
              color={district.color}
            />
            <MetricBox
              icon={<FileText className="w-5 h-5" />}
              label="Суд. дела"
              value={sro.courtCases.toString()}
              color={district.color}
            />
          </div>

          {/* Risk Distribution */}
          {sro.companies.length > 0 && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4" style={{ color: district.color }} />
                Распределение рисков организаций-членов
              </h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-foreground">{sro.riskDistribution.green} низкий</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-foreground">{sro.riskDistribution.yellow} средний</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-foreground">{sro.riskDistribution.red} высокий</span>
                </div>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Реквизиты</h3>
              <DetailRow icon={<Hash className="w-4 h-4" />} label="ИНН" value={sro.inn} />
              <DetailRow icon={<Calendar className="w-4 h-4" />} label="Рег. номер" value={sro.registrationNumber} />
              <DetailRow icon={<User className="w-4 h-4" />} label="Руководитель" value={sro.director} />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Контакты</h3>
              <DetailRow icon={<MapPin className="w-4 h-4" />} label="Адрес" value={sro.address} />
              <DetailRow icon={<Phone className="w-4 h-4" />} label="Телефон" value={sro.phone} />
              <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={sro.email} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/30 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Данные актуальны на {new Date().toLocaleDateString('ru-RU')}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Закрыть
            </Button>
            <Button size="sm" style={{ backgroundColor: district.color }}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Подробнее
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricBoxProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}

function MetricBox({ icon, label, value, color }: MetricBoxProps) {
  return (
    <div className="bg-secondary/50 rounded-xl p-4 text-center">
      <div 
        className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

interface DetailRowProps {
  icon: React.ReactNode
  label: string
  value: string
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground break-words">{value}</div>
      </div>
    </div>
  )
}