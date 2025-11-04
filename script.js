// ===== ALLOWED STUDENTS =====
const allowedStudents = [
  "Aitach2", "Alvi2", "Zhaxongir2", "Aylin2", "Narmin2",
  "Sultan2", "Islam2", "Kirill2", "Kira2", "Dima2",
  "Damir2", "Irada2", "Shyngis2", "Balman2", "Aray2", "Aisu2"
];

// ===== PINs =====
const STUDENT_PIN = "6856";
const TEACHER_PIN = "9995";

// ===== OpenAI API SETTINGS (ONLINE mode) =====
// ВАЖНО: для реальной школы лучше вызывать backend, а не хранить ключ в JS.
// Здесь оставляем пустым (оффлайн-режим + заглушки).
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_API_KEY = ""; // сюда можно временно вставить ключ только для тестов

// ===== JOURNAL STORAGE =====
function getJournal() {
  return JSON.parse(localStorage.getItem("teacherJournal_4GrII")) || [];
}
function saveJournal(journal) {
  localStorage.setItem("teacherJournal_4GrII", JSON.stringify(journal));
}

function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
}

function ensureStudentInJournal(name) {
  if (!name) return;
  let journal = getJournal();
  const idx = journal.findIndex(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
  if (idx === -1) {
    journal.push({
      name: name,
      grammar: 0,
      vocabulary: 0,
      phonics: 0,
      reading: 0,
      listening: 0,
      writing: 0,
      speaking: 0,
      quiz: 0,
      lastMode: "offline",
      lastActivityDate: "",
      lastTopic: ""
    });
    saveJournal(journal);
  }
}

// ===== LOGIN =====
function checkPin() {
  const pinInput = document.getElementById("pin");
  const nameInput = document.getElementById("studentNameInput");
  const pin = (pinInput.value || "").trim();
  const name = (nameInput ? nameInput.value : "").trim();

  // Teacher
  if (pin === TEACHER_PIN) {
    localStorage.setItem("role_4GrII", "teacher");
    window.location.href = "teacher.html";
    return;
  }

  // Student
  if (pin === STUDENT_PIN) {
    if (!name) {
      alert("Please enter student name.");
      return;
    }
    if (!allowedStudents.includes(name)) {
      alert("❌ This name is not in the class list. Please check with your teacher.");
      return;
    }
    localStorage.setItem("role_4GrII", "student");
    localStorage.setItem("lastStudentName_4GrII", name);
    ensureStudentInJournal(name);

    const overlay = document.querySelector(".overlay");
    if (overlay) overlay.style.display = "none";

    updateWelcomeAndStars();
    return;
  }

  alert("❌ Wrong PIN");
}

function goToTeacher() {
  window.location.href = "teacher.html";
}

// ===== STARS + DATES + LAST TOPIC =====
function awardStar(sectionKey, mode = "offline") {
  const name = localStorage.getItem("lastStudentName_4GrII");
  if (!name) return;

  let journal = getJournal();
  const idx = journal.findIndex(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
  if (idx === -1) return;

  const current = journal[idx][sectionKey] || 0;
  journal[idx][sectionKey] = current + 1;
  journal[idx].lastMode = mode;
  journal[idx].lastActivityDate = todayString();

  if (currentTopic && TOPIC_TITLES[currentTopic]) {
    journal[idx].lastTopic = TOPIC_TITLES[currentTopic];
  } else {
    journal[idx].lastTopic = "Menu / Chat";
  }

  saveJournal(journal);
  updateWelcomeAndStars();
}

function getStudentTotals() {
  const name = localStorage.getItem("lastStudentName_4GrII");
  if (!name) return null;
  const journal = getJournal();
  const s = journal.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!s) return null;
  const total =
    s.grammar +
    s.vocabulary +
    s.phonics +
    s.reading +
    s.listening +
    s.writing +
    s.speaking +
    s.quiz;
  return { ...s, total };
}

function updateWelcomeAndStars() {
  const box = document.getElementById("welcomeBox");
  const nameSpan = document.getElementById("studentName");
  const totalSpan = document.getElementById("totalStars");
  const starsSummary = document.getElementById("starsSummary");
  const lastActivityLine = document.getElementById("lastActivityLine");

  const info = getStudentTotals();
  const name = localStorage.getItem("lastStudentName_4GrII");

  if (!info || !name) {
    if (box) box.style.display = "none";
    return;
  }

  if (box) box.style.display = "block";
  if (nameSpan) nameSpan.textContent = name;
  if (totalSpan) totalSpan.textContent = info.total;
  if (lastActivityLine) {
    if (info.lastActivityDate) {
      lastActivityLine.textContent =
        `Last activity: ${info.lastActivityDate} · Last topic: ` +
        (info.lastTopic || "-");
    } else {
      lastActivityLine.textContent = "";
    }
  }
  if (starsSummary) {
    starsSummary.textContent =
      `Grammar: ${info.grammar} · Vocabulary: ${info.vocabulary} · ` +
      `Writing: ${info.writing} · Speaking: ${info.speaking} · ` +
      `Chat/Quiz: ${info.quiz} (Mode: ${info.lastMode})`;
  }
}

// ===== TOPICS =====
const TOPIC_TITLES = {
  1: "Let’s Have Fun!",
  2: "Sports and Exercises",
  3: "Sports Around the World",
  4: "Arts and Music",
  5: "Popular Team Sports",
  6: "Museum of Kazakh Musical Instruments",
  7: "Children’s Rights & Responsibilities",
  8: "Different Jobs",
  9: "Professions",
  10: "People at Work",
  11: "What Do You Do?",
  12: "You Can Help!",
  13: "Final Challenge"
};

let currentTopic = null;
let currentSubsection = null;

function openTopic(num) {
  currentTopic = num;

  const section = document.getElementById("topicSection");
  const title = document.getElementById("topicTitle");
  const subnav = document.getElementById("topicSubnav");
  const chat = document.getElementById("chatSection");

  if (title) {
    title.textContent = `Topic ${num}: ${TOPIC_TITLES[num] || ""}`;
  }
  if (section) section.style.display = "block";
  if (chat) chat.style.display = "none";

  if (subnav) {
    subnav.style.display = num === 13 ? "none" : "block";
  }

  if (num === 13) {
    renderFinalChallenge();
  } else {
    currentSubsection = "vocabulary";
    renderTopicContent();
  }
}

function setTopicSubsection(sub) {
  currentSubsection = sub;
  renderTopicContent();
}

function renderTopicContent() {
  const box = document.getElementById("topicContent");
  if (!box || !currentTopic || !currentSubsection) return;

  if (currentSubsection === "vocabulary") {
    box.innerHTML = `
      <h3>🧠 Vocabulary</h3>
      <p>Topic: <b>${TOPIC_TITLES[currentTopic]}</b></p>
      <p>Example: complete a small vocabulary task and get a star.</p>
      <button class="btn" onclick="completeSimpleTask('vocabulary')">Complete vocab task ✅</button>
    `;
  } else if (currentSubsection === "grammar") {
    box.innerHTML = `
      <h3>📘 Grammar</h3>
      <p>Example grammar exercise. You can replace this text with real tasks from Top Stars.</p>
      <button class="btn" onclick="completeSimpleTask('grammar')">Complete grammar task ✅</button>
    `;
  } else if (currentSubsection === "listening") {
    box.innerHTML = `
      <h3>🎧 Listening</h3>
      <p>Example listening task placeholder. Later you can add real audio files from /audio/.</p>
      <button class="btn" onclick="completeSimpleTask('listening')">Complete listening task ✅</button>
    `;
  } else if (currentSubsection === "reading") {
    box.innerHTML = `
      <h3>📖 Reading</h3>
      <p>Short reading text for topic <b>${TOPIC_TITLES[currentTopic]}</b>.</p>
      <p>(You can paste real text here.)</p>
      <button class="btn" onclick="completeSimpleTask('reading')">Complete reading task ✅</button>
    `;
  } else if (currentSubsection === "speaking") {
    box.innerHTML = `
      <h3>🗣️ Speaking</h3>
      <p>Say one sentence about this topic using your microphone.</p>
      <button class="btn" onclick="startSimpleSpeaking()">🎙️ Start speaking</button>
      <p id="speakingHeard"></p>
      <p id="speakingFeedback"></p>
    `;
  } else if (currentSubsection === "writing") {
    box.innerHTML = `
      <h3>✍️ Writing</h3>
      <p>Write one simple sentence (e.g. "I like English.").</p>
      <input id="writingInput" style="width:100%;padding:6px;border-radius:8px;border:1px solid #ccc;">
      <br><br>
      <button class="btn" onclick="checkSimpleWriting()">Check</button>
      <p id="writingFeedbackSimple"></p>
    `;
  }
}

function completeSimpleTask(sectionKey) {
  alert("✅ Well done! You get 1 star for " + sectionKey + "!");
  awardStar(sectionKey, "offline");
}

// ===== Simple Speaking =====
function startSimpleSpeaking() {
  const heard = document.getElementById("speakingHeard");
  const fb = document.getElementById("speakingFeedback");
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("SpeechRecognition is not supported in this browser.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-GB";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  if (heard) {
    heard.textContent = "Listening... 🎧 Please speak now.";
    heard.style.color = "#003366";
  }
  if (fb) fb.textContent = "";

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    if (heard) {
      heard.textContent = 'You said: "' + text + '"';
      heard.style.color = "#333";
    }
    if (fb) {
      fb.textContent = "✅ Great speaking! You get 1 star for speaking.";
      fb.style.color = "green";
    }
    awardStar("speaking", "offline");
  };

  recognition.onerror = (event) => {
    if (fb) {
      fb.textContent = "Error: " + event.error;
      fb.style.color = "#cc0000";
    }
  };

  recognition.start();
}

// ===== Simple Writing =====
const SIMPLE_WRITING_ANSWER = "I like English.";

function checkSimpleWriting() {
  const input = document.getElementById("writingInput");
  const fb = document.getElementById("writingFeedbackSimple");
  if (!input || !fb) return;

  const userText = (input.value || "").trim();
  if (!userText) {
    fb.textContent = "Please write a sentence 🙂";
    fb.style.color = "#cc0000";
    return;
  }

  if (userText.toLowerCase() === SIMPLE_WRITING_ANSWER.toLowerCase()) {
    fb.textContent =
      "✅ Correct! Well done!\nCorrect answer: " + SIMPLE_WRITING_ANSWER;
    fb.style.color = "green";
    awardStar("writing", "offline");
  } else {
    fb.textContent =
      "❌ Not exactly.\nCorrect answer: " + SIMPLE_WRITING_ANSWER;
    fb.style.color = "#cc0000";
  }
}

// ===== FINAL CHALLENGE (topic 13) – каркас 6 раундов =====
function renderFinalChallenge() {
  const box = document.getElementById("topicContent");
  if (!box) return;
  box.innerHTML = `
    <h3>🎯 Final Challenge — All Skills</h3>
    <p>This is a final game with 6 rounds: Vocabulary, Grammar, Listening, Reading, Dictation, Speaking.</p>
    <ol>
      <li>🧠 Vocabulary Sprint</li>
      <li>📘 Grammar Mix</li>
      <li>🎧 Listening Mystery</li>
      <li>📖 Reading Text</li>
      <li>✍️ Dictation</li>
      <li>🗣️ Speaking Challenge</li>
    </ol>
    <button class="btn" onclick="runFinalRound('vocab')">Start Round 1: Vocabulary ✅</button>
    <button class="btn" onclick="runFinalRound('grammar')">Round 2: Grammar ✅</button>
    <button class="btn" onclick="runFinalRound('listening')">Round 3: Listening ✅</button>
    <button class="btn" onclick="runFinalRound('reading')">Round 4: Reading ✅</button>
    <button class="btn" onclick="runFinalRound('dictation')">Round 5: Dictation ✅</button>
    <button class="btn" onclick="runFinalRound('speaking')">Round 6: Speaking ✅</button>
    <p style="margin-top:10px;font-size:0.85rem;">
      (For now, each button just gives you 1 star in the matching skill. Later you can put real tasks here.)
    </p>
  `;
}

function runFinalRound(type) {
  if (type === "vocab") awardStar("vocabulary", "offline");
  else if (type === "grammar") awardStar("grammar", "offline");
  else if (type === "listening") awardStar("listening", "offline");
  else if (type === "reading") awardStar("reading", "offline");
  else if (type === "dictation") awardStar("writing", "offline");
  else if (type === "speaking") awardStar("speaking", "offline");
  alert("✅ Round completed! You got 1 star.");
}

// ===== Chat Section open =====
function openChat() {
  const chat = document.getElementById("chatSection");
  const topic = document.getElementById("topicSection");
  if (topic) topic.style.display = "none";
  if (chat) chat.style.display = "block";
}

// ===== AI BAYAN CHAT: online + offline fallback =====
async function sendAiChat() {
  const input = document.getElementById("aiChatInput");
  const log = document.getElementById("aiChatLog");
  if (!input || !log) return;

  const text = (input.value || "").trim();
  if (!text) return;

  const userDiv = document.createElement("div");
  userDiv.className = "chat-entry-user";
  userDiv.textContent = "👤 You: " + text;
  log.appendChild(userDiv);

  let answer;
  let mode = "offline";
  if (OPENAI_API_KEY) {
    try {
      answer = await askOpenAI(text);
      mode = "online";
    } catch (e) {
      console.warn("OpenAI error, fallback to offline:", e);
      answer = buildOfflineAnswer(text);
      mode = "offline";
    }
  } else {
    answer = buildOfflineAnswer(text);
    mode = "offline";
  }

  const botDiv = document.createElement("div");
  botDiv.className = "chat-entry-bot";
  botDiv.innerHTML = "🤖 AI Bayan: " + answer.html;
  log.appendChild(botDiv);

  log.scrollTop = log.scrollHeight;
  input.value = "";

  awardStar("quiz", mode);

  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(answer.say);
    utter.lang = "en-GB";
    window.speechSynthesis.speak(utter);
  }
}

// ==== ONLINE запрос к OpenAI (при наличии ключа) ====
async function askOpenAI(userMessage) {
  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are AI Bayan, an English tutor for 4th grade students. Answer in simple English and, if helpful, add short Russian explanation."
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    })
  });

  if (!res.ok) {
    throw new Error("OpenAI HTTP error " + res.status);
  }
  const data = await res.json();
  const content = data.choices[0].message.content.trim();

  return {
    say: content,
    html: content.replace(/\n/g, "<br>")
  };
}

// ==== OFFLINE fallback ИИ ====
function buildOfflineAnswer(question) {
  const q = question.toLowerCase();

  if (q.includes("корова")) {
    return {
      say: "Cow.",
      html: "<b>cow</b> [kaʊ] — корова."
    };
  }
  if (q.includes("кошка") || q.includes("кот")) {
    return {
      say: "Cat.",
      html: "<b>cat</b> [kæt] — кошка / кот."
    };
  }
  if (q.includes("собака")) {
    return {
      say: "Dog.",
      html: "<b>dog</b> [dɒg] — собака."
    };
  }
  if (q.includes("как будет")) {
    return {
      say: "I am a simple offline trainer. Please ask your teacher or use a dictionary for more words.",
      html:
        "I’m a simple offline trainer 🧠.<br>" +
        "Я не могу переводить все слова, но можешь спросить учителя или использовать словарь 😊."
    };
  }
  if (q.includes("что значит")) {
    return {
      say: "Try to guess the meaning from context or ask your teacher.",
      html:
        "Try to guess the meaning from context or ask your teacher 💬.<br>" +
        "Попробуй догадаться по контексту или спроси учителя."
    };
  }
  if (q.includes("why") && q.includes("wrong")) {
    return {
      say: "Check the verb form and word order.",
      html:
        "Check the <b>verb form</b> and <b>word order</b> in the sentence.<br>" +
        "Проверь форму глагола и порядок слов."
    };
  }

  return {
    say: "I am happy to talk with you. Ask me about words or simple sentences.",
    html:
      "I am happy to talk with you 🩵<br>" +
      "Я простой AI Bayan внутри приложения. Спроси меня про слова или предложения."
  };
}
