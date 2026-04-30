"use client"

import { useState, useCallback, useEffect } from "react"
// Убираем фигурные скобки там, где файлы экспортируют один компонент
import Sidebar from "@/components/dashboard/sidebar"
import Header from "@/components/dashboard/header"
import RussiaMap from "@/components/dashboard/russia-map"
import FederalDistrictMap from "@/components/dashboard/federal-district-map"
// Charts обычно экспортирует много объектов, их можно оставить в скобках, 
// НО проверь файл components/dashboard/charts.tsx — если там export default, скобки тоже не нужны.
import { CompensationFundsChart, CourtCasesChart, DistrictDetailCharts, TopRegionsChart, CourtClaimsForecastChart } from "@/components/dashboard/charts"
import SROList from "@/components/dashboard/sro-list"
import SROCard from "@/components/dashboard/sro-card"
import CompanyList from "@/components/dashboard/company-list"
import CompanyCard from "@/components/dashboard/company-card"
import { 
  type FederalDistrict, 
  type Region, 
  type SRO,
  type Company,
  federalDistricts as baseFederalDistricts
} from "@/lib/data"

// ==================== ГЛОБАЛЬНЫЕ КЭШИ ДАННЫХ ====================
let membersCache: any[] = []
let enrichmentCache = new Map()
let dataLoaded = false

// ==================== ЗАГРУЗКА РЕАЛЬНЫХ ДАННЫХ ====================
async function loadRealData() {
  if (dataLoaded) return
  
  try {
    const [membersRes, enrichRes] = await Promise.all([
      fetch('/data/members_final.json'),
      fetch('/data/nostroy.json')
    ])
    
    const membersData = await membersRes.json()
    const enrichData = await enrichRes.json()
    
    membersCache = membersData.companies || []
    
    for (const company of enrichData.companies || []) {
      const memberId = String(company.member_id)
      const basic = company.basic || {}
      const summary = company.summary || {}
      
      enrichmentCache.set(memberId, {
        director: basic.director || null,
        address: basic.address || null,
        phone: basic.phone || null,
        registration_date: basic.registration_date || null,
        liability_vv: summary.liability_vv || null,
        liability_vv_status: summary.liability_vv_status || null,
        liability_odo: summary.liability_odo || null,
        liability_odo_status: summary.liability_odo_status || null,
        kf_vv_amount: summary.kf_vv_amount ? parseInt(summary.kf_vv_amount.replace(/\D/g, '')) || 0 : 0,
        kf_odo_amount: summary.kf_odo_amount ? parseInt(summary.kf_odo_amount.replace(/\D/g, '')) || 0 : 0,
        insurance_companies: summary.insurance_companies || [],
        check_types: summary.check_types || [],
        total_rows: summary.total_rows || 0
      })
    }
    
    dataLoaded = true
    console.log(`[data] Загружено ${membersCache.length} компаний, обогащено ${enrichmentCache.size}`)
  } catch (err) {
    console.error('[data] Ошибка загрузки:', err)
  }
}

// ==================== ОБОГАЩЕНИЕ КОМПАНИИ ====================
function enrichCompany(member: any): Company {
  const enriched = enrichmentCache.get(String(member.id))
  const hasFullData = !!enriched && (!!enriched.director || !!enriched.address || !!enriched.liability_vv)
  
  let riskLevel: "green" | "yellow" | "red" = "green"
  if (enriched?.liability_vv?.toLowerCase().includes('третий')) riskLevel = "yellow"
  if (enriched?.liability_vv?.toLowerCase().includes('высокий')) riskLevel = "red"
  
  let insuranceStatus: "active" | "expired" | "none" = "none"
  if (enriched?.insurance_companies?.length) insuranceStatus = "active"
  
  return {
    id: String(member.id),
    name: member.full_description || member.short_description || 'Неизвестно',
    inn: member.inn || '',
    ogrn: '',
    director: enriched?.director || member.director || '',
    address: enriched?.address || '',
    phone: enriched?.phone || '',
    email: '',
    riskLevel,
    contractVolume: 0,
    kfLimit: 0,
    kfUsed: 0,
    insuranceStatus,
    insuranceAmount: 0,
    courtCases: [],
    violations: [],
    registrationDate: enriched?.registration_date || '',
    hasFullData,
    liability_vv: enriched?.liability_vv,
    liability_vv_status: enriched?.liability_vv_status,
    liability_odo: enriched?.liability_odo,
    liability_odo_status: enriched?.liability_odo_status,
    kf_vv_amount: enriched?.kf_vv_amount || 0,
    kf_odo_amount: enriched?.kf_odo_amount || 0,
    insurance_companies: enriched?.insurance_companies || [],
    check_types: enriched?.check_types || [],
    total_rows: enriched?.total_rows || 0
  }
}

// ==================== ТИП ДЛЯ РЕАЛЬНЫХ ДАННЫХ ====================
interface RealRegionData {
  sros: SRO[]
  totalMembers: number
  totalKfVv: number
  totalKfOdo: number
}

// ==================== КОМПОНЕНТ ====================
type ViewState = "map" | "district" | "region" | "sro"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [federalDistricts] = useState<FederalDistrict[]>(baseFederalDistricts)
  const [loading, setLoading] = useState(true)
  const [viewState, setViewState] = useState<ViewState>("map")
  const [selectedDistrict, setSelectedDistrict] = useState<FederalDistrict | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedSRO, setSelectedSRO] = useState<SRO | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showSROCard, setShowSROCard] = useState(false)
  const [showCompanyCard, setShowCompanyCard] = useState(false)
  
  // Реальные данные (загружаются и используются при клике на регион)
  const [realRegionDataMap, setRealRegionDataMap] = useState<Map<string, RealRegionData>>(new Map())

  useEffect(() => {
    loadRealData().then(() => {
      // Строим реальные данные по регионам
      const regionDataMap = new Map<string, RealRegionData>()
      
      // Группируем компании по региону и СРО (по ID СРО из поля sro.id)
      const companiesByRegionAndSRO = new Map<string, Map<number, any[]>>()
      
      for (const member of membersCache) {
        const region = member.sro_details?.region
        const sroId = member.sro?.id
        const sroName = member.sro?.full_description || member.sro_details?.name
        
        if (!region || !sroId || !sroName) continue
        
        if (!companiesByRegionAndSRO.has(region)) {
          companiesByRegionAndSRO.set(region, new Map())
        }
        const srosMap = companiesByRegionAndSRO.get(region)!
        if (!srosMap.has(sroId)) {
          srosMap.set(sroId, [])
        }
        srosMap.get(sroId)!.push(member)
      }
      
      // Для каждого региона создаём SRO и компании
      for (const [regionName, srosMap] of companiesByRegionAndSRO) {
        const sros: SRO[] = []
        
        for (const [sroId, members] of srosMap) {
          const sroName = members[0].sro?.full_description || members[0].sro_details?.name
          const companies = members.map(member => enrichCompany(member))
          
          // Сортировка компаний: сначала с полными данными
          companies.sort((a, b) => {
            const aFull = (a as any).hasFullData
            const bFull = (b as any).hasFullData
            if (aFull && !bFull) return -1
            if (!aFull && bFull) return 1
            return a.name.localeCompare(b.name)
          })
          
          const green = companies.filter(c => c.riskLevel === 'green').length
          const yellow = companies.filter(c => c.riskLevel === 'yellow').length
          const red = companies.filter(c => c.riskLevel === 'red').length
          const kfVv = companies.reduce((sum, c) => sum + ((c as any).kf_vv_amount || 0), 0)
          const kfOdo = companies.reduce((sum, c) => sum + ((c as any).kf_odo_amount || 0), 0)
          
          sros.push({
            id: String(sroId),
            name: sroName,
            inn: '',
            registrationNumber: '',
            memberCount: companies.length,
            kfOdo: kfOdo,
            kfVv: kfVv,
            courtCases: 0,
            status: 'active',
            director: '',
            address: '',
            phone: '',
            email: '',
            riskDistribution: { green, yellow, red },
            companies
          })
        }
        
        // Сортируем СРО по количеству членов
        sros.sort((a, b) => b.memberCount - a.memberCount)
        
        const totalMembers = sros.reduce((sum, s) => sum + s.memberCount, 0)
        const totalKfVv = sros.reduce((sum, s) => sum + s.kfVv, 0)
        const totalKfOdo = sros.reduce((sum, s) => sum + s.kfOdo, 0)
        
        regionDataMap.set(regionName, {
          sros,
          totalMembers,
          totalKfVv,
          totalKfOdo
        })
      }
      
      setRealRegionDataMap(regionDataMap)
      setLoading(false)
    })
  }, [])

  // ==================== ФУНКЦИИ ПОИСКА ====================
  const findSROById = useCallback((id: string) => {
    // Поиск в реальных данных (по всем регионам)
    for (const [_, regionData] of realRegionDataMap) {
      const sro = regionData.sros.find(s => s.id === id)
      if (sro) {
        // Создаём временный регион для навигации
        const tempRegion: Region = {
          id: 'temp',
          name: 'temp',
          code: '',
          sroCount: 1,
          totalMembers: regionData.totalMembers,
          kfOdo: regionData.totalKfOdo,
          kfVv: regionData.totalKfVv,
          courtCases: 0,
          sros: regionData.sros
        }
        // Находим округ (по первому региону из моков)
        const district = federalDistricts[0]
        return { sro, region: tempRegion, district }
      }
    }
    return null
  }, [realRegionDataMap, federalDistricts])

  const findCompanyById = useCallback((companyId: string) => {
    for (const [regionName, regionData] of realRegionDataMap) {
      for (const sro of regionData.sros) {
        const company = sro.companies.find(c => c.id === companyId)
        if (company) {
          const tempRegion: Region = {
            id: regionName,
            name: regionName,
            code: '',
            sroCount: regionData.sros.length,
            totalMembers: regionData.totalMembers,
            kfOdo: regionData.totalKfOdo,
            kfVv: regionData.totalKfVv,
            courtCases: 0,
            sros: regionData.sros
          }
          const district = federalDistricts[0]
          return { company, sro, region: tempRegion, district }
        }
      }
    }
    return null
  }, [realRegionDataMap, federalDistricts])

  // ==================== НАВИГАЦИЯ ====================
  const handleDistrictClick = useCallback((district: FederalDistrict) => {
    setSelectedDistrict(district)
    setSelectedRegion(null)
    setSelectedSRO(null)
    setSelectedCompany(null)
    setViewState("district")
  }, [])

  const handleRegionSelect = useCallback((region: Region) => {
    // Берём реальные данные для этого региона
    const realData = realRegionDataMap.get(region.name)
    
    if (realData && realData.sros.length > 0) {
      // Создаём реальный регион с настоящими СРО и компаниями
      const realRegion: Region = {
        ...region,
        sros: realData.sros,
        sroCount: realData.sros.length,
        totalMembers: realData.totalMembers,
        kfOdo: realData.totalKfOdo,
        kfVv: realData.totalKfVv
      }
      setSelectedRegion(realRegion)
    } else {
      // Если реальных данных нет — оставляем как есть (пустой)
      setSelectedRegion(region)
    }
    setSelectedSRO(null)
    setSelectedCompany(null)
    setViewState("region")
  }, [realRegionDataMap])

  const handleSROSelect = useCallback((sro: SRO) => {
    setSelectedSRO(sro)
    setSelectedCompany(null)
    setViewState("sro")
  }, [])

  const handleSROCardOpen = useCallback((sro: SRO) => {
    setSelectedSRO(sro)
    setShowSROCard(true)
  }, [])

  const handleCompanySelect = useCallback((company: Company) => {
    setSelectedCompany(company)
    setShowCompanyCard(true)
  }, [])

  const handleSROSearchSelect = useCallback((sroId: string) => {
    const result = findSROById(sroId)
    if (result) {
      setSelectedDistrict(result.district)
      setSelectedRegion(result.region)
      setSelectedSRO(result.sro)
      setViewState("sro")
      setSidebarOpen(false)
    }
  }, [findSROById])

  const handleCompanySearchSelect = useCallback((query: string) => {
    const result = findCompanyById(query)
    if (result) {
      setSelectedDistrict(result.district)
      setSelectedRegion(result.region)
      setSelectedSRO(result.sro)
      setSelectedCompany(result.company)
      setViewState("sro")
      setShowCompanyCard(true)
      setSidebarOpen(false)
    } else {
      // Поиск по ИНН или названию
      for (const [, regionData] of realRegionDataMap) {
        for (const sro of regionData.sros) {
          const company = sro.companies.find(c => 
            c.inn === query || 
            c.name.toLowerCase().includes(query.toLowerCase())
          )
          if (company) {
            const tempRegion: Region = {
              id: company.name,
              name: company.name,
              code: '',
              sroCount: 1,
              totalMembers: regionData.totalMembers,
              kfOdo: regionData.totalKfOdo,
              kfVv: regionData.totalKfVv,
              courtCases: 0,
              sros: regionData.sros
            }
            const district = federalDistricts[0]
            setSelectedDistrict(district)
            setSelectedRegion(tempRegion)
            setSelectedSRO(sro)
            setSelectedCompany(company)
            setViewState("sro")
            setShowCompanyCard(true)
            setSidebarOpen(false)
            return
          }
        }
      }
    }
    setSidebarOpen(false)
  }, [realRegionDataMap, federalDistricts, findCompanyById])

  const handleNavigateHome = useCallback(() => {
    setViewState("map")
    setSelectedDistrict(null)
    setSelectedRegion(null)
    setSelectedSRO(null)
    setSelectedCompany(null)
    setShowSROCard(false)
    setShowCompanyCard(false)
  }, [])

  const handleNavigateDistrict = useCallback(() => {
    setViewState("district")
    setSelectedRegion(null)
    setSelectedSRO(null)
    setSelectedCompany(null)
    setShowSROCard(false)
    setShowCompanyCard(false)
  }, [])

  const handleNavigateRegion = useCallback(() => {
    setViewState("region")
    setSelectedSRO(null)
    setSelectedCompany(null)
    setShowSROCard(false)
    setShowCompanyCard(false)
  }, [])

  const handleNavigateSRO = useCallback(() => {
    setSelectedCompany(null)
    setShowCompanyCard(false)
  }, [])

  const handleCloseSROCard = useCallback(() => setShowSROCard(false), [])
  const handleCloseCompanyCard = useCallback(() => {
    setShowCompanyCard(false)
    setSelectedCompany(null)
  }, [])

  const handleChartDistrictClick = useCallback((district: FederalDistrict) => {
    setSelectedDistrict(district)
    setSelectedRegion(null)
    setSelectedSRO(null)
    setSelectedCompany(null)
    setViewState("district")
  }, [])

  const handleChartSROClick = useCallback((sroId: string) => {
    const result = findSROById(sroId)
    if (result) {
      setSelectedDistrict(result.district)
      setSelectedRegion(result.region)
      setSelectedSRO(result.sro)
      setViewState("sro")
    }
  }, [findSROById])

  const handleRegionClickFromChart = useCallback((regionName: string) => {
    if (selectedDistrict) {
      const region = selectedDistrict.regions.find(r => r.name === regionName)
      if (region) handleRegionSelect(region)
    }
  }, [selectedDistrict, handleRegionSelect])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Загрузка данных...</div>
          <div className="text-sm text-muted-foreground">104 289 компаний</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        onSROSelect={handleSROSearchSelect}
        onCompanySelect={handleCompanySearchSelect}
        onDistrictSelect={handleDistrictClick}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          district={selectedDistrict}
          region={selectedRegion}
          sro={viewState === "sro" ? selectedSRO : null}
          company={showCompanyCard ? selectedCompany : null}
          onNavigateHome={handleNavigateHome}
          onNavigateDistrict={handleNavigateDistrict}
          onNavigateRegion={handleNavigateRegion}
          onNavigateSRO={handleNavigateSRO}
        />

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {viewState === "map" && (
            <>
              <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                <div className="lg:col-span-8 xl:col-span-9 min-h-[400px] lg:min-h-0">
                  <div className="glass rounded-xl h-full overflow-hidden">
                    <RussiaMap
                      onDistrictClick={handleDistrictClick}
                      selectedDistrict={selectedDistrict}
                    />
                  </div>
                </div>
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 lg:gap-6">
                  <div className="flex-1 min-h-[180px]"><CourtClaimsForecastChart /></div>
                  <div className="flex-1 min-h-[180px]"><CompensationFundsChart onDistrictClick={handleChartDistrictClick} /></div>
                  <div className="flex-1 min-h-[180px]"><CourtCasesChart onDistrictClick={handleChartDistrictClick} /></div>
                </div>
              </div>
              <footer className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
                Концепция разработана Ивановым Алексеем Борисовичем 8(911)979-78-83
              </footer>
            </>
          )}

          {viewState === "district" && selectedDistrict && (
            <>
              <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                <div className="lg:col-span-8 xl:col-span-9 min-h-[400px] lg:min-h-0">
                  <div className="glass rounded-xl h-full overflow-hidden">
                    <FederalDistrictMap
                      district={selectedDistrict}
                      onRegionClick={handleRegionSelect}
                      selectedRegion={selectedRegion}
                      onBack={handleNavigateHome}
                    />
                  </div>
                </div>
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 lg:gap-6">
                  <div className="flex-1 min-h-[180px]"><TopRegionsChart districtId={selectedDistrict.id} districtName={selectedDistrict.shortName} districtColor={selectedDistrict.color} onRegionClick={handleRegionClickFromChart} /></div>
                  <div className="flex-1 min-h-[180px]"><DistrictDetailCharts districtId={selectedDistrict.id} districtName={selectedDistrict.shortName} onSROClick={handleChartSROClick} /></div>
                </div>
              </div>
              <footer className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
                Концепция разработана Ивановым Алексеем Борисовичем 8(911)979-78-83
              </footer>
            </>
          )}

          {viewState === "region" && selectedDistrict && selectedRegion && (
            <>
              <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                <div className="lg:col-span-8 xl:col-span-9 min-h-[400px] lg:min-h-0">
                  <SROList
                    region={selectedRegion}
                    districtColor={selectedDistrict.color}
                    onBack={handleNavigateDistrict}
                    onSROSelect={handleSROSelect}
                    onSROCardOpen={handleSROCardOpen}
                    selectedSRO={selectedSRO}
                  />
                </div>
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 lg:gap-6">
                  <div className="flex-1 min-h-[180px]"><CompensationFundsChart onDistrictClick={handleChartDistrictClick} /></div>
                  <div className="flex-1 min-h-[180px]"><CourtCasesChart onDistrictClick={handleChartDistrictClick} /></div>
                </div>
              </div>
              <footer className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
                Концепция разработана Ивановым Алексеем Борисовичем 8(911)979-78-83
              </footer>
            </>
          )}

          {viewState === "sro" && selectedDistrict && selectedRegion && selectedSRO && (
            <>
              <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                <div className="lg:col-span-8 xl:col-span-9 min-h-[400px] lg:min-h-0">
                  <CompanyList
                    sro={selectedSRO}
                    districtColor={selectedDistrict.color}
                    onBack={handleNavigateRegion}
                    onCompanySelect={handleCompanySelect}
                    selectedCompany={selectedCompany}
                  />
                </div>
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 lg:gap-6">
                  <div className="flex-1 min-h-[180px]"><CompensationFundsChart onDistrictClick={handleChartDistrictClick} /></div>
                  <div className="flex-1 min-h-[180px]"><CourtCasesChart onDistrictClick={handleChartDistrictClick} /></div>
                </div>
              </div>
              <footer className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
                Концепция разработана Ивановым Алексеем Борисовичем 8(911)979-78-83
              </footer>
            </>
          )}
        </main>
      </div>

      {showSROCard && selectedSRO && selectedRegion && selectedDistrict && (
        <SROCard sro={selectedSRO} region={selectedRegion} district={selectedDistrict} onClose={handleCloseSROCard} />
      )}

      {showCompanyCard && selectedCompany && selectedSRO && selectedDistrict && (
        <CompanyCard company={selectedCompany} sro={selectedSRO} district={selectedDistrict} onClose={handleCloseCompanyCard} />
      )}
    </div>
  )
}
