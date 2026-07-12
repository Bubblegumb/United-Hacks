# World Cup Fixtures & Match Details Application

This project is an attempt at making a dynamic, high-impact web application for exploring football fixtures, specifically focused on the World Cup and other major leagues. This project provides a user with rich aesthetics, dynamic team color effects, and comprehensive match data experience.

## Features

- **Football Fixtures & Match Data**: Integration with API-Football to fetch real-time and historical match data, including various leagues and competitions.
- **Match Detail Page**: In-depth view of individual matches.
- **Dynamic Season Selector**: Allows users to switch between the last 20 years of data to view historical fixtures.
- **Hero Countdown Component**: A high-impact grid layout countdown timer for upcoming major matches.
- **Dynamic Hover Effects**: Fixture cards and hero sections feature dynamic blurred hover effects that adapt to the specific colors of the playing teams (using a custom team color utility).
- **Premium UI/UX**: Built with a custom design system prioritizing visual excellence, including smooth transitions, curated color palettes, and modern typography.
- **3D Elements**: Incorporates `react-three-fiber` and `three.js` for advanced visual effects.

## Technologies Used

- **React 19**
- **TypeScript**
- **Vite**
- **React Router DOM**
- **Three.js & React Three Fiber** (@react-three/fiber, @react-three/drei)
- **Vanilla CSS** (for precise, custom styling and animations)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd United-Hacks
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   - Create a `.env.local` file in the root directory based on `.env.example`.
   - Add your API-Football credentials or any other required environment variables.

### Running the Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified by Vite).

### Building for Production

To create a production build:

```bash
npm run build
```

This will output the optimized static files into the `dist` directory.

## Design System

This project adheres to a specific visual design system (`design.md` reference), emphasizing:
- Full-bleed layouts and grid-based rows.
- Dynamic micro-animations and interactive hover states.
- Carefully selected color tokens and typography to avoid templated defaults.
