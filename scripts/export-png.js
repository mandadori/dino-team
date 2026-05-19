#!/usr/bin/env node
/**
 * Export script Dino Team — converte slides HTML em PNGs prontos para Instagram.
 *
 * Uso:
 *   node scripts/export-png.js <pasta-do-post> [--format=carrossel|stories]
 *
 * Fonte de design (detectada automaticamente em design/):
 *   - preview.html existir → extrai section[data-slide] do preview editado no Claude Design
 *   - caso contrário       → renderiza slide-N.html individuais
 *
 * Saída:
 *   <pasta>/export/slide-N.png
 */

import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const FORMATS = {
  carrossel: { width: 1080, height: 1350, label: "carrossel (4:5)" },
  stories: { width: 1080, height: 1920, label: "stories (9:16)" },
};

function parseArgs(argv) {
  const args = argv.slice(2);
  let folder = null;
  let format = null;
  for (const arg of args) {
    if (arg.startsWith("--format=")) {
      format = arg.split("=")[1];
    } else if (!folder) {
      folder = arg;
    }
  }
  return { folder, format };
}

function detectFormat(folderPath) {
  const normalized = folderPath.replace(/\\/g, "/");
  if (normalized.includes("/conteudos/carrossel/")) return "carrossel";
  if (normalized.includes("/conteudos/stories/")) return "stories";
  return null;
}

async function listSlides(designDir) {
  const entries = await readdir(designDir);
  return entries
    .filter((name) => name.match(/^slide-\d+\.html$/i))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0], 10);
      const nb = parseInt(b.match(/\d+/)[0], 10);
      return na - nb;
    });
}

// Extrai e renderiza cada section[data-slide] do preview.html combinado
async function exportFromPreview(browser, previewPath, exportDir, width, height) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(previewPath).href, { waitUntil: "load", timeout: 60000 });
  // Aguarda o bundle do Claude Design terminar de desempacotar o DOM (async pós-DOMContentLoaded)
  await page.waitForSelector("section[data-slide]", { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);

  const slideCount = await page.$$eval("section[data-slide]", (sections) => sections.length);
  if (slideCount === 0) {
    await page.close();
    return 0;
  }

  for (let i = 1; i <= slideCount; i++) {
    // Mostra apenas o slide i, reseta o body para posição 0,0
    await page.evaluate((slideN) => {
      // Aciona modo export do wrapper Dino Team (oculta controles, neutraliza carrossel).
      // Se o preview não usar o wrapper (formato antigo), a classe é inerte — o fallback abaixo cobre.
      document.body.classList.add("export-mode");

      // Oculta todas as sections e labels de slide
      document.querySelectorAll("section[data-slide]").forEach((s) => {
        s.style.display = "none";
      });
      document.querySelectorAll(".slide-label").forEach((l) => {
        l.style.display = "none";
      });
      // Exibe apenas o slide alvo
      const target = document.querySelector(`section[data-slide="${slideN}"]`);
      if (target) target.style.display = "";

      // Fallback para previews antigos sem o wrapper Dino Team:
      document.body.style.cssText = "margin:0;padding:0;overflow:hidden;";
    }, i);

    const pngPath = join(exportDir, `slide-${i}.png`);
    await page.screenshot({
      path: pngPath,
      type: "png",
      clip: { x: 0, y: 0, width, height },
      omitBackground: false,
    });
    console.log(`  slide-${i} (preview.html)  →  slide-${i}.png`);
  }

  await page.close();
  return slideCount;
}

// Renderiza cada slide-N.html individual
async function exportFromIndividuals(browser, slides, designDir, exportDir, width, height) {
  for (const slide of slides) {
    const htmlPath = join(designDir, slide);
    const pngName = slide.replace(/\.html$/i, ".png");
    const pngPath = join(exportDir, pngName);

    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: pngPath,
      type: "png",
      clip: { x: 0, y: 0, width, height },
      omitBackground: false,
    });
    await page.close();
    console.log(`  ${slide}  →  ${pngName}`);
  }
}

async function main() {
  const { folder, format: formatOverride } = parseArgs(process.argv);

  if (!folder) {
    console.error("erro: informe a pasta do post como primeiro argumento");
    console.error("uso:  node scripts/export-png.js <pasta> [--format=carrossel|stories]");
    process.exit(1);
  }

  const postDir = resolve(folder);
  if (!existsSync(postDir)) {
    console.error(`erro: pasta não encontrada: ${postDir}`);
    process.exit(1);
  }

  const designDir = join(postDir, "design");
  if (!existsSync(designDir)) {
    console.error(`erro: subpasta 'design/' não existe em ${postDir}`);
    process.exit(1);
  }

  const format = formatOverride || detectFormat(postDir);
  if (!format || !FORMATS[format]) {
    console.error(
      "erro: formato indefinido. use --format=carrossel ou --format=stories, " +
        "ou coloque a pasta dentro de export/conteudos/carrossel/ ou export/conteudos/stories/"
    );
    process.exit(1);
  }

  const { width, height, label } = FORMATS[format];
  const exportDir = join(postDir, "export");
  await mkdir(exportDir, { recursive: true });

  const previewPath = join(designDir, "preview.html");
  const usePreview = existsSync(previewPath);

  console.log(`formato: ${label}  ·  ${width}x${height}`);
  console.log(`fonte:   ${usePreview ? "preview.html (editado no Claude Design)" : "slide-N.html individuais"}`);
  console.log(`destino: ${exportDir}`);
  console.log("");

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width, height, deviceScaleFactor: 1 },
  });

  try {
    if (usePreview) {
      const count = await exportFromPreview(browser, previewPath, exportDir, width, height);
      if (count === 0) {
        console.error("erro: nenhuma section[data-slide] encontrada em preview.html");
        process.exit(1);
      }
      console.log("");
      console.log(`pronto: ${count} png(s) em ${exportDir}`);
    } else {
      const slides = await listSlides(designDir);
      if (slides.length === 0) {
        console.error(`erro: nenhum slide-N.html encontrado em ${designDir}`);
        process.exit(1);
      }
      console.log(`slides:  ${slides.length}`);
      await exportFromIndividuals(browser, slides, designDir, exportDir, width, height);
      console.log("");
      console.log(`pronto: ${slides.length} png(s) em ${exportDir}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("falha no export:", err.message);
  process.exit(1);
});
