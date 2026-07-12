/**
 * Map of football team names/abbreviations to their primary brand colors.
 * Used for dynamic spotlighting in the 3D Hero Scene.
 */
export const TEAM_COLORS: Record<string, string> = {
  // Premier League
  ARS: '#ef0107', // Arsenal
  ARSENAL: '#ef0107',
  CHE: '#034694', // Chelsea
  CHELSEA: '#034694',
  MCI: '#6cabdd', // Man City
  'MANCHESTER CITY': '#6cabdd',
  LIV: '#c8102e', // Liverpool
  LIVERPOOL: '#c8102e',
  MUN: '#da291c', // Man Utd
  'MANCHESTER UNITED': '#da291c',
  TOT: '#132257', // Tottenham
  TOTTENHAM: '#132257',
  NEW: '#241f20', // Newcastle
  NEWCASTLE: '#241f20',
  AST: '#95bfe5', // Aston Villa
  'ASTON VILLA': '#95bfe5',
  WHA: '#7a263a', // West Ham
  'WEST HAM': '#7a263a',
  BHA: '#0057b8', // Brighton
  BRIGHTON: '#0057b8',
  EVE: '#003399', // Everton
  EVERTON: '#003399',
  LEI: '#003090', // Leicester
  LEICESTER: '#003090',
  WOL: '#fdb913', // Wolves
  WOLVERHAMPTON: '#fdb913',

  // La Liga
  RMA: '#febe10', // Real Madrid
  'REAL MADRID': '#febe10',
  FCB: '#004d98', // Barcelona
  BARCELONA: '#004d98',
  ATM: '#cb3524', // Atletico Madrid
  'ATLETICO MADRID': '#cb3524',
  SEV: '#d81e05', // Sevilla
  SEVILLA: '#d81e05',
  RSO: '#005ca4', // Real Sociedad
  'REAL SOCIEDAD': '#005ca4',
  VAL: '#f37021', // Valencia
  VALENCIA: '#f37021',

  // Bundesliga
  FCBUN: '#e30613', // Bayern Munich
  'BAYERN MUNICH': '#e30613',
  'BAYERN MÜNCHEN': '#e30613',
  BVB: '#fde100', // Dortmund
  'BORUSSIA DORTMUND': '#fde100',
  RBL: '#dd013f', // RB Leipzig
  'RB LEIPZIG': '#dd013f',
  LEV: '#e32219', // Leverkusen
  'BAYER LEVERKUSEN': '#e32219',

  // Serie A
  JUV: '#1e1e1e', // Juventus
  JUVENTUS: '#1e1e1e',
  INT: '#0066b2', // Inter Milan
  INTER: '#0066b2',
  ACM: '#ac1820', // AC Milan
  'AC MILAN': '#ac1820',
  ROM: '#8e2336', // Roma
  ROMA: '#8e2336',
  NAP: '#12a0d7', // Napoli
  NAPOLI: '#12a0d7',

  // Ligue 1
  PSG: '#004170', // PSG
  'PARIS SAINT-GERMAIN': '#004170',
  OM: '#00a6e0', // Marseille
  MARSEILLE: '#00a6e0',
  ASM: '#e30613', // Monaco
  MONACO: '#e30613',
  LOSC: '#e01e37', // Lille
  LILLE: '#e01e37',

  // International / World Cup
  ARG: '#74acdf', // Argentina
  ARGENTINA: '#74acdf',
  BRA: '#fded00', // Brazil
  BRAZIL: '#fded00',
  FRA: '#002395', // France
  FRANCE: '#002395',
  GER: '#e30613', // Germany
  GERMANY: '#e30613',
  ESP: '#f1bf00', // Spain
  SPAIN: '#f1bf00',
  ENG: '#132257', // England
  ENGLAND: '#132257',
  ITA: '#0066bc', // Italy
  ITALY: '#0066bc',
  POR: '#046a38', // Portugal
  PORTUGAL: '#046a38',
  NED: '#ff4f00', // Netherlands
  NETHERLANDS: '#ff4f00',
  CRO: '#ff0000', // Croatia
  CROATIA: '#ff0000',
};

/**
 * Returns a team's primary color based on its shortName, full name, or TLA.
 * Fallbacks to a default neutral stadium-light color if not found.
 */
export function getTeamColor(name?: string | null, tla?: string | null): string {
  const normTla = tla?.trim().toUpperCase();
  if (normTla && TEAM_COLORS[normTla]) {
    return TEAM_COLORS[normTla];
  }

  const safeName = name || '';
  const normName = safeName.trim().toUpperCase();
  if (normName && TEAM_COLORS[normName]) {
    return TEAM_COLORS[normName];
  }

  // Try partial match
  if (normName) {
    for (const [key, val] of Object.entries(TEAM_COLORS)) {
      if (normName.includes(key)) {
        return val;
      }
    }
  }

  // Deterministic fallback color based on name string hash
  const hashName = safeName || 'Fallback';
  let hash = 0;
  for (let i = 0; i < hashName.length; i++) {
    hash = hashName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 80%, 45%)`;
}
