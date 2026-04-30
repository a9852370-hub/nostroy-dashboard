"use client"

import { Menu, Bell, Settings, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type FederalDistrict, type Region, type SRO, type Company } from "@/lib/data"

interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface HeaderProps {
  onMenuClick: () => void
  district: FederalDistrict | null
  region: Region | null
  sro: SRO | null
  company?: Company | null
  onNavigateHome: () => void
  onNavigateDistrict: () => void
  onNavigateRegion: () => void
  onNavigateSRO?: () => void
}

export function Header({ 
  onMenuClick, 
  district, 
  region, 
  sro,
  company,
  onNavigateHome,
  onNavigateDistrict,
  onNavigateRegion,
  onNavigateSRO
}: HeaderProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Россия", onClick: onNavigateHome }
  ]

  if (district) {
    breadcrumbs.push({ 
      label: district.shortName, 
      onClick: region ? onNavigateDistrict : undefined 
    })
  }

  if (region) {
    breadcrumbs.push({ 
      label: region.name, 
      onClick: sro ? onNavigateRegion : undefined 
    })
  }

  if (sro) {
    breadcrumbs.push({ 
      label: sro.name.length > 20 ? sro.name.substring(0, 20) + '...' : sro.name,
      onClick: company ? onNavigateSRO : undefined
    })
  }

  if (company) {
    breadcrumbs.push({ label: company.name })
  }

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 p-0 shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm min-w-0 overflow-x-auto scrollbar-hide">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateHome}
            className="h-8 w-8 p-0 hover:bg-primary/20 shrink-0"
          >
            <Home className="h-4 w-4" />
          </Button>
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-1 shrink-0">
              {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="text-muted-foreground hover:text-foreground transition-colors px-1 whitespace-nowrap"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-foreground font-medium px-1 whitespace-nowrap">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/20 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/20">
          <Settings className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ml-2">
          <span className="text-xs font-bold text-primary">АД</span>
        </div>
      </div>
    </header>
  )
}
