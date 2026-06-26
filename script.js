/* =========================================================
   Deutsch Lernen — script.js

   This ONE file is loaded on every page. Each section below
   checks "does this page have the element I need?" before it
   runs, so the same file safely powers Home, Courses, Booking,
   Confirmation, About, and Contact without errors.
   ========================================================= */

/* ---------------------------------------------------------
   0. SHARED COURSE DATA
   One array used by both the Courses page (to build the table)
   and the Booking page (to fill the dropdown + auto-fill price).
   In a real school this would come from a server/database —
   here we keep it simple with a plain JavaScript array, which
   is exactly how the HTML5/CSS3 fundamentals project expects
   data to be "hard-coded" inside the page.
--------------------------------------------------------- */
const COURSES = [
  {
    id: "c1",
    name: "German Beginner Course",
    level: "A1",
    teacher: "Anna Müller",
    initials: "AM",
    avatarClass: "avatar-1",
    schedule: "Mon, Wed, Fri · 09:00 - 11:00",
    duration: "4 Weeks",
    price: 120,
    seatsLeft: 8,
    seatsTotal: 15
  },
  {
    id: "c2",
    name: "Elementary German Course",
    level: "A2",
    teacher: "Mark Schneider",
    initials: "MS",
    avatarClass: "avatar-2",
    schedule: "Tue, Thu · 13:00 - 15:00",
    duration: "4 Weeks",
    price: 120,
    seatsLeft: 6,
    seatsTotal: 15
  },
  {
    id: "c3",
    name: "Intermediate German Course",
    level: "B1",
    teacher: "Laura Weber",
    initials: "LW",
    avatarClass: "avatar-3",
    schedule: "Mon, Wed, Fri · 18:00 - 20:00",
    duration: "6 Weeks",
    price: 150,
    seatsLeft: 10,
    seatsTotal: 15
  },
  {
    id: "c4",
    name: "Upper Intermediate Course",
    level: "B2",
    teacher: "Felix Becker",
    initials: "FB",
    avatarClass: "avatar-4",
    schedule: "Tue, Thu · 18:00 - 20:00",
    duration: "6 Weeks",
    price: 150,
    seatsLeft: 7,
    seatsTotal: 15
  },
  {
    id: "c5",
    name: "Advanced German Course",
    level: "C1",
    teacher: "Sophie Hoffmann",
    initials: "SH",
    avatarClass: "avatar-5",
    schedule: "Sat · 10:00 - 13:00",
    duration: "8 Weeks",
    price: 200,
    seatsLeft: 5,
    seatsTotal: 15
  }
];

/* Run everything once the HTML has finished loading */
document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupCoursesPage();
  setupBookingPage();
  setupConfirmationPage();
  setupContactForm();
});

/* ---------------------------------------------------------
   1. MOBILE NAV TOGGLE (hamburger button)
--------------------------------------------------------- */
function setupMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });
}

/* ---------------------------------------------------------
   2. COURSES PAGE — build the table + filter buttons
--------------------------------------------------------- */
function setupCoursesPage() {
  const tbody = document.getElementById("coursesTableBody");
  if (!tbody) return; // we are not on courses.html, stop here

  function renderRows(levelFilter) {
    const rows = COURSES.filter(
      (c) => levelFilter === "all" || c.level === levelFilter
    );

    tbody.innerHTML = rows
      .map((c) => {
        const seatsClass = c.seatsLeft <= 6 ? "seats-low" : "seats-ok";
        return `
          <tr>
            <td>${c.name}</td>
            <td><span class="badge badge-${c.level}">${c.level}</span></td>
            <td>
              <div class="teacher-cell">
                <span class="avatar ${c.avatarClass}">${c.initials}</span>
                ${c.teacher}
              </div>
            </td>
            <td>${c.schedule}</td>
            <td>${c.duration}</td>
            <td>$${c.price}</td>
            <td class="${seatsClass}">${c.seatsLeft} / ${c.seatsTotal}</td>
            <td><a class="btn btn-primary btn-sm" href="booking.html?course=${c.id}">Book Now</a></td>
          </tr>
        `;
      })
      .join("");

    const emptyState = document.getElementById("coursesEmptyState");
    if (emptyState) {
      emptyState.style.display = rows.length === 0 ? "block" : "none";
    }
  }

  // Wire up the filter buttons (All Levels / A1 / A2 / B1 / B2 / C1)
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderRows(btn.dataset.level);
    });
  });

  renderRows("all"); // initial render shows every course
}

/* ---------------------------------------------------------
   3. BOOKING PAGE — fill dropdown, validate, "submit"
--------------------------------------------------------- */
function setupBookingPage() {
  const form = document.getElementById("bookingForm");
  if (!form) return; // not on booking.html

  const courseSelect = document.getElementById("courseSelect");
  const levelSelect = document.getElementById("levelSelect");
  const scheduleSelect = document.getElementById("scheduleSelect");

  // 3a. Fill the "Course" dropdown from our COURSES array
  courseSelect.innerHTML =
    '<option value="">Select course</option>' +
    COURSES.map(
      (c) => `<option value="${c.id}">${c.name} (${c.level})</option>`
    ).join("");

  // 3b. When a course is chosen, auto-fill level + schedule for the user
  function applyCourse(courseId) {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return;
    courseSelect.value = course.id;
    levelSelect.innerHTML = `<option value="${course.level}">${course.level}</option>`;
    scheduleSelect.innerHTML = `<option value="${course.schedule}">${course.schedule}</option>`;
  }

  courseSelect.addEventListener("change", (e) => applyCourse(e.target.value));

  // 3c. If the user arrived from "Book Now" on courses.html, the course
  // id is in the URL like booking.html?course=c1 — read it and pre-fill.
  const params = new URLSearchParams(window.location.search);
  const preselected = params.get("course");
  if (preselected) applyCourse(preselected);

  // 3d. Basic client-side validation helpers
  function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + "Error");
    const fieldWrap = document.getElementById(fieldId)?.closest(".form-field");
    if (errorEl) errorEl.textContent = message;
    if (fieldWrap) fieldWrap.classList.toggle("field-invalid", Boolean(message));
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    let valid = true;

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const course = courseSelect.value;
    const level = levelSelect.value;
    const schedule = scheduleSelect.value;
    const message = document.getElementById("message").value.trim();

    if (!fullName) { showError("fullName", "Please enter your full name."); valid = false; }
    else showError("fullName", "");

    if (!email || !isValidEmail(email)) { showError("email", "Please enter a valid email address."); valid = false; }
    else showError("email", "");

    if (!phone || phone.length < 6) { showError("phone", "Please enter a valid phone number."); valid = false; }
    else showError("phone", "");

    if (!course) { showError("courseSelect", "Please choose a course."); valid = false; }
    else showError("courseSelect", "");

    if (!valid) return;

    const chosenCourse = COURSES.find((c) => c.id === course);

    // Build a query string and redirect to the confirmation page.
    // (No backend/database is used in this fundamentals project,
    // so we simply pass the booking details through the URL.)
    const query = new URLSearchParams({
      name: fullName,
      email: email,
      phone: phone,
      course: chosenCourse.name,
      level: level,
      schedule: schedule,
      price: chosenCourse.price,
      message: message
    });

    window.location.href = "confirmation.html?" + query.toString();
  });
}

/* ---------------------------------------------------------
   4. CONFIRMATION PAGE — read the URL and show a summary
--------------------------------------------------------- */
function setupConfirmationPage() {
  const summary = document.getElementById("confirmSummary");
  if (!summary) return; // not on confirmation.html

  const params = new URLSearchParams(window.location.search);

  // If someone opens confirmation.html directly (no booking data),
  // send them back to the booking page instead of showing blanks.
  if (!params.get("name")) {
    window.location.href = "booking.html";
    return;
  }

  document.getElementById("confirmName").textContent = params.get("name");

  const rows = [
    ["Course", params.get("course")],
    ["Level", params.get("level")],
    ["Schedule", params.get("schedule")],
    ["Email", params.get("email")],
    ["Phone", params.get("phone")],
    ["Price", "$" + params.get("price")]
  ];

  summary.innerHTML = rows
    .map(
      ([label, value]) =>
        `<div class="confirm-row"><span>${label}</span><span>${value}</span></div>`
    )
    .join("");

  // Generate a simple, friendly-looking booking reference number
  const ref = "DL-" + Math.floor(100000 + Math.random() * 900000);
  document.getElementById("confirmRef").textContent = "Booking Reference: " + ref;
}

/* ---------------------------------------------------------
   5. CONTACT PAGE — fake "send message" feedback
   (No backend in this fundamentals project, so we just show
   a friendly confirmation message instead of actually emailing.)
--------------------------------------------------------- */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = document.getElementById("contactStatus");
    status.textContent = "Thanks! Your message has been sent — we'll reply within 1-2 business days.";
    status.style.display = "block";
    form.reset();
  });
}
