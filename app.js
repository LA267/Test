const API_BASE = "https://DEIN-VERCEL-PROJEKT.vercel.app";

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
  nextBtn.textContent = current === quiz.length - 1 ? "Quiz beenden" : "Weiter";

  const q = quiz[current];
  questionEl.textContent = q.question;
  progressEl.textContent = `Frage ${current + 1} von ${quiz.length}`;
  scoreEl.textContent = `${score} Punkte`;
  answersEl.innerHTML = "";

  // Antworten werden nur für die Darstellung gemischt.
  const shuffled = q.answers.map((text, index) => ({ text, index }))
    .sort(() => Math.random() - 0.5);

  shuffled.forEach(item => {
    const button = document.createElement("button");
    button.className = "answer";
    button.textContent = item.text;
    button.dataset.originalIndex = item.index;

    button.addEventListener("click", () => selectAnswer(button, item.index));
    answersEl.appendChild(button);
  });
}

function selectAnswer(button, originalIndex) {
  if (locked) return;

  document.querySelectorAll(".answer").forEach(b => b.classList.remove("selected"));
  button.classList.add("selected");
  selected = originalIndex;
  nextBtn.disabled = false;
}

function finishQuiz() {
  document.getElementById("quiz-card").classList.add("hidden");
  document.getElementById("result-card").classList.remove("hidden");
  document.getElementById("result-text").textContent =
    `Du hast ${score} von ${quiz.length} Fragen richtig beantwortet.`;

  loadCurrentWord();
}

async function loadCurrentWord() {
  const wordEl = document.getElementById("solution-word");
  wordEl.textContent = "wird geladen …";

  try {
    const response = await fetch(`${API_BASE}/api/current-word`, {
      cache: "no-store"
    });

    if (!response.ok) throw new Error("API-Fehler");

    const data = await response.json();
    wordEl.textContent = data.word;
  } catch {
    wordEl.textContent = "Nicht verfügbar";
  }
}

nextBtn.addEventListener("click", () => {
  if (selected === null || locked) return;

  locked = true;
  const correct = quiz[current].correct;

  document.querySelectorAll(".answer").forEach(button => {
    const index = Number(button.dataset.originalIndex);

    if (index === correct) button.classList.add("correct");
    if (index === selected && selected !== correct) button.classList.add("wrong");
  });

  if (selected === correct) score++;

  setTimeout(() => {
    current++;

    if (current >= quiz.length) {
      finishQuiz();
    } else {
      renderQuestion();
    }
  }, 700);
});

document.getElementById("restart").addEventListener("click", () => {
  current = 0;
  score = 0;
  document.getElementById("result-card").classList.add("hidden");
  document.getElementById("quiz-card").classList.remove("hidden");
  renderQuestion();
});

async function setupPush() {
  const status = document.getElementById("push-status");

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    status.textContent = "Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.";
    return;
  }

  try {
    await navigator.serviceWorker.register("sw.js");
    status.textContent = "Service Worker ist bereit.";
    document.getElementById("admin-area").classList.remove("hidden");
  } catch (error) {
    status.textContent = "Service Worker konnte nicht registriert werden.";
  }
}

document.getElementById("enable-push").addEventListener("click", async () => {
  const status = document.getElementById("push-status");

  if (!("Notification" in window)) {
    status.textContent = "Dieser Browser unterstützt keine Benachrichtigungen.";
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    status.textContent = "Benachrichtigungen wurden nicht erlaubt.";
    return;
  }

  await setupPush();
  status.textContent = "Erlaubnis erteilt. Jetzt kannst du dein Gerät registrieren.";
});

document.getElementById("register-device").addEventListener("click", async () => {
  const status = document.getElementById("push-status");
  const token = document.getElementById("admin-token").value.trim();

  if (!token) {
    status.textContent = "Bitte den Registrierungscode eingeben.";
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const keyResponse = await fetch(`${API_BASE}/api/public-key`, {
      cache: "no-store"
    });

    if (!keyResponse.ok) throw new Error("Public Key konnte nicht geladen werden.");

    const { publicKey } = await keyResponse.json();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    const response = await fetch(`${API_BASE}/api/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": token
      },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error("Registrierung fehlgeschlagen.");
    }

    status.textContent = "Dieses Handy ist jetzt für die stündlichen Benachrichtigungen registriert.";
    document.getElementById("admin-token").value = "";
  } catch (error) {
    status.textContent = "Registrierung fehlgeschlagen. Prüfe API-URL, Code und HTTPS.";
  }
});

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

setupPush();
renderQuestion();
