export type ToolMode = 
  | 'kpr' 
  | 'whiteboard' 
  | 'dbr' 
  | 'rent-vs-buy' 
  | 'capital-gain' 
  | 'slip';

export interface BankRate {
  id: string;
  name: string;
  alias: string;
  logoText: string;
  badge: string;
  color: string;
  fixedRate: number; // percentage, e.g. 3.75
  fixedYears: number; // e.g. 3
  floatingRate: number; // percentage, e.g. 11.5
  maxTenorYears: number; // e.g. 30
  isSyariah: boolean;
  highlight: string;
  specialPromoNote: string;
  verifiedSource: string;
  adminFeeFree: boolean;
  provisiFree: boolean;
}

export interface PropertyPreset {
  id: string;
  name: string;
  cluster: string;
  location: string;
  price: number;
  promoInstallment: number;
  dailyEstimate: number; // e.g. 60000
  tenorYears: number;
  developerName: string;
  promoSubsidyPerMonth: number;
  promoSubsidyMonths: number;
  freeLegalFeesEstimated: number; // BPHTB, AJB, Notaris
  kprFeeSubsidyAmount: number;
  customPerks: string[];
  specs: {
    landArea: number;
    buildingArea: number;
    bedrooms: number;
    bathrooms: number;
    floors: number;
  };
  features: string[];
}

export interface KprInputState {
  propertyPrice: number;
  developerName: string;
  projectName: string;
  isDpZero: boolean;
  downPaymentPercent: number;
  downPaymentAmount: number;
  tenorYears: number;
  fixedRatePercent: number;
  fixedDurationYears: number;
  floatingRatePercent: number;
  hasDeveloperSubsidy: boolean;
  developerSubsidyPerMonth: number;
  developerSubsidyDurationMonths: number;
  hasFreeLegalAllIn: boolean; // BPHTB, AJB, Notaris
  freeLegalAmount: number;
  hasKprFeeSubsidy: boolean;
  kprFeeSubsidyAmount: number;
  customPerks: string[];
  selectedBankId: string;
  calculationType: 'anuitas' | 'flat';
}

export interface KprCalculationResult {
  loanAmount: number;
  baseMonthlyInstallmentPromo: number;
  netMonthlyInstallmentPromo: number; // After developer subsidy
  dailyCostPromo: number;
  monthlyInstallmentFloating: number;
  dailyCostFloating: number;
  totalInterestPaid: number;
  totalDeveloperSavings: number;
  amortizationBreakdown: {
    year: number;
    monthlyInstallment: number;
    interestPaidYearly: number;
    principalPaidYearly: number;
    remainingLoan: number;
    isPromo: boolean;
  }[];
}

export interface DbrInputState {
  applicantIncome: number;
  spouseIncome: number;
  includeSpouse: boolean;
  activeInstallments: {
    id: string;
    name: string;
    amount: number;
  }[];
  targetHousePrice: number;
}

export interface RentVsBuyInputState {
  yearlyRentCost: number;
  rentInflationPercent: number;
  yearsToCompare: number; // 5, 10, 15
  housePurchasePrice: number;
  initialDp: number;
  monthlyHouseInstallment: number;
  propertyAppreciationPercent: number;
}

export interface CapitalGainInputState {
  initialPrice: number;
  holdingYears: number;
  baseAppreciationRate: number; // e.g. 10%
  catalystRsudSedati2027: boolean; // extra +15%
  catalystAlohaMerr: boolean; // extra +10%
  potentialYearlyRentalYieldPercent: number; // e.g. 5%
}

export interface WhiteboardState {
  brushColor: string;
  brushSize: number;
  brushType: 'pen' | 'highlighter' | 'eraser';
  backgroundTemplate: 'blank' | 'grid' | 'floorplan-1fl' | 'floorplan-2fl' | 'siteplan';
}
