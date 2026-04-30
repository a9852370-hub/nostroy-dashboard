"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts"
import { federalDistricts, type FederalDistrict } from "@/lib/data"
import { X, Maximize2, TrendingUp, AlertTriangle, ChevronRight, Building2, Landmark, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Данные для графиков
const compensationFundsData = federalDistricts.map(d => ({
  district: d.shortName,
  kfOdo: d.kfOdo / 1000000000,
  kfVv: d.kfVv / 1000000000,
  fullName: d.name
}))

const courtCasesData = [
  { month: "Янв", cases: 145, resolved: 98 },
  { month: "Фев", cases: 132, resolved: 105 },
  { month: "Мар", cases: 168, resolved: 112 },
  { month: "Апр", cases: 155, resolved: 128 },
  { month: "Май", cases: 142, resolved: 118 },
  { month: "Июн", cases: 178, resolved: 135 },
  { month: "Июл", cases: 165, resolved: 142 },
  { month: "Авг", cases: 189, resolved: 158 },
  { month: "Сен", cases: 172, resolved: 145 },
  { month: "Окт", cases: 195, resolved: 162 },
  { month: "Ноя", cases: 183, resolved: 155 },
  { month: "Дек", cases: 201, resolved: 178 }
]

const courtClaimsForecast = [
  { year: "2022", amount: 1.2 },
  { year: "2023", amount: 1.5 },
  { year: "2024", amount: 1.8 },
  { year: "2025", amount: 2.5 },
  { year: "2026", amount: 3.3 },
  { year: "2027", amount: 4.2 }
]

function getTopRegionsByKF(districtId: string) {
  const district = federalDistricts.find(d => d.id === districtId)
  if (!district) return []
  
  return [...district.regions]
    .sort((a, b) => b.kfOdo - a.kfOdo)
    .slice(0, 5)
    .map(r => ({
      name: r.name.length > 15 ? r.name.substring(0, 15) + '...' : r.name,
      fullName: r.name,
      kfOdo: r.kfOdo / 1000000,
      kfVv: r.kfVv / 1000000
    }))
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
  onExpand: () => void
  onClick?: () => void
  highlight?: boolean
  subtitle?: string
  clickable?: boolean
}

function ChartCard({ title, children, onExpand, onClick, highlight, subtitle, clickable }: ChartCardProps) {
  return (
    <div 
      className={cn(
        "glass rounded-xl p-4 h-full flex flex-col transition-all",
        highlight && "border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
        clickable && "cursor-pointer hover:border-primary/40 hover:glow"
      )}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            {highlight && <AlertTriangle className="w-4 h-4 text-red-400" />}
            {title}
            {clickable && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onExpand()
          }}
          className="h-8 w-8 p-0 hover:bg-primary/20"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  )
}

interface FullScreenChartProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  subtitle?: string
}

function FullScreenChart({ title, children, onClose, subtitle }: FullScreenChartProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-10 w-10 p-0 hover:bg-destructive/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {entry.name.includes('КФ') ? 'млрд ₽' : entry.name.includes('млрд') ? 'млрд ₽' : ''}
          </p>
        ))}
      </div>
    )
  }
  return null
}

interface CourtClaimsForecastChartProps {
  onDrillDown?: (year: string) => void
}

export function CourtClaimsForecastChart({ onDrillDown }: CourtClaimsForecastChartProps) {
  const [expanded, setExpanded] = useState(false)

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={courtClaimsForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis 
          dataKey="year" 
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
        />
        <YAxis 
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
          tickFormatter={(value) => `${value}B`}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <ReferenceLine y={1.8} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '2024: 1.8 млрд', fill: '#f59e0b', fontSize: 10 }} />
        <ReferenceLine y={4.2} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '2027: 4.2 млрд', fill: '#ef4444', fontSize: 10 }} />
        <Area 
          type="monotone" 
          dataKey="amount" 
          name="Прогноз исков (млрд ₽)"
          stroke="#ef4444" 
          strokeWidth={3}
          fill="url(#colorAmount)"
          dot={{ fill: '#ef4444', r: 4, strokeWidth: 2, stroke: '#1e1e2e' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )

  return (
    <ChartCard 
      title="Прогноз исков" 
      subtitle="Рост с 1.8 до 4.2 млрд ₽"
      onExpand={() => setExpanded(true)}
      highlight
      clickable
      onClick={() => setExpanded(true)}
    >
      {chart}
    </ChartCard>
  )
}

interface CompensationFundsChartProps {
  onDistrictClick?: (district: FederalDistrict) => void
}

export function CompensationFundsChart({ onDistrictClick }: CompensationFundsChartProps) {
  const [expanded, setExpanded] = useState(false)

  const sortedData = [...compensationFundsData].sort((a, b) => b.kfOdo - a.kfOdo)

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis 
          dataKey="district" 
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
        />
        <YAxis 
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
          tickFormatter={(value) => `${value}`}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
        <Bar dataKey="kfOdo" name="КФ ОДО" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="kfVv" name="КФ ВВ" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )

  return (
    <ChartCard 
      title="Компенсационные фонды" 
      subtitle="По округам (млрд ₽)"
      onExpand={() => setExpanded(true)}
      clickable
      onClick={() => setExpanded(true)}
    >
      {chart}
    </ChartCard>
  )
}

interface CourtCasesChartProps {
  onMonthClick?: (month: string) => void
  onDistrictClick?: (district: FederalDistrict) => void
}

export function CourtCasesChart({ onMonthClick, onDistrictClick }: CourtCasesChartProps) {
  const [expanded, setExpanded] = useState(false)

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={courtCasesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
        />
        <YAxis 
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
        <Line type="monotone" dataKey="cases" name="Новые дела" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
        <Line type="monotone" dataKey="resolved" name="Разрешённые" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <ChartCard 
      title="Судебные дела (2024)" 
      onExpand={() => setExpanded(true)}
      clickable
      onClick={() => setExpanded(true)}
    >
      {chart}
    </ChartCard>
  )
}

interface TopRegionsChartProps {
  districtId: string
  districtName: string
  districtColor: string
  onRegionClick?: (regionName: string) => void
}

export function TopRegionsChart({ districtId, districtName, districtColor, onRegionClick }: TopRegionsChartProps) {
  const [expanded, setExpanded] = useState(false)
  const data = getTopRegionsByKF(districtId)

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis 
          type="number"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
          tickFormatter={(value) => `${value}M`}
        />
        <YAxis 
          type="category"
          dataKey="name"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
          width={80}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <Bar dataKey="kfOdo" name="КФ ОДО" fill={districtColor} radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )

  return (
    <ChartCard 
      title={`TOP регионы - ${districtName}`} 
      onExpand={() => setExpanded(true)}
      clickable
      onClick={() => setExpanded(true)}
    >
      {chart}
    </ChartCard>
  )
}

interface DistrictDetailChartsProps {
  districtId: string
  districtName: string
  onSROClick?: (sroId: string) => void
}

export function DistrictDetailCharts({ districtId, districtName, onSROClick }: DistrictDetailChartsProps) {
  const [expanded, setExpanded] = useState(false)
  
  const districtData = courtCasesData.map(d => ({
    ...d,
    cases: Math.round(d.cases * (0.8 + Math.random() * 0.4)),
    resolved: Math.round(d.resolved * (0.8 + Math.random() * 0.4))
  }))

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={districtData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
        />
        <YAxis 
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={{ stroke: '#475569' }}
          axisLine={{ stroke: '#475569' }}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
        <Line type="monotone" dataKey="cases" name="Дела" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
        <Line type="monotone" dataKey="resolved" name="Разрешено" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <ChartCard 
      title={`Судебные дела - ${districtName}`} 
      onExpand={() => setExpanded(true)}
      clickable
      onClick={() => setExpanded(true)}
    >
      {chart}
    </ChartCard>
  )
}

interface KPIWidgetProps {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
  color: string
  onClick?: () => void
  trend?: "up" | "down" | "neutral"
}

export function KPIWidget({ icon, label, value, subValue, color, onClick, trend }: KPIWidgetProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "glass rounded-lg p-4 text-left transition-all w-full",
        onClick && "cursor-pointer hover:border-primary/40 hover:glow"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
        {trend && (
          <TrendingUp className={cn(
            "w-3 h-3 ml-auto",
            trend === "up" && "text-red-400",
            trend === "down" && "text-green-400",
            trend === "neutral" && "text-muted-foreground"
          )} />
        )}
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      {subValue && <div className="text-xs text-muted-foreground mt-1">{subValue}</div>}
    </button>
  )
}