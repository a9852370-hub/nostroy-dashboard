"use client"

import { type SRO, type Company } from "@/lib/data"

interface CompanyListProps {
  sro: SRO
  districtColor: string
  onBack: () => void
  onCompanySelect: (company: Company) => void
  selectedCompany: Company | null
}

export function CompanyList({
  sro,
  districtColor,
  onBack,
  onCompanySelect,
  selectedCompany,
}: CompanyListProps) {
  // Сортировка: сначала с полными данными, потом по алфавиту
  const sortedCompanies = [...sro.companies].sort((a, b) => {
    const aFull = (a as any).hasFullData
    const bFull = (b as any).hasFullData
    if (aFull && !bFull) return -1
    if (!aFull && bFull) return 1
    return a.name.localeCompare(b.name)
  })

  const fullDataCount = sortedCompanies.filter(c => (c as any).hasFullData).length

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-primary">
          ← Назад к списку СРО
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold">{sro.name}</h2>
        <p className="text-muted-foreground">
          Компаний в СРО: {sro.companies.length}
          {fullDataCount > 0 && (
            <span className="ml-2 text-green-600">(📄 {fullDataCount} с полными данными)</span>
          )}
        </p>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        {sortedCompanies.map((company) => {
          const hasFullData = (company as any).hasFullData
          return (
            <div
              key={company.id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                selectedCompany?.id === company.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              style={{ borderLeftColor: hasFullData ? "#10b981" : districtColor, borderLeftWidth: "4px" }}
              onClick={() => onCompanySelect(company)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{company.name}</h3>
                    {hasFullData && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        📄 Полные данные
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>ИНН: {company.inn}</span>
                    {company.director && <span>Руководитель: {company.director.slice(0, 40)}</span>}
                  </div>
                  {(company as any).liability_vv && (
                    <div className="text-sm">
                      <span className="text-green-600">Уровень ВВ: {(company as any).liability_vv}</span>
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {hasFullData ? "📄 Подробнее" : "Только ИНН"}
                </div>
              </div>
            </div>
          )
        })}

        {sortedCompanies.length === 0 && (
          <p className="text-center text-muted-foreground py-8">В этом СРО нет компаний</p>
        )}
      </div>
    </div>
  )
}