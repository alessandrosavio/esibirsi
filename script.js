function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const form = document.getElementById("userForm");
  const data = new FormData(form);

  let content = "Form Data:\n\n";
  for (let [key, value] of data.entries()) {
    content += `${key}: ${value}\n`;
  }

  doc.text(content, 10, 10);
  doc.save("form_data.pdf");
}

function forwardEmail() {
  const form = document.getElementById("userForm");
  const data = new FormData(form);

  const firstName = data.get("firstName") || "";
  const lastName = data.get("lastName") || "";

  const subject = `Form - ${firstName} ${lastName}`;

  let body = "Here is my form data:\n\n";
  for (let [key, value] of data.entries()) {
    body += `${key}: ${value}\n`;
  }

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
  const form = document.getElementById("userForm");
  const phoneInput = form.querySelector('input[name="phone"]');

  phoneInput.addEventListener("input", () => {
    if (!confettiShown && form.checkValidity()) {
      showConfetti();
      confettiShown = true;
    }
  });
});
