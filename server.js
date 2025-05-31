const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.post("/extract", async (req, res) => {
  const albumURL = req.body.url;
  if (!albumURL) return res.status(400).send("Missing URL");

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(albumURL, { waitUntil: "networkidle2" });
  await page.waitForTimeout(3000);

  // Scroll automático para cargar más fotos
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  }

  const imageLinks = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs
      .map(img => img.src)
      .filter(src => src.includes("googleusercontent.com"));
  });

  await browser.close();
  const unique = [...new Set(imageLinks)];

  res.json({ count: unique.length, images: unique });
});

app.listen(3000, () => {
  console.log("✅ Servidor iniciado en http://localhost:3000");
});
