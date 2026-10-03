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
    pdfTitle: "Dati per la fatturazione",
    emailIntro: "Ecco i miei dati:",
    copied: "IBAN copiato!",
    copyFailed: "Copia non riuscita, seleziona l'IBAN a mano",
    title: "Dati per la fatturazione",
    subtitle: "Compila tutti i campi, poi crea il PDF o invialo via e-mail.",
    sectionPersonal: "Dati personali",
    sectionAddress: "Indirizzo",
    sectionContacts: "Contatti",
    tapToCopy: "Tocca per copiare",
    bank: "Banca",
    beneficiary: "Beneficiario"
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
    pdfTitle: "Billing details",
    emailIntro: "Here is my form data:",
    copied: "IBAN copied!",
    copyFailed: "Copy failed, please select the IBAN manually",
    title: "Billing details",
    subtitle: "Fill in all fields, then create the PDF or send it by e-mail.",
    sectionPersonal: "Personal details",
    sectionAddress: "Address",
    sectionContacts: "Contacts",
    tapToCopy: "Tap to copy",
    bank: "Bank",
    beneficiary: "Beneficiary"
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
  document.title = "Esibirsi – " + t("title");
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

  const margin = 20;
  const width = doc.internal.pageSize.getWidth() - margin * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(t("pdfTitle"), margin, 25);

  let y = 40;
  for (let [key, value] of data.entries()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(t(key).toUpperCase(), margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(String(value), width);
    if (y + 6 + lines.length * 6 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y + 6);
    y += 6 + lines.length * 6 + 6;
  }

  const lastName = (data.get("lastName") || "").trim().replace(/\s+/g, "_");
  doc.save(lastName ? `form_${lastName}.pdf` : "form_data.pdf");
}

function validateForm(form) {
  form.querySelectorAll("input").forEach((input) => input.classList.add("touched"));
  if (form.checkValidity()) return true;

  const firstInvalid = form.querySelector("input:invalid");
  firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
  firstInvalid.focus({ preventScroll: true });
  form.reportValidity();
  return false;
}

function submitFormWithCheck() {
  const form = document.getElementById("userForm");
  if (!validateForm(form)) return;
  generatePDF();
}

function forwardEmail() {
  const form = document.getElementById("userForm");
  if (!validateForm(form)) return;
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

let toastTimer;

function showToast(text) {
  const msg = document.getElementById("copy-msg");
  msg.textContent = text;
  msg.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => msg.classList.remove("show"), 2000);
}

// Fallback per browser senza Clipboard API (es. pagina aperta senza HTTPS)
function legacyCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (e) {}
  document.body.removeChild(area);
  return ok;
}

function copyIBAN() {
  const ibanText = "IT90Y0863164860065000000730";
  const done = (ok) => showToast(t(ok ? "copied" : "copyFailed"));

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(ibanText)
      .then(() => done(true))
      .catch(() => done(legacyCopy(ibanText)));
  } else {
    done(legacyCopy(ibanText));
  }
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

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () => input.classList.add("touched"));
  });

  const taxCode = form.querySelector('input[name="taxCode"]');
  taxCode.addEventListener("blur", () => {
    taxCode.value = taxCode.value.toUpperCase().trim();
  });

  form.addEventListener("input", () => {
    if (!confettiShown && form.checkValidity()) {
      showConfetti();
      confettiShown = true;
    }
  });
});
