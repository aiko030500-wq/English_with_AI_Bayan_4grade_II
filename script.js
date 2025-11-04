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
// Для реальной школы лучше вызывать backend, а не хранить ключ в JS.
// Сейчас оставляем пустым → будет оффлайн-режим для чата.
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

// ===== CONTENT for topics 1–12 (кратко, на основе Top Stars 4 SB+WB) =====
const TOPIC_CONTENT = {
  1: {
    vocabulary: [
      "play tag",
      "play hide-and-seek",
      "fly a kite",
      "go fishing",
      "go ice skating",
      "play basketball",
      "play volleyball",
      "have fun"
    ],
    grammar: "Present Continuous: I’m playing, She’s flying, They’re having fun.",
    listening: [
      "They’re playing hide-and-seek in the park.",
      "She is flying a kite.",
      "They are fishing in the lake.",
      "The children are having fun."
    ],
    reading:
      "It’s Sunday. The children are at the park. Ron and Jim are playing football. " +
      "Tina and Ed are flying a kite. John is fishing in the lake. They’re all having fun!",
    writing:
      "Write 3 sentences about what the children are doing in the park. " +
      "Example: They’re playing hide-and-seek.",
    speaking:
      "Say 2–3 sentences about what you are doing now. Example: I’m studying English. I’m having fun."
  },
  2: {
    vocabulary: [
      "do exercises",
      "go jogging",
      "do gymnastics",
      "ride a bike",
      "swim",
      "play tennis",
      "healthy",
      "strong"
    ],
    grammar: "Present Simple for habits: I play, He plays, They don’t play.",
    listening: [
      "I go jogging every morning.",
      "He plays tennis on Saturdays.",
      "We do exercises at school.",
      "She doesn’t like gymnastics."
    ],
    reading:
      "Madi likes sports. He plays football after school and rides his bike at the weekend. " +
      "He doesn’t like swimming, but he loves jogging with his friends.",
    writing:
      "Write 3 sentences about sports you do every week. Example: I play football on Fridays.",
    speaking:
      "Answer: What sports do you do? How often do you do exercises? Speak in full sentences."
  },
  3: {
    vocabulary: [
      "ice hockey",
      "table tennis",
      "basketball",
      "volleyball",
      "skiing",
      "skating",
      "stadium",
      "match"
    ],
    grammar:
      "Present Simple with like / love: They like playing basketball. He doesn’t like ice hockey.",
    listening: [
      "In Canada, many people play ice hockey.",
      "In China, table tennis is very popular.",
      "In Brazil, children love playing football."
    ],
    reading:
      "Sports around the world are different. In Canada, people love ice hockey. " +
      "In Brazil, football is the most popular sport. In China, table tennis is very important.",
    writing:
      "Write 3 sentences about sports in different countries. Example: In Kazakhstan, people like ice skating.",
    speaking:
      "Say 2–3 sentences about sports in your country and in another country."
  },
  4: {
    vocabulary: [
      "draw",
      "paint",
      "sing",
      "dance",
      "play the piano",
      "play the dombra",
      "musician",
      "artist"
    ],
    grammar: "Can / Can’t: I can sing. She can’t play the piano.",
    listening: [
      "She can play the piano.",
      "He can’t dance very well.",
      "They can sing and play the guitar."
    ],
    reading:
      "Aliya loves art. She can draw and paint beautiful pictures. " +
      "Her brother can play the dombra and sing traditional songs.",
    writing:
      "Write 3 sentences about what you can and can’t do in arts and music. Example: I can sing, but I can’t play the piano.",
    speaking:
      "Say what you can do: I can draw, I can play an instrument, I can sing."
  },
  5: {
    vocabulary: [
      "team",
      "player",
      "goalkeeper",
      "referee",
      "score a goal",
      "win",
      "lose",
      "match"
    ],
    grammar:
      "Present Simple in team sports: The team plays, The goalkeeper stops the ball.",
    listening: [
      "The goalkeeper can stop the ball.",
      "The players run and pass the ball.",
      "The team wins the match."
    ],
    reading:
      "Football is a popular team sport. There are eleven players in a team. " +
      "One player is the goalkeeper. Teams try to score goals and win the match.",
    writing:
      "Write 3 sentences about your favourite team sport. Example: My favourite team sport is football.",
    speaking:
      "Talk about a team sport you like. Who plays? What do they do? Use present simple."
  },
  6: {
    vocabulary: [
      "dombyra",
      "kobyz",
      "dangyra",
      "flute",
      "traditional",
      "museum",
      "exhibition",
      "instrument"
    ],
    grammar:
      "There is / There are: There is a dombyra in the museum. There are many instruments.",
    listening: [
      "There is a big dombyra in this museum.",
      "There are many traditional instruments.",
      "Children are visiting the museum."
    ],
    reading:
      "The Museum of Kazakh Musical Instruments has many traditional instruments. " +
      "There is a big dombyra and there are beautiful kobyz and dangyra. Children learn about music and history.",
    writing:
      "Write 3 sentences with There is / There are about a museum or a classroom.",
    speaking:
      "Describe a museum or a room: There is…, There are…"
  },
  7: {
    vocabulary: [
      "right",
      "responsibility",
      "go to school",
      "play",
      "be safe",
      "help at home",
      "listen",
      "respect"
    ],
    grammar:
      "Have to / don’t have to (simple): Children have to go to school. They don’t have to work.",
    listening: [
      "Children have the right to go to school.",
      "They have to listen to their parents.",
      "Children must be safe."
    ],
    reading:
      "Children have rights. They have the right to go to school, to play and to be safe. " +
      "They also have responsibilities. They have to listen to their parents and help at home.",
    writing:
      "Write 3 sentences about your rights and responsibilities as a child.",
    speaking:
      "Say what rights children have and what responsibilities they have."
  },
  8: {
    vocabulary: [
      "teacher",
      "doctor",
      "nurse",
      "driver",
      "cook",
      "farmer",
      "police officer",
      "vet"
    ],
    grammar:
      "Present Simple job descriptions: A teacher works at a school. A doctor helps sick people.",
    listening: [
      "My mother is a nurse. She works at a hospital.",
      "My father is a driver. He drives a bus.",
      "A vet helps animals."
    ],
    reading:
      "There are many different jobs. Teachers work at schools. Nurses and doctors work at hospitals. " +
      "Drivers take people to work. Farmers grow food for us.",
    writing:
      "Write 3 sentences about jobs in your family. Example: My mum is a teacher. She works at a school.",
    speaking:
      "Say what jobs you know and where these people work."
  },
  9: {
    vocabulary: [
      "engineer",
      "artist",
      "pilot",
      "dentist",
      "firefighter",
      "builder",
      "office worker",
      "manager"
    ],
    grammar:
      "What do you want to be? I want to be a…, because I like…",
    listening: [
      "I want to be a pilot.",
      "She wants to be a doctor because she likes helping people.",
      "He wants to be an artist."
    ],
    reading:
      "Children often think about future jobs. Nazym wants to be a vet because she loves animals. " +
      "Ali wants to be an engineer. He likes building and fixing things.",
    writing:
      "Write 3 sentences about what you want to be in the future and why.",
    speaking:
      "Say: What do you want to be? Why? Use ‘I want to be… because…’"
  },
  10: {
    vocabulary: [
      "office",
      "hospital",
      "school",
      "shop",
      "factory",
      "farm",
      "airport",
      "building site"
    ],
    grammar:
      "Present Simple: He works at…, She works in…, They work in…",
    listening: [
      "My dad works at an airport.",
      "She works in an office.",
      "They work on a farm."
    ],
    reading:
      "People work in many places. Some people work in offices, some in shops, and some in hospitals. " +
      "Farmers work on farms and builders work on building sites.",
    writing:
      "Write 3 sentences about where people in your family work.",
    speaking:
      "Say 2–3 sentences about people at work in your town or city."
  },
  11: {
    vocabulary: [
      "What do you do?",
      "I’m a student.",
      "I work at…",
      "I help…",
      "I build…",
      "I drive…",
      "I teach…",
      "I look after…"
    ],
    grammar:
      "Questions and answers: What do you do? I’m a…, Where do you work? I work at…",
    listening: [
      "What do you do? I’m a teacher.",
      "Where do you work? I work at a school.",
      "I’m a driver. I drive a taxi."
    ],
    reading:
      "A: What do you do?\nB: I’m a dentist. I work at a clinic.\nA: Do you like your job?\nB: Yes, I like helping people.",
    writing:
      "Write a short dialogue with ‘What do you do?’ and ‘Where do you work?’",
    speaking:
      "Role play: Ask and answer ‘What do you do?’ and ‘Where do you work?’"
  },
  12: {
    vocabulary: [
      "help",
      "volunteer",
      "recycle",
      "clean the park",
      "visit old people",
      "donate clothes",
      "save water",
      "save energy"
    ],
    grammar:
      "Can for offers: We can help. We can clean. We can visit.",
    listening: [
      "We can help old people.",
      "We can clean the park.",
      "We can recycle paper and plastic."
    ],
    reading:
      "Children can help in many ways. They can clean the park, recycle paper and plastic, " +
      "visit old people and help animals. Small actions can make a big difference.",
    writing:
      "Write 3 sentences about how you can help at home, at school, or in your town.",
    speaking:
      "Say 2–3 sentences: How can children help other people or the planet?"
  }
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

  const data = TOPIC_CONTENT[currentTopic] || {};

  if (currentSubsection === "vocabulary") {
    const vocabList = (data.vocabulary || [])
      .map((w) => `<li>${w}</li>`)
      .join("");
    box.innerHTML = `
      <h3>🧠 Vocabulary</h3>
      <p>Topic: <b>${TOPIC_TITLES[currentTopic]}</b></p>
      <ul>${vocabList}</ul>
      <p>Read and repeat the words. Then click the button when you finish.</p>
      <button class="btn" onclick="completeSimpleTask('vocabulary')">I finished vocabulary ✅</button>
    `;
  } else if (currentSubsection === "grammar") {
    box.innerHTML = `
      <h3>📘 Grammar</h3>
      <p><b>Rule:</b> ${data.grammar || "Grammar rule here."}</p>
      <p>Make 2–3 sentences using this grammar in your notebook.</p>
      <button class="btn" onclick="completeSimpleTask('grammar')">I practised grammar ✅</button>
    `;
  } else if (currentSubsection === "listening") {
    const listPhrases = (data.listening || [])
      .map((s) => `<li>${s}</li>`)
      .join("");
    box.innerHTML = `
      <h3>🎧 Listening</h3>
      <p>Listen to your teacher or audio files for these sentences (offline in class):</p>
      <ul>${listPhrases}</ul>
      <p>Then choose or say the correct sentence in class.</p>
      <button class="btn" onclick="completeSimpleTask('listening')">I did listening ✅</button>
    `;
  } else if (currentSubsection === "reading") {
    box.innerHTML = `
      <h3>📖 Reading</h3>
      <p><b>Text:</b></p>
      <p>${(data.reading || "").replace(/\n/g, "<br>")}</p>
      <p>Answer 1–2 questions orally with your teacher.</p>
      <button class="btn" onclick="completeSimpleTask('reading')">I read the text ✅</button>
    `;
  } else if (currentSubsection === "speaking") {
    box.innerHTML = `
      <h3>🗣️ Speaking</h3>
      <p>${data.speaking || "Say 2–3 sentences about this topic."}</p>
      <button class="btn" onclick="startSimpleSpeaking()">🎙️ Start speaking</button>
      <p id="speakingHeard"></p>
      <p id="speakingFeedback"></p>
    `;
  } else if (currentSubsection === "writing") {
    box.innerHTML = `
      <h3>✍️ Writing</h3>
      <p>${data.writing || "Write 2–3 sentences about this topic."}</p>
      <p>Type one simple sentence here (example check only):</p>
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
      (Now each button just gives you 1 star in the matching skill. Later you can add full tests here.)
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
