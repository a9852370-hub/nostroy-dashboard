// lib/flat-data.ts
// Плоская структура данных для быстрого поиска и фильтрации
// Содержит ВСЕ поля из real-data.ts

import { federalDistricts, type Company, type SRO } from './real-data';

export interface FlatCompany extends Company {
  sroId: string;
  sroName: string;
  sroRegistrationNumber: string;
  regionId: string;
  regionName: string;
  districtId: string;
  districtName: string;
  // Дополнительные поля из members_full_data.json
  _insurance?: any[];
  _certificates?: any[];
  _checks?: any[];
  _contracts?: any[];
  _experts?: any[];
  _members_total_liability?: string;
}

export interface FlatSRO extends SRO {
  regionId: string;
  regionName: string;
  districtId: string;
  districtName: string;
}

// Плоские массивы
export const allCompanies: FlatCompany[] = [];
export const allSROs: FlatSRO[] = [];

// Индексы для быстрого поиска
export const companiesByInn: Record<string, FlatCompany> = {};
export const companiesBySroId: Record<string, FlatCompany[]> = {};
export const sroById: Record<string, FlatSRO> = {};
export const sroByRegistrationNumber: Record<string, FlatSRO> = {};

// Заполняем данные
for (const district of federalDistricts) {
  for (const region of district.regions) {
    for (const sro of region.sros) {
      const flatSro: FlatSRO = {
        ...sro,
        regionId: region.id,
        regionName: region.name,
        districtId: district.id,
        districtName: district.name,
      };
      
      allSROs.push(flatSro);
      sroById[sro.id] = flatSro;
      sroByRegistrationNumber[sro.registrationNumber] = flatSro;
      
      for (const company of sro.companies) {
        // Приводим company к any, чтобы достать дополнительные поля
        const companyAny = company as any;
        
        const flatCompany: FlatCompany = {
          ...company,
          sroId: sro.id,
          sroName: sro.name,
          sroRegistrationNumber: sro.registrationNumber,
          regionId: region.id,
          regionName: region.name,
          districtId: district.id,
          districtName: district.name,
          // Сохраняем дополнительные поля
          _insurance: companyAny._insurance || [],
          _certificates: companyAny._certificates || [],
          _checks: companyAny._checks || [],
          _contracts: companyAny._contracts || [],
          _experts: companyAny._experts || [],
          _members_total_liability: companyAny._members_total_liability || '',
        };
        
        allCompanies.push(flatCompany);
        
        if (company.inn) {
          companiesByInn[company.inn] = flatCompany;
        }
        
        if (!companiesBySroId[sro.id]) {
          companiesBySroId[sro.id] = [];
        }
        companiesBySroId[sro.id].push(flatCompany);
      }
    }
  }
}

// Статистика при загрузке
console.log(`[flat-data] Загружено СРО: ${allSROs.length}`);
console.log(`[flat-data] Загружено компаний: ${allCompanies.length}`);

// Дополнительная статистика по заполненности полей
const withInsurance = allCompanies.filter(c => c._insurance && c._insurance.length > 0).length;
const withCertificates = allCompanies.filter(c => c._certificates && c._certificates.length > 0).length;
const withChecks = allCompanies.filter(c => c._checks && c._checks.length > 0).length;
const withContracts = allCompanies.filter(c => c._contracts && c._contracts.length > 0).length;
const withExperts = allCompanies.filter(c => c._experts && c._experts.length > 0).length;
const withLiability = allCompanies.filter(c => c._members_total_liability).length;

console.log(`[flat-data] Компаний со страховками: ${withInsurance}`);
console.log(`[flat-data] Компаний с свидетельствами: ${withCertificates}`);
console.log(`[flat-data] Компаний с проверками: ${withChecks}`);
console.log(`[flat-data] Компаний с договорами: ${withContracts}`);
console.log(`[flat-data] Компаний с экспертами: ${withExperts}`);
console.log(`[flat-data] Компаний с уровнем ответственности: ${withLiability}`);

// Функции поиска
export function findCompanyByInn(inn: string): FlatCompany | undefined {
  return companiesByInn[inn];
}

export function getCompaniesBySroId(sroId: string): FlatCompany[] {
  return companiesBySroId[sroId] || [];
}

export function getSROById(id: string): FlatSRO | undefined {
  return sroById[id];
}

export function getSROByRegistrationNumber(regNumber: string): FlatSRO | undefined {
  return sroByRegistrationNumber[regNumber];
}

export function searchCompanies(query: string): FlatCompany[] {
  const lowerQuery = query.toLowerCase();
  return allCompanies.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) || 
    c.inn.includes(query)
  );
}

export function searchSROs(query: string): FlatSRO[] {
  const lowerQuery = query.toLowerCase();
  return allSROs.filter(s => 
    s.name.toLowerCase().includes(lowerQuery) || 
    s.inn.includes(query) ||
    s.registrationNumber.includes(query)
  );
}