const translations = {
  it: {
    firstName: "Nome",
    lastName: "Cognome",
    taxCode: "Codice Fiscale",
    country: "Paese",
    province: "Provincia",
    street: "Via",
    streetNumber: "Numero civico",
    zip: "CAP",
    email: "Indirizzo e-mail (non PEC)",
    phone: "Numero di telefono",
    createPdf: "Crea PDF",
    or: "oppure",
    forwardEmail: "Invia via e-mail",
    pdfTitle: "Dati del modulo:",
    emailIntro: "Ecco i miei dati:",
    copied: "IBAN copiato!"
  },
  en: {
    firstName: "First Name",
    lastName: "Last Name",
    taxCode: "Tax Code (CF)",
    country: "Country",
    province: "Province",
    street: "Street",
    streetNumber: "Street Number",
    zip: "ZIP Code",
    email: "Email Address (not PEC)",
    phone: "Phone Number",
    createPdf: "Create PDF",
    or: "or",
    forwardEmail: "Forward via e-mail",
    pdfTitle: "Form Data:",
    emailIntro: "Here is my form data:",
    copied: "IBAN copied!"
  }
};

let currentLang = "it";

function t(key) {
  return translations[currentLang][key] || key;
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("#userForm input[name]").forEach((input) => {
    input.placeholder = t(input.name);
  });
  document.querySelectorAll("[data-lang]").forEach((el) => {
    el.hidden = el.dataset.lang !== lang;
  });
  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.setLang === lang);
  });

  try {
    localStorage.setItem("lang", lang);
  } catch (e) {}
}

function formatFormData(data) {
  let text = "";
  for (let [key, value] of data.entries()) {
    text += `${t(key)}: ${value}\n`;
  }
  return text;
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const form = document.getElementById("userForm");
  const data = new FormData(form);

  const content = t("pdfTitle") + "\n\n" + formatFormData(data);

  const lines = doc.splitTextToSize(content, doc.internal.pageSize.getWidth() - 20);
  doc.text(lines, 10, 10);
  doc.save("form_data.pdf");
}

function submitFormWithCheck() {
  const form = document.getElementById("userForm");
  if (!form.reportValidity()) return;
  generatePDF();
}

function forwardEmail() {
  const form = document.getElementById("userForm");
  if (!form.reportValidity()) return;
  const data = new FormData(form);

  const firstName = data.get("firstName") || "";
  const lastName = data.get("lastName") || "";

  const subject = `Form - ${firstName} ${lastName}`;

  const body = t("emailIntro") + "\n\n" + formatFormData(data);

  const mailtoLink =
    "mailto:savioale@msn.com"
    + "?subject=" + encodeURIComponent(subject)
    + "&body=" + encodeURIComponent(body);

  window.location.href = mailtoLink;

}

function copyIBAN() {
  const ibanText = "IT90Y0863164860065000000730";
  navigator.clipboard.writeText(ibanText).then(() => {
    const msg = document.getElementById("copy-msg");
    msg.textContent = t("copied");
    msg.style.opacity = 1;
    setTimeout(() => {
      msg.style.opacity = 0;
    }, 2000);
  });
}



function showConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 }
  });
}

let confettiShown = false;

document.addEventListener("DOMContentLoaded", () => {
  let savedLang = null;
  try {
    savedLang = localStorage.getItem("lang");
  } catch (e) {}
  const browserLang = (navigator.language || "").toLowerCase().startsWith("it") ? "it" : "en";
  setLanguage(savedLang || browserLang);

  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.setLang));
  });

  const form = document.getElementById("userForm");

  form.addEventListener("input", () => {
    if (!confettiShown && form.checkValidity()) {
      showConfetti();
      confettiShown = true;
    }
  });
});
