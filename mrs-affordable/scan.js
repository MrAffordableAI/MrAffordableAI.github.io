pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
let stop = false;
document.getElementById("stop").onclick = () => { stop = true; };

function ruleText(text) {
  const findings = [];
  if (/no student|student status form missing/i.test(text) || !/student/i.test(text)) findings.push("Student status certification was not confirmed in the text read.");
  if (/owner signature missing|unsigned/i.test(text)) findings.push("Owner signature was not confirmed.");
  if (/lease/i.test(text) && /month/i.test(text)) findings.push("Lease language was found. Confirm the initial term is at least six months.");
  return findings;
}

async function scan(file) {
  stop = false;
  const status = document.getElementById("status");
  const out = document.getElementById("out");
  status.textContent = "Opening the PDF.";
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const worker = await Tesseract.createWorker("eng");
  let text = "";
  const limit = Math.min(pdf.numPages, 150);
  for (let i = 1; i <= limit; i += 1) {
    if (stop) break;
    status.textContent = "Reading page " + i + " of " + pdf.numPages + ".";
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const embedded = content.items.map((item) => item.str).join(" ").trim();
    if (embedded.length > 40) {
      text += "\n\nPage " + i + "\n" + embedded;
      continue;
    }
    const view = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement("canvas");
    canvas.width = view.width;
    canvas.height = view.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: view }).promise;
    const result = await worker.recognize(canvas);
    text += "\n\nPage " + i + "\n" + (result.data.text || "[no text recognized]");
  }
  await worker.terminate();
  const findings = ruleText(text);
  status.textContent = stop ? "Stopped." : "Read " + limit + " page(s).";
  out.textContent = ["Mrs. Affordable scan", "Pages in file: " + pdf.numPages, "Pages read: " + (stop ? "stopped early" : limit), "", "Corrections", findings.length ? findings.map((item, n) => (n + 1) + ". " + item).join("\n") : "No student or signature defect was confirmed in the text read.", "", "Text read", text.slice(0, 4000)].join("\n");
}

document.getElementById("file").onchange = (event) => {
  const file = event.target.files[0];
  if (file) scan(file);
};
document.getElementById("drop").addEventListener("dragover", (event) => event.preventDefault());
document.getElementById("drop").addEventListener("drop", (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) scan(file);
});
