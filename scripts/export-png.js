#!/usr/bin/env node
/**
 * Export script Dino Team — converte slides HTML em PNGs prontos para Instagram.
 *
 * Uso:
 *   node scripts/export-png.js <pasta-do-post> [--format=carrossel|stories]
 *
 * Lê design/slide-N.html e exporta para export/slide-N.png.
 * Valida dimensões e contagem após o export.
 */

import { readdir, mkdir, readFile } from "node:fs/promises";
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

// Lê dimensões do cabeçalho PNG (bytes 16-19 = largura, 20-23 = altura, big-endian uint32)
function readPngDimensions(buffer) {
  if (buffer.length < 24) return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function validateExports(exportDir, slides, expectedWidth, expectedHeight) {
  const errors = [];
  for (const slide of slides) {
    const pngName = slide.replace(/\.html$/i, ".png");
    const pngPath = join(exportDir, pngName);

    if (!existsSync(pngPath)) {
      errors.push(`  ${pngName}: arquivo não gerado`);
      continue;
    }

    const buf = await readFile(pngPath);
    const dims = readPngDimensions(buf);
    if (!dims) {
      errors.push(`  ${pngName}: arquivo inválido ou corrompido`);
      continue;
    }

    if (dims.width !== expectedWidth || dims.height !== expectedHeight) {
      errors.push(
        `  ${pngName}: dimensão inválida ${dims.width}×${dims.height} (esperado ${expectedWidth}×${expectedHeight})`
      );
    }
  }
  return errors;
}

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

  const slides = await listSlides(designDir);
  if (slides.length === 0) {
    console.error(`erro: nenhum slide-N.html encontrado em ${designDir}`);
    process.exit(1);
  }

  console.log(`formato: ${label}  ·  ${width}×${height}`);
  console.log(`slides:  ${slides.length}`);
  console.log(`destino: ${exportDir}`);
  console.log("");

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width, height, deviceScaleFactor: 1 },
  });

  try {
    await exportFromIndividuals(browser, slides, designDir, exportDir, width, height);
  } finally {
    await browser.close();
  }

  const errors = await validateExports(exportDir, slides, width, height);
  if (errors.length > 0) {
    console.error("\nerro: validação falhou:");
    errors.forEach((e) => console.error(e));
    process.exit(1);
  }

  console.log(`\npronto: ${slides.length} png(s) — validados ${width}×${height}`);
}

main().catch((err) => {
  console.error("falha no export:", err.message);
  process.exit(1);
});
