# Project Explanation

This document provides a technical and functional overview of the **World Cup Fixtures** web application. It breaks down what the project is, how it works, and how the various pieces fit together.

## What is this project?

The **World Cup Fixtures** app is a modern, dynamic web application designed to help users track football (soccer) matches. While initially tailored for the FIFA World Cup, it supports tracking fixtures, results, lineups, and match events for a wide variety of major leagues around the world (e.g., Premier League, Champions League, La Liga, etc.).

The application emphasizes a **premium visual experience**, featuring a custom design system with full-bleed layouts, dynamic team-based color accents, smooth micro-animations, and 3D visual elements in the hero section.

## How it works

The app is built as a Single Page Application (SPA) using **React 19**, **TypeScript**, and **Vite**. 

### 1. Data Sources and APIs

The application integrates with two distinct APIs to gather and display football data:

- **football-data.org**: Used primarily as the source of truth for high-level fixture lists, teams, and competition schedules. The core hook `useFixtures` pulls the matches from this service.
- **API-Football (api-sports.io)**: Used for granular match details such as player lineups, minute-by-minute match events (goals, cards, substitutions), and deep match statistics (possession, shots). 

Because these APIs can have strict CORS restrictions or rate limits (API-Football has a 100 requests/day free tier), the requests are proxied through Vite's local development server (configured in `vite.config.ts`) and injected with the necessary API keys from `.env.local`.

The bridging logic in `src/api/apiFootball.ts` contains a clever algorithm (`findFixtureByTeamsAndDate`) that fuzzy-matches teams from the `football-data.org` response to the `API-Football` database so the app can stitch the rich data together seamlessly.

### 2. Core Architecture and State

- **Routing**: `react-router-dom` handles navigation. The main entry point `App.tsx` defines two primary routes:
  - `/` -> The main Dashboard/Fixtures list (`FixturesView`)
  - `/match/:matchId` -> The detailed view for a specific match (`MatchDetail`)

- **State Management**: React's standard `useState` and `useMemo` hooks are used to manage local state. In `App.tsx`, state is maintained for the currently selected `competitionCode`, the `season` year (allowing users to look back at the last 20 years), and the user's `searchQuery`.

### 3. Key Components

- **`CompetitionSelector.jsx`**: The header navigation that allows the user to switch between different leagues (e.g., World Cup to Premier League) and change the historical season.
- **`HeroScene.jsx` & `Countdown.jsx`**: A high-impact hero banner at the top of the main page. It automatically calculates the next upcoming match (using `utils/matchStatus.js`) and displays a live countdown timer. The `HeroScene` incorporates `react-three-fiber` and `three.js` to render 3D elements for a premium aesthetic.
- **`FixtureList.jsx` & `FixtureCard.jsx`**: Renders the grid of matches for the selected season. It includes a text search feature to filter matches by team name. The cards themselves utilize a custom utility (`teamColors.ts`) to dynamically glow and blur using the primary colors of the playing teams when hovered over.
- **`MatchDetail.jsx`**: When a user clicks a fixture, they navigate to the match detail page. This page fetches the rich data from API-Football and displays sub-components like `FormationView.jsx` (lineups on a pitch), `MatchTimeline.jsx` (chronological events), and `MatchStats.jsx` (data bars and percentages).

### 4. Styling and Design System

The app purposefully avoids generic UI libraries (like Bootstrap or Tailwind) in favor of **Vanilla CSS** (`src/styles/`). This allows for absolute control over the design system. The CSS focuses on:
- **Glassmorphism**: Translucent panels over deep backgrounds.
- **Dynamic Theming**: The `teamColors.ts` utility maps team names to hex codes, which are injected into the CSS as variables to drive hover states and backgrounds.
- **Typography and Spacing**: strict adherence to a grid-based, full-bleed design documented in `design.md`.

## Summary

In short, the application is a high-performance React frontend that elegantly stitches together data from multiple football APIs. It presents a highly polished, interactive dashboard where users can filter historical seasons, search for teams, and dive deep into match analytics with a visually stunning interface.
