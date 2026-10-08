/* Reads the text layer of a dropped file. This is not a reasoning model.
   It fills blank fields from what the PDF actually says, then the rules engine runs. */
function moneyIn(text, label) {
  const re = new RegExp(label + "[^\d]{0,20}\\$?\\s*([\\d,]+(?:\\.\\d{1,2})?)", "i");
  const hit = text.match(re);
  return hit ? hit[1].replace(/,/g, "") : "";
}

function isoDate(text) {
  const mdy = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (mdy) return mdy[3] + "-" + mdy[1].padStart(2, "0") + "-" + mdy[2].padStart(2, "0");
  const iso = text.match(/(20\d{2}-\d{2}-\d{2})/);
  return iso ? iso[1] : "";
}

function fillBlank(id, value) {
  const el = document.getElementById(id);
  if (!el || !value || el.value) return;
  el.value = value;
}

function readDroppedFile(text) {
  if (!text) return;
  fillBlank("ticIncome", moneyIn(text, "annual income") || moneyIn(text, "TIC"));
  fillBlank("incomeLimit", moneyIn(text, "income limit"));
  fillBlank("tenantRent", moneyIn(text, "tenant rent") || moneyIn(text, "rent"));
  fillBlank("maxRent", moneyIn(text, "max rent") || moneyIn(text, "gross rent"));
  const lease = text.match(/lease[^\d]{0,24}(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})[^\d]{0,16}(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i);
  if (lease) {
    fillBlank("leaseStart", isoDate(lease[1]));
    fillBlank("leaseEnd", isoDate(lease[2]));
  }
  const oldVer = text.match(/pay stub[^\d]{0,24}(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i);
  if (oldVer) fillBlank("oldestVer", isoDate(oldVer[1]));
  if (/owner signature missing/i.test(text)) {
    const box = document.getElementById("ownerSigned");
    if (box) box.checked = false;
  }
  if (/full-time student/i.test(text)) fillBlank("ftStudents", "1");
  const note = document.getElementById("readNote");
  if (note) note.textContent = "Read the text layer. Blank fields were filled from that text. A scan with no text layer is not read.";
}

function showLimit() {
  if (document.getElementById("limitNote")) return;
  const host = document.querySelector("main");
  if (!host) return;
  const note = document.createElement("p");
  note.id = "limitNote";
  note.className = "hint";
  note.textContent = "This pass reads the file text and applies federal Tax Credit, HUD, HOME, RD, and Section 202 checks, plus the Idaho stacking order when Idaho is selected. It does not reason like a model. The other 49 states are named, and the state manual still controls where it is stricter. County limits are not looked up.";
  host.insertBefore(note, host.firstChild);
  const setup = document.getElementById("setup");
  if (setup && !document.getElementById("readNote")) {
    const line = document.createElement("p");
    line.id = "readNote";
    line.className = "hint";
    setup.appendChild(line);
  }
}

document.getElementById("reviewBtn").addEventListener("click", function () { readDroppedFile(extractedText); }, true);
showLimit();
