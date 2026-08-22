* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f3f4f6;
  color: #111827;
}

.container {
  width: min(720px, calc(100% - 28px));
  margin: 32px auto;
}

.card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 18px;
  box-shadow: 0 8px 30px rgba(0,0,0,.08);
}

.topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  color: #6b7280;
  font-size: .95rem;
  margin-bottom: 22px;
}

h1 {
  line-height: 1.25;
  margin: 0 0 22px;
}

h2 {
  margin-top: 0;
}

.answer {
  display: block;
  width: 100%;
  text-align: left;
  padding: 15px 16px;
  margin: 10px 0;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
}

.answer:hover {
  border-color: #9ca3af;
}

.answer.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.answer.correct {
  border-color: #16a34a;
  background: #f0fdf4;
}

.answer.wrong {
  border-color: #dc2626;
  background: #fef2f2;
}

button {
  border: 0;
  border-radius: 11px;
  padding: 13px 17px;
  font-size: 1rem;
  cursor: pointer;
}

.primary {
  background: #111827;
  color: white;
  width: 100%;
  margin-top: 14px;
}

.primary:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.secondary {
  background: #e5e7eb;
  color: #111827;
}

.hidden {
  display: none !important;
}

.solution {
  text-align: center;
  margin: 28px 0;
  padding: 26px;
  border-radius: 15px;
  background: #f9fafb;
}

.solution-label {
  color: #6b7280;
  margin-bottom: 8px;
}

#solution-word {
  font-size: clamp(2rem, 10vw, 4rem);
  font-weight: 800;
  letter-spacing: .08em;
}

.push-card {
  border: 1px solid #e5e7eb;
}

.admin-area {
  margin-top: 14px;
  display: flex;
  gap: 8px;
}

.admin-area input {
  flex: 1;
  min-width: 0;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
}

.status {
  min-height: 1.3em;
  color: #4b5563;
}


/* =========================================
   NICKNAME
========================================= */

#nickname {
  width: 100%;
  padding: 14px 16px;
  margin: 10px 0 14px;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: white;
  color: #111827;
}

#nickname:focus {
  outline: none;
  border-color: #9ca3af;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, .08);
}


/* =========================================
   TIMER
========================================= */

#timer {
  font-weight: 800;
  color: #111827;
  font-variant-numeric: tabular-nums;
  letter-spacing: .03em;
}


/* =========================================
   BESTENLISTE
========================================= */

.leaderboard-card {
  overflow: hidden;
}

.leaderboard-card h2 {
  margin-bottom: 6px;
}

.leaderboard-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 90px;
  align-items: center;
  gap: 16px;

  min-height: 52px;

  padding: 11px 12px;
  margin-bottom: 7px;

  border: 1px solid #e5e7eb;
  border-radius: 11px;

  background: #ffffff;
}

.leaderboard-rank {
  font-weight: 800;
  text-align: right;
  color: #6b7280;
}

.leaderboard-name {
  font-weight: 600;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leaderboard-time {
  font-weight: 800;
  text-align: right;

  font-variant-numeric: tabular-nums;
  letter-spacing: .02em;
}


/* Top 3 etwas hervorheben */

.place-first {
  border-width: 2px;
  background: #fafafa;
}

.place-first .leaderboard-rank {
  font-size: 1.1rem;
  color: #111827;
}

.place-second {
  border-width: 2px;
}

.place-third {
  border-width: 2px;
}


/* Eigener Eintrag */

.current-player {
  outline: 2px solid #111827;
  outline-offset: -2px;
}


/* Bestenliste aktualisieren */

.leaderboard-refresh {
  width: 100%;
  margin-top: 16px;
}


/* =========================================
   MOBILE
========================================= */

@media (max-width: 520px) {

  .card {
    padding: 20px;
  }

  .leaderboard-row {
    grid-template-columns: 38px minmax(0, 1fr) 78px;
    gap: 10px;
    padding: 10px;
  }

  .leaderboard-time {
    font-size: .95rem;
  }

  .topline {
    gap: 10px;
  }
}
