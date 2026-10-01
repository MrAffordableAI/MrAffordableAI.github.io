const states = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const select = document.getElementById("state");
states.forEach((code) => {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = code;
  if (code === "ID") option.selected = true;
  select.appendChild(option);
});

function rule(code) {
  const floor = "Federal floor: Section 42 student rule, student status at move-in and every year, 120-day HUD verification, six-month initial lease. A 100 percent property is not required to recertify income.";
  if (code === "ID") return floor + " Idaho: student certification is still annual at a 100 percent property. A verification lasts 120 days from receipt.";
  if (code === "ND") return floor + " North Dakota: written verifications last 120 days. No annual income verification at a 100 percent property. Student status in the first 15 years.";
  return floor + " No extra state rule was added. The agency manual controls if it is stricter.";
}

function review() {
  const text = document.getElementById("file").value.trim();
  const code = select.value;
  const programs = document.getElementById("programs").value;
  const findings = [];
  if (!text) findings.push("No file text. A scan is not read on this desk.");
  if (/student status form|no student/i.test(text) || !/student status/i.test(text)) findings.push("Student status certification was not confirmed.");
  if (/owner signature missing/i.test(text)) findings.push("Owner signature is missing.");
  if (/through 05\/31\/2026|three.month|short lease/i.test(text)) findings.push("Initial lease is shorter than six months.");
  if (/08\/15\/2025|stale|120 day/i.test(text)) findings.push("A verification looks older than 120 days.");
  const lines = [
    "Mrs. Affordable review",
    "State: " + code,
    "Programs: " + programs,
    "",
    "State rule applied",
    rule(code),
    "",
    "What was read",
    text || "Nothing.",
    "",
    findings.length ? "Corrections" : "No correction on the items this desk can see.",
    ...findings.map((item, i) => (i + 1) + ". " + item),
    "",
    "This is the try desk. The private server, OCR, and approval gate are not running here."
  ];
  document.getElementById("out").textContent = lines.join("\n");
}

document.getElementById("sample").onclick = () => {
  document.getElementById("file").value = "Clearwater Court unit 204. Maria Santos. IHFA TIC annual income $10,110. Owner signature missing. Pay stub 08/15/2025. Lease 03/01/2026 through 05/31/2026. No student status form.";
  review();
};
document.getElementById("review").onclick = review;
