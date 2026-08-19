const API_BASE = "https://mein-quiz.vercel.app";

// ======================================================
// QUIZ
// ======================================================

let current = 0;
let score = 0;
let selected = null;
let locked = false;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next");
const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");

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
  progressEl.textContent = `Frage ${current + 1} von ${quiz.length}`;
  scoreEl.textContent = `${score} richtig`;

  answersEl.innerHTML = "";

  const shuffled = q.answers
    .map((text, index) => ({
      text,
      index
    }))
    .sort(() => Math.random() - 0.5);

  shuffled.forEach(item => {
    const button = document.createElement("button");

    button.className = "answer";
    button.textContent = item.text;
    button.dataset.originalIndex = item.index;

    button.addEventListener("click", () => {
      selectAnswer(button, item.index);
    });

    answersEl.appendChild(button);
  });
}

function selectAnswer(button, originalIndex) {
  if (locked) return;

  document
    .querySelectorAll(".answer")
    .forEach(b => b.classList.remove("selected"));

  button.classList.add("selected");

  selected = originalIndex;
  nextBtn.disabled = false;
}

function showMessage(text) {
  let messageEl = document.getElementById("quiz-message");

  if (!messageEl) {
    messageEl = document.createElement("p");
    messageEl.id = "quiz-message";
    messageEl.style.marginTop = "14px";
    messageEl.style.fontWeight = "600";

    nextBtn.insertAdjacentElement("afterend", messageEl);
  }

  messageEl.textContent = text;
}

function clearMessage() {
  const messageEl = document.getElementById("quiz-message");

  if (messageEl) {
    messageEl.textContent = "";
  }
}

function finishQuiz() {
  document
    .getElementById("quiz-card")
    .classList.add("hidden");

  document
    .getElementById("result-card")
    .classList.remove("hidden");

  document
    .getElementById("result-text")
    .textContent =
      `Geschafft! Du hast alle ${quiz.length} Fragen richtig beantwortet.`;

  loadCurrentWord();
}


// ======================================================
// AKTUELLES LÖSUNGSWORT
// ======================================================

async function loadCurrentWord() {
  const wordEl =
    document.getElementById("solution-word");

  wordEl.textContent =
    "wird geladen …";

  try {
    const response = await fetch(
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
// ANTWORT PRÜFEN
// ======================================================

nextBtn.addEventListener(
  "click",
  () => {
    if (
      selected === null ||
      locked
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
          button.classList.remove("selected");
        });

      selected = null;
      locked = false;
      nextBtn.disabled = true;

      return;
    }

    // RICHTIGE ANTWORT
    clearMessage();

    score++;

    showMessage(
      "Richtig!"
    );

    setTimeout(
      () => {
        current++;

        if (
          current >= quiz.length
        ) {
          finishQuiz();
        } else {
          clearMessage();
          renderQuestion();
        }
      },
      600
    );
  }
);


// ======================================================
// QUIZ NEU STARTEN
// ======================================================

document
  .getElementById("restart")
  .addEventListener(
    "click",
    () => {
      current = 0;
      score = 0;

      clearMessage();

      document
        .getElementById("result-card")
        .classList.add("hidden");

      document
        .getElementById("quiz-card")
        .classList.remove("hidden");

      renderQuestion();
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
      .getElementById("admin-area")
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
  .getElementById("enable-push")
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
  .getElementById("register-device")
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
renderQuestion();
