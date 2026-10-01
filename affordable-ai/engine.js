function daysBetween(a, b) {
  if (!a || !b) return null;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.round(ms / 86400000);
}

function money(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "\u2014";
  return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function reviewFile(input) {
  const findings = [];
  const programs = input.programs.length ? input.programs : ["lihtc"];
  const has = (id) => programs.includes(id);
  const docOn = (id) => !!input.docs[id];
  const add = (item) => findings.push(item);
  const hotma = RULES.hotma2026;

  if (has("lihtc") && !docOn("tic")) {
    add({ severity: "critical", program: "Tax Credit", title: "Tenant Income Certification is missing", found: "No TIC was detected or confirmed.", should: "The file needs a TIC signed by every adult and by the owner representative, with each income and asset figure supported.", correction: "Complete the HFA TIC, obtain all adult signatures and the owner signature, and file it on top of the certification packet.", cite: "IRC \u00a742; IRS Form 8823 Guide; IHFA stacking order (Oct 2025) if this is an Idaho file" });
  }
  if (has("lihtc") && docOn("tic") && !input.ownerSigned) {
    add({ severity: "needed", program: "Tax Credit", title: "Owner signature is missing on the certification", found: "The TIC is in the file, but the owner or manager signature was not confirmed.", should: "The owner representative signs the TIC after reviewing the verifications.", correction: "Sign and date the TIC. Do not backdate. If the effective date has passed, document the date the signature was actually obtained.", cite: "State HFA TIC instructions; IRS 8823 Guide tenant-file documentation" });
  }
  if ((has("lihtc") || has("home") || has("hud")) && docOn("tic") && !input.adultsSigned) {
    add({ severity: "needed", program: "All selected", title: "Not every adult signed the certification", found: "Adult signatures were not confirmed.", should: "Each adult household member signs the income certification.", correction: "Obtain the missing adult signatures. A signature dated after the effective date needs a file note.", cite: "HUD Handbook 4350.3; HFA TIC instructions" });
  }
  if ((has("lihtc") || has("home")) && !docOn("student")) {
    add({ severity: "critical", program: has("lihtc") ? "Tax Credit" : "HOME", title: "Student status certification is missing", found: "No student status certification was in the file.", should: "Student status is certified at move-in and annually, even at a 100% tax credit property that does not recertify income. A LIHTC + HOME unit needs both certifications.", correction: "Have the household complete the student status form. If anyone is a full-time student, add school verification or the applicable exception.", cite: "IRC \u00a742(i)(3)(D); IHFA compliance manual \u2014 student status required annually" });
  }
  if (has("lihtc") && input.allFt && !input.studentException) {
    add({ severity: "critical", program: "Tax Credit", title: "Household appears ineligible under the full-time student rule", found: "The household is marked entirely full-time students, and no Section 42 exception is documented.", should: "A Tax Credit household cannot be made up entirely of full-time students unless an exception is in the file: married filing jointly, single parent with a dependent child, TANF, Job Corps, or former foster youth.", correction: "Document an exception with third-party support, or the unit is not a qualified low-income unit. Do not count the unit in the applicable fraction until this is cured.", cite: "IRC \u00a742(i)(3)(D); IRS 8823 Guide Chapter 17" });
  }
  if (has("home") && has("lihtc") && !docOn("homeCert")) {
    add({ severity: "needed", program: "HOME", title: "HOME certification is missing on a layered unit", found: "Tax Credit paperwork is present or selected, but a separate HOME certification was not confirmed.", should: "IHFA requires both certifications when the unit is LIHTC and HOME.", correction: "Complete the HOME income certification and file it with the TIC. Do not rely on the TIC alone.", cite: "IHFA electronic file stacking order, revised October 2025; 24 CFR 92.203" });
  }
  if (has("hud") && !docOn("f50059")) {
    add({ severity: "critical", program: "HUD", title: "HUD 50059 is missing", found: "No 50059 was detected.", should: "A HUD-assisted household file has a 50059 for the certification effective date, matching the verifications.", correction: "Produce the 50059 from the certified income and assets. File the signed 50059 with the backup.", cite: "HUD Handbook 4350.3" });
  }
  if ((has("hud") || has("s202")) && input.certType !== "movein" && !docOn("eiv")) {
    add({ severity: "needed", program: "HUD", title: "EIV report is missing", found: "No EIV Income Report was confirmed for this recertification.", should: "HUD multifamily uses EIV at recertification. EIV is not a Tax Credit verification and must not be used as the income source for a LIHTC-only file.", correction: "Print the EIV Income Report within the allowed window, resolve discrepancies, and file the reports in the HUD section of the file. Keep EIV out of a tax-credit-only packet.", cite: "HUD Notice H 2023-10 verification hierarchy, Level 6; HUD EIV instructions" });
  }
  if (has("rd") && !docOn("rd3560")) {
    add({ severity: "critical", program: "RD", title: "RD 3560-8 is missing", found: "No Tenant Certification form was confirmed.", should: "An RD file uses Form RD 3560-8, supported by income and asset verifications.", correction: "Complete Form RD 3560-8 for this effective date and file the verifications behind it.", cite: "7 CFR 3560; RD HB-2-3560" });
  }
  if (has("s202") && !docOn("age")) {
    add({ severity: "needed", program: "Section 202", title: "Proof of age is missing", found: "No age document was confirmed.", should: "Section 202 occupancy requires proof that the qualifying member is 62 or older, unless the property is an 811 or another disability program.", correction: "File a birth certificate, passport, or other age evidence. Do not use a document that shows a full Social Security number if a partial number will do.", cite: "Section 202 program eligibility; HUD Handbook 4350.3" });
  }
  if (has("s202") && input.headAge && input.headAge < 62) {
    add({ severity: "critical", program: "Section 202", title: "Head of household is under 62", found: "Age on the review sheet is " + input.headAge + ".", should: "A Section 202 household is qualified by an elderly person 62 or older, unless this is an 811 or another designated disability property.", correction: "Confirm the program. If this is 202 elderly housing, the household is not eligible. If it is 811, change the program selection and file the disability documentation.", cite: "Section 202 of the Housing Act of 1959" });
  }
  if (!docOn("incomeVer")) {
    add({ severity: "critical", program: "All selected", title: "Income verification is missing", found: "No paystubs, benefit letters, or other income source documents were confirmed.", should: "Every amount on the certification has backup. Preferred order: non-EIV upfront verification, tenant-provided source documents, written third-party form, oral verification with a file note, then self-certification only as a last resort.", correction: "Collect source documents for each income item. If a document is unclear, put a clarification on the next page. Include the calculation worksheet.", cite: "HUD Notice H 2023-10 Table J-2; IHFA stacking order verification hierarchy" });
  }
  if (!docOn("calcTape")) {
    add({ severity: "needed", program: "All selected", title: "Calculation worksheet is missing", found: "No income calculation tape or worksheet was confirmed.", should: "The file shows the math from the source document to the annual figure on the certification.", correction: "Add a worksheet that shows pay frequency, the stubs used, and the annualized amount. File it directly behind the verification.", cite: "IHFA electronic file stacking order, October 2025" });
  }
  if (!docOn("assetCert")) {
    add({ severity: "needed", program: "All selected", title: "Asset backup is missing", found: "No asset self-certification or bank statement was confirmed.", should: "If net family assets are at or under the 2026 self-certification threshold of $52,787, a self-certification can be accepted where HOTMA applies. Above that, verify assets. A checking account needs at least one statement showing the current balance when verification is required.", correction: "File the asset self-certification or the current statement. Impute income only on assets with no determinable income, and only when net assets exceed the threshold.", cite: "HUD CY2026 inflation-adjusted values; 24 CFR 5.609; HUD Notice H 2023-10" });
  }
  if ((has("hud") || has("home") || has("lihtc")) && !docOn("vawa")) {
    add({ severity: "needed", program: "VAWA", title: "VAWA documents are missing", found: "No VAWA notice or lease addendum was confirmed.", should: "The file includes the notice of occupancy rights and the VAWA lease addendum.", correction: "Add HUD-5380 and the VAWA lease addendum (HUD-91067) to the lease packet and document that the household received them.", cite: "Violence Against Women Act housing provisions; HUD-5380; HUD-91067" });
  }
  if (!docOn("lease")) {
    add({ severity: "critical", program: "All selected", title: "Lease is missing", found: "No lease was detected.", should: "A signed lease covers the certification period. Tax Credit initial term is at least six months. HOME is generally a one-year term unless both parties agree to a shorter term, and prohibited lease clauses cannot be used.", correction: "Execute the program lease and addenda. Replace a short Tax Credit lease before the unit is treated as qualified.", cite: "IRC \u00a742(i)(3) transient rule; 24 CFR 92.253" });
  }
  const leaseDays = daysBetween(input.leaseStart, input.leaseEnd);
  if (has("lihtc") && input.certType === "movein" && leaseDays !== null && leaseDays < 180) {
    add({ severity: "critical", program: "Tax Credit", title: "Initial lease is shorter than six months", found: "Lease runs " + input.leaseStart + " to " + input.leaseEnd + " (" + leaseDays + " days).", should: "A Tax Credit unit cannot be used on a transient basis. The initial lease term is at least six months, unless a recognized transitional-housing exception applies.", correction: "Execute an addendum or a new lease with a term of at least six months. Keep the short lease in the file as the error, with the cure behind it.", cite: "IRC \u00a742(i)(3); IRS 8823 Guide" });
  }
  if (input.oldestVer && input.effective) {
    const age = daysBetween(input.oldestVer, input.effective);
    if (age !== null && age > 120) {
      add({ severity: "critical", program: input.state === "ID" ? "IHFA" : "HFA / HUD", title: "Verification is older than 120 days", found: "Oldest verification " + input.oldestVer + " is " + age + " days before effective date " + input.effective + ".", should: "IHFA treats verifications and the application as valid for 120 days. HUD uses a 120-day verification window. A stale document does not support the certification.", correction: "Obtain current source documents dated within 120 days of the effective date and recalculate. Note why the old document was rejected.", cite: "IHFA LIHTC compliance manual; HUD Handbook 4350.3" });
    }
  }
  const annual = Number(input.wageIncome || 0) + Number(input.otherIncome || 0) + Number(input.assetIncome || 0);
  const tic = Number(input.ticIncome || 0);
  if (tic && Math.abs(annual - tic) > 1) {
    add({ severity: "critical", program: "Income math", title: "Certification income does not match the worksheet", found: "Certification shows " + money(tic) + ". Source documents support " + money(annual) + ".", should: "The figure on the TIC, 50059, or 3560-8 equals the worksheet. Wages are annualized by pay frequency (biweekly times 26, weekly times 52), not by multiplying one stub by 12.", correction: "Redo the worksheet, correct the certification, and have the household and owner sign the corrected form. Do not leave both figures in the file without a superseded stamp on the wrong one.", cite: "HUD Handbook 4350.3 Chapter 5; IHFA calculation-tape requirement" });
  }
  if (input.incomeLimit && annual > Number(input.incomeLimit) && input.certType === "movein") {
    add({ severity: "critical", program: "Eligibility", title: "Household is over the income limit at move-in", found: money(annual) + " is over the entered limit of " + money(input.incomeLimit) + ".", should: "A household must be at or under the program limit that applies to this unit on the effective date. Layered units use the most restrictive limit.", correction: "Stop treating the unit as qualified. If the limit entered is wrong, replace it with the county limit for the household size and effective date and review again.", cite: "IRC \u00a742(g); 24 CFR 92.252; 7 CFR 3560" });
  }
  if (input.incomeLimit && input.certType === "annual" && annual > Number(input.incomeLimit) * 1.4 && has("lihtc")) {
    add({ severity: "needed", program: "Tax Credit", title: "Available Unit Rule may apply", found: "Recertification income " + money(annual) + " is over 140% of the current limit (" + money(Number(input.incomeLimit) * 1.4) + ").", should: "If household income goes over 140% of the current income limit, the next available unit of comparable or smaller size in the building must be rented to a qualified household.", correction: "Flag the building's next available unit. Document the 140% test. This is not by itself a move-out.", cite: "IRC \u00a742(g)(2)(D); IRS 8823 Guide Available Unit Rule" });
  }
  const gross = Number(input.tenantRent || 0) + Number(input.ua || 0);
  if (input.maxRent && gross > Number(input.maxRent) + 0.009) {
    add({ severity: "critical", program: "Rent", title: "Gross rent is over the program maximum", found: "Tenant rent " + money(input.tenantRent) + " plus utility allowance " + money(input.ua) + " is " + money(gross) + ". Maximum entered is " + money(input.maxRent) + ".", should: "Gross rent is tenant rent plus the utility allowance, and it cannot exceed the Tax Credit, HOME, or other program max for that unit.", correction: "Reduce tenant rent so gross rent is at or under the max, refund any overcharge, and file the rent-limit sheet used for this effective date.", cite: "IRC \u00a742(g)(2); 24 CFR 92.252" });
  }
  if (Number(input.stubCount) > 0 && Number(input.stubCount) < 4 && Number(input.wageIncome) > 0) {
    add({ severity: "watch", program: "Income", title: "Too few paystubs to annualize wages", found: input.stubCount + " paystub(s) confirmed.", should: "Use enough consecutive stubs to cover the pay frequency. Four to six current stubs is the usual file for biweekly wages. One stub times 12 is not an annual wage.", correction: "Add consecutive stubs inside the 120-day window and show the average times the annual pay count on the worksheet.", cite: "HUD Notice H 2023-10; HFA calculation practice" });
  }
  if (input.certType === "annual" && input.priorCert && input.effective) {
    const gap = daysBetween(input.priorCert, input.effective);
    if (gap !== null && gap > 366) {
      add({ severity: "needed", program: "Recertification", title: "Annual certification is late", found: gap + " days between " + input.priorCert + " and " + input.effective + ".", should: "Income certifications are completed at least every 12 months. RD rental assistance and HUD assistance can be affected by a late recertification. Start the packet about 120 days before the anniversary.", correction: "Complete the late certification now, document the reason, and reset the anniversary only if the program allows it. Notify RD or the contract administrator if assistance was billed on an expired cert.", cite: "HUD Handbook 4350.3; 7 CFR 3560.152; IHFA recertification timing" });
    }
  }
  if (Number(input.assets) > hotma.assetSelfCert && !docOn("assetCert")) {
    add({ severity: "needed", program: "HOTMA", title: "Assets are over the self-certification threshold", found: "Net assets " + money(input.assets) + " exceed " + money(hotma.assetSelfCert) + ".", should: "Self-certification is not enough above the 2026 threshold. Verify the assets. Impute at the 0.40% passbook rate only where actual income cannot be determined.", correction: "Obtain current statements and add the imputation worksheet if any asset has no determinable income.", cite: hotma.source });
  }
  if (!docOn("inspection") && input.certType === "movein") {
    add({ severity: "watch", program: "Unit", title: "Move-in inspection is missing", found: "No inspection was confirmed.", should: "The move-in inspection is in the tenant file, signed, and dated on or before move-in.", correction: "File the signed move-in inspection. If it was done and not filed, add it. If it was not done, complete one and note the date gap.", cite: "HUD Handbook 4350.3; HFA tenant-file checklists" });
  }
  const required = RULES.documents.filter((d) => d.programs.some((p) => programs.includes(p)));
  required.forEach((d) => {
    if (docOn(d.id)) add({ severity: "pass", program: "File", title: d.label, found: "Present.", should: "Keep it in stacking order.", correction: "No correction.", cite: "File checklist" });
  });
  const rank = { critical: 0, needed: 1, watch: 2, pass: 3 };
  findings.sort((a, b) => rank[a.severity] - rank[b.severity]);
  const counts = findings.reduce((acc, f) => { acc[f.severity] = (acc[f.severity] || 0) + 1; return acc; }, {});
  return { findings, counts, programs };
}

function buildLetter(input, result) {
  const open = result.findings.filter((f) => f.severity !== "pass");
  const when = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const programs = result.programs.map((id) => PROGRAM_LABEL[id] || id).join(", ");
  const lines = open.map((f, i) => (i + 1) + ". [" + f.severity.toUpperCase() + "] " + f.title + "\nWhat is in the file: " + f.found + "\nWhat the file should contain: " + f.should + "\nManager correction: " + f.correction + "\nAuthority: " + f.cite);
  return "AFFORDABLE AI FILE REVIEW\nCorrection notice for the site manager\n" + when + "\n\nProperty: " + (input.property || "\u2014") + "\nUnit: " + (input.unit || "\u2014") + "\nHousehold: " + (input.head || "\u2014") + "\nManager: " + (input.manager || "\u2014") + "\nPrograms: " + programs + "\nCertification: " + input.certType + "\nEffective date: " + (input.effective || "\u2014") + "\n\nThis file is not ready for a compliance review until the items below are corrected. Do not alter a file after an agency audit notice has been sent.\n\n" + (lines.join("\n\n") || "No corrections. The checked documents and figures support this certification.") + "\n\nHow the corrected file should be stacked\n" + stackFor(input.state).map((item, i) => (i + 1) + ". " + item).join("\n") + "\n\nThis notice is a specialist aid. It is not an IHFA, HUD, USDA, or IRS determination. Limits must be the county limits for the effective date.";
}

function stackFor(state) {
  const pack = RULES.stacking[state] || RULES.stacking.OTHER;
  return pack.movein;
}
