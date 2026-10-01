/* Affordable AI file rules. Sources are named in each item.
   State manuals control when they are stricter than the federal floor. */
const RULES = {
  hotma2026: {
    passbook: 0.004,
    assetSelfCert: 52787,
    assetLimitation: 105574,
    dependentDeduction: 500,
    elderlyDeduction: 550,
    source: "HUD CY2026 inflation-adjusted values, effective January 1, 2026"
  },
  documents: [
    { id: "application", label: "Rental application, dated", programs: ["lihtc", "hud", "home", "rd", "s202"], detect: [/rental application/i, /application date/i] },
    { id: "questionnaire", label: "Household questionnaire / income and asset form", programs: ["lihtc", "hud", "home", "rd", "s202"], detect: [/household questionnaire/i, /income and asset/i, /income\/asset/i] },
    { id: "tic", label: "Tenant Income Certification (TIC)", programs: ["lihtc", "home"], detect: [/tenant income certification/i, /\bTIC\b/, /IHFA TIC/i] },
    { id: "f50059", label: "HUD 50059", programs: ["hud", "s202"], detect: [/50059/] },
    { id: "rd3560", label: "RD 3560-8 Tenant Certification", programs: ["rd"], detect: [/3560-8/, /tenant certification/i] },
    { id: "student", label: "Certification of student status", programs: ["lihtc", "home"], detect: [/student status/i, /certification of student/i] },
    { id: "homeCert", label: "HOME income certification (required in addition to the TIC on a layered unit)", programs: ["home"], detect: [/HOME certification/i, /HOME income certification/i] },
    { id: "incomeVer", label: "Income verifications for every source on the certification", programs: ["lihtc", "hud", "home", "rd", "s202"], detect: [/pay stub/i, /paystub/i, /earnings statement/i, /social security/i, /benefit letter/i] },
    { id: "calcTape", label: "Income calculation worksheet or tape", programs: ["lihtc", "hud", "home", "rd", "s202"], detect: [/calculation worksheet/i, /calculation tape/i, /income calculation/i] },
    { id: "assetCert", label: "Asset self-certification or third-party asset verification", programs: ["lihtc", "hud", "home", "rd", "s202"], detect: [/asset self-cert/i, /asset certification/i, /bank statement/i] },
    { id: "release", label: "Signed release / HUD-9887 consent where required", programs: ["hud", "s202", "lihtc", "home", "rd"], detect: [/release of information/i, /9887/] },
    { id: "eiv", label: "EIV Income Report and Existing Tenant Search", programs: ["hud", "s202"], detect: [/\bEIV\b/, /existing tenant search/i] },
    { id: "lease", label: "Signed lease and required addenda", programs: ["lihtc", "hud", "home", "rd", "s202"], detect: [/\blease\b/i] },
    { id: "vawa", label: "VAWA notice and lease addendum (HUD-5380 / 91067)", programs: ["lihtc", "hud", "home", "rd", "s202"], detect: [/VAWA/i, /91067/, /5380/] },
    { id: "inspection", label: "Move-in or annual unit inspection", programs: ["lihtc", "hud", "home", "rd", "s202"], detect: [/move-in inspection/i, /unit inspection/i] },
    { id: "age", label: "Proof of age (Section 202 head of household)", programs: ["s202"], detect: [/proof of age/i, /birth certificate/i, /driver'?s license/i] },
    { id: "citizenship", label: "Citizenship / immigration declaration (Section 214, HUD)", programs: ["hud"], detect: [/citizenship/i, /section 214/i, /declaration of/i] }
  ],
  stacking: {
    ID: {
      name: "Idaho Housing and Finance Association electronic file stacking order",
      revised: "Revised October 2025",
      movein: [
        "IHFA Tenant Income Certification",
        "Household questionnaire (income and asset form)",
        "Certification of student status \u2014 LIHTC and HOME each need their own certification on a layered unit",
        "Income source documents or third-party verifications, in the order listed on the questionnaire",
        "COLA letter, when Social Security or similar income has a known increase",
        "Clarification page immediately after any incomplete or unclear verification",
        "Calculation worksheet or tape for every income source",
        "Child support certification and Health & Welfare payment history, when applicable",
        "Student financial assistance certification, when applicable",
        "Public assistance verification, when applicable",
        "Asset documents",
        "Household asset self-certification",
        "Over-asset-limitation worksheet, when applicable",
        "Signed lease, program addenda, VAWA addendum",
        "Move-in inspection"
      ],
      note: "IHFA: every amount on the TIC needs verification. Verifications and the application are valid for 120 days. Student status is certified at move-in and every year, including at 100% tax credit properties that do not recertify income."
    },
    OTHER: {
      name: "Model tenant file used by state HFA manuals",
      revised: "Federal floor plus typical HFA practice",
      movein: [
        "Application with date and time",
        "Program income certification signed by all adults and the owner representative (TIC, HUD 50059, or RD 3560-8)",
        "Student status certification where Tax Credit or HOME applies",
        "Release of information",
        "Third-party or tenant-provided source documents for each income and asset item",
        "Calculation worksheet",
        "Clarifications for gaps, and a file note if a lower verification level was used",
        "Lease of at least six months for Tax Credit, with VAWA addendum",
        "Move-in inspection and screening record"
      ],
      note: "Use the allocating agency's current compliance manual if it is stricter than this model."
    }
  }
};

const PROGRAM_LABEL = {
  lihtc: "Tax Credit",
  hud: "HUD",
  home: "HOME",
  rd: "RD",
  s202: "Section 202"
};
