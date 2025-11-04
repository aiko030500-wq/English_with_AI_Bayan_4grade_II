// === Работа с журналом (общие функции) ===
function getJournal() {
  return JSON.parse(localStorage.getItem('teacherJournal')) || [];
}

function saveJournal(journal) {
  localStorage.setItem('teacherJournal', JSON.stringify(journal));
}

// Добавить ученика в журнал, если его ещё нет
function addStudentToJournal(name) {
  if (!name) return;
  let journal = getJournal();
  const exists = journal.some(s => s.name.toLowerCase() === name.toLowerCase());
  if (!exists) {
    journal.push({
      name: name,
      grammar: 0,
      vocabulary: 0,
      phonics: 0,
      reading: 0,
      listening: 0,
      writing: 0,
      speaking: 0,
      quiz: 0
    });
    saveJournal(journal);
  }
}

// === Логика входа ===
function checkPin() {
  const pinInput = document.getElementById("pin");
  const nameInput = document.getElementById("studentNameInput");
  const pin = (pinInput.value || "").trim();
  const name = (nameInput.value || "").trim();

  // Учительский PIN (имя не обязательно)
  if (pin === "9996") {
    localStorage.setItem("role", "teacher");
    window.location.href = "teacher.html";
    return;
  }

  // Ученический PIN
  if (pin === "8856") {
    if (!name) {
      alert("Введите имя ученика!");
      return;
    }
    localStorage.setItem("role", "student");
    localStorage.setItem("lastStudentName", name);

    // Добавляем ученика в общий журнал
    addStudentToJournal(name);

    // Скрываем оверлей
    const overlay = document.querySelector(".overlay");
    if (overlay) overlay.style.display = "none";

    const welcome = document.getElementById("welcomeText");
    if (welcome) {
      welcome.innerHTML = `<b>Hello, ${name}! I’m AI Bayan — let’s start learning 💙</b>`;
    }

    // Показываем панель звёзд
    const panel = document.getElementById("starsPanel");
    if (panel) panel.style.display = "block";

    // Отрисовать звёзды ученика
    renderStudentStars();
    return;
  }

  alert("❌ Wrong PIN");
}

// Переход к журналу по кнопке
function goToTeacher() {
  window.location.href = "teacher.html";
}

// === Звёзды ученика ===
function renderStudentStars() {
  const name = localStorage.getItem("lastStudentName");
  if (!name) return;
  let journal = getJournal();
  const student = journal.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (!student) return;

  const map = {
    grammar: "stars-grammar",
    vocabulary: "stars-vocabulary",
    phonics: "stars-phonics",
    reading: "stars-reading",
    listening: "stars-listening",
    writing: "stars-writing",
    speaking: "stars-speaking",
    quiz: "stars-quiz"
  };

  let total = 0;
  for (const key in map) {
    const val = student[key] || 0;
    const cell = document.getElementById(map[key]);
    if (cell) cell.textContent = val;
    total += val;
  }
  const totalCell = document.getElementById("stars-total");
  if (totalCell) totalCell.textContent = total;
}

// Изменение звёзд учеником (+1 / -1)
function changeStars(section, delta) {
  const name = localStorage.getItem("lastStudentName");
  if (!name) {
    alert("Сначала войдите как ученик.");
    return;
  }
  let journal = getJournal();
  const studentIndex = journal.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
  if (studentIndex === -1) return;

  const current = journal[studentIndex][section] || 0;
  let next = current + delta;
  if (next < 0) next = 0;
  journal[studentIndex][section] = next;
  saveJournal(journal);
  renderStudentStars();
}
