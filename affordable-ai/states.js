RULES.states = [
  { code: "AL", name: "Alabama", agency: "Alabama Housing Finance Authority" },
  { code: "AK", name: "Alaska", agency: "Alaska Housing Finance Corporation" },
  { code: "AZ", name: "Arizona", agency: "Arizona Department of Housing" },
  { code: "AR", name: "Arkansas", agency: "Arkansas Development Finance Authority" },
  { code: "CA", name: "California", agency: "California Tax Credit Allocation Committee" },
  { code: "CO", name: "Colorado", agency: "Colorado Housing and Finance Authority" },
  { code: "CT", name: "Connecticut", agency: "Connecticut Housing Finance Authority" },
  { code: "DE", name: "Delaware", agency: "Delaware State Housing Authority" },
  { code: "FL", name: "Florida", agency: "Florida Housing Finance Corporation" },
  { code: "GA", name: "Georgia", agency: "Georgia Department of Community Affairs" },
  { code: "HI", name: "Hawaii", agency: "Hawaii Housing Finance and Development Corporation" },
  { code: "ID", name: "Idaho", agency: "Idaho Housing and Finance Association" },
  { code: "IL", name: "Illinois", agency: "Illinois Housing Development Authority" },
  { code: "IN", name: "Indiana", agency: "Indiana Housing and Community Development Authority" },
  { code: "IA", name: "Iowa", agency: "Iowa Finance Authority" },
  { code: "KS", name: "Kansas", agency: "Kansas Housing Resources Corporation" },
  { code: "KY", name: "Kentucky", agency: "Kentucky Housing Corporation" },
  { code: "LA", name: "Louisiana", agency: "Louisiana Housing Corporation" },
  { code: "ME", name: "Maine", agency: "Maine State Housing Authority" },
  { code: "MD", name: "Maryland", agency: "Maryland Department of Housing and Community Development" },
  { code: "MA", name: "Massachusetts", agency: "Massachusetts Executive Office of Housing and Livable Communities" },
  { code: "MI", name: "Michigan", agency: "Michigan State Housing Development Authority" },
  { code: "MN", name: "Minnesota", agency: "Minnesota Housing" },
  { code: "MS", name: "Mississippi", agency: "Mississippi Home Corporation" },
  { code: "MO", name: "Missouri", agency: "Missouri Housing Development Commission" },
  { code: "MT", name: "Montana", agency: "Montana Board of Housing" },
  { code: "NE", name: "Nebraska", agency: "Nebraska Investment Finance Authority" },
  { code: "NV", name: "Nevada", agency: "Nevada Housing Division" },
  { code: "NH", name: "New Hampshire", agency: "New Hampshire Housing Finance Authority" },
  { code: "NJ", name: "New Jersey", agency: "New Jersey Housing and Mortgage Finance Agency" },
  { code: "NM", name: "New Mexico", agency: "New Mexico Mortgage Finance Authority" },
  { code: "NY", name: "New York", agency: "New York State Homes and Community Renewal" },
  { code: "NC", name: "North Carolina", agency: "North Carolina Housing Finance Agency" },
  { code: "ND", name: "North Dakota", agency: "North Dakota Housing Finance Agency" },
  { code: "OH", name: "Ohio", agency: "Ohio Housing Finance Agency" },
  { code: "OK", name: "Oklahoma", agency: "Oklahoma Housing Finance Agency" },
  { code: "OR", name: "Oregon", agency: "Oregon Housing and Community Services" },
  { code: "PA", name: "Pennsylvania", agency: "Pennsylvania Housing Finance Agency" },
  { code: "RI", name: "Rhode Island", agency: "Rhode Island Housing" },
  { code: "SC", name: "South Carolina", agency: "South Carolina State Housing Finance and Development Authority" },
  { code: "SD", name: "South Dakota", agency: "South Dakota Housing Development Authority" },
  { code: "TN", name: "Tennessee", agency: "Tennessee Housing Development Agency" },
  { code: "TX", name: "Texas", agency: "Texas Department of Housing and Community Affairs" },
  { code: "UT", name: "Utah", agency: "Utah Housing Corporation" },
  { code: "VT", name: "Vermont", agency: "Vermont Housing Finance Agency" },
  { code: "VA", name: "Virginia", agency: "Virginia Housing" },
  { code: "WA", name: "Washington", agency: "Washington State Housing Finance Commission" },
  { code: "WV", name: "West Virginia", agency: "West Virginia Housing Development Fund" },
  { code: "WI", name: "Wisconsin", agency: "Wisconsin Housing and Economic Development Authority" },
  { code: "WY", name: "Wyoming", agency: "Wyoming Community Development Authority" }
];

function agencyName(code) {
  const row = RULES.states.find((s) => s.code === code);
  return row ? row.agency : "the state allocating agency";
}

function stackingFor(code) {
  if (code === "ID") return RULES.stacking.ID;
  const agency = agencyName(code);
  return {
    name: agency + " tenant file",
    revised: "Federal floor for this state. Use the current " + agency + " compliance manual and its forms if they are stricter.",
    movein: [
      agency + " income certification, or the HUD 50059 or RD 3560-8 where that program accepts it",
      "Household application and income and asset questionnaire",
      "Student status certification where Tax Credit or HOME applies",
      "Income and asset source documents in the order listed on the questionnaire",
      "Calculation worksheet for every figure on the certification",
      "Clarification page behind any incomplete verification",
      "Signed lease and program addenda, including VAWA",
      "Move-in inspection"
    ],
    note: "Local suballocators, including Chicago, New York City, and some Minnesota agencies, use their own manual when they monitor the property. HUD uses a 120-day verification window. Confirm the window in the " + agency + " manual."
  };
}

RULES.states.forEach((s) => {
  if (s.code !== "ID") RULES.stacking[s.code] = stackingFor(s.code);
});

(function fillStates() {
  const sel = document.getElementById("state");
  if (!sel) return;
  sel.innerHTML = RULES.states.map((s) => "<option value=\"" + s.code + "\">" + s.name + " \u2014 " + s.agency + "</option>").join("");
  sel.value = "ID";
})();
