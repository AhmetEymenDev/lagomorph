import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("index.html can run directly from the filesystem", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /<link rel="stylesheet" href="\.\/src\/style\.css"/);
  assert.doesNotMatch(html, /type="module"/);
  assert.doesNotMatch(html, /src="\/src\//);
  assert.match(html, /function chooseBotMove\(/);
  assert.match(html, /class Game/);
  assert.match(html, /id="playerOneName"/);
  assert.match(html, /id="playerTwoName"/);
  assert.match(html, /id="playerOneColor"/);
  assert.match(html, /id="playerTwoColor"/);
  assert.match(html, /function createCaptureEffects\(/);
  assert.match(html, /function drawRabbitMark\(/);
  assert.match(html, /function drawParticles\(/);
  assert.match(html, /requestAnimationFrame\(animationLoop\)/);
  assert.match(html, /function drawCuteBoardDecor\(/);
  assert.match(html, /function drawHappyVictoryRabbit\(/);
  assert.match(html, /function drawRabbitPaws\(/);
  assert.doesNotMatch(html, /NAME_ALIASES/);
  assert.doesNotMatch(html, /resolveDisplayName/);

  const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotMatch(script, /\bimport\b/);
  assert.doesNotThrow(() => new Function(script));
});

test("theme styles keep the game playful and animated", async () => {
  const css = await readFile(new URL("./style.css", import.meta.url), "utf8");

  assert.match(css, /body::before/);
  assert.match(css, /body::after/);
  assert.match(css, /@keyframes float-sprinkles/);
  assert.match(css, /@keyframes panel-bob/);
  assert.match(css, /\.game-shell::before/);
});
