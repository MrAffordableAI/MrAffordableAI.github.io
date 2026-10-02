pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
let stop = false;
document.getElementById("stop").onclick = () => { stop = true; };

function clean(text) {
  return text.replace(/[^\n\w$.,:/%()-]+/g, " ").replace(/[ ]{2,}/g, " ");
}

function reviewText(raw) {
  const text = raw.toLowerCase();
  const lines = [];
  const rd = /rural housing service|tenant certification|3560/.test(text);
  const hud = /50059|form hud/.test(text);
  const tic = /tenant income certification|\btic\b/.test(text);
  lines.push(rd ? "Document recognized: USDA Rural Housing Service tenant certification. This is an RD file, not a tax credit TIC." : hud ? "Document recognized: HUD certification." : tic ? "Document recognized: tenant income certification." : "Document type not established. The scan was too unclear to name the form.");
  if (/recertification/.test(text)) lines.push("Certification type read: recertification.");
  if (/eviction in process/.test(text)) lines.push("The form says eviction in process. Confirm the notice, the date, and whether the unit is still occupied before this certification is used.");
  if (/52787|52,787|52797|52,797/.test(text)) lines.push("Asset threshold language was read, about $52,787. Confirm actual asset income was entered. Do not leave imputed income blank if assets exceed the threshold.");
  if (/wages, salaries/.test(text)) lines.push("A wage line was read. The figures on that line are not clear enough to accept. Recalculate from the paystubs behind the certification.");
  if (/household information statement/.test(text)) lines.push("Household information statement is present. Names and dates of birth were not readable. Confirm every member against the application.");
  if (!/student/.test(text)) lines.push("Student status was not readable. If this unit is also Tax Credit or HOME, the student certification still has to be in the file.");
  lines.push("Owner and tenant signatures were not readable. Do not treat this scan as a signed certification.");
  lines.push("This review uses only the words that survived the scan. Garbled characters are not findings.");
  return lines;
}

async function scan(file) {
  stop = false;
  const status = document.getElementById("status");
  const out = document.getElementById("out");
  status.textContent = "Opening the PDF.";
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const worker = await Tesseract.createWorker("eng");
  await worker.setParameters({ tessedit_pageseg_mode: "6" });
  let text = "";
  const limit = Math.min(pdf.numPages, 150);
  let read = 0;
  for (let i = 1; i <= limit; i += 1) {
    if (stop) break;
    status.textContent = "Reading page " + i + " of " + pdf.numPages + ".";
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let pageText = content.items.map((item) => item.str).join(" ").trim();
      if (pageText.length < 40) {
        const view = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = view.width;
        canvas.height = view.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: view }).promise;
        const result = await worker.recognize(canvas);
        pageText = result.data.text || "";
      }
      text += "\n" + clean(pageText);
      read += 1;
    } catch (err) {
      text += "\nPage " + i + " could not be read.";
    }
  }
  await worker.terminate();
  const findings = reviewText(text);
  status.textContent = (stop ? "Stopped after " : "Read ") + read + " of " + pdf.numPages + " pages.";
  out.textContent = [
    "Mrs. Affordable review",
    "Pages in file: " + pdf.numPages,
    "Pages read: " + read,
    "",
    "What the file is",
    findings[0],
    "",
    "Manager corrections",
    findings.slice(1).map((item, n) => (n + 1) + ". " + item).join("\n\n")
  ].join("\n");
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
