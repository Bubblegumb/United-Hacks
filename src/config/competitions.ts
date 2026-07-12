export interface Competition {
  code: string;
  name: string;
  featured?: boolean;
}

export const COMPETITIONS: Competition[] = [
  { code: 'WC', name: 'World Cup', featured: true },
  { code: 'PL', name: 'Premier League', featured: true },
  { code: 'CL', name: 'Champions League', featured: true },
  { code: 'BL1', name: 'Bundesliga', featured: true },
  { code: 'PD', name: 'La Liga', featured: true },
  { code: 'SA', name: 'Serie A' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'DED', name: 'Eredivisie' },
  { code: 'PPL', name: 'Primeira Liga' },
  { code: 'ELC', name: 'Championship' },
  { code: 'BSA', name: 'Campeonato Brasileiro' },
  { code: 'EC', name: 'European Championship', featured: true },
];

export const DEFAULT_COMPETITION = COMPETITIONS.find((c) => c.featured) ?? COMPETITIONS[0];
