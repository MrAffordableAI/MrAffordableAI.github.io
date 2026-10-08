/* Compliance specialist memo. State rules are added only where a source was read. */
function stateRule(code) {
  const floor = "Federal floor: Section 42 student rule, student status at move-in and every year, 120-day HUD verification, six-month initial lease. A 100 percent tax credit property is not required to recertify income. Student status is still annual.";
  if (code === "ID") return floor + " Idaho Housing: student certification is still required every year at a 100 percent property. A verification lasts 120 days from the date the owner receives it. Recertification starts 120 days before the anniversary. Source: IHFA manual, 2020 text; confirm the current manual.";
  if (code === "ND") return floor + " North Dakota Housing: written verifications last 120 days. A 100 percent property does not verify income and assets annually. Student status is verified in the first 15 years. Source: North Dakota 2025 manual.";
  if (code === "CA" || code === "MI" || code === "OH" || code === "WA") return floor + " This state publishes a compliance manual. That manual was not copied into the review. Use the current manual on the agency site if it is stricter.";
  return floor + " No state-specific rule was added. Do not apply the Idaho or North Dakota rule here. The allocating agency manual controls if it is stricter.";
}

function specialistMemo(input, result, text) {
  const agency = typeof agencyName === "function" ? agencyName(input.state) : "the allocating agency";
  const open = result.findings.filter((f) => f.severity !== "pass");
  const lines = [];
  lines.push("Compliance specialist review");
  lines.push((input.property || "Property") + " · unit " + (input.unit || "—") + " · " + (input.head || "household"));
  lines.push("State: " + (input.state || "—") + " · " + agency);
  lines.push("Programs: " + (input.programs || []).join(", "));
  lines.push("");
  lines.push("State rule applied to this file");
  lines.push(stateRule(input.state));
  lines.push("");
  lines.push("What I read in the file");
  lines.push(text ? text.slice(0, 1200) : "No text layer. A scan was not read. Tick the documents that are in the paper file.");
  lines.push("");
  lines.push(open.length ? "Corrections" : "No correction on the items this pass can see.");
  open.forEach((f, i) => {
    lines.push((i + 1) + ". " + f.title);
    lines.push("In the file: " + f.found);
    lines.push("Correction: " + f.correction);
    lines.push("Should look like: " + f.should);
    lines.push("Authority: " + f.cite);
    lines.push("");
  });
  lines.push("How this file should be stacked");
  const stack = typeof stackingFor === "function" ? stackingFor(input.state) : null;
  if (stack) stack.movein.forEach((item, i) => lines.push((i + 1) + ". " + item));
  lines.push("");
  lines.push("This review applies the sourced state rule above. It is not an agency determination.");
  return lines.join("\n");
}

function writeSpecialist() {
  if (typeof readDroppedFile === "function") readDroppedFile(typeof extractedText === "string" ? extractedText : "");
  if (typeof readInput !== "function" || typeof reviewFile !== "function") return;
  const input = readInput();
  const result = reviewFile(input);
  const memo = specialistMemo(input, result, typeof extractedText === "string" ? extractedText : "");
  const letter = document.getElementById("letter");
  if (letter) letter.innerText = memo;
  const out = document.getElementById("reasonOut");
  if (out) out.textContent = memo;
}

function mountSpecialist() {
  const btn = document.getElementById("reviewBtn");
  if (btn) btn.addEventListener("click", function () { setTimeout(writeSpecialist, 0); });
  const sample = document.getElementById("loadSample");
  if (sample) sample.addEventListener("click", function () { setTimeout(writeSpecialist, 0); });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountSpecialist);
else mountSpecialist();
