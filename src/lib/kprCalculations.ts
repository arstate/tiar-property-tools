import { KprInputState, KprCalculationResult } from "@/types";

/**
 * Calculates monthly installment using standard Annuity formula:
 * M = P * [ r * (1 + r)^n ] / [ (1 + r)^n - 1 ]
 * where:
 * P = Principal (Loan amount)
 * r = Monthly interest rate (annualRate / 12 / 100)
 * n = Total months (tenorYears * 12)
 */
export function calculateAnnuityMonthly(
  principal: number,
  annualInterestRatePercent: number,
  totalYears: number
): number {
  if (principal <= 0 || totalYears <= 0) return 0;
  if (annualInterestRatePercent <= 0) {
    return principal / (totalYears * 12);
  }

  const monthlyRate = annualInterestRatePercent / 100 / 12;
  const totalMonths = totalYears * 12;

  const numerator = monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
  const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;

  const monthlyPayment = principal * (numerator / denominator);
  return Math.round(monthlyPayment);
}

/**
 * Calculates monthly installment using standard Flat formula:
 * M = (P / n) + (P * r / 12)
 */
export function calculateFlatMonthly(
  principal: number,
  annualInterestRatePercent: number,
  totalYears: number
): number {
  if (principal <= 0 || totalYears <= 0) return 0;
  const totalMonths = totalYears * 12;
  const principalPerMonth = principal / totalMonths;
  const interestPerMonth = (principal * (annualInterestRatePercent / 100)) / 12;
  return Math.round(principalPerMonth + interestPerMonth);
}

/**
 * Comprehensive KPR Calculator with Promo Fixed, Floating Period, and Tiar Developer Subsidies.
 */
export function calculateKprSummary(input: KprInputState): KprCalculationResult {
  const propertyPrice = Math.max(0, input.propertyPrice);
  
  // Calculate Down Payment
  let downPayment = 0;
  if (!input.isDpZero) {
    if (input.downPaymentAmount > 0) {
      downPayment = input.downPaymentAmount;
    } else {
      downPayment = (propertyPrice * input.downPaymentPercent) / 100;
    }
  }

  const loanAmount = Math.max(0, propertyPrice - downPayment);
  const tenorYears = Math.max(1, input.tenorYears);

  // Promo Fixed Period Monthly Installment
  const baseMonthlyInstallmentPromo =
    input.calculationType === "flat"
      ? calculateFlatMonthly(loanAmount, input.fixedRatePercent, tenorYears)
      : calculateAnnuityMonthly(loanAmount, input.fixedRatePercent, tenorYears);

  // Developer Subsidy deduction during promo
  const subsidyPerMonth = input.hasDeveloperSubsidy ? input.developerSubsidyPerMonth : 0;
  const netMonthlyInstallmentPromo = Math.max(0, baseMonthlyInstallmentPromo - subsidyPerMonth);

  // Floating Period Monthly Installment (approximate based on remaining principal after promo)
  const fixedYears = Math.min(input.fixedDurationYears, tenorYears);
  const remainingYears = Math.max(1, tenorYears - fixedYears);
  
  // Estimate remaining loan balance after fixed period
  let remainingLoanAfterFixed = loanAmount;
  if (fixedYears > 0 && tenorYears > fixedYears) {
    // In annuity, early years pay mostly interest, principal reduces gradually
    const monthlyRate = (input.fixedRatePercent / 100) / 12;
    let balance = loanAmount;
    for (let m = 0; m < fixedYears * 12; m++) {
      const interestMonth = balance * monthlyRate;
      const principalMonth = baseMonthlyInstallmentPromo - interestMonth;
      balance = Math.max(0, balance - principalMonth);
    }
    remainingLoanAfterFixed = Math.round(balance);
  }

  const monthlyInstallmentFloating =
    input.calculationType === "flat"
      ? calculateFlatMonthly(remainingLoanAfterFixed, input.floatingRatePercent, remainingYears)
      : calculateAnnuityMonthly(remainingLoanAfterFixed, input.floatingRatePercent, remainingYears);

  // Total Developer Savings:
  // 1. Direct Installment Subsidy (e.g. 1.4 Jt x 12 bln = 16.8 Jt)
  // 2. Free Legal All-In (BPHTB, AJB, BBN, Notary ~ 25-35 Jt)
  // 3. Free KPR Fee Subsidy (~ 15-20 Jt)
  const subsidyDuration = input.hasDeveloperSubsidy ? input.developerSubsidyDurationMonths : 0;
  const totalInstallmentSubsidySavings = subsidyPerMonth * subsidyDuration;
  const legalSavings = input.hasFreeLegalAllIn ? input.freeLegalAmount : 0;
  const kprFeeSavings = input.hasKprFeeSubsidy ? input.kprFeeSubsidyAmount : 0;
  const totalDeveloperSavings = totalInstallmentSubsidySavings + legalSavings + kprFeeSavings;

  // Daily costs
  const dailyCostPromo = Math.round(netMonthlyInstallmentPromo / 30);
  const dailyCostFloating = Math.round(monthlyInstallmentFloating / 30);

  // Amortization Table preview for first 5 years + milestone years
  const amortizationBreakdown: KprCalculationResult["amortizationBreakdown"] = [];
  let currBalance = loanAmount;

  for (let y = 1; y <= tenorYears; y++) {
    const isPromo = y <= fixedYears;
    const rateToUse = isPromo ? input.fixedRatePercent : input.floatingRatePercent;
    const activeMonthly = isPromo ? baseMonthlyInstallmentPromo : monthlyInstallmentFloating;
    const monthlyRate = (rateToUse / 100) / 12;

    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for (let m = 0; m < 12; m++) {
      if (currBalance <= 0) break;
      const interestPart = currBalance * monthlyRate;
      const principalPart = Math.min(currBalance, activeMonthly - interestPart);
      yearlyInterest += interestPart;
      yearlyPrincipal += principalPart;
      currBalance = Math.max(0, currBalance - principalPart);
    }

    // Only record first 5 years and every 5 years afterwards to keep client view clean
    if (y <= 5 || y === 10 || y === 15 || y === 20 || y === 25 || y === tenorYears) {
      amortizationBreakdown.push({
        year: y,
        monthlyInstallment: isPromo && input.hasDeveloperSubsidy && y <= Math.ceil(subsidyDuration / 12)
          ? netMonthlyInstallmentPromo
          : activeMonthly,
        interestPaidYearly: Math.round(yearlyInterest),
        principalPaidYearly: Math.round(yearlyPrincipal),
        remainingLoan: Math.round(currBalance),
        isPromo,
      });
    }
  }

  // Total interest paid estimate
  const totalInterestPaid = Math.max(
    0,
    baseMonthlyInstallmentPromo * (fixedYears * 12) +
      monthlyInstallmentFloating * (remainingYears * 12) -
      loanAmount
  );

  return {
    loanAmount,
    baseMonthlyInstallmentPromo,
    netMonthlyInstallmentPromo,
    dailyCostPromo,
    monthlyInstallmentFloating,
    dailyCostFloating,
    totalInterestPaid: Math.round(totalInterestPaid),
    totalDeveloperSavings,
    amortizationBreakdown,
  };
}
