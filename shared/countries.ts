// Comprehensive country and carrier data
export interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
}

export interface CarrierData {
  [countryCode: string]: string[];
}

export const REGIONS = [
  "North America",
  "South America", 
  "Europe",
  "Asia",
  "Africa",
  "Oceania"
] as const;

export const COUNTRIES: Country[] = [
  // North America (USA excluded - has separate USA Recharge service)
  { code: "ca", name: "Canada", flag: "🇨🇦", region: "North America" },
  { code: "mx", name: "Mexico", flag: "🇲🇽", region: "North America" },
  { code: "caribbean", name: "Caribbean", flag: "🏝️", region: "North America" },

  // South America
  { code: "ar", name: "Argentina", flag: "🇦🇷", region: "South America" },
  { code: "br", name: "Brazil", flag: "🇧🇷", region: "South America" },
  { code: "co", name: "Colombia", flag: "🇨🇴", region: "South America" },
  { code: "cl", name: "Chile", flag: "🇨🇱", region: "South America" },
  { code: "pe", name: "Peru", flag: "🇵🇪", region: "South America" },
  { code: "ve", name: "Venezuela", flag: "🇻🇪", region: "South America" },
  { code: "ec", name: "Ecuador", flag: "🇪🇨", region: "South America" },
  { code: "bo", name: "Bolivia", flag: "🇧🇴", region: "South America" },
  { code: "uy", name: "Uruguay", flag: "🇺🇾", region: "South America" },
  { code: "py", name: "Paraguay", flag: "🇵🇾", region: "South America" },

  // Europe
  { code: "gb", name: "United Kingdom", flag: "🇬🇧", region: "Europe" },
  { code: "de", name: "Germany", flag: "🇩🇪", region: "Europe" },
  { code: "fr", name: "France", flag: "🇫🇷", region: "Europe" },
  { code: "es", name: "Spain", flag: "🇪🇸", region: "Europe" },
  { code: "it", name: "Italy", flag: "🇮🇹", region: "Europe" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱", region: "Europe" },
  { code: "ru", name: "Russia", flag: "🇷🇺", region: "Europe" },
  { code: "pl", name: "Poland", flag: "🇵🇱", region: "Europe" },
  { code: "se", name: "Sweden", flag: "🇸🇪", region: "Europe" },
  { code: "ch", name: "Switzerland", flag: "🇨🇭", region: "Europe" },
  { code: "eu_other", name: "Other European Countries", flag: "🇪🇺", region: "Europe" },

  // Asia
  { code: "cn", name: "China", flag: "🇨🇳", region: "Asia" },
  { code: "in", name: "India", flag: "🇮🇳", region: "Asia" },
  { code: "jp", name: "Japan", flag: "🇯🇵", region: "Asia" },
  { code: "kr", name: "South Korea", flag: "🇰🇷", region: "Asia" },
  { code: "id", name: "Indonesia", flag: "🇮🇩", region: "Asia" },
  { code: "ph", name: "Philippines", flag: "🇵🇭", region: "Asia" },
  { code: "my", name: "Malaysia", flag: "🇲🇾", region: "Asia" },
  { code: "sg", name: "Singapore", flag: "🇸🇬", region: "Asia" },
  { code: "th", name: "Thailand", flag: "🇹🇭", region: "Asia" },
  { code: "vn", name: "Vietnam", flag: "🇻🇳", region: "Asia" },
  { code: "middle_east", name: "Middle East Region", flag: "🏛️", region: "Asia" },
  { code: "asia_other", name: "Other Asian Countries", flag: "🌏", region: "Asia" },

  // Africa
  { code: "za", name: "South Africa", flag: "🇿🇦", region: "Africa" },
  { code: "ng", name: "Nigeria", flag: "🇳🇬", region: "Africa" },
  { code: "eg", name: "Egypt", flag: "🇪🇬", region: "Africa" },
  { code: "ke", name: "Kenya", flag: "🇰🇪", region: "Africa" },
  { code: "ma", name: "Morocco", flag: "🇲🇦", region: "Africa" },
  { code: "gh", name: "Ghana", flag: "🇬🇭", region: "Africa" },
  { code: "et", name: "Ethiopia", flag: "🇪🇹", region: "Africa" },
  { code: "tz", name: "Tanzania", flag: "🇹🇿", region: "Africa" },
  { code: "africa_other", name: "Other African Countries", flag: "🌍", region: "Africa" },

  // Oceania
  { code: "au", name: "Australia", flag: "🇦🇺", region: "Oceania" },
  { code: "nz", name: "New Zealand", flag: "🇳🇿", region: "Oceania" },
  { code: "pg", name: "Papua New Guinea", flag: "🇵🇬", region: "Oceania" },
  { code: "pacific", name: "Pacific Islands", flag: "🏝️", region: "Oceania" },
];

export const CARRIERS: CarrierData = {
  // North America (USA excluded - has separate USA Recharge service)
  ca: ["Rogers", "Bell", "Telus", "Freedom Mobile", "Videotron"],
  mx: ["Telcel", "Movistar", "AT&T Mexico", "Unefon"],
  caribbean: ["Flow", "Digicel", "LIME", "Cable & Wireless"],

  // South America
  ar: ["Movistar", "Personal", "Claro", "Tuenti"],
  br: ["Vivo", "Tim", "Claro", "Oi"],
  co: ["Claro", "Movistar", "Tigo", "Avantel"],
  cl: ["Movistar", "Entel", "Claro", "WOM"],
  pe: ["Movistar", "Claro", "Entel", "Bitel"],
  ve: ["Movistar", "Digitel", "Movilnet"],
  ec: ["Claro", "Movistar", "CNT Mobile"],
  bo: ["Entel", "Tigo", "Viva"],
  uy: ["Movistar", "Claro", "Antel"],
  py: ["Tigo", "Personal", "Claro", "Copaco"],

  // Europe
  gb: ["EE", "O2", "Vodafone", "Three", "Virgin Mobile"],
  de: ["Deutsche Telekom", "Vodafone", "O2", "1&1", "Freenet"],
  fr: ["Orange", "SFR", "Bouygues", "Free Mobile"],
  es: ["Movistar", "Orange", "Vodafone", "MásMóvil"],
  it: ["TIM", "Vodafone", "WindTre", "Iliad"],
  nl: ["KPN", "Vodafone", "T-Mobile", "Tele2"],
  ru: ["MTS", "Beeline", "MegaFon", "Tele2"],
  pl: ["Orange", "Play", "T-Mobile", "Plus"],
  se: ["Telia", "Tele2", "Telenor", "3"],
  ch: ["Swisscom", "Salt", "Sunrise"],
  eu_other: ["Telekom", "Vodafone", "Orange", "T-Mobile"],

  // Asia
  cn: ["China Mobile", "China Unicom", "China Telecom"],
  in: ["Airtel", "Vodafone Idea", "Jio", "BSNL"],
  jp: ["NTT Docomo", "SoftBank", "KDDI", "Rakuten Mobile"],
  kr: ["SK Telecom", "KT", "LG U+"],
  id: ["Telkomsel", "Indosat", "XL Axiata", "3"],
  ph: ["Globe", "Smart", "DITO", "Sun Cellular"],
  my: ["Maxis", "Celcom", "Digi", "U Mobile"],
  sg: ["Singtel", "StarHub", "M1", "Circles.Life"],
  th: ["AIS", "dtac", "TrueMove H"],
  vn: ["Viettel", "MobiFone", "Vinaphone"],
  middle_east: ["Etisalat", "STC", "Ooredoo", "Zain"],
  asia_other: ["Local Carrier 1", "Local Carrier 2", "Regional Carrier"],

  // Africa
  za: ["Vodacom", "MTN", "Cell C", "Telkom Mobile"],
  ng: ["MTN", "Airtel", "Glo", "9mobile"],
  eg: ["Orange", "Vodafone", "Etisalat", "WE"],
  ke: ["Safaricom", "Airtel", "Telkom Kenya"],
  ma: ["Maroc Telecom", "Orange", "inwi"],
  gh: ["MTN", "Vodafone", "AirtelTigo"],
  et: ["Ethio Telecom", "Safaricom Ethiopia"],
  tz: ["Vodacom", "Airtel", "Tigo", "TTCL"],
  africa_other: ["MTN", "Airtel", "Orange", "Vodafone"],

  // Oceania
  au: ["Telstra", "Optus", "Vodafone", "TPG"],
  nz: ["Spark", "Vodafone", "2degrees"],
  pg: ["bmobile", "Digicel"],
  pacific: ["Telecom Fiji", "bmobile", "Digicel"],
};

export const getCountriesByRegion = (region: string): Country[] => {
  return COUNTRIES.filter(country => country.region === region);
};

export const getCarriers = (countryCode: string): string[] => {
  return CARRIERS[countryCode] || [];
};