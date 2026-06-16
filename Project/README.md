# Doctor Appointment Booking System (Lab)

This is the React.js + Vite migration of the Doctor Appointment Booking System.

## Project Structure

Inside this nested directory (`lab`):
* `public/` - Static assets.
* `src/` - React components and business logic:
  * `main.jsx` - App entry point.
  * `App.jsx` - State management and core layout.
  * `doctorsData.js` - Database of hardcoded doctor listings.
  * `components/` - Sub-views (Authentication forms, Dashboards, Modals).
* `index.html` - HTML mount template.
* `vite.config.js` - Compiler configurations.
* `eslint.config.js` - ESLint flat layout configs.

## How to Run

1. Change directory to `lab`:
   ```bash
   cd lab
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```
