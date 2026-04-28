import { ALL_COUNTRIES } from '../countries';

export const formatCurrency = (amount: number): string => {
  const savedCurrencyCode = localStorage.getItem('luxardo_currency') || 'INR';
  const country = ALL_COUNTRIES.find(c => c.currency.code === savedCurrencyCode);
  
  const currencyCode = country?.currency.code || 'INR';
  const rate = country?.currency.rate || 1;
  const convertedAmount = amount * rate;

  const formattedAmountStr = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertedAmount);

  return `MRP ${formattedAmountStr}`;
};
