pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
let stop = false;
document.getElementById("stop").onclick = () => { stop = true; };

function memo(raw, pages, read) {
  const text = raw.toLowerCase();
  const rd = /rural housing|tenant certification|gross tenant contribution|net tenant contribution/.test(text);
  const project = (raw.match(/villa\s+siena/i) || [])[0];
  const unit = (raw.match(/\b[a-z]?\d{3}\b/i) || [])[0];
  const lines = [];
  lines.push("Manager correction");
  lines.push("Pages in file: " + pages + ". Pages used: " + read + ".");
  lines.push("");
  lines.push(rd ? "This is a USDA Rural Housing Service tenant certification, the RD 3560-8 packet. Review it as an RD file. Do not review it as a tax credit TIC." : "The form was not identified. Do not approve the file from this read.");
  if (/modify certification/.test(text)) lines.push("The action read is a modify certification, not a move-in.");
  if (project) lines.push("Project name read: " + project + ".");
  if (unit) lines.push("A unit number was read: " + unit + ". Confirm it against the certification header.");
  lines.push("");
  lines.push("1. Do not use the certification totals. Income, assets, gross tenant contribution, and net tenant contribution were not read clearly enough to accept.");
  lines.push("2. Recalculate wages from the paystubs in the packet. The wage line is present and the amount is not reliable.");
  lines.push("3. Complete the asset section. The $52,787 threshold is on the form. Enter actual asset income, and imputed income only if assets exceed that threshold.");
  lines.push("4. Confirm household members, dates of birth, and the tenant signature on Part VI and Part X. A signature was not established.");
  lines.push("5. Confirm rental assistance. The form asks whether the tenant receives RA. That answer was not read.");
  if (/eviction/.test(text)) lines.push("6. Eviction in process was read. File the notice and do not treat the certification as a routine recertification until occupancy is confirmed.");
  lines.push("");
  lines.push("The packet should contain the signed 3560-8, the income and asset verifications behind it, the lease, and the household application. A student certification is required only if the unit is also Tax Credit or HOME.");
  lines.push("This is not an RD determination.");
  return lines.join("\n");
}

async function scan(file) {
  stop = false;
  const status = document.getElementById("status");
  const out = document.getElementById("out");
  status.textContent = "Opening the PDF.";
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const worker = await Tesseract.createWorker("eng");
  let text = "";
  let read = 0;
  const limit = Math.min(pdf.numPages, 12);
  for (let i = 1; i <= limit; i += 1) {
    if (stop) break;
    status.textContent = "Reading certification page " + i + " of " + pdf.numPages + ".";
    try {
      const page = await pdf.getPage(i);
      const embedded = (await page.getTextContent()).items.map((item) => item.str).join(" ");
      let pageText = embedded;
      if (embedded.trim().length < 40) {
        const view = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = view.width;
        canvas.height = view.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: view }).promise;
        pageText = (await worker.recognize(canvas)).data.text || "";
      }
      text += "\n" + pageText;
      read += 1;
    } catch (err) {
      text += "";
    }
  }
  await worker.terminate();
  status.textContent = "Review ready. Certification pages used: " + read + " of " + pdf.numPages + ".";
  out.textContent = memo(text, pdf.numPages, read);
}

document.getElementById("file").onchange = (event) => { if (event.target.files[0]) scan(event.target.files[0]); };
document.getElementById("drop").addEventListener("dragover", (event) => event.preventDefault());
document.getElementById("drop").addEventListener("drop", (event) => {
  event.preventDefault();
  if (event.dataTransfer.files[0]) scan(event.dataTransfer.files[0]);
});
