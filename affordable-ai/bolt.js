/* Bolt-on intake. Yardi, RealPage, AppFolio, MRI, and ResMan stay the system of record.
   A manager pastes the certification row or drops the file. No ledger is replaced. */
const E8823 = {
  income: "8823 line 11a — household income over the limit at move-in",
  aur: "8823 line 11b / 1.42-15 — Available Unit Rule",
  student: "8823 line 11f — household is full-time students with no exception",
  rent: "8823 line 11g — gross rent over the tax credit limit",
  file: "8823 line 11i — file does not support the certification"
};

function tag8823(finding) {
  const text = (finding.title + " " + finding.should).toLowerCase();
  let line = E8823.file;
  if (/student/.test(text)) line = E8823.student;
  else if (/140%|available unit/.test(text)) line = E8823.aur;
  else if (/rent/.test(text)) line = E8823.rent;
  else if (/income limit|over the limit/.test(text)) line = E8823.income;
  if (finding.program === "Tax Credit" || /tax credit|lihtc|student|rent/.test(text)) {
    finding.cite = finding.cite + "; " + line;
  }
  return finding;
}

if (typeof reviewFile === "function") {
  const baseReview = reviewFile;
  reviewFile = function (input) {
    const result = baseReview(input);
    result.findings = result.findings.map(tag8823);
    return result;
  };
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (!el || value == null || value === "") return;
  el.value = value;
}

function applyBolt(text) {
  const lines = text.split(/\n|\r/).map((line) => line.trim()).filter(Boolean);
  const bag = {};
  lines.forEach((line) => {
    const parts = line.split(/[:=\t]/);
    if (parts.length < 2) return;
    bag[parts[0].trim().toLowerCase()] = parts.slice(1).join(":").trim();
  });
  const pick = (names) => {
    for (const name of names) if (bag[name]) return bag[name];
    return "";
  };
  setVal("property", pick(["property", "property name", "community"]));
  setVal("unit", pick(["unit", "unit number", "bldg unit"]));
  setVal("head", pick(["head", "head of household", "resident", "tenant"]));
  setVal("effective", pick(["effective", "effective date", "cert date"]));
  setVal("priorCert", pick(["prior cert", "prior cert date", "last cert"]));
  setVal("incomeLimit", pick(["income limit", "ami limit", "max income"]).replace(/[$,]/g, ""));
  setVal("ticIncome", pick(["tic income", "50059 income", "certified income", "annual income"]).replace(/[$,]/g, ""));
  setVal("wageIncome", pick(["wages", "wage income", "employment income"]).replace(/[$,]/g, ""));
  setVal("otherIncome", pick(["other income"]).replace(/[$,]/g, ""));
  setVal("assets", pick(["assets", "net family assets", "cash value"]).replace(/[$,]/g, ""));
  setVal("assetIncome", pick(["asset income"]).replace(/[$,]/g, ""));
  setVal("tenantRent", pick(["tenant rent", "rent", "resident rent"]).replace(/[$,]/g, ""));
  setVal("ua", pick(["utility allowance", "ua"]).replace(/[$,]/g, ""));
  setVal("maxRent", pick(["max rent", "max program rent", "gross rent limit"]).replace(/[$,]/g, ""));
  setVal("leaseStart", pick(["lease start", "lease begin"]));
  setVal("leaseEnd", pick(["lease end", "lease expires"]));
  setVal("members", pick(["household members", "members", "hh size"]));
  const state = pick(["state"]);
  const stateSel = document.getElementById("state");
  if (stateSel && state) {
    const code = state.trim().toUpperCase();
    if ([...stateSel.options].some((opt) => opt.value === code)) stateSel.value = code;
  }
  const programs = pick(["programs", "program"]).toLowerCase();
  if (programs) {
    document.querySelectorAll("input[name=program]").forEach((box) => {
      box.checked = programs.indexOf(box.value) >= 0 || /tax credit|lihtc/.test(programs) && box.value === "lihtc" || /section 202|202/.test(programs) && box.value === "s202";
    });
    if (typeof renderDocs === "function") renderDocs();
  }
  const note = document.getElementById("boltNote");
  if (note) note.textContent = "Certification row loaded. Drop the file next. Yardi stays the system of record.";
}

function mountBolt() {
  const host = document.getElementById("setup");
  if (!host || document.getElementById("boltBox")) return;
  const box = document.createElement("div");
  box.id = "boltBox";
  box.innerHTML = "<h3>Bolt-on from Yardi or another system</h3><p class=\"hint\">Paste a certification row from Voyager, Breeze, RealPage, AppFolio, MRI, or ResMan. The ledger stays there. This desk reviews the file.</p><textarea id=\"boltPaste\" rows=\"5\" placeholder=\"Property: Clearwater Court\nUnit: 204\nState: ID\nPrograms: lihtc, home\nEffective: 2026-03-01\nTIC income: 10110\nIncome limit: 42000\nTenant rent: 890\nUA: 75\nMax rent: 900\"></textarea><p><button type=\"button\" class=\"text-btn\" id=\"boltApply\">Load this row</button> <a href=\"yardi.html\">Why this is the bolt-on</a></p><p class=\"hint\" id=\"boltNote\"></p>";
  host.appendChild(box);
  document.getElementById("boltApply").addEventListener("click", () => applyBolt(document.getElementById("boltPaste").value));
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountBolt);
else mountBolt();
