const meetings = [
  {
    id: "M001",
    title: "Hop kickoff du an CRM",
    room: "Phong Lotus - Tang 3",
    time: "09:00 - 10:30, 09/07/2026",
    status: "upcoming",
    owner: "Le Tan Kiet",
    accepted: 8,
    declined: 1,
    pending: 2,
  },
  {
    id: "M002",
    title: "Cap nhat sprint backend",
    room: "Phong Strategy - Online",
    time: "14:00 - 15:00, 08/07/2026",
    status: "running",
    owner: "Le Tan Kiet",
    accepted: 5,
    declined: 0,
    pending: 1,
  },
  {
    id: "M003",
    title: "Tong ket thang 6",
    room: "Phong Orchid - Tang 4",
    time: "15:30 - 17:00, 28/06/2026",
    status: "ended",
    owner: "Le Tan Kiet",
    accepted: 12,
    declined: 2,
    pending: 0,
  },
  {
    id: "M004",
    title: "Review thiet ke giao dien",
    room: "Phong Sunflower - Tang 5",
    time: "10:00 - 11:00, 12/07/2026",
    status: "upcoming",
    owner: "Le Tan Kiet",
    accepted: 4,
    declined: 0,
    pending: 4,
  },
  {
    id: "M005",
    title: "Dao tao quy trinh van hanh",
    room: "Phong Lotus - Tang 3",
    time: "08:00 - 09:30, 05/07/2026",
    status: "cancelled",
    owner: "Le Tan Kiet",
    accepted: 0,
    declined: 0,
    pending: 0,
  },
];

const statusLabels = {
  upcoming: "Sap dien ra",
  running: "Dang dien ra",
  ended: "Da ket thuc",
  cancelled: "Da huy",
};

let currentPage = 1;
const pageSize = 10;

const tableBody = document.querySelector("#meetingTable");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const pageInfo = document.querySelector("#pageInfo");
const detailDialog = document.querySelector("#detailDialog");
const dialogBody = document.querySelector("#dialogBody");
const dialogTitle = document.querySelector("#dialogTitle");
const form = document.querySelector("#meetingForm");
const formMessage = document.querySelector("#formMessage");
const authTabs = document.querySelectorAll(".auth-tab");
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const loginMessage = document.querySelector("#loginMessage");
const registerMessage = document.querySelector("#registerMessage");
const appShell = document.querySelector("#appShell");
const userName = document.querySelector("#userName");
const userAvatar = document.querySelector("#userAvatar");
const logoutBtn = document.querySelector("#logoutBtn");
const participantInput = document.querySelector("#participantInput");
const addParticipantBtn = document.querySelector("#addParticipantBtn");
const participantList = document.querySelector("#participantList");
const participantHelp = document.querySelector("#participantHelp");
const participants = [];
const maxParticipants = 5;
const userStorageKey = "meetingHubUsers";
const currentUserStorageKey = "meetingHubCurrentUser";

const defaultUsers = [
  {
    name: "Le Tan Kiet",
    email: "employee@company.com",
    password: "123456",
    department: "Phong Ky thuat",
  },
];
const users = loadUsers();

function setMessage(element, text, type) {
  element.className = `form-message ${type}`;
  element.textContent = text;
}

function loadUsers() {
  try {
    const savedUsers = JSON.parse(localStorage.getItem(userStorageKey));
    if (Array.isArray(savedUsers) && savedUsers.length) {
      return savedUsers;
    }
  } catch (error) {
    localStorage.removeItem(userStorageKey);
  }

  localStorage.setItem(userStorageKey, JSON.stringify(defaultUsers));
  return [...defaultUsers];
}

function saveUsers() {
  localStorage.setItem(userStorageKey, JSON.stringify(users));
}

function saveCurrentUser(user) {
  localStorage.setItem(currentUserStorageKey, user.email);
}

function restoreCurrentUser() {
  const savedEmail = localStorage.getItem(currentUserStorageKey);
  if (!savedEmail) return;

  const user = users.find((item) => item.email.toLowerCase() === savedEmail.toLowerCase());
  if (user) {
    showApp(user);
    return;
  }

  localStorage.removeItem(currentUserStorageKey);
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function showApp(user) {
  document.body.classList.remove("auth-mode");
  appShell.setAttribute("aria-hidden", "false");
  userName.textContent = user.name;
  userAvatar.textContent = getInitials(user.name);
}

function showAuth() {
  document.body.classList.add("auth-mode");
  appShell.setAttribute("aria-hidden", "true");
  localStorage.removeItem(currentUserStorageKey);
  loginForm.reset();
  loginMessage.textContent = "";
  loginMessage.className = "form-message";
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    authTabs.forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".auth-form").forEach((authForm) => authForm.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.authView}`).classList.add("active");
    loginMessage.textContent = "";
    registerMessage.textContent = "";
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = data.get("email").trim().toLowerCase();
  const password = data.get("password");
  const user = users.find((item) => item.email.toLowerCase() === email && item.password === password);

  if (!user) {
    setMessage(loginMessage, "Email hoac mat khau khong dung.", "error");
    return;
  }

  setMessage(loginMessage, "Dang nhap thanh cong.", "success");
  saveCurrentUser(user);
  showApp(user);
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(registerForm);
  const name = data.get("name").trim();
  const email = data.get("email").trim().toLowerCase();
  const department = data.get("department");
  const password = data.get("password");
  const confirmPassword = data.get("confirmPassword");

  if (users.some((user) => user.email.toLowerCase() === email)) {
    setMessage(registerMessage, "Email nay da duoc dang ky.", "error");
    return;
  }

  if (password !== confirmPassword) {
    setMessage(registerMessage, "Mat khau xac nhan khong khop.", "error");
    return;
  }

  const newUser = { name, email, password, department };
  users.push(newUser);
  saveUsers();
  registerForm.reset();
  setMessage(registerMessage, "Tao tai khoan thanh cong. Tai khoan da duoc luu.", "success");

  authTabs.forEach((item) => item.classList.toggle("active", item.dataset.authView === "loginForm"));
  document.querySelectorAll(".auth-form").forEach((authForm) => {
    authForm.classList.toggle("active", authForm.id === "loginForm");
  });
  loginForm.email.value = email;
});

logoutBtn.addEventListener("click", showAuth);

function renderParticipants() {
  participantList.innerHTML = participants
    .map(
      (name, index) => `
        <span class="participant-chip">
          <span>${escapeHtml(name)}</span>
          <button class="remove-participant" type="button" data-index="${index}" title="Xoa ${escapeHtml(name)}">x</button>
        </span>
      `
    )
    .join("");

  participantHelp.textContent = `Da them ${participants.length}/${maxParticipants} nguoi tham gia.`;
  addParticipantBtn.disabled = participants.length >= maxParticipants;
  participantInput.disabled = participants.length >= maxParticipants;
  participantInput.placeholder =
    participants.length >= maxParticipants ? "Da dat toi da 5 nguoi" : "Nhap ten nguoi tham gia";
}

function addParticipant() {
  const name = participantInput.value.trim().replace(/\s+/g, " ");
  formMessage.className = "form-message";
  formMessage.textContent = "";

  if (!name) {
    formMessage.textContent = "Vui long nhap ten nguoi tham gia.";
    formMessage.classList.add("error");
    return;
  }

  if (participants.length >= maxParticipants) {
    formMessage.textContent = "Chi duoc them toi da 5 nguoi tham gia.";
    formMessage.classList.add("error");
    return;
  }

  if (participants.some((participant) => participant.toLowerCase() === name.toLowerCase())) {
    formMessage.textContent = "Nguoi tham gia nay da co trong danh sach.";
    formMessage.classList.add("error");
    return;
  }

  participants.push(name);
  participantInput.value = "";
  renderParticipants();
  participantInput.focus();
}

addParticipantBtn.addEventListener("click", addParticipant);

participantInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addParticipant();
  }
});

participantList.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-participant");
  if (!button) return;

  participants.splice(Number(button.dataset.index), 1);
  renderParticipants();
  participantInput.focus();
});

form.addEventListener("reset", () => {
  participants.length = 0;
  renderParticipants();
  formMessage.textContent = "";
  formMessage.className = "form-message";
});

function getFilteredMeetings() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  return meetings.filter((meeting) => {
    const matchesQuery =
      meeting.title.toLowerCase().includes(query) ||
      meeting.room.toLowerCase().includes(query);
    const matchesStatus = status === "all" || meeting.status === status;
    return matchesQuery && matchesStatus;
  });
}

function renderMeetings() {
  const filtered = getFilteredMeetings();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  tableBody.innerHTML = visible
    .map((meeting) => {
      const canEdit = meeting.status === "upcoming" || meeting.status === "running";
      return `
        <tr>
          <td>
            <div class="meeting-title">
              <strong>${meeting.title}</strong>
              <span>${meeting.id} · ${meeting.owner}</span>
            </div>
          </td>
          <td>${meeting.room}</td>
          <td>${meeting.time}</td>
          <td><span class="badge ${meeting.status}">${statusLabels[meeting.status]}</span></td>
          <td>
            <span class="response-pill">
              <span>${meeting.accepted} dong y · ${meeting.declined} tu choi</span>
              <span>${meeting.pending} chua phan hoi</span>
            </span>
          </td>
          <td class="row-actions">
            <button class="small-button" type="button" data-action="detail" data-id="${meeting.id}">Chi tiet</button>
            <button class="small-button" type="button" data-action="edit" data-id="${meeting.id}" ${canEdit ? "" : "disabled"}>Sua</button>
            <button class="danger-action" type="button" data-action="cancel" data-id="${meeting.id}" ${meeting.status === "cancelled" ? "disabled" : ""}>Huy</button>
          </td>
        </tr>
      `;
    })
    .join("");

  if (!visible.length) {
    tableBody.innerHTML = `<tr><td colspan="6">Khong co cuoc hop phu hop.</td></tr>`;
  }

  pageInfo.textContent = `Trang ${currentPage}/${totalPages}`;
  document.querySelector("#prevPage").disabled = currentPage === 1;
  document.querySelector("#nextPage").disabled = currentPage === totalPages;
}

function showDetail(meeting) {
  dialogTitle.textContent = meeting.title;
  dialogBody.innerHTML = `
    <div class="dialog-row"><strong>Ma lich</strong><span>${meeting.id}</span></div>
    <div class="dialog-row"><strong>Phong hop</strong><span>${meeting.room}</span></div>
    <div class="dialog-row"><strong>Thoi gian</strong><span>${meeting.time}</span></div>
    <div class="dialog-row"><strong>Trang thai</strong><span>${statusLabels[meeting.status]}</span></div>
    <div class="dialog-row"><strong>Phan hoi</strong><span>${meeting.accepted} dong y, ${meeting.declined} tu choi, ${meeting.pending} chua phan hoi</span></div>
  `;
  detailDialog.showModal();
}

const viewTitles = {
  manageView: "Quan ly cuoc hop",
  createView: "Tao lich hop",
  scheduleView: "Lich trinh cuoc hop",
};

const scheduleGrid = document.querySelector("#scheduleGrid");
const scheduleRange = document.querySelector("#scheduleRange");
const weekdayLabels = ["Thu 2", "Thu 3", "Thu 4", "Thu 5", "Thu 6", "Thu 7", "Chu nhat"];

let scheduleWeekStart = getWeekStart(new Date());

function pad(value) {
  return String(value).padStart(2, "0");
}

function getWeekStart(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDateShort(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

function formatDateFull(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function parseMeetingSchedule(meeting) {
  const match = meeting.time.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2}),\s*(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;

  const [, startHour, startMinute, endHour, endMinute, day, month, year] = match.map(Number);
  const start = new Date(year, month - 1, day, startHour, startMinute);
  const end = new Date(year, month - 1, day, endHour, endMinute);

  return { start, end, dateKey: `${year}-${pad(month)}-${pad(day)}` };
}

function renderSchedule() {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(scheduleWeekStart);
    date.setDate(date.getDate() + index);
    return date;
  });

  scheduleRange.textContent = `${formatDateShort(days[0])} - ${formatDateFull(days[6])}`;

  const todayKey = formatDateKey(new Date());

  scheduleGrid.innerHTML = days
    .map((day, index) => {
      const dateKey = formatDateKey(day);
      const dayMeetings = meetings
        .map((meeting) => ({ meeting, schedule: parseMeetingSchedule(meeting) }))
        .filter((item) => item.schedule && item.schedule.dateKey === dateKey)
        .sort((a, b) => a.schedule.start - b.schedule.start);

      const eventsHtml = dayMeetings.length
        ? dayMeetings
            .map(({ meeting, schedule }) => {
              const timeLabel = `${pad(schedule.start.getHours())}:${pad(schedule.start.getMinutes())} - ${pad(schedule.end.getHours())}:${pad(schedule.end.getMinutes())}`;
              return `
                <button class="schedule-event ${meeting.status}" type="button" data-id="${meeting.id}" title="${escapeHtml(meeting.title)}">
                  <span class="schedule-event-time">${timeLabel}</span>
                  <span class="schedule-event-title">${escapeHtml(meeting.title)}</span>
                  <span class="schedule-event-room">${escapeHtml(meeting.room)}</span>
                </button>
              `;
            })
            .join("")
        : `<p class="schedule-empty">Khong co lich</p>`;

      return `
        <div class="schedule-day ${dateKey === todayKey ? "is-today" : ""}">
          <div class="schedule-day-head">
            <span>${weekdayLabels[index]}</span>
            <strong>${formatDateShort(day)}</strong>
          </div>
          <div class="schedule-day-body">${eventsHtml}</div>
        </div>
      `;
    })
    .join("");
}

scheduleGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".schedule-event");
  if (!button) return;

  const meeting = meetings.find((item) => item.id === button.dataset.id);
  if (meeting) showDetail(meeting);
});

document.querySelector("#prevWeekBtn").addEventListener("click", () => {
  scheduleWeekStart.setDate(scheduleWeekStart.getDate() - 7);
  renderSchedule();
});

document.querySelector("#nextWeekBtn").addEventListener("click", () => {
  scheduleWeekStart.setDate(scheduleWeekStart.getDate() + 7);
  renderSchedule();
});

document.querySelector("#todayWeekBtn").addEventListener("click", () => {
  scheduleWeekStart = getWeekStart(new Date());
  renderSchedule();
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}`).classList.add("active");
    document.querySelector("#pageTitle").textContent = viewTitles[button.dataset.view] || "";

    if (button.dataset.view === "scheduleView") {
      renderSchedule();
    }
  });
});

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const meeting = meetings.find((item) => item.id === button.dataset.id);
  if (!meeting) return;

  if (button.dataset.action === "detail") {
    showDetail(meeting);
    return;
  }

  if (button.dataset.action === "edit") {
    alert(`Mo chinh sua: ${meeting.title}`);
    return;
  }

  if (button.dataset.action === "cancel" && confirm("Ban co chac muon huy cuoc hop nay?")) {
    meeting.status = "cancelled";
    renderMeetings();
    renderSchedule();
  }
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderMeetings();
});

statusFilter.addEventListener("change", () => {
  currentPage = 1;
  renderMeetings();
});

document.querySelector("#refreshBtn").addEventListener("click", () => {
  renderMeetings();
  renderSchedule();
});
document.querySelector("#exportBtn").addEventListener("click", () => {
  alert("Da tao tep xuat danh sach theo bo loc hien tai.");
});
document.querySelector("#prevPage").addEventListener("click", () => {
  currentPage -= 1;
  renderMeetings();
});
document.querySelector("#nextPage").addEventListener("click", () => {
  currentPage += 1;
  renderMeetings();
});
document.querySelector("#closeDialog").addEventListener("click", () => detailDialog.close());

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const date = data.get("date");
  const start = data.get("start");
  const end = data.get("end");
  const attachment = data.get("attachment");
  const selectedDate = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  formMessage.className = "form-message";

  if (selectedDate < today) {
    formMessage.textContent = "Ngay hop khong duoc nam trong qua khu.";
    formMessage.classList.add("error");
    return;
  }

  if (start >= end) {
    formMessage.textContent = "Thoi gian bat dau phai nho hon thoi gian ket thuc.";
    formMessage.classList.add("error");
    return;
  }

  if (attachment && attachment.size > 20 * 1024 * 1024) {
    formMessage.textContent = "Tep dinh kem vuot qua 20 MB.";
    formMessage.classList.add("error");
    return;
  }

  if (!participants.length) {
    formMessage.textContent = "Vui long them it nhat 1 nguoi tham gia.";
    formMessage.classList.add("error");
    participantInput.focus();
    return;
  }

  meetings.unshift({
    id: `M${String(meetings.length + 1).padStart(3, "0")}`,
    title: data.get("title"),
    room: data.get("room"),
    time: `${start} - ${end}, ${date.split("-").reverse().join("/")}`,
    status: "upcoming",
    owner: "Le Tan Kiet",
    accepted: 0,
    declined: 0,
    pending: participants.length,
  });

  form.reset();
  participants.length = 0;
  renderParticipants();
  formMessage.textContent = "Da tao lich hop thanh cong.";
  formMessage.classList.add("success");
  renderMeetings();
  renderSchedule();
});

renderParticipants();
renderMeetings();
renderSchedule();
restoreCurrentUser();
