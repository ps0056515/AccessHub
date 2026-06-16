import React from 'react';
import { Country } from 'country-state-city';

const countryToIsoMap = new Map();

export function CountryFlag({ countryName }) {
  if (!countryName) return null;

  if (countryToIsoMap.size === 0) {
    const allCountries = Country.getAllCountries();
    for (const c of allCountries) {
      countryToIsoMap.set(c.name.toLowerCase(), c.isoCode.toLowerCase());
    }
  }

  const isoCode = countryToIsoMap.get(countryName.toLowerCase());
  if (!isoCode) return null;

  return (
    <img
      src={`https://flagcdn.com/w20/${isoCode}.png`}
      srcSet={`https://flagcdn.com/w40/${isoCode}.png 2x`}
      width="20"
      alt={`${countryName} flag`}
      style={{ marginLeft: '4px', verticalAlign: 'middle', borderRadius: '2px', display: 'inline-block' }}
      title={countryName}
    />
  );
}
