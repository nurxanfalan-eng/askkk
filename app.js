/* ===================================================
   LOVE INVITATION APP  –  app.js
   =================================================== */

/* ---------- Global State ---------- */
const state = {
  yesCount:      0,   // how many times YES was chosen (toggles)
  noCount:       0,   // how many times NO was chosen
  selectedDate:  null,
  selectedTime:  null,
  selectedAct:   null,
  calYear:       new Date().getFullYear(),
  calMonth:      new Date().getMonth()
};

/* ---------- Heart Particles ---------- */
(function spawnHearts() {
  const container = document.getElementById('heartsBg');
  const emojis = ['💕','💗','💖','💝','💞','🌸','✨'];
  for (let i = 0; i < 22; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.classList.add('heart-particle');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left     = `${Math.random() * 100}%`;
      el.style.fontSize = `${0.9 + Math.random() * 1.4}rem`;
      const dur = 7 + Math.random() * 10;
      el.style.animationDuration = `${dur}s`;
      el.style.animationDelay    = `${Math.random() * dur}s`;
      container.appendChild(el);
    }, i * 300);
  }
})();

/* ===================================================
   PAGE 1 – YES / NO logic
   =================================================== */
function handleNo() {
  state.noCount++;
  const yesBtn = document.getElementById('yesBtn');
  const noBtn  = document.getElementById('noBtn');
  const hint   = document.getElementById('hintText');

  if (state.noCount === 1) {
    /* First NO click → swap labels */
    noBtn.textContent  = 'Evet 💕';
    yesBtn.textContent = 'Hayır';
    hint.textContent   = 'Düşün bir daha... 🥺';
  }
}

function handleYes() {
  state.yesCount++;
  const yesBtn = document.getElementById('yesBtn');
  const noBtn  = document.getElementById('noBtn');
  const hint   = document.getElementById('hintText');

  if (state.noCount > 0) {
    /* YES after NO was swapped → both become EVET */
    yesBtn.textContent = 'Evet 💕';
    noBtn.textContent  = 'Evet 💕';
    hint.textContent   = 'Gördüm! İkisi də Evet! 🎉';

    /* After brief celebration, go to page 2 */
    setTimeout(goToPage2, 900);
  } else {
    /* Direct YES */
    hint.textContent = '🎊 Yay! Gəlin planlaşdıraq!';
    setTimeout(goToPage2, 700);
  }
}

/* ===================================================
   PAGE TRANSITIONS
   =================================================== */
function switchPage(fromId, toId) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);
  from.classList.add('fade-out');
  setTimeout(() => {
    from.classList.remove('active', 'fade-out');
    to.classList.add('active', 'fade-in');
    setTimeout(() => to.classList.remove('fade-in'), 600);
    window.scrollTo(0, 0);
  }, 340);
}

function goToPage2() {
  buildCalendar();
  switchPage('page1', 'page2');
}

function goToPage3() {
  if (!state.selectedDate) { shake('page2'); alert('Zəhmət olmasa tarix seçin 📅'); return; }
  if (!state.selectedTime) { shake('page2'); alert('Zəhmət olmasa vaxt seçin 🕐'); return; }
  switchPage('page2', 'page3');
}

function goToPage4() {
  if (!state.selectedAct) { shake('page3'); return; }
  fillPostcard();
  switchPage('page3', 'page4');
}

function shake(pageId) {
  const el = document.getElementById(pageId).querySelector('.page-inner');
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => el.style.animation = '', 500);
}

/* Inject shake keyframes once */
(function() {
  const s = document.createElement('style');
  s.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`;
  document.head.appendChild(s);
})();

/* ===================================================
   CALENDAR
   =================================================== */
const AZ_MONTHS = [
  'Yanvar','Fevral','Mart','Aprel','May','İyun',
  'İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr'
];

function buildCalendar() {
  const grid  = document.getElementById('calGrid');
  const label = document.getElementById('calMonthYear');
  const today = new Date();
  today.setHours(0,0,0,0);

  const year  = state.calYear;
  const month = state.calMonth;
  label.textContent = `${AZ_MONTHS[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  /* Sunday = 0 → shift so Monday first */
  const startOffset = (firstDay + 6) % 7;

  grid.innerHTML = '';

  /* Empty cells */
  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('button');
    empty.className = 'cal-day empty';
    empty.disabled = true;
    grid.appendChild(empty);
  }

  /* Day cells */
  for (let d = 1; d <= daysInMonth; d++) {
    const btn  = document.createElement('button');
    btn.className  = 'cal-day';
    btn.textContent = d;
    const thisDate = new Date(year, month, d);
    thisDate.setHours(0,0,0,0);

    if (thisDate < today) {
      btn.classList.add('past');
      btn.disabled = true;
    } else {
      if (
        state.selectedDate &&
        state.selectedDate.getDate()     === d &&
        state.selectedDate.getMonth()    === month &&
        state.selectedDate.getFullYear() === year
      ) {
        btn.classList.add('selected');
      }
      if (thisDate.getTime() === today.getTime()) btn.classList.add('today');
      btn.addEventListener('click', () => pickDate(new Date(year, month, d)));
    }
    grid.appendChild(btn);
  }
}

function pickDate(date) {
  state.selectedDate = date;
  document.getElementById('selectedDateText').textContent =
    `Seçildi: ${date.getDate()} ${AZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  buildCalendar(); // re-render to highlight
}

document.getElementById('prevMonth').addEventListener('click', () => {
  state.calMonth--;
  if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
  buildCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  state.calMonth++;
  if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  buildCalendar();
});

/* ===================================================
   TIME SELECTION
   =================================================== */
const TIME_LABELS = {
  sabah:   '🌅 Sabah',
  gunorta: '☀️ Öğleden Sonra',
  axsam:   '🌆 Akşam',
  gece:    '🌙 Gece'
};

function selectTime(btn) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.selectedTime = btn.dataset.time;
}

/* ===================================================
   ACTIVITY SELECTION
   =================================================== */
function selectActivity(btn) {
  document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.selectedAct = btn.dataset.act;
  document.getElementById('nextToCard').style.display = 'inline-flex';
}

/* ===================================================
   POSTCARD
   =================================================== */
function fillPostcard() {
  const d   = state.selectedDate;
  const fmt = `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  document.getElementById('pcDate').textContent = fmt;
  document.getElementById('pcTime').textContent = TIME_LABELS[state.selectedTime] || state.selectedTime;
  document.getElementById('pcAct').textContent  = state.selectedAct;
}

/* ===================================================
   WHATSAPP SEND
   =================================================== */
function sendToWhatsApp() {
  const d    = state.selectedDate;
  const fmt  = `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const time = TIME_LABELS[state.selectedTime] || state.selectedTime;
  const act  = state.selectedAct;

  /* Compose a rich text message that mirrors the postcard */
  const msg =
`💌✨ *Bu Bir Davet* ✨💌

Selam, Fıstık! 🌸
Seninle görüşmek istiyorum...

📅 *Tarix:* ${fmt}
🕐 *Vaxt:* ${time}
🍽️ *Fəaliyyət:* ${act}

Seni Çok Seviyorum! 💖
Senin için Özel...

💗 💗 💗`;

  const phone   = '994503999134';
  const encoded = encodeURIComponent(msg);
  const url     = `https://wa.me/${phone}?text=${encoded}`;

  /* Open WhatsApp directly – most reliable cross-platform method */
  window.open(url, '_blank');

  /* Show confirmation page */
  setTimeout(() => switchPage('page4', 'page5'), 600);
}

/* ===================================================
   RESET
   =================================================== */
function resetAll() {
  /* Reset state */
  state.yesCount     = 0;
  state.noCount      = 0;
  state.selectedDate = null;
  state.selectedTime = null;
  state.selectedAct  = null;
  state.calYear      = new Date().getFullYear();
  state.calMonth     = new Date().getMonth();

  /* Reset UI */
  document.getElementById('yesBtn').textContent = 'Evet 💕';
  document.getElementById('noBtn').textContent  = 'Hayır';
  document.getElementById('hintText').textContent = '';
  document.getElementById('selectedDateText').textContent = 'Tarix seçilməyib';
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('nextToCard').style.display = 'none';

  switchPage('page5', 'page1');
}
