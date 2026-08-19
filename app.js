const API_BASE = "https://mein-quiz.vercel.app";

// ======================================================
// QUIZ + TIMER
// ======================================================

let current = 0;
let selected = null;
let locked = false;

let nickname = "";
let startTime = null;
let timerInterval = null;
let finalTime = null;
let quizRunning = false;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next");
const progressEl = document.getElementById("progress");
const timerEl = document.getElementById("timer");


// ======================================================
// ZEIT FORMATIEREN
// ======================================================

function formatTime(milliseconds) {
  const totalTenths = Math.floor(milliseconds / 100);

  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    "." +
    tenths
  );
}


// ======================================================
// TIMER
// ======================================================

function startTimer() {
  startTime = performance.now();
  finalTime = null;
  quizRunning = true;

  clearInterval(timerInterval);

  timerEl.textContent = "⏱ 00:00.0";

  timerInterval = setInterval(() => {
    if (!quizRunning) return;

    const elapsed = performance.now() - startTime;

    timerEl.textContent =
      "⏱ " + formatTime(elapsed);
  }, 100);
}


function stopTimer() {
  if (!quizRunning || startTime === null) {
    return;
  }

  finalTime =
    Math.round(performance.now() - startTime);

  quizRunning = false;

  clearInterval(timerInterval);
  timerInterval = null;

  timerEl.textContent =
    "⏱ " + formatTime(finalTime);
}


// ======================================================
// QUIZ STARTEN
// ======================================================

document
  .getElementById("start-quiz")
  .addEventListener("click", () => {

    const input =
      document.getElementById("nickname");

    const message =
      document.getElementById("start-message");

    const enteredName =
      input.value.trim();

    if (!enteredName) {
      message.textContent =
        "Bitte gib zuerst einen Nickname ein.";
      return;
    }

    if (
      !/^[\p{L}\p{N} _.-]+$/u.test(enteredName)
    ) {
      message.textContent =
        "Bitte verwende nur Buchstaben, Zahlen, Leerzeichen, Punkt, Bindestrich oder Unterstrich.";
      return;
    }

    nickname =
      enteredName.slice(0, 20);

    current = 0;
    selected = null;
    locked = false;

    message.textContent = "";

    document
      .getElementById("start-card")
      .classList.add("hidden");

    document
      .getElementById("result-card")
      .classList.add("hidden");

    document
      .getElementById("quiz-card")
      .classList.remove("hidden");

    renderQuestion();
    startTimer();
  });


// ======================================================
// FRAGE ANZEIGEN
// ======================================================

function renderQuestion() {
  selected = null;
  locked = false;

  nextBtn.disabled = true;

  nextBtn.textContent =
    current === quiz.length - 1
      ? "Quiz abschließen"
      : "Antwort prüfen";

  const q = quiz[current];

  questionEl.textContent = q.question;

  progressEl.textContent =
    `Frage ${current + 1} von ${quiz.length}`;

  answersEl.innerHTML = "";

  const shuffled =
    q.answers
      .map((text, index) => ({
        text,
        index
      }))
      .sort(() => Math.random() - 0.5);

  shuffled.forEach(item => {
    const button =
      document.createElement("button");

    button.className = "answer";
    button.textContent = item.text;

    button.addEventListener("click", () => {
      selectAnswer(
        button,
        item.index
      );
    });

    answersEl.appendChild(button);
  });
}


// ======================================================
// ANTWORT AUSWÄHLEN
// ======================================================

function selectAnswer(
  button,
  originalIndex
) {
  if (locked) return;

  document
    .querySelectorAll(".answer")
    .forEach(b =>
      b.classList.remove("selected")
    );

  button.classList.add("selected");

  selected = originalIndex;
  nextBtn.disabled = false;
}


// ======================================================
// MELDUNGEN
// ======================================================

function showMessage(text) {
  let messageEl =
    document.getElementById(
      "quiz-message"
    );

  if (!messageEl) {
    messageEl =
      document.createElement("p");

    messageEl.id =
      "quiz-message";

    messageEl.style.marginTop =
      "14px";

    messageEl.style.fontWeight =
      "600";

    nextBtn.insertAdjacentElement(
      "afterend",
      messageEl
    );
  }

  messageEl.textContent = text;
}


function clearMessage() {
  const messageEl =
    document.getElementById(
      "quiz-message"
    );

  if (messageEl) {
    messageEl.textContent = "";
  }
}


// ======================================================
// ANTWORT PRÜFEN
// ======================================================

nextBtn.addEventListener(
  "click",
  () => {

    if (
      selected === null ||
      locked ||
      !quizRunning
    ) {
      return;
    }

    locked = true;

    const correct =
      quiz[current].correct;


    // FALSCHE ANTWORT
    if (selected !== correct) {

      showMessage(
        "Leider falsch. Versuch es noch einmal."
      );

      document
        .querySelectorAll(".answer")
        .forEach(button => {
          button.classList.remove(
            "selected"
          );
        });

      selected = null;
      locked = false;
      nextBtn.disabled = true;

      return;
    }


    // RICHTIGE ANTWORT
    clearMessage();

    showMessage("Richtig!");

    setTimeout(() => {

      current++;

      if (current >= quiz.length) {
        finishQuiz();
      } else {
        clearMessage();
        renderQuestion();
      }

    }, 600);
  }
);


// ======================================================
// QUIZ BEENDET
// ======================================================

async function finishQuiz() {

  stopTimer();

  document
    .getElementById("quiz-card")
    .classList.add("hidden");

  document
    .getElementById("result-card")
    .classList.remove("hidden");

  document
    .getElementById("result-text")
    .textContent =
      `${nickname}, du hast alle ${quiz.length} Fragen richtig beantwortet!`;

  document
    .getElementById("final-time")
    .textContent =
      formatTime(finalTime);

  // Lösungswort laden
  loadCurrentWord();

  // Zeit speichern
  await submitScore();

  // Bestenliste aktualisieren
  await loadLeaderboard();
}


// ======================================================
// ZEIT SPEICHERN
// ======================================================

async function submitScore() {

  if (
    !nickname ||
    !Number.isFinite(finalTime)
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        `${API_BASE}/api/submit-score`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            nickname: nickname,
            time: finalTime
          })
        }
      );

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(
        `Score-API ${response.status}: ${text}`
      );
    }

  } catch (error) {

    console.error(
      "Zeit konnte nicht gespeichert werden:",
      error
    );
  }
}


// ======================================================
// BESTENLISTE LADEN
// ======================================================

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    let entries =
      (await redis.get("quiz_leaderboard")) || [];

    if (!Array.isArray(entries)) {
      entries = [];
    }

    // Falls aus der alten Version bereits doppelte
    // Nicknames vorhanden sind, bereinigen wir sie hier.
    const bestByNickname =
      new Map();

    for (const entry of entries) {
      const name =
        String(entry.nickname || "").trim();

      const time =
        Number(entry.time);

      if (
        !name ||
        !Number.isFinite(time)
      ) {
        continue;
      }

      const key =
        name.toLowerCase();

      const previous =
        bestByNickname.get(key);

      if (
        !previous ||
        time < Number(previous.time)
      ) {
        bestByNickname.set(
          key,
          entry
        );
      }
    }

    const leaderboard =
      Array.from(
        bestByNickname.values()
      ).sort(
        (a, b) =>
          Number(a.time) -
          Number(b.time)
      );

    return res.status(200).json({
      leaderboard
    });

  } catch (error) {
    console.error(
      "Leaderboard error:",
      error
    );

    return res.status(500).json({
      error:
        "Could not load leaderboard"
    });
  }
}


// ======================================================
// BESTENLISTE MANUELL AKTUALISIEREN
// ======================================================

document
  .getElementById(
    "refresh-leaderboard"
  )
  .addEventListener(
    "click",
    loadLeaderboard
  );


// ======================================================
// AKTUELLES LÖSUNGSWORT
// ======================================================

async function loadCurrentWord() {

  const wordEl =
    document.getElementById(
      "solution-word"
    );

  wordEl.textContent =
    "wird geladen …";

  try {

    const response =
      await fetch(
        `${API_BASE}/api/current-word`,
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `API-Fehler ${response.status}`
      );
    }

    const data =
      await response.json();

    wordEl.textContent =
      data.word;

  } catch (error) {

    console.error(
      "Fehler beim Laden des Lösungswortes:",
      error
    );

    wordEl.textContent =
      "Nicht verfügbar";
  }
}


// ======================================================
// NOCHMAL SPIELEN
// ======================================================

document
  .getElementById("restart")
  .addEventListener(
    "click",
    () => {

      clearInterval(timerInterval);

      current = 0;
      selected = null;
      locked = false;

      startTime = null;
      finalTime = null;
      quizRunning = false;

      clearMessage();

      document
        .getElementById("result-card")
        .classList.add("hidden");

      document
        .getElementById("quiz-card")
        .classList.add("hidden");

      document
        .getElementById("start-card")
        .classList.remove("hidden");

      document
        .getElementById("nickname")
        .value = nickname;

      document
        .getElementById("solution-word")
        .textContent =
          "wird geladen …";
    }
  );


// ======================================================
// SERVICE WORKER
// ======================================================

async function setupPush() {

  const status =
    document.getElementById(
      "push-status"
    );

  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {

    status.textContent =
      "Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.";

    return false;
  }

  try {

    await navigator
      .serviceWorker
      .register("./sw.js");

    status.textContent =
      "Push-System ist bereit.";

    document
      .getElementById(
        "admin-area"
      )
      .classList.remove("hidden");

    return true;

  } catch (error) {

    console.error(
      "Service Worker Fehler:",
      error
    );

    status.textContent =
      `Service-Worker-Fehler: ${error.message}`;

    return false;
  }
}


// ======================================================
// BENACHRICHTIGUNGEN ERLAUBEN
// ======================================================

document
  .getElementById(
    "enable-push"
  )
  .addEventListener(
    "click",
    async () => {

      const status =
        document.getElementById(
          "push-status"
        );

      if (
        !("Notification" in window)
      ) {

        status.textContent =
          "Dieser Browser unterstützt keine Benachrichtigungen.";

        return;
      }

      try {

        const permission =
          await Notification
            .requestPermission();

        if (
          permission !== "granted"
        ) {

          status.textContent =
            "Benachrichtigungen wurden nicht erlaubt.";

          return;
        }

        const success =
          await setupPush();

        if (success) {

          status.textContent =
            "Benachrichtigungen erlaubt. Gib jetzt deinen Registrierungscode ein.";
        }

      } catch (error) {

        console.error(error);

        status.textContent =
          `Fehler: ${error.message}`;
      }
    }
  );


// ======================================================
// ANDROID-GERÄT REGISTRIEREN
// ======================================================

document
  .getElementById(
    "register-device"
  )
  .addEventListener(
    "click",
    async () => {

      const status =
        document.getElementById(
          "push-status"
        );

      const token =
        document
          .getElementById(
            "admin-token"
          )
          .value
          .trim();

      if (!token) {

        status.textContent =
          "Bitte den Registrierungscode eingeben.";

        return;
      }

      try {

        status.textContent =
          "Registrierung läuft …";

        const registration =
          await navigator
            .serviceWorker
            .ready;

        const keyResponse =
          await fetch(
            `${API_BASE}/api/public-key`,
            {
              cache: "no-store"
            }
          );

        if (!keyResponse.ok) {

          throw new Error(
            `Public-Key-API: ${keyResponse.status} ${keyResponse.statusText}`
          );
        }

        const keyData =
          await keyResponse.json();

        if (!keyData.publicKey) {

          throw new Error(
            "VAPID Public Key ist leer."
          );
        }

        let subscription =
          await registration
            .pushManager
            .getSubscription();

        if (!subscription) {

          subscription =
            await registration
              .pushManager
              .subscribe({
                userVisibleOnly: true,

                applicationServerKey:
                  urlBase64ToUint8Array(
                    keyData.publicKey
                  )
              });
        }

        const response =
          await fetch(
            `${API_BASE}/api/subscribe`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "X-Admin-Token":
                  token
              },

              body:
                JSON.stringify(
                  subscription
                )
            }
          );

        const responseText =
          await response.text();

        if (!response.ok) {

          throw new Error(
            `Subscribe-API: ${response.status} ${response.statusText} – ${responseText}`
          );
        }

        status.textContent =
          "Dieses Handy ist jetzt für die stündlichen Benachrichtigungen registriert.";

        document
          .getElementById(
            "admin-token"
          )
          .value = "";

      } catch (error) {

        console.error(
          "Push-Registrierung fehlgeschlagen:",
          error
        );

        status.textContent =
          `Registrierung fehlgeschlagen: ${error.name || "Fehler"} – ${error.message}`;
      }
    }
  );


// ======================================================
// VAPID KEY UMWANDELN
// ======================================================

function urlBase64ToUint8Array(
  base64String
) {

  const padding =
    "=".repeat(
      (4 - base64String.length % 4) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      char =>
        char.charCodeAt(0)
    )
  );
}


// ======================================================
// START
// ======================================================

setupPush();
loadLeaderboard();
