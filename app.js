const API_BASE = "https://mein-quiz.vercel.app";

// ======================================================
// STATUS
// ======================================================

let current = 0;
let selected = null;
let locked = false;

let nickname = "";
let startTime = null;
let timerInterval = null;
let finalTime = null;
let quizRunning = false;

// ======================================================
// ELEMENTE
// ======================================================

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

  timerEl.textContent = "00:00.0";

  timerInterval = setInterval(() => {
    if (!quizRunning) return;

    const elapsed = performance.now() - startTime;

    timerEl.textContent = formatTime(elapsed);
  }, 100);
}

function stopTimer() {
  if (!quizRunning || startTime === null) {
    return;
  }

  finalTime = Math.round(
    performance.now() - startTime
  );

  quizRunning = false;

  clearInterval(timerInterval);
  timerInterval = null;

  timerEl.textContent =
    formatTime(finalTime);
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
      !/^[\p{L}\p{N} _.-]+$/u.test(
        enteredName
      )
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

  questionEl.textContent =
    q.question;

  progressEl.textContent =
    `Frage ${current + 1} von ${quiz.length}`;

  answersEl.innerHTML = "";

  const shuffled =
    q.answers
      .map((text, index) => ({
        text,
        index
      }))
      .sort(
        () => Math.random() - 0.5
      );

  shuffled.forEach(item => {
    const button =
      document.createElement("button");

    button.className = "answer";
    button.textContent = item.text;

    button.addEventListener(
      "click",
      () => {
        selectAnswer(
          button,
          item.index
        );
      }
    );

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
    .forEach(button => {
      button.classList.remove(
        "selected"
      );
    });

  button.classList.add(
    "selected"
  );

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

  messageEl.textContent =
    text;
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

      if (
        current >= quiz.length
      ) {
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

  loadCurrentWord();

  await submitScore();

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
            nickname,
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

async function loadLeaderboard() {
  const leaderboardEl =
    document.getElementById(
      "leaderboard"
    );

  leaderboardEl.innerHTML =
    '<p class="status">Bestenliste wird geladen …</p>';

  try {
    const response =
      await fetch(
        `${API_BASE}/api/leaderboard`,
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `Leaderboard-API ${response.status}`
      );
    }

    const data =
      await response.json();

    const entries =
      Array.isArray(
        data.leaderboard
      )
        ? data.leaderboard
        : [];

    leaderboardEl.innerHTML = "";

    if (entries.length === 0) {
      const empty =
        document.createElement("p");

      empty.className =
        "status";

      empty.textContent =
        "Noch keine Zeiten vorhanden.";

      leaderboardEl.appendChild(
        empty
      );

      return;
    }

    entries.forEach(
      (entry, index) => {

        const row =
          document.createElement(
            "div"
          );

        row.className =
          "leaderboard-row";

        if (index === 0) {
          row.classList.add(
            "place-first"
          );
        }

        if (index === 1) {
          row.classList.add(
            "place-second"
          );
        }

        if (index === 2) {
          row.classList.add(
            "place-third"
          );
        }

        if (
          nickname &&
          String(
            entry.nickname
          ).toLowerCase() ===
          nickname.toLowerCase()
        ) {
          row.classList.add(
            "current-player"
          );
        }

        // Platznummer
        const rank =
          document.createElement(
            "span"
          );

        rank.className =
          "leaderboard-rank";

        rank.textContent =
          `${index + 1}.`;

        // Name
        const name =
          document.createElement(
            "span"
          );

        name.className =
          "leaderboard-name";

        name.textContent =
          entry.nickname;

        // Zeit
        const time =
          document.createElement(
            "span"
          );

        time.className =
          "leaderboard-time";

        time.textContent =
          formatTime(
            Number(entry.time)
          );

        row.appendChild(rank);
        row.appendChild(name);
        row.appendChild(time);

        leaderboardEl.appendChild(
          row
        );
      }
    );

  } catch (error) {
    console.error(
      "Bestenliste konnte nicht geladen werden:",
      error
    );

    leaderboardEl.innerHTML = "";

    const errorText =
      document.createElement("p");

    errorText.className =
      "status";

    errorText.textContent =
      "Bestenliste konnte nicht geladen werden.";

    leaderboardEl.appendChild(
      errorText
    );
  }
}

// ======================================================
// BESTENLISTE AKTUALISIEREN
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
// LÖSUNGSWORT LADEN
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

      clearInterval(
        timerInterval
      );

      current = 0;
      selected = null;
      locked = false;

      startTime = null;
      finalTime = null;
      quizRunning = false;

      clearMessage();

      document
        .getElementById(
          "result-card"
        )
        .classList.add(
          "hidden"
        );

      document
        .getElementById(
          "quiz-card"
        )
        .classList.add(
          "hidden"
        );

      document
        .getElementById(
          "start-card"
        )
        .classList.remove(
          "hidden"
        );

      document
        .getElementById(
          "nickname"
        )
        .value =
          nickname;

      document
        .getElementById(
          "solution-word"
        )
        .textContent =
          "wird geladen …";
    }
  );



// ======================================================
// START
// ======================================================

loadLeaderboard();
