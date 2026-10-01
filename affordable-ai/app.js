const $ = (id) => document.getElementById(id);
let extractedText = "";
let fileNames = [];

function selectedPrograms() {
  return [...document.querySelectorAll("input[name=program]:checked")].map((el) => el.value);
}

function readInput() {
  return {
    property: $("property").value.trim(),
    unit: $("unit").value.trim(),
    head: $("head").value.trim(),
    manager: $("manager").value.trim(),
    state: $("state").value,
    certType: $("certType").value,
    effective: $("effective").value,
    priorCert: $("priorCert").value,
    programs: selectedPrograms(),
    incomeLimit: $("incomeLimit").value,
    ticIncome: $("ticIncome").value,
    wageIncome: $("wageIncome").value,
    otherIncome: $("otherIncome").value,
    assets: $("assets").value,
    assetIncome: $("assetIncome").value,
    tenantRent: $("tenantRent").value,
    ua: $("ua").value,
    maxRent: $("maxRent").value,
    stubCount: $("stubCount").value,
    oldestVer: $("oldestVer").value,
    leaseStart: $("leaseStart").value,
    leaseEnd: $("leaseEnd").value,
    headAge: Number($("headAge").value || 0),
    ftStudents: $("ftStudents").value,
    members: $("members").value,
    allFt: $("allFt").checked,
    studentException: $("studentException").checked,
    ownerSigned: $("ownerSigned").checked,
    adultsSigned: $("adultsSigned").checked,
    docs: docState()
  };
}

function docState() {
  const state = {};
  document.querySelectorAll("#docList input").forEach((el) => { state[el.value] = el.checked; });
  return state;
}

function renderDocs() {
  const programs = selectedPrograms();
  const previous = docState();
  const docs = RULES.documents.filter((d) => d.programs.some((p) => programs.includes(p)));
  $("docList").innerHTML = docs.map((d) => {
    const detected = d.detect.some((re) => re.test(extractedText) || re.test(fileNames.join(" ")));
    const checked = previous[d.id] || detected;
    return '<label class="doc"><input type="checkbox" value="' + d.id + '" ' + (checked ? "checked" : "") + ' /><span>' + d.label + (detected ? '<small class="badge">Seen in the upload</small>' : '<small>Confirm if it is in the paper file</small>') + '</span></label>';
  }).join("");
  const names = programs.map((id) => PROGRAM_LABEL[id]).join(" + ");
  $("layerNote").textContent = programs.length > 1
    ? names + ": the stricter rule is applied. A missing document under any selected program is a correction."
    : (names || "Select a program") + " file standard.";
}

function setFiles(files) {
  fileNames = [...files].map((f) => f.name);
  $("fileList").innerHTML = fileNames.map((name) => "<li>" + name + "</li>").join("") || "";
  extractAll(files);
}

async function extractAll(files) {
  const parts = [];
  for (const file of files) {
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) parts.push(await pdfText(file));
    else if (/^text|json|csv/.test(file.type) || /\.(txt|md|csv)$/i.test(file.name)) parts.push(await file.text());
    else parts.push("[Image filed: " + file.name + ". Text was not read from this image. Confirm the documents below.]");
  }
  extractedText = parts.filter(Boolean).join("\n\n");
  $("extracted").textContent = extractedText || "No text layer found.";
  renderDocs();
}

async function pdfText(file) {
  if (!window.pdfjsLib) return "";
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

function loadSample() {
  $("property").value = "Clearwater Court Apartments";
  $("unit").value = "204";
  $("head").value = "Maria Santos";
  $("manager").value = "Site manager";
  $("state").value = "ID";
  $("certType").value = "movein";
  $("effective").value = "2026-03-01";
  $("incomeLimit").value = "32400";
  $("ticIncome").value = "10110";
  $("wageIncome").value = "22132.50";
  $("otherIncome").value = "0";
  $("assets").value = "3200";
  $("assetIncome").value = "0";
  $("tenantRent").value = "780";
  $("ua").value = "95";
  $("maxRent").value = "850";
  $("stubCount").value = "2";
  $("oldestVer").value = "2025-08-15";
  $("leaseStart").value = "2026-03-01";
  $("leaseEnd").value = "2026-05-31";
  $("headAge").value = "41";
  $("ftStudents").value = "1";
  $("members").value = "3";
  $("allFt").checked = false;
  $("studentException").checked = false;
  $("ownerSigned").checked = false;
  $("adultsSigned").checked = true;
  document.querySelectorAll("input[name=program]").forEach((el) => {
    el.checked = el.value === "lihtc" || el.value === "home";
  });
  extractedText = "Clearwater Court Apartments Unit 204\nHead of household Maria Santos. Household member Luis Santos, age 19, full-time student.\nRental application date 02/01/2026.\nIHFA TIC Tenant Income Certification annual income $10,110. Adult signatures present. Owner signature missing.\nPay stub earnings statement 08/15/2025 $842.50. Pay stub 08/29/2025 $860.00.\nLease 03/01/2026 through 05/31/2026.\nNo student status form. No HOME certification. No asset self-certification. No bank statement. No calculation worksheet. No VAWA addendum. No move-in inspection.";
  fileNames = ["Clearwater-204-move-in.txt"];
  $("fileList").innerHTML = "<li>Sample file: Clearwater Court 204 move-in (deficient)</li>";
  $("extracted").textContent = extractedText;
  renderDocs();
  review();
}

function review() {
  const input = readInput();
  const result = reviewFile(input);
  const c = result.counts;
  $("score").textContent = (c.critical || 0) + " must fix \u00b7 " + (c.needed || 0) + " corrections \u00b7 " + (c.watch || 0) + " watch \u00b7 " + (c.pass || 0) + " present";
  $("findings").innerHTML = result.findings.map((f) => '<article class="finding ' + f.severity + '"><div class="meta">' + f.severity + " \u00b7 " + f.program + '</div><h3>' + f.title + '</h3><p><strong>In the file.</strong> ' + f.found + '</p><p><strong>Should look like.</strong> ' + f.should + '</p><p><strong>Manager correction.</strong> ' + f.correction + '</p><p class="hint">' + f.cite + '</p></article>').join("");
  const pack = RULES.stacking[input.state] || RULES.stacking.OTHER;
  $("modelPanel").innerHTML = "<h2>" + pack.name + "</h2><p class=\"hint\">" + pack.revised + ". " + pack.note + "</p><ol class=\"stack\">" + pack.movein.map((item) => "<li>" + item + "</li>").join("") + "</ol><h3>Program pieces that sit in that order</h3><ul class=\"stack\"><li>Tax Credit: TIC, student certification at move-in and every year, six-month initial lease, 140% Available Unit Rule at recertification.</li><li>HUD: 50059, HUD-9887, EIV at recertification, citizenship declaration. 2026 passbook rate 0.40%. Asset self-certification through $52,787. Dependent deduction $500. Elderly or disabled deduction $550, which is not a Tax Credit deduction.</li><li>HOME: income at occupancy under 24 CFR 5.609, HOME rent cap, one-year lease unless both parties agree shorter, no prohibited lease terms. Layered Idaho units need a HOME certification and a TIC.</li><li>RD: Form RD 3560-8, annual certification, verifications behind the form.</li><li>Section 202: age 62 proof for the qualifying member, then the HUD certification packet.</li></ul>";
  $("letter").innerText = buildLetter(input, result);
}

function showTab(name) {
  document.querySelectorAll(".tabs button").forEach((btn) => btn.classList.toggle("on", btn.dataset.tab === name));
  $("findingsPanel").classList.toggle("hidden", name !== "findings");
  $("modelPanel").classList.toggle("hidden", name !== "model");
  $("letterPanel").classList.toggle("hidden", name !== "letter");
}

$("drop").addEventListener("dragover", (e) => { e.preventDefault(); $("drop").classList.add("over"); });
$("drop").addEventListener("dragleave", () => $("drop").classList.remove("over"));
$("drop").addEventListener("drop", (e) => {
  e.preventDefault();
  $("drop").classList.remove("over");
  setFiles(e.dataTransfer.files);
});
$("fileInput").addEventListener("change", (e) => setFiles(e.target.files));
$("loadSample").addEventListener("click", loadSample);
$("reviewBtn").addEventListener("click", review);
$("printLetter").addEventListener("click", () => window.print());
document.querySelectorAll("input[name=program]").forEach((el) => el.addEventListener("change", renderDocs));
document.querySelectorAll(".tabs button").forEach((btn) => btn.addEventListener("click", () => showTab(btn.dataset.tab)));
renderDocs();
