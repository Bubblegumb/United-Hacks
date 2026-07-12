/**
 * All competitions supported by the app.
 *
 * @typedef {Object} Competition
 * @property {string}  code     - The football-data.org competition code (e.g. 'PL').
 * @property {string}  name     - Human-readable competition name.
 * @property {boolean} [featured] - When true, shown as a tab in CompetitionSelector.
 *                                  Non-featured competitions appear in the '+ More' overflow dropdown.
 *                                  Adding `featured: true` to any entry here is the only change
 *                                  needed to promote a competition to a tab — no component changes required.
 */

/** @type {Competition[]} */
export const COMPETITIONS = [
  { code: 'WC',            name: 'World Cup',                featured: true  },
  { code: 'PL',            name: 'Premier League',           featured: true  },
  { code: 'CL',            name: 'Champions League',         featured: true  },
  { code: 'EL',            name: 'Europa League',            featured: true  },
  { code: 'ECL',           name: 'Conference League',        featured: true  },
  { code: 'BL',            name: 'Bundesliga',               featured: true  },
  { code: 'LaLiga',        name: 'La Liga'                                   },
  { code: 'SerieA',        name: 'Serie A'                                   },
  { code: 'Ligue1',        name: 'Ligue 1'                                   },
  { code: 'Eredivisie',    name: 'Eredivisie'                                },
  { code: 'PrimeiraLiga',  name: 'Primeira Liga'                             },
  { code: 'Championship',  name: 'Championship'                              },
  { code: 'LeagueOne',     name: 'League One'                                },
  { code: 'LeagueTwo',     name: 'League Two'                                },
  { code: 'FACup',         name: 'FA Cup'                                    },
  { code: 'LeagueCup',     name: 'League Cup'                                },
];

/**
 * The first featured competition, used as the default selection.
 * This stays correct automatically as the array is reordered.
 *
 * @type {Competition}
 */
export const DEFAULT_COMPETITION = COMPETITIONS.find((c) => c.featured) ?? COMPETITIONS[0];
