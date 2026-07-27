import React from 'react';
import { Country } from 'country-state-city';

const countryToIsoMap = new Map();

const commonAliases = {
  'usa': 'us',
  'us': 'us',
  'united states of america': 'us',
  'america': 'us',
  'uk': 'gb',
  'great britain': 'gb',
  'england': 'gb',
  'uae': 'ae',
  'russia': 'ru',
  'south korea': 'kr',
  'korea': 'kr',
  'vietnam': 'vn',
  'taiwan': 'tw',
  'philippines': 'ph'
};

export function CountryFlag({ countryName }) {
  if (countryToIsoMap.size === 0) {
    const allCountries = Country.getAllCountries();
    for (const c of allCountries) {
      countryToIsoMap.set(c.name.toLowerCase(), c.isoCode.toLowerCase());
    }
  }

  const lowerName = countryName ? countryName.toLowerCase().trim() : '';
  const isoCode = (lowerName && (countryToIsoMap.get(lowerName) || commonAliases[lowerName])) || 'in';
  const displayTitle = countryName || 'India';

  return (
    <img
      src={`https://flagcdn.com/w20/${isoCode}.png`}
      srcSet={`https://flagcdn.com/w40/${isoCode}.png 2x`}
      width="16"
      alt={`Nationality: ${displayTitle}`}
      style={{ marginLeft: '4px', verticalAlign: 'middle', borderRadius: '2px', display: 'inline-block' }}
      title={displayTitle}
    />
  );
}
