/* Specialist review. Federal rules run in every state. The selected agency is named.
   A model call is optional and uses a key typed on this phone. The key is not stored in git. */
function specialistPacket(input, result, text) {
  const agency = typeof agencyName === "function" ? agencyName(input.state) : "the allocating agency";
  return [
    "Review this affordable-housing tenant file as a compliance specialist.",
    "State: " + (input.state || "not selected") + ". Allocating agency: " + agency + ".",
    "Programs: " + (input.programs || []).join(", ") + ". Certification: " + (input.certType || "move-in") + ".",
    "Apply IRC 42, the IRS 8823 Guide, HUD Handbook 4350.3, 24 CFR 92, and RD HB-2-3560 where those programs are selected.",
    "If the state manual is stricter than the federal floor, say so and name the manual. Do not invent a state rule you cannot support.",
    "Idaho uses the IHFA stacking order revised October 2025. Other states use that agency's current forms.",
    "Return the corrections a site manager must make, what the file should contain, and what is only a watch item.",
    "File text:",
    text || "(no text layer)",
    "Checklist already found:",
    (result.findings || []).map((f) => f.severity + ": " + f.title + " — " + f.found).join("\n")
  ].join("\n");
}

async function reasonOverFile() {
  const out = document.getElementById("reasonOut");
  const key = (document.getElementById("modelKey") || {}).value || "";
  const input = typeof readInput === "function" ? readInput() : { state: "ID", programs: ["lihtc"] };
  if (typeof readDroppedFile === "function") readDroppedFile(extractedText);
  const result = typeof reviewFile === "function" ? reviewFile(input) : { findings: [] };
  const packet = specialistPacket(input, result, extractedText);
  if (!key) {
    out.textContent = "Federal review is above. A model pass needs a key typed here. It is not saved in git. Without a key, this is the checklist plus the file text, not a reasoned review.\n\n" + packet;
    return;
  }
  out.textContent = "Sending the file text and the checklist to the model…";
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model: "grok-4",
        messages: [{ role: "user", content: packet }]
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error && data.error.message ? data.error.message : "Model call failed");
    out.textContent = data.choices[0].message.content;
  } catch (err) {
    out.textContent = "The model call did not complete from this page: " + err.message + "\nA public page often cannot call the model directly. The review packet is ready for a private server.\n\n" + packet;
  }
}

function mountReason() {
  if (document.getElementById("reasonBox")) return;
  const host = document.getElementById("letterPanel") || document.querySelector("main");
  if (!host) return;
  const box = document.createElement("section");
  box.className = "panel";
  box.id = "reasonBox";
  box.innerHTML = "<h2>Reason over this file</h2><p class=\"hint\">Runs for the state you selected. Federal rules apply in all 50. The model key stays in this box and is not written to git.</p><input id=\"modelKey\" type=\"password\" placeholder=\"Model key, optional\" autocomplete=\"off\" /><button type=\"button\" class=\"go\" id=\"reasonBtn\">Reason over this file</button><pre id=\"reasonOut\"></pre>";
  host.parentNode.insertBefore(box, host.nextSibling);
  document.getElementById("reasonBtn").addEventListener("click", reasonOverFile);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountReason);
else mountReason();
