"use strict";
const $ = (s, r = document) => r.querySelector(s);
const root = $("#root");
const SAVE_KEY = "punigo-v1";
const WORLD = { w: 1600, h: 1900 };

const TYPES = ["Fluff", "Spice", "Dream", "Splash", "Bloom"];
const BEATS = { Fluff: "Spice", Spice: "Dream", Dream: "Splash", Splash: "Bloom", Bloom: "Fluff" };
const GLOW = { Everyday: "frosted", "Soft Rare": "blush", Sparkle: "glitter", Dream: "humming", Moon: "moonlit" };
const RCLASS = { Everyday: "r-everyday", "Soft Rare": "r-soft", Sparkle: "r-sparkle", Dream: "r-dream", Moon: "r-moon" };
const RBADGE = { Everyday: "", "Soft Rare": "soft", Sparkle: "sparkle", Dream: "dream", Moon: "moon" };
const RANK = { Everyday: 1, "Soft Rare": 2, Sparkle: 3, Dream: 4, Moon: 5 };
const PUFF = { Everyday: 12, "Soft Rare": 20, Sparkle: 36, Dream: 55, Moon: 80 };
const TRAIT_TEXT = {
  chubby: "Extra fluff. Harder to squish down.",
  bouncy: "Acts first in a squish-off.",
  snuggly: "Hugs heal more.",
  shy: "The first hit sinks in softer.",
  brave: "Squishes a little harder.",
  sparkly: "Sometimes pops a crit."
};
const COLOR_NAME = { classic: "Classic", blush: "Blush", mint: "Mint", golden: "Golden", moonkissed: "Moonkissed" };
const HEROES = [
  { id: "fox", name: "Momo Kitsune", title: "Fox-eared wanderer" },
  { id: "fairy", name: "Sora Pixie", title: "Mint fairy kid" },
  { id: "gnome", name: "Kin Cap", title: "Mushroom gnome" },
  { id: "uni", name: "Niji Kid", title: "Unicorn adventurer" },
  { id: "witch", name: "Hoshi Mage", title: "Galaxy witch" },
  { id: "sakura", name: "Hana Miko", title: "Sakura shrine kid" }
];
const HERO_KIT = {
  fox: { weapon: "Foxfire Fan", skill: "Dash Pounce", fly: false },
  fairy: { weapon: "Dew Wand", skill: "Pixie Lift", fly: true },
  gnome: { weapon: "Acorn Hammer", skill: "Cap Bonk", fly: false },
  uni: { weapon: "Rainbow Horn", skill: "Prism Gallop", fly: true },
  witch: { weapon: "Star Bell", skill: "Star Hop", fly: true },
  sakura: { weapon: "Petal Staff", skill: "Bloom Gust", fly: false }
};
const FOES = [
  { kind: "sour", name: "Sour Blob", emoji: "😈", hp: 2, puff: 8 },
  { kind: "grump", name: "Grump Cap", emoji: "🍄", hp: 3, puff: 12 },
  { kind: "ravel", name: "Ravel Imp", emoji: "🌀", hp: 2, puff: 10 },
  { kind: "drip", name: "Drip Mean", emoji: "💧", hp: 2, puff: 9 },
  { kind: "frost", name: "Frost Nip", emoji: "❄️", hp: 3, puff: 11 }
];
const BIOMES = [
  { id: "park", name: "Sakura Park", filter: "saturate(1.15)", hue: "#ffd0e0" },
  { id: "river", name: "Pearl River", filter: "hue-rotate(40deg) saturate(1.2)", hue: "#9fe4ff" },
  { id: "shrine", name: "Soft Shrine", filter: "sepia(.2) saturate(1.2)", hue: "#ffe08a" },
  { id: "moon", name: "Moon Hill", filter: "brightness(.78) saturate(1.2)", hue: "#cdb4ff" },
  { id: "cafe", name: "Puni Cafe", filter: "sepia(.28) saturate(1.25)", hue: "#f0c9a0" },
  { id: "candy", name: "Candy Grove", filter: "hue-rotate(-20deg) saturate(1.4)", hue: "#ffb7c8" },
  { id: "storm", name: "Storm Path", filter: "brightness(.7) contrast(1.15)", hue: "#8eb6e8" },
  { id: "snow", name: "Powder Trail", filter: "brightness(1.12) saturate(.7)", hue: "#e7f4ff" },
  { id: "fest", name: "Lantern Fest", filter: "saturate(1.35) contrast(1.05)", hue: "#ff8fab" },
  { id: "galaxy", name: "Star Garden", filter: "hue-rotate(210deg) brightness(.8)", hue: "#7a5cff" }
];
const BOSSES = [
  { name: "King Sour", emoji: "👑", hp: 8, puff: 40 },
  { name: "Mama Grump", emoji: "🍄", hp: 9, puff: 44 },
  { name: "River Wraith", emoji: "👻", hp: 10, puff: 48 },
  { name: "Moon Oni", emoji: "🌙", hp: 11, puff: 52 },
  { name: "Cafe Crumb", emoji: "🍪", hp: 10, puff: 50 },
  { name: "Sugar Titan", emoji: "🍭", hp: 12, puff: 56 },
  { name: "Storm King", emoji: "⚡", hp: 13, puff: 60 },
  { name: "Blizzard Bun", emoji: "⛄", hp: 12, puff: 58 },
  { name: "Fest Drake", emoji: "🐉", hp: 14, puff: 66 },
  { name: "Galaxy Queen", emoji: "🌟", hp: 16, puff: 80 }
];
function buildStages() {
  const names = ["Picnic Panic","Puddle Chase","Shrine Shadows","Moon Nibbles","Oven Raid","Lollipop Lane","Thunder Trot","Snowball Sprint","Lantern Rush","Star Snack"];
  return Array.from({ length: 50 }, (_, i) => {
    const n = i + 1;
    const biome = BIOMES[i % BIOMES.length];
    const boss = n % 5 === 0 ? BOSSES[Math.floor((n / 5 - 1) % BOSSES.length)] : null;
    const pack = 2 + Math.min(6, Math.floor(n / 8));
    return {
      n,
      name: (boss ? "BOSS · " : "") + names[i % names.length] + " " + n,
      biome: biome.id,
      place: biome.name,
      foes: pack,
      boss,
      prizePuffs: 12 + n * 2 + (boss ? 30 : 0)
    };
  });
}
const STAGES = buildStages();
function stageOf(n) { return STAGES[(n || 1) - 1] || STAGES[0]; }
function heroOf(id) { return HEROES.find(h => h.id === id) || HEROES[0]; }
function kit() { return HERO_KIT[S.hero || "fox"] || HERO_KIT.fox; }
function canFly() { return !!(S.wings || kit().fly); }
function weaponHTML() {
  return `<svg class="wand" id="wand" viewBox="0 0 28 96" width="30" height="96" aria-hidden="true">
    <rect x="12" y="28" width="5" height="64" rx="2.5" fill="#5c3317"/>
    <rect x="12" y="28" width="5" height="20" rx="2" fill="#d4a017"/>
    <circle cx="14.5" cy="16" r="11" fill="#fff3b0" stroke="#7a5cff" stroke-width="3"/>
    <circle cx="14.5" cy="16" r="5" fill="#ff6b9d"/>
    <path d="M14.5 2 L16.5 12 L14.5 10 L12.5 12 Z" fill="#cdb4ff"/>
  </svg>`;
}
function paintHearts() {
  const el = $("#hearts");
  if (!el) return;
  const h = Math.max(0, Math.min(3, S.hp == null ? 3 : S.hp));
  el.textContent = "♥".repeat(h) + "♡".repeat(3 - h);
}
function heroImg(id, size) {
  const art = (typeof PUNI_HERO !== "undefined" && PUNI_HERO[id]) ? PUNI_HERO[id] : "";
  if (art) return `<img class="heroart" alt="" src="${art}" width="${size}" height="${Math.round(size * 1.75)}" style="width:${size}px;height:${Math.round(size * 1.75)}px;object-fit:contain;background:transparent;filter:drop-shadow(0 12px 8px rgba(74,52,46,.3))">`;
  return `<div class="avatar"><div class="hair"></div><div class="face"></div><div class="body"></div></div>`;
}

const SPECIES = [
  { id: "mochiko", name: "Mochiko", title: "Rice-cake fox", type: "Fluff", rarity: "Everyday", power: "Bounce Barrier", blurb: "Squishes its own cheek when it is happy.", look: "fox", a: "#fff6ee", b: "#ffd6e0", c: "#ff8fab" },
  { id: "sakura", name: "Sakura Puff", title: "Petal sheep", type: "Bloom", rarity: "Everyday", power: "Petal Drift", blurb: "Leaves a trail of soft blossoms.", look: "sheep", a: "#fff0f5", b: "#ffc2d4", c: "#f06292" },
  { id: "yuzu", name: "Yuzu Drop", title: "Citrus jelly", type: "Spice", rarity: "Everyday", power: "Zest Zap", blurb: "Sour in the sweetest way.", look: "citrus", a: "#fff8d6", b: "#ffe08a", c: "#f0a202" },
  { id: "onigiri", name: "Onigiri Oni", title: "Shy rice demon", type: "Fluff", rarity: "Everyday", power: "Filling Fury", blurb: "Gets rounder the more you squeeze.", look: "onigiri", a: "#fffdf8", b: "#f4efe6", c: "#3d6b4f" },
  { id: "kumo", name: "Kumo-kun", title: "Cloud friend", type: "Dream", rarity: "Everyday", power: "Cotton Web", blurb: "A spider made of nap-clouds.", look: "cloud", a: "#f7fbff", b: "#d9ecff", c: "#8eb6e8" },
  { id: "dango", name: "Dango Trio", title: "Stuck together", type: "Fluff", rarity: "Everyday", power: "Stick Together", blurb: "Three snacks, one hug.", look: "dango", a: "#fff", b: "#ffd6e8", c: "#7dcea0" },
  { id: "rei", name: "Raindrop Rei", title: "Puddle mer", type: "Splash", rarity: "Soft Rare", power: "Puddle Portal", blurb: "Slips through a puddle and pops out smiling.", look: "drop", a: "#eef9ff", b: "#b7e4f5", c: "#5dade2" },
  { id: "chili", name: "Chili Bun", title: "Warm spice", type: "Spice", rarity: "Soft Rare", power: "Heat Hug", blurb: "Hugs that leave a happy blush.", look: "chili", a: "#ffe8e0", b: "#ffb199", c: "#e85d4c" },
  { id: "moss", name: "Moss Puff", title: "Park nap", type: "Bloom", rarity: "Soft Rare", power: "Nap Shade", blurb: "A moss cap, a sleepy face.", look: "moss", a: "#f3ffe8", b: "#c6e6a8", c: "#6aaa3a" },
  { id: "pearl", name: "Pearl Otter", title: "River gleam", type: "Splash", rarity: "Soft Rare", power: "River Gleam", blurb: "Keeps a pearl where a tummy should be.", look: "otter", a: "#f4fbff", b: "#d5eef8", c: "#f6c453" },
  { id: "plum", name: "Plum Bun", title: "Dusk mochi", type: "Dream", rarity: "Soft Rare", power: "Plum Nap", blurb: "Sweet, purple, and a little sleepy.", look: "plum", a: "#f8e9ff", b: "#e0b3ff", c: "#9b59b6" },
  { id: "nebula", name: "Nebula Neko", title: "Galaxy cat", type: "Dream", rarity: "Sparkle", power: "Star Nap", blurb: "A night sky that learned to purr.", look: "galaxy", a: "#2c1e6e", b: "#7a5cff", c: "#f6c453" },
  { id: "hanabi", name: "Hanabi Mochi", title: "Sparkler bun", type: "Spice", rarity: "Sparkle", power: "Sparkler Pop", blurb: "Pops into harmless sparkles.", look: "hanabi", a: "#fff5ea", b: "#ffc9a8", c: "#ff5d8f" },
  { id: "snow", name: "Snow Bun", title: "Powder puff", type: "Fluff", rarity: "Sparkle", power: "Powder Puff", blurb: "Cold on the outside, hug on the inside.", look: "snow", a: "#ffffff", b: "#e7f4ff", c: "#9fd3ff" },
  { id: "kitsune", name: "Kitsune Puff", title: "Shrine fox", type: "Fluff", rarity: "Dream", power: "Foxfire Hug", blurb: "Gold ears. A very soft guardian.", look: "kitsune", a: "#fffaf0", b: "#ffe8b8", c: "#e0a106" },
  { id: "jelly", name: "Jelly Dragon", title: "Wiggle wyrm", type: "Splash", rarity: "Dream", power: "Jelly Wave", blurb: "A dragon that jiggles instead of roaring.", look: "jelly", a: "#e8fff8", b: "#9be7c4", c: "#2f8f62" },
  { id: "tsukimochi", name: "Tsukimochi", title: "Moon rabbit", type: "Dream", rarity: "Moon", power: "Full Moon Squeeze", blurb: "Only the moonlit orbs know this one.", look: "moon", a: "#fffdf6", b: "#fff3c4", c: "#f6c453" },
  { id: "matcha", name: "Matcha Mochi", title: "Tea blob", type: "Bloom", rarity: "Everyday", power: "Calm Whisk", blurb: "Smells like a warm cafe.", look: "matcha", a: "#f3ffe8", b: "#b7e07a", c: "#5f8f2d" },
  { id: "taiyaki", name: "Taiyaki Pup", title: "Pastry pup", type: "Spice", rarity: "Everyday", power: "Warm Filling", blurb: "A fish bun that learned to wag.", look: "taiyaki", a: "#fff1dc", b: "#f0b27a", c: "#c46a2d" },
  { id: "manju", name: "Manju Mouse", title: "Tiny bun", type: "Fluff", rarity: "Everyday", power: "Nibble Hug", blurb: "Fits in a pocket. Barely.", look: "manju", a: "#fff8ef", b: "#f5d0b0", c: "#d9896a" },
  { id: "soda", name: "Melon Soda", title: "Fizz drop", type: "Splash", rarity: "Soft Rare", power: "Bubble Rush", blurb: "Pops into harmless green fizz.", look: "soda", a: "#e9fff4", b: "#7ee0b8", c: "#2f8f62" },
  { id: "boba", name: "Boba Bear", title: "Sip buddy", type: "Splash", rarity: "Soft Rare", power: "Pearl Pop", blurb: "Keeps chewy pearls in its tummy.", look: "boba", a: "#fff4ea", b: "#f0c9a0", c: "#6b3f2a" },
  { id: "wagashi", name: "Wagashi Wren", title: "Sweet bird", type: "Bloom", rarity: "Sparkle", power: "Petal Song", blurb: "Sings like a snack box opening.", look: "wren", a: "#fff0f5", b: "#ffc2d4", c: "#e07a9a" },
  { id: "ame", name: "Rainbow Ame", title: "Candy cloud", type: "Dream", rarity: "Sparkle", power: "Sugar Prism", blurb: "A hard-candy sky that went soft.", look: "ame", a: "#fff", b: "#cdb4ff", c: "#ff8fab" },
  { id: "kompeito", name: "Kompeito Kid", title: "Star sugar", type: "Spice", rarity: "Dream", power: "Star Sprinkle", blurb: "Tiny points. Huge personality.", look: "star", a: "#fff7fb", b: "#ffd0e8", c: "#ff5d8f" },
  { id: "moripix", name: "Mori Pixie", title: "Garden spark", type: "Bloom", rarity: "Everyday", power: "Twinkle Dust", blurb: "A pocket fairy that giggles when squeezed.", look: "pixie", a: "#f4ffe8", b: "#d4f5a8", c: "#7dcea0" },
  { id: "clover", name: "Clover Gnome", title: "Lucky cap", type: "Fluff", rarity: "Everyday", power: "Lucky Bonk", blurb: "Trips on its own hat. Still wins hugs.", look: "gnome", a: "#fff6ee", b: "#f0c9a0", c: "#c0392b" },
  { id: "kinoko", name: "Kinoko Gnome", title: "Mushroom hermit", type: "Bloom", rarity: "Soft Rare", power: "Spore Nap", blurb: "Lives under a squishy toadstool.", look: "mushroom", a: "#fff4ea", b: "#ffb3c6", c: "#e74c3c" },
  { id: "starfairy", name: "Hoshi Fairy", title: "Wish light", type: "Dream", rarity: "Sparkle", power: "Stardust Hug", blurb: "Grants tiny wishes. Mostly snacks.", look: "fairy", a: "#fff7ff", b: "#e0b3ff", c: "#f6c453" },
  { id: "nijiuni", name: "Niji Uni", title: "Rainbow unicorn", type: "Dream", rarity: "Dream", power: "Prism Gallop", blurb: "A mochi horse with a glowing swirl horn.", look: "uni", a: "#fffdf8", b: "#cdb4ff", c: "#ff8fab" }
];
const POWERS = {
  mochiko: { dmg: 14, shield: true },
  sakura: { dmg: 16, skip: 0.5 },
  yuzu: { dmg: 30 },
  onigiri: { dmg: 12, heal: 16, grow: 14 },
  kumo: { dmg: 12, web: true },
  dango: { dmg: 8, heal: 28 },
  rei: { dmg: 16, dodge: true },
  chili: { dmg: 18, heal: 14 },
  moss: { dmg: 10, skip: 0.55 },
  pearl: { dmg: 24, heal: 8 },
  plum: { dmg: 14, skip: 0.4, heal: 8 },
  nebula: { dmg: 20, skip: 0.55 },
  hanabi: { dmg: 34, recoil: 6 },
  snow: { dmg: 14, shield: true, heal: 8 },
  kitsune: { dmg: 22, heal: 12 },
  jelly: { dmg: 36 },
  tsukimochi: { dmg: 28, heal: 22, shield: true },
  matcha: { dmg: 12, heal: 16 },
  taiyaki: { dmg: 18, heal: 10 },
  manju: { dmg: 10, heal: 18 },
  soda: { dmg: 16, dodge: true },
  boba: { dmg: 20, heal: 10 },
  wagashi: { dmg: 18, skip: 0.4 },
  ame: { dmg: 22, skip: 0.45 },
  kompeito: { dmg: 26, heal: 10 },
  moripix: { dmg: 12, dodge: true },
  clover: { dmg: 14, heal: 12 },
  kinoko: { dmg: 16, skip: 0.5 },
  starfairy: { dmg: 20, heal: 14, skip: 0.35 },
  nijiuni: { dmg: 26, shield: true, heal: 10 }
};
const PLACES = [
  { id: "den", name: "Your Den", x: 800, y: 1720, icon: "🏠", kind: "den" },
  { id: "cafe", name: "Puni Cafe", x: 800, y: 1040, icon: "✨", kind: "cafe" },
  { id: "shrine", name: "Soft Shrine", x: 400, y: 560, icon: "⛩️", kind: "shrine" },
  { id: "hill", name: "Moon Hill", x: 1180, y: 300, icon: "🌙", kind: "moon" },
  { id: "park", name: "Sakura Park", x: 360, y: 1240, icon: "🌸", kind: "park" },
  { id: "river", name: "Pearl River", x: 1200, y: 1160, icon: "🫧", kind: "river" },
  { id: "arena", name: "Squish Ring", x: 640, y: 880, icon: "⚔️", kind: "arena" }
];
const WEAPON = {
  mochiko: "Mochi Mallet", sakura: "Petal Fan", yuzu: "Zest Star", onigiri: "Nori Cape",
  kumo: "Cotton Web", dango: "Triple Skewer", rei: "Puddle Ring", chili: "Heat Mitt",
  moss: "Nap Cap", pearl: "River Pearl", plum: "Dusk Fan", nebula: "Star Bell",
  hanabi: "Sparkler Wand", snow: "Powder Puff", kitsune: "Foxfire Tail", jelly: "Jelly Whip",
  tsukimochi: "Moon Pestle", matcha: "Tea Whisk", taiyaki: "Warm Tail", manju: "Bun Fist",
  soda: "Fizz Straw", boba: "Pearl Sling", wagashi: "Song Fan", ame: "Candy Prism",
  kompeito: "Star Sugar",
  moripix: "Dew Wand", clover: "Acorn Hammer", kinoko: "Toadstool Shield",
  starfairy: "Wish Wand", nijiuni: "Rainbow Horn"
};
const BLOCKS = [
  { x: 760, y: 1660, w: 90, h: 80 },
  { x: 620, y: 1580, w: 70, h: 40 },
  { x: 920, y: 1600, w: 80, h: 36 },
  { x: 742, y: 980, w: 116, h: 78 },
  { x: 360, y: 500, w: 80, h: 70 },
  { x: 200, y: 700, w: 70, h: 70 },
  { x: 980, y: 620, w: 60, h: 60 },
  { x: 500, y: 860, w: 70, h: 50 },
  { x: 1080, y: 760, w: 70, h: 50 },
  { x: 240, y: 1180, w: 50, h: 50 },
  { x: 1280, y: 200, w: 320, h: 1700 }
];
function blocked(x, y) {
  if (x < 90 || y < 90 || x > WORLD.w - 90 || y > WORLD.h - 90) return true;
  for (const b of BLOCKS) {
    if (x > b.x - 18 && x < b.x + b.w + 18 && y > b.y - 18 && y < b.y + b.h + 18) return true;
  }
  return false;
}
function weatherNow() {
  const h = new Date().getHours();
  if (h >= 19 || h < 6) return "night";
  if (h >= 16) return "dusk";
  const day = today().split("-").reduce((a, n) => a + Number(n), 0);
  return ["sun", "petals", "rain", "sun", "petals"][day % 5];
}

const RIVALS = [
  { id: "hana", name: "Hana", line: "My galaxy cat only naps for winners.", speciesId: "nebula", colorway: "golden", x: 900, y: 820 },
  { id: "ren", name: "Ren", line: "Onigiri Oni is shy. Win, and you may echo it.", speciesId: "onigiri", colorway: "blush", x: 460, y: 1320 },
  { id: "mio", name: "Mio", line: "The river gave me this one.", speciesId: "pearl", colorway: "mint", x: 1160, y: 1240 },
  { id: "okami", name: "Okami", line: "Shrine keeper. Bow, then squish.", speciesId: "kitsune", colorway: "golden", x: 500, y: 620, shrine: true },
  { id: "yuki", name: "Yuki", line: "Niji Uni only gallops for a kind squeeze.", speciesId: "nijiuni", colorway: "moonkissed", x: 720, y: 460 },
  { id: "sora", name: "Sora", line: "My fairy grants snack wishes if you win.", speciesId: "starfairy", colorway: "golden", x: 300, y: 1100 }
];

let gid = 0;
let S = null;
let mode = "title";
let sheet = null;
let joy = { on: false, x: 0, y: 0 };
let keys = {};
let follow = null;
let last = 0;
let shots = [];
let walkBuf = 0;
let saveTimer = 0;
let squeezeTap = null;
let audioOn = false;

const AudioBus = {
  ctx: null,
  ensure() {
    if (S && S.muted) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === "suspended") this.ctx.resume();
    audioOn = true;
  },
  tone(freq, dur, type, gain) {
    if (!this.ctx || (S && S.muted)) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.08, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(); o.stop(this.ctx.currentTime + dur);
  },
  pop() { this.tone(520, 0.08, "sine", 0.07); this.tone(280, 0.12, "triangle", 0.05); },
  ui() { this.tone(640, 0.06, "sine", 0.04); },
  heal() { this.tone(523, 0.1, "sine", 0.05); this.tone(659, 0.14, "sine", 0.05); },
  sparkle() { [880, 1174, 1568].forEach((f, i) => setTimeout(() => this.tone(f, 0.12, "sine", 0.05), i * 70)); },
  legend() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.2, "sine", 0.06), i * 80)); }
};

function uid() { return Math.random().toString(36).slice(2, 9); }
function today() { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
function species(id) { return SPECIES.find(s => s.id === id); }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function rclass(r) { return RCLASS[r] || "r-everyday"; }
function basePath() {
  let p = location.pathname;
  if (p.endsWith("index.html")) p = p.slice(0, -10);
  if (!p.endsWith("/")) p += "/";
  return location.origin + p;
}
function townCount() {
  let n = 0;
  for (const c of today()) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return 16800 + (n % 1800) + Math.min(400, S.squeezesToday || 0);
}
function uniqueCount() { return new Set(S.squishies.map(s => s.speciesId)).size; }
function countOf(id) { return S.squishies.filter(s => s.speciesId === id).length; }
function lead() { return S.squishies.find(s => s.uid === S.lead) || S.squishies[0]; }

function blankSave() {
  return {
    v: 1, name: "", x: 800, y: 1580, puffs: 20, squishies: [], lead: null, orbs: [], inbox: [],
    beaten: {}, echoDay: {}, lastLucky: "", lastMoon: "", lastTown: "", claimed: [],
    squeezesToday: 0, squeezeDate: "", seenCoach: false, muted: false, started: false, hero: "fox",
    walkPuffs: 0, walkDate: "", pity: 0, didSqueeze: false, wins: 0, catches: 0,
    enemies: [], mission: null, wings: false, flyUntil: 0, foesBeat: 0,
    level: 1, activeLevel: 0, prizes: [], hp: 3, hurtUntil: 0
  };
}
function load() {
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) return Object.assign(blankSave(), JSON.parse(raw)); } catch (e) {}
  return blankSave();
}
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
}
function dayReset() {
  const t = today();
  if (S.squeezeDate !== t) { S.squeezeDate = t; S.squeezesToday = 0; }
  if (S.walkDate !== t) { S.walkDate = t; S.walkPuffs = 0; }
}

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  $("#toasts").appendChild(el);
  setTimeout(() => el.remove(), 2400);
}
function burst(colors) {
  const layer = document.createElement("div");
  layer.className = "burst";
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("i");
    p.style.setProperty("--a", (i * 26) + "deg");
    p.style.background = colors[i % colors.length];
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 700);
}
function buzz(p) { if (navigator.vibrate) navigator.vibrate(p || 12); }

function rollTrait(perfects) {
  const traits = [["chubby", 16], ["bouncy", 16], ["snuggly", 16], ["shy", 16], ["brave", 16], ["sparkly", 12 + perfects * 6]];
  let t = traits.reduce((a, x) => a + x[1], 0), r = Math.random() * t;
  for (const x of traits) { r -= x[1]; if (r <= 0) return x[0]; }
  return "bouncy";
}
function rollColorway(perfects, sp) {
  const g = 0.06 + perfects * 0.05, m = 0.035 + perfects * 0.03, r = Math.random();
  let cw = "classic";
  if (r < m) cw = "moonkissed";
  else if (r < m + g) cw = "golden";
  else if (r < m + g + 0.18) cw = "mint";
  else if (r < m + g + 0.36) cw = "blush";
  if (sp && sp.rarity === "Moon" && cw !== "moonkissed") cw = "golden";
  return cw;
}
function makeInstance(sp, score, opt) {
  opt = opt || {};
  const perfects = (score && score.perfects) || 0;
  return {
    uid: uid(),
    speciesId: sp.id,
    nickname: sp.name,
    trait: opt.trait || rollTrait(perfects),
    colorway: opt.colorway || rollColorway(perfects, sp),
    shiny: opt.shiny != null ? opt.shiny : Math.random() < (0.045 + perfects * 0.045),
    bond: 0,
    caughtAt: Date.now()
  };
}
function addInstance(inst) {
  const isNew = !S.squishies.some(s => s.speciesId === inst.speciesId);
  S.squishies.push(inst);
  if (!S.lead) S.lead = inst.uid;
  S.catches++;
  const sp = species(inst.speciesId);
  let puff = PUFF[sp.rarity] + (isNew ? 8 : 0) + (inst.shiny ? 6 : 0);
  S.puffs += puff;
  save();
  return { isNew, puff };
}
function rollSpecies(rarity, bias) {
  let pool = SPECIES.filter(s => s.rarity === rarity);
  if (!pool.length) pool = SPECIES.filter(s => s.rarity === "Everyday");
  if (bias === "river" && rarity === "Soft Rare") pool = pool.concat(pool.filter(s => s.id === "pearl"));
  if (bias === "park" && rarity === "Soft Rare") pool = pool.concat(pool.filter(s => s.id === "moss"));
  if (bias === "park" && rarity === "Everyday") pool = pool.concat(pool.filter(s => s.id === "sakura" || s.id === "moripix"));
  if (bias === "park" && rarity === "Soft Rare") pool = pool.concat(pool.filter(s => s.id === "kinoko"));
  if (bias === "hill" && (rarity === "Dream" || rarity === "Sparkle")) pool = pool.concat(pool.filter(s => s.id === "nijiuni" || s.id === "starfairy"));
  return pool[Math.floor(Math.random() * pool.length)];
}
function rollRarity(zone) {
  const r = Math.random() * 100;
  if (zone === "hill") {
    if (r < 8) return "Moon";
    if (r < 28) return "Dream";
    if (r < 55) return "Sparkle";
    if (r < 80) return "Soft Rare";
    return "Everyday";
  }
  if (r < 0.7) return "Moon";
  if (r < 4.2) return "Dream";
  if (r < 16) return "Sparkle";
  if (r < 42) return "Soft Rare";
  return "Everyday";
}
function speciesFromOrb(orb) {
  if (orb.rarity === "Moon") return Math.random() < 0.62 ? species("tsukimochi") : rollSpecies("Dream", orb.bias);
  return rollSpecies(orb.rarity, orb.bias);
}
function maxFluff(inst) {
  const sp = species(inst.speciesId);
  const base = { Everyday: 80, "Soft Rare": 94, Sparkle: 110, Dream: 128, Moon: 156 }[sp.rarity];
  return base + (inst.trait === "chubby" ? 18 : 0);
}

function squishSVG(sp, inst, size) {
  const id = "g" + (++gid);
  const cw = (inst && inst.colorway) || "classic";
  const shiny = inst && inst.shiny;
  const tint = { blush: "#ff8fab", mint: "#7ddeba", golden: "#f6c453", moonkissed: "#fff6c8" }[cw];
  const eyes = sp.look === "galaxy" || sp.look === "moon"
    ? `<circle cx="46" cy="62" r="8" fill="#1b1030"/><circle cx="74" cy="62" r="8" fill="#1b1030"/><polygon points="46,56 48.2,61 53,61 49.2,64 50.6,69 46,66 41.4,69 42.8,64 39,61 43.8,61" fill="#ffe08a"/><polygon points="74,56 76.2,61 81,61 77.2,64 78.6,69 74,66 69.4,69 70.8,64 67,61 71.8,61" fill="#ffe08a"/>`
    : `<ellipse cx="46" cy="62" rx="9" ry="11" fill="#3a2a28"/><ellipse cx="74" cy="62" rx="9" ry="11" fill="#3a2a28"/><circle cx="49" cy="58" r="3.2" fill="#fff"/><circle cx="77" cy="58" r="3.2" fill="#fff"/>`;
  const blush = `<ellipse cx="34" cy="72" rx="7" ry="4" fill="#ff8fab" opacity="0.55"/><ellipse cx="86" cy="72" rx="7" ry="4" fill="#ff8fab" opacity="0.55"/>`;
  const mouth = sp.look === "onigiri"
    ? `<path d="M54 78 Q60 82 66 78" stroke="#c47a8a" stroke-width="2" fill="none"/>`
    : `<ellipse cx="60" cy="78" rx="5" ry="3.5" fill="#f06292"/>`;
  let extra = "";
  if (sp.look === "fox" || sp.look === "kitsune" || sp.look === "galaxy") {
    extra += `<path d="M34 38 L42 18 L52 40" fill="${sp.a}" stroke="${sp.c}" stroke-width="2"/><path d="M86 38 L78 18 L68 40" fill="${sp.a}" stroke="${sp.c}" stroke-width="2"/>`;
  }
  if (sp.look === "moon") extra += `<ellipse cx="42" cy="22" rx="8" ry="16" fill="${sp.b}"/><ellipse cx="78" cy="22" rx="8" ry="16" fill="${sp.b}"/><path d="M78 28 a10 10 0 1 0 0 16 a7 7 0 1 1 0 -16" fill="${sp.c}"/>`;
  if (sp.look === "sheep") extra += `<circle cx="34" cy="48" r="10" fill="#fff"/><circle cx="86" cy="48" r="10" fill="#fff"/><circle cx="28" cy="58" r="8" fill="#ffe4ee"/>`;
  if (sp.look === "citrus") extra += `<path d="M60 34 Q70 18 78 32" stroke="#6aaa3a" stroke-width="3" fill="none"/><ellipse cx="80" cy="30" rx="7" ry="4" fill="#8ed36a"/>`;
  if (sp.look === "onigiri") extra += `<path d="M28 58 Q20 78 30 96 Q40 70 36 54" fill="#2f5d45"/><path d="M92 50 Q104 74 90 98 Q80 70 86 50" fill="#2f5d45"/><path d="M46 28 L52 16 L58 28" fill="#c9b6e8"/><path d="M74 28 L80 16 L86 28" fill="#c9b6e8"/><ellipse cx="60" cy="88" rx="8" ry="4" fill="#7dcea0"/>`;
  if (sp.look === "dango") extra += `<circle cx="40" cy="40" r="14" fill="#ffb7c8"/><circle cx="60" cy="34" r="14" fill="#fff"/><circle cx="80" cy="40" r="14" fill="#b7e7c9"/>`;
  if (sp.look === "chili") extra += `<path d="M70 30 Q80 18 74 36" stroke="#e85d4c" stroke-width="3" fill="none"/>`;
  if (sp.look === "moss") extra += `<ellipse cx="60" cy="36" rx="28" ry="12" fill="#6aaa3a"/>`;
  if (sp.look === "otter") extra += `<circle cx="60" cy="92" r="8" fill="#f6c453" stroke="#fff" stroke-width="2"/>`;
  if (sp.look === "galaxy") extra += `<circle cx="30" cy="50" r="1.4" fill="#fff"/><circle cx="90" cy="46" r="1.2" fill="#fff"/><circle cx="60" cy="44" r="1.3" fill="#fff"/>`;
  if (sp.look === "hanabi") extra += `<path d="M60 30 L62 18 L64 30 L76 32 L64 34 L62 46 L60 34 L48 32 Z" fill="#ff5d8f"/>`;
  if (sp.look === "snow") extra += `<circle cx="40" cy="36" r="3" fill="#fff"/><circle cx="78" cy="32" r="2.4" fill="#fff"/>`;
  if (sp.look === "jelly") extra += `<path d="M18 70 Q8 50 22 46" stroke="#2f8f62" stroke-width="4" fill="none"/><path d="M102 70 Q112 50 98 46" stroke="#2f8f62" stroke-width="4" fill="none"/>`;
  if (sp.look === "matcha") extra += `<ellipse cx="60" cy="40" rx="16" ry="8" fill="#5f8f2d" opacity="0.35"/><path d="M78 34 Q88 22 84 40" stroke="#5f8f2d" stroke-width="3" fill="none"/>`;
  if (sp.look === "taiyaki") extra += `<ellipse cx="28" cy="74" rx="12" ry="8" fill="${sp.b}"/><ellipse cx="92" cy="74" rx="12" ry="8" fill="${sp.b}"/><circle cx="22" cy="74" r="3" fill="${sp.c}"/><path d="M60 96 Q68 108 76 98" stroke="${sp.c}" stroke-width="3" fill="none"/>`;
  if (sp.look === "manju") extra += `<ellipse cx="60" cy="48" rx="18" ry="10" fill="#fff" opacity="0.5"/><circle cx="40" cy="92" r="5" fill="#fff"/>`;
  if (sp.look === "soda") extra += `<circle cx="44" cy="48" r="4" fill="#fff" opacity="0.8"/><circle cx="70" cy="42" r="3" fill="#fff" opacity="0.7"/><circle cx="86" cy="58" r="2.4" fill="#fff"/>`;
  if (sp.look === "boba") extra += `<circle cx="48" cy="92" r="5" fill="#6b3f2a"/><circle cx="62" cy="96" r="5" fill="#6b3f2a"/><circle cx="74" cy="90" r="4.5" fill="#4a2818"/><rect x="56" y="18" width="8" height="16" rx="3" fill="#ff8fab"/>`;
  if (sp.look === "wren") extra += `<path d="M88 58 Q108 50 96 74" fill="${sp.b}"/><path d="M28 56 Q18 44 34 50" fill="${sp.c}"/><path d="M72 78 L80 86 L72 84" fill="#f6c453"/>`;
  if (sp.look === "ame") extra += `<circle cx="32" cy="50" r="6" fill="#ffb7c8"/><circle cx="88" cy="48" r="6" fill="#9be7c4"/><circle cx="60" cy="36" r="5" fill="#cdb4ff"/>`;
  if (sp.look === "star") extra += `<path d="M60 18 L64 32 L78 34 L66 42 L70 56 L60 48 L50 56 L54 42 L42 34 L56 32 Z" fill="#ffd15c"/>`;
  if (sp.look === "uni") extra += `<path d="M60 16 L65 46 L55 46 Z" fill="#cdb4ff" stroke="#ff8fab" stroke-width="2"/><path d="M26 72 Q10 60 20 90" fill="#cdb4ff"/><path d="M94 72 Q110 60 100 90" fill="#ffd6e8"/>`;
  if (sp.look === "fairy" || sp.look === "pixie") extra += `<ellipse cx="22" cy="66" rx="16" ry="22" fill="#d4f5a8" opacity="0.8"/><ellipse cx="98" cy="66" rx="16" ry="22" fill="#e0b3ff" opacity="0.8"/><path d="M60 14 L63 24 L74 25 L65 32 L68 42 L60 36 L52 42 L55 32 L46 25 L57 24 Z" fill="#f6c453"/>`;
  if (sp.look === "gnome") extra += `<path d="M34 50 L60 6 L86 50 Z" fill="#c0392b"/><ellipse cx="60" cy="50" rx="20" ry="7" fill="#e74c3c"/>`;
  if (sp.look === "mushroom") extra += `<ellipse cx="60" cy="38" rx="36" ry="20" fill="#e74c3c"/><circle cx="44" cy="34" r="6" fill="#fff"/><circle cx="70" cy="30" r="5" fill="#fff"/><circle cx="58" cy="44" r="4" fill="#fff"/>`;
  if (shiny) extra += `<circle cx="24" cy="40" r="2.4" fill="#ffe08a"/><circle cx="96" cy="44" r="2.2" fill="#fff"/><circle cx="88" cy="32" r="1.6" fill="#fff6c8"/>`;
  const overlay = tint ? `<ellipse cx="60" cy="78" rx="40" ry="34" fill="${tint}" opacity="0.28"/>` : "";
  return `<svg class="sq jiggle ${shiny ? "shiny" : ""}" viewBox="0 0 120 130" width="${size}" height="${size}" aria-hidden="true">
    <defs><radialGradient id="${id}" cx="40%" cy="35%"><stop offset="0" stop-color="#fff"/><stop offset="0.35" stop-color="${sp.a}"/><stop offset="1" stop-color="${sp.b}"/></radialGradient></defs>
    <ellipse cx="60" cy="118" rx="26" ry="5" fill="rgba(90,70,60,0.16)">
      <animate attributeName="rx" values="26;20;26" dur="0.9s" repeatCount="indefinite"/>
    </ellipse>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 -7; 0 0" dur="0.9s" repeatCount="indefinite"/>
      <g>
        <animateTransform attributeName="transform" type="scale" additive="sum" values="1 1; 1.1 0.88; 1 1" dur="0.9s" repeatCount="indefinite"/>
        <ellipse cx="60" cy="74" rx="44" ry="40" fill="url(#${id})"/>
        <ellipse cx="44" cy="58" rx="14" ry="8" fill="#fff" opacity="0.35"/>
        ${overlay}${extra}${eyes}${blush}${mouth}
        <circle cx="92" cy="40" r="3" fill="#fff" opacity="0.9">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.1s" repeatCount="indefinite"/>
        </circle>
      </g>
    </g>
  </svg>`;
}

function faceHTML(sp, inst, size) {
  const art = (typeof PUNI_ART !== "undefined" && PUNI_ART[sp.id]) ? PUNI_ART[sp.id] : "";
  if (art) {
    return `<img class="faceart" alt="" src="${art}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:${Math.max(18, size / 7)}px;box-shadow:0 10px 18px rgba(74,52,46,.18)">`;
  }
  return squishSVG(sp, inst, size);
}

function mount(html) { root.innerHTML = html; }
function toastPuffs(n) { if (n) toast("+" + n + " puffs"); }

function showTitle() {
  mode = "title";
  const cont = S.started;
  mount(`<div class="screen title">
    <div class="title-sky">
      <div class="float-orb"></div><div class="float-orb"></div><div class="float-orb"></div><div class="float-orb"></div>
      <i class="spark" style="left:20%;top:24%"></i><i class="spark" style="left:78%;top:30%;animation-delay:.4s"></i>
      <i class="spark" style="left:30%;top:70%;animation-delay:.8s"></i>
    </div>
    <div class="kid-chip">colorful · cute · collect them all</div>
    ${S.hero ? `<div class="pop">${heroImg(S.hero, 120)}</div>` : ""}
    <h1 class="wordmark">Puni <span>Go</span></h1>
    <p class="tag">Squeeze first. Ask later.</p>
    <button class="orb-btn" id="start" aria-label="Squeeze to begin"><i></i></button>
    <div class="hint">${cont ? "Squeeze to continue" : "Squeeze the big orb"}</div>
    <p class="tiny">Mystery orbs. Cute squishies. You will not know what pops out.</p>
    ${cont ? `<button class="linkish" id="reset">Start a new town</button>` : ""}
  </div>`);
  $("#start").onclick = () => { AudioBus.ensure(); AudioBus.pop(); buzz(12); cont ? enterMap() : askName(); };
  const reset = $("#reset");
  if (reset) reset.onclick = () => { if (confirm("Release this town's squishies on this phone?")) { S = blankSave(); save(); showTitle(); } };
}

function askName() {
  mode = "name";
  const picks = HEROES.map(h => `<button class="card heropick ${S.hero === h.id ? "on" : ""}" data-hero="${h.id}">${heroImg(h.id, 92)}<small>${esc(h.name)}</small></button>`).join("");
  mount(`<div class="screen title"><div class="panel">
    <h2>Who walks the town?</h2>
    <p>Pick a kawaii look. You can change it later in your den.</p>
    <div class="grid">${picks}</div>
    <input class="field" id="name" maxlength="16" value="${esc(S.name || "")}" placeholder="Your name">
    <button class="btn primary wide" id="go">That's me</button>
  </div></div>`);
  const input = $("#name");
  root.querySelectorAll("[data-hero]").forEach(b => b.onclick = () => {
    S.hero = b.dataset.hero;
    root.querySelectorAll("[data-hero]").forEach(x => x.classList.toggle("on", x === b));
    AudioBus.ui();
  });
  $("#go").onclick = () => {
    S.name = (input.value || heroOf(S.hero).name.split(" ")[0]).trim().slice(0, 16);
    S.hero = S.hero || "fox";
    save();
    AudioBus.ui();
    if (S.started) { enterMap(); return; }
    showStarter();
  };
}

function showStarter() {
  mode = "starter";
  mount(`<div class="screen title"><div class="panel">
    <h2>Pick an orb</h2>
    <p>Three frosted orbs. You do not get to know which squishy is waiting.</p>
    <div class="starter-row">
      <button class="mini-orb" data-i="0" aria-label="Left orb"></button>
      <button class="mini-orb" data-i="1" aria-label="Middle orb"></button>
      <button class="mini-orb" data-i="2" aria-label="Right orb"></button>
    </div>
    <p class="tiny">A perfect squeeze comes out luckier. You will catch it either way.</p>
  </div></div>`);
  root.querySelectorAll(".mini-orb").forEach(b => b.onclick = () => starterSqueeze());
}

async function starterSqueeze() {
  const score = await playSqueeze("Everyday", true);
  const lucky = Math.random() < 0.08;
  const sp = lucky ? species("rei") : species(["mochiko", "sakura", "yuzu"][Math.floor(Math.random() * 3)]);
  const inst = makeInstance(sp, score);
  const info = addInstance(inst);
  S.started = true;
  S.x = 800; S.y = 1580;
  seedOrbs();
  seedAdventure();
  await reveal(inst, info, "Your first squishy");
  enterMap();
}

function seedAdventure() {
  if (!S.mission) {
    S.mission = { id: "parkspoil", title: "Chase the spoilers", blurb: "Sour Blobs are stealing picnic puffs.", need: 3, have: 0, done: false, prize: "Fairy Wings" };
  }
  if (!S.activeLevel) {
    if (!(S.enemies || []).length || S.enemies.length > 3) seedEnemies();
  }
}
function makeFoe(kind, x, y) {
  return {
    id: uid(), kind: kind.kind, name: kind.name, emoji: kind.emoji,
    hp: kind.hp, max: kind.hp, puff: kind.puff, x, y, homeX: x, homeY: y
  };
}
function seedEnemies() {
  const cx = S.x || 800, cy = S.y || 1580;
  const spots = [[-180, -30], [190, 40], [10, -200]];
  S.enemies = spots.map((off, i) => makeFoe(FOES[i % FOES.length], cx + off[0], cy + off[1]));
}
function spawnOneFar() {
  if (mode !== "map" || S.activeLevel || (S.enemies || []).length >= 3) return;
  const ang = Math.random() * Math.PI * 2;
  const r = 240;
  S.enemies.push(makeFoe(FOES[Math.floor(Math.random() * FOES.length)], S.x + Math.cos(ang) * r, S.y + Math.sin(ang) * r));
  drawFoes();
}
function seedOrbs() {
  S.orbs = [
    { id: uid(), x: 800, y: 1460, rarity: "Everyday", bias: null },
    { id: uid(), x: 680, y: 1500, rarity: "Soft Rare", bias: null },
    { id: uid(), x: 900, y: 1340, rarity: "Sparkle", bias: null }
  ];
  for (let i = 0; i < 5; i++) addOrb(randomSpot());
}
function randomSpot() {
  const zones = [
    { x: 800, y: 1200, bias: null },
    { x: 400, y: 1180, bias: "park" },
    { x: 1200, y: 1120, bias: "river" },
    { x: 480, y: 700, bias: null },
    { x: 1100, y: 460, bias: "hill" },
    { x: 700, y: 900, bias: null }
  ];
  const z = zones[Math.floor(Math.random() * zones.length)];
  return {
    x: Math.max(120, Math.min(1480, z.x + (Math.random() * 200 - 100))),
    y: Math.max(140, Math.min(1780, z.y + (Math.random() * 160 - 80))),
    bias: z.bias
  };
}
function addOrb(spot, rarity) {
  S.orbs.push({ id: uid(), x: spot.x, y: spot.y, rarity: rarity || rollRarity(spot.bias === "hill" ? "hill" : null), bias: spot.bias || null });
}
function topUpOrbs() {
  while (S.orbs.length < 7) addOrb(randomSpot());
}

function playSqueeze(rarity, firstHint) {
  return new Promise(resolve => {
    const beats = RANK[rarity] >= 3 ? 4 : 3;
    let i = 0, perfects = 0, goods = 0, misses = 0, running = true, start = 0;
    const hint = !S.didSqueeze || firstHint ? "You will catch it. Perfect squeezes come out luckier." : "Squeeze when the rings kiss.";
    const ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = `<div class="tag">${esc(GLOW[rarity])} orb</div>
      <h2 style="margin:6px 0">Squeeze</h2>
      <div class="squeeze-stage">
        <div class="target-ring"></div>
        <div class="ring"></div>
        <button class="orb-hit ${rclass(rarity)}" id="hit" aria-label="Squeeze"></button>
      </div>
      <div class="flash" id="flash">${esc(hint)}</div>
      <div class="beats" id="beats">${Array.from({ length: beats }, () => "<i></i>").join("")}</div>`;
    root.appendChild(ov);
    const ring = ov.querySelector(".ring");
    const flash = ov.querySelector("#flash");
    const dots = [...ov.querySelectorAll(".beats i")];
    function frame(t) {
      if (!running) return;
      if (!start) start = t;
      const p = ((t - start) % 1150) / 1150;
      const scale = 1.42 - p * 0.72;
      ring.style.transform = `scale(${scale})`;
      ring._scale = scale;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    function tap() {
      const s = ring._scale || 1;
      AudioBus.pop(); buzz(10);
      ov.querySelector(".orb-hit").classList.remove("squashing");
      void ov.querySelector(".orb-hit").offsetWidth;
      ov.querySelector(".orb-hit").classList.add("squashing");
      if (s >= 0.94 && s <= 1.12) { perfects++; flash.textContent = "Perfect puni!"; }
      else if (s >= 0.8 && s <= 1.28) { goods++; flash.textContent = "Soft!"; }
      else { misses++; flash.textContent = "A little early"; }
      if (dots[i]) dots[i].classList.add("on");
      i++;
      if (i >= beats) {
        running = false;
        squeezeTap = null;
        S.didSqueeze = true;
        S.squeezesToday = (S.squeezesToday || 0) + 1;
        setTimeout(() => { ov.remove(); resolve({ perfects, goods, misses }); }, 280);
      }
    }
    squeezeTap = tap;
    ov.querySelector("#hit").addEventListener("pointerdown", e => { e.preventDefault(); tap(); });
  });
}

function reveal(inst, info, title) {
  return new Promise(resolve => {
    const sp = species(inst.speciesId);
    if (sp.rarity === "Moon" || sp.rarity === "Dream") AudioBus.legend();
    else if (RANK[sp.rarity] >= 3 || inst.shiny) AudioBus.sparkle();
    else AudioBus.pop();
    burst(sp.rarity === "Moon" ? ["#fff3c4", "#f6c453", "#fff"] : ["#ffb7c8", "#fff", "#cdb4ff", "#9be7c4"]);
    const ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = `<style>@keyframes spin{to{transform:rotate(360deg)}}@keyframes orbit{from{transform:rotate(0deg) translateX(96px)}to{transform:rotate(360deg) translateX(96px)}}@keyframes popIn{0%{transform:scale(.15)}60%{transform:scale(1.16)}100%{transform:scale(1)}}.pop{animation:popIn .55s cubic-bezier(.2,1.4,.4,1)}</style>
      <div class="gotcha">${info.isNew ? "PUNI GET!" : "TWIN PUNI!"}</div>
      <div class="tag">${esc(title || (info.isNew ? "New squishy" : "A twin"))}</div>
      <div class="pop reveal-stage" style="position:relative;width:220px;height:220px;display:grid;place-items:center">
        <i style="position:absolute;inset:-8px;border-radius:50%;border:3px dashed #ff8fab;animation:spin 4s linear infinite"></i>
        <i style="position:absolute;width:14px;height:14px;background:#ffd15c;border-radius:50%;top:8px;left:50%;animation:orbit 1.6s linear infinite"></i>
        <i style="position:absolute;width:10px;height:10px;background:#cdb4ff;border-radius:50%;bottom:12px;left:18px;animation:orbit 2s linear infinite reverse"></i>
        ${faceHTML(sp, inst, 200)}
      </div>
      <h2 style="margin:8px 0 4px">${esc(inst.nickname)}</h2>
      <div>${badge(sp.rarity)} ${typePill(sp.type)}</div>
      <p class="muted" style="margin:8px 0">${esc(sp.title)} · ${esc(COLOR_NAME[inst.colorway])} · ${esc(inst.trait)}${inst.shiny ? " · shiny squeeze" : ""}</p>
      <p style="font-weight:800;margin:0 0 12px">${esc(sp.blurb)} Power: ${esc(sp.power)}.</p>
      <p class="tiny" style="margin-top:0">+${info.puff} puffs</p>
      <p class="hint">Tap the pink button to walk the town</p>
      <div class="row" style="width:min(420px,100%)">
        <button class="btn ghost" id="send">Send a mystery</button>
        <button class="btn primary" id="keep">Play the map</button>
      </div>`;
    root.appendChild(ov);
    function goPlay() {
      if (!ov.parentNode) return;
      ov.remove();
      resolve();
    }
    const send = $("#send", ov);
    const keep = $("#keep", ov);
    if (send) send.addEventListener("pointerup", e => { e.preventDefault(); e.stopPropagation(); shareMystery(); });
    if (keep) keep.addEventListener("pointerup", e => { e.preventDefault(); e.stopPropagation(); goPlay(); });
    ov.addEventListener("pointerup", e => {
      if (e.target && e.target.closest && e.target.closest("#send")) return;
      goPlay();
    });
    setTimeout(goPlay, 4200);
  });
}
function badge(r) { return `<span class="rarity ${RBADGE[r] || ""}">${esc(r)}</span>`; }
function typePill(t) { return `<span class="type">${esc(t)}</span>`; }

function enterMap() {
  mode = "map";
  sheet = null;
  dayReset();
  if (S.started && S.orbs.length < 4) topUpOrbs();
  seedAdventure();
  const flying = Date.now() < (S.flyUntil || 0);
  mount(`<div class="screen map" id="map">
    <div class="world" id="world">
      ${mapArt()}
      <div id="pins"></div>
      <div id="orbs"></div>
      <div id="hazards"></div>
      <div id="foes" style="position:absolute;inset:0;z-index:9"></div>
      <div id="bolts" style="position:absolute;inset:0;z-index:11;pointer-events:none"></div>
      <div class="player ${flying ? "flying" : ""}" id="player"><div class="wings"></div>${weaponHTML()}<div class="shoulder" id="shoulder"></div><i class="feet"></i><div class="avatar">${heroImg(S.hero || "fox", 78)}</div></div>
    </div>
    <div class="petals" id="petals">${Array.from({length: 16}, (_, i) => `<i class="petal" style="left:${4 + i * 6}%;animation-delay:${i * 0.4}s;background:${['#ffb7c8','#cdb4ff','#fff','#ffd15c','#9fe4ff'][i%5]}"></i>`).join("")}</div>
    <div class="wx water" id="water"></div>
    <div class="hud">
      <button class="pill" id="about">${esc(S.name || "Trainer")} · ${uniqueCount()}/${SPECIES.length}</button>
      <button class="pill" id="quest">${S.mission && !S.mission.done ? "Mission " + S.mission.have + "/" + S.mission.need : canFly() ? "Wings ready" : "Mission"}</button>
      <button class="pill" id="hearts">${"♥".repeat(S.hp || 3)}${"♡".repeat(Math.max(0, 3 - (S.hp || 3)))}</button>
      <button class="pill" id="puffs">${S.puffs} puffs</button>
    </div>
    <div class="joy" id="joy"><i id="knob"></i></div>
    <div class="wx" id="wx"></div>
    <button class="glow-btn" id="glow">Zap</button>
    <button class="glow-btn" id="flybtn" style="bottom:calc(var(--nav) + var(--safe-b) + 168px);background:linear-gradient(180deg,#e0b3ff,#7a5cff);color:#fff">${canFly() ? "Fly" : "Wings?"}</button>
    <button class="glow-btn" id="fight" style="bottom:calc(var(--nav) + var(--safe-b) + 108px);background:linear-gradient(180deg,#fff3c4,#f6c453);color:#6a4b16">Battle</button>
    <button class="btn primary action" id="action" hidden>Squeeze</button>
    ${S.pendingDuel ? `<div class="coach" id="duelcoach"><b>${esc(S.pendingDuel.name)} challenged you!</b><span class="muted">Tap Battle to fight their ${esc(species(S.pendingDuel.speciesId).name)}. They keep theirs. You can win an echo.</span><div style="margin-top:8px"><button class="btn gold" id="acceptduel">Fight now</button></div></div>` : ""}
    <div class="coach" id="missionbar" style="top:58px;bottom:auto"><b>Mission 1/50</b><span class="muted">Zap the 3 pests. A new world opens.</span></div>
    <nav class="nav" id="nav">
      <button data-tab="map" class="on">🗺️<span>Map</span></button>
      <button data-tab="dex">📒<span>Dex</span></button>
      <button data-tab="capsule">✨<span>Capsule</span></button>
      <button data-tab="gifts">🎁<span>Gifts</span></button>
      <button data-tab="den">🏠<span>Den</span></button>
    </nav>
  </div>`);
  drawPins();
  drawOrbs();
  drawHazards();
  drawFoes();
  drawShoulder();
  bindMap();
  paintGiftDot();
  paintQuest();
  paintHearts();
  if (!S.activeLevel) startLevel(Math.min(50, S.level || 1));
  paintQuest();
  const acc = $("#acceptduel");
  if (acc) acc.onclick = () => { AudioBus.ui(); demoBattle(); };
}

function mapArt() {
  const painted = (typeof PUNI_SCENE !== "undefined" && PUNI_SCENE.map) ? PUNI_SCENE.map : "";
  const fire = Array.from({ length: 16 }, (_, i) =>
    `<i class="fly" style="left:${8 + (i * 11) % 84}%;top:${12 + (i * 17) % 70}%;animation-delay:${(i % 8) * 0.35}s"></i>`
  ).join("");
  const life = `<div class="life">
    ${fire}
    <i class="lantern" style="left:210px;top:1480px"></i>
    <i class="lantern" style="left:1080px;top:1500px"></i>
    <i class="lantern" style="left:360px;top:540px"></i>
    <i class="lantern" style="left:1180px;top:360px"></i>
    <i class="koi" style="left:1320px;top:980px"></i>
    <i class="koi late" style="left:1400px;top:1240px"></i>
    <i class="bloom" style="left:280px;top:1180px"></i>
    <i class="bloom" style="left:430px;top:1280px"></i>
    <i class="bloom" style="left:200px;top:1320px"></i>
  </div>`;
  if (painted) {
    return `<img class="mapart painted" id="mapbg" src="${painted}" width="1600" height="1900" alt="">${life}`;
  }
  const trees = [
    [160,720],[240,640],[980,640],[640,480],[520,860],[1080,780],[200,980],[1440,700],
    [420,300],[700,260],[1500,980],[180,1500],[1040,1500],[1400,1560],[240,1700]
  ].map(([x,y], i) => {
    const c = i % 3 === 0 ? "#7edc8a" : i % 3 === 1 ? "#67c97a" : "#8ee39a";
    return `<g>
      <ellipse cx="${x}" cy="${y + 28}" rx="16" ry="6" fill="rgba(74,52,46,0.12)"/>
      <circle cx="${x}" cy="${y}" r="28" fill="${c}"/>
      <circle cx="${x - 16}" cy="${y + 8}" r="16" fill="#9be7a8"/>
      <rect x="${x - 4}" y="${y + 20}" width="8" height="16" rx="3" fill="#c9855a"/>
    </g>`;
  }).join("");
  return `${life}<svg class="mapart" viewBox="0 0 1600 1900" width="1600" height="1900">
    <defs>
      <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c8f08a"/><stop offset="0.55" stop-color="#9ed85a"/><stop offset="1" stop-color="#7ec44a"/>
      </linearGradient>
      <linearGradient id="river" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7ad7ff"/><stop offset="1" stop-color="#4ec3f5"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="1900" fill="url(#grass)"/>
    <ellipse cx="280" cy="360" rx="260" ry="130" fill="#dff6cf" opacity="0.7"/>
    <ellipse cx="1180" cy="240" rx="280" ry="120" fill="#d3eebf"/>
    <path d="M1280 0 C 1460 280 1180 520 1360 820 C 1520 1100 1180 1320 1360 1620 C 1460 1760 1320 1860 1280 1900 L 1600 1900 L 1600 0 Z" fill="url(#river)"/>
    <path d="M1360 200 C 1420 360 1280 480 1380 700" stroke="#e9f7ff" stroke-width="14" fill="none" opacity="0.7"/>
    <circle cx="1320" cy="1180" r="8" fill="#fff" opacity="0.55"/><circle cx="1410" cy="980" r="6" fill="#fff" opacity="0.5"/>
    <path d="M800 1800 C 800 1500 780 1280 800 1040 C 820 820 760 640 560 540" stroke="#f8e3b8" stroke-width="64" fill="none" stroke-linecap="round"/>
    <path d="M800 1040 C 980 980 1120 860 1180 420" stroke="#f8e3b8" stroke-width="52" fill="none" stroke-linecap="round"/>
    <path d="M760 1280 C 520 1260 400 1260 340 1240" stroke="#f8e3b8" stroke-width="46" fill="none" stroke-linecap="round"/>
    <ellipse cx="1180" cy="280" rx="160" ry="74" fill="#b7e27a"/>
    <circle cx="1180" cy="196" r="40" fill="#fff6c8" stroke="#ffd15c" stroke-width="8"/>
    <circle cx="1194" cy="184" r="8" fill="#fff" opacity="0.7"/>
    <circle cx="300" cy="1180" r="28" fill="#ffd0e0"/><circle cx="340" cy="1140" r="20" fill="#ffb7c8"/><circle cx="250" cy="1220" r="18" fill="#ffc2d4"/>
    <circle cx="520" cy="1100" r="24" fill="#ffd0e0"/><circle cx="200" cy="1320" r="22" fill="#ffd6e4"/>
    <circle cx="430" cy="1280" r="14" fill="#cdb4ff"/>
    <rect x="736" y="968" width="128" height="92" rx="22" fill="#fff" stroke="#ff8fab" stroke-width="5"/>
    <path d="M720 982 Q800 912 880 982" fill="#ff6b9d"/>
    <rect x="776" y="1004" width="22" height="28" rx="6" fill="#9fe4ff"/>
    <rect x="808" y="1004" width="22" height="28" rx="6" fill="#9fe4ff"/>
    <rect x="754" y="1648" width="92" height="82" rx="28" fill="#fff" stroke="#ffd15c" stroke-width="5"/>
    <path d="M768 1656 h64" stroke="#ff8fab" stroke-width="6" stroke-linecap="round"/>
    <path d="M332 508 h96 M348 472 h68 M360 430 h48" stroke="#e07a9a" stroke-width="10" stroke-linecap="round"/>
    <path d="M360 540 L400 430 L440 540 Z" fill="#fff" stroke="#c9b6ff" stroke-width="5"/>
    <rect x="388" y="500" width="24" height="40" fill="#ffd15c"/>
    ${trees}
    <ellipse cx="360" cy="1288" rx="70" ry="18" fill="#fff" opacity="0.35"/>
  </svg>`;
}

function drawPins() {
  const box = $("#pins");
  if (!box) return;
  box.innerHTML = PLACES.map(p => `<button class="pin" data-place="${p.id}" style="left:${p.x}px;top:${p.y}px"><span class="bubble">${p.icon}</span><b>${esc(p.name)}</b></button>`).join("")
    + RIVALS.map(r => `<button class="rival" data-rival="${r.id}" style="left:${r.x}px;top:${r.y}px"><span class="bubble">${squishSVG(species(r.speciesId), { colorway: r.colorway }, 36)}</span><b>${esc(r.name)}</b></button>`).join("");
  box.querySelectorAll("[data-place]").forEach(b => b.onclick = () => walkToPlace(b.dataset.place));
  box.querySelectorAll("[data-rival]").forEach(b => b.onclick = () => walkToRival(b.dataset.rival));
}
function drawOrbs() {
  const box = $("#orbs");
  if (!box) return;
  box.innerHTML = S.orbs.map(o => `<button class="orb ${rclass(o.rarity)}" data-orb="${o.id}" style="left:${o.x}px;top:${o.y}px" aria-label="${esc(GLOW[o.rarity])} orb"><span></span></button>`).join("");
  box.querySelectorAll(".orb").forEach(b => b.onclick = () => walkToOrb(b.dataset.orb));
}
function drawHazards() {
  const box = $("#hazards");
  if (!box) return;
  box.innerHTML = BLOCKS.filter(b => b.w < 280).map(b =>
    `<i style="position:absolute;left:${b.x}px;top:${b.y}px;width:${Math.max(36, b.w)}px;height:${Math.max(28, b.h)}px;border-radius:46%;background:radial-gradient(circle at 30% 30%,#c4a574,#6b4a2e);box-shadow:0 8px 0 rgba(60,40,20,.25);z-index:2;pointer-events:none"></i>`
  ).join("");
}
function foeSVG(f) {
  const art = (typeof PUNI_FOE !== "undefined" && PUNI_FOE[f.kind]) ? PUNI_FOE[f.kind] : "";
  const n = f.boss ? 96 : 78;
  if (art) return `<img class="foeart" alt="" src="${art}" width="${n}" height="${n}" style="width:${n}px;height:${n}px;object-fit:contain;background:transparent;filter:drop-shadow(0 8px 8px rgba(70,40,30,.28))">`;
  return `<div style="width:${n}px;height:${n}px;border-radius:50%;background:#cdb4ff"></div>`;
}
function drawFoes() {
  const box = $("#foes");
  if (!box) return;
  box.innerHTML = (S.enemies || []).map(f =>
    `<button class="foe ${f.boss ? "boss" : ""}" data-foe="${f.id}" style="position:absolute;left:${f.x}px;top:${f.y}px;transform:translate(-50%,-50%);z-index:10;border:0;background:transparent;animation:bob 0.9s ease-in-out infinite">
      ${foeSVG(f)}
      <b style="display:block;margin-top:-4px;background:#fff;border-radius:8px;font-size:10px;padding:1px 6px">${esc(f.name)}</b>
    </button>`
  ).join("");
  box.querySelectorAll("[data-foe]").forEach(b => b.onclick = () => fireWand(b.dataset.foe));
}
function nearestFoe() {
  return [...(S.enemies || [])].sort((a, b) => dist(S.x, S.y, a.x, a.y) - dist(S.x, S.y, b.x, b.y))[0] || null;
}
function fireWand(id) {
  if (mode !== "map") return;
  if (S._cool && Date.now() < S._cool) return;
  const f = (id && (S.enemies || []).find(x => x.id === id)) || nearestFoe();
  if (!f) { toast("No pest in sight"); return; }
  if (dist(S.x, S.y, f.x, f.y) > 280) { toast("A little closer"); follow = { x: f.x, y: f.y, then: () => fireWand(f.id) }; return; }
  S._cool = Date.now() + 260;
  shots.push({ x: S.x + 18, y: S.y - 54, tx: f.x, ty: f.y - 10, tid: f.id, t: 0 });
  AudioBus.pop();
  buzz(10);
  const wand = $("#wand");
  if (wand) { wand.classList.remove("cast"); void wand.offsetWidth; wand.classList.add("cast"); }
}
function walkToFoe(id) {
  fireWand(id);
}
function hitFoe(id) {
  const f = (S.enemies || []).find(x => x.id === id);
  if (!f || mode !== "map") return;
  const k = kit();
  f.hp -= 1;
  const ang = Math.atan2(f.y - S.y, f.x - S.x);
  f.x += Math.cos(ang) * 38;
  f.y += Math.sin(ang) * 38;
  AudioBus.pop();
  buzz(16);
  toast(k.weapon + "! " + f.hp + "/" + f.max);
  burst(["#fff", "#cdb4ff", "#ffd15c"]);
  if (f.hp <= 0) {
    S.puffs += f.puff;
    S.foesBeat = (S.foesBeat || 0) + 1;
    S.enemies = S.enemies.filter(x => x.id !== f.id);
    if (S.mission && !S.mission.done) {
      S.mission.have = Math.min(S.mission.need, S.mission.have + 1);
      if (S.mission.have >= S.mission.need) {
        S.mission.done = true;
        S.wings = true;
        S.puffs += 40;
        toast("First mission clear! Fairy wings unlocked.");
        AudioBus.sparkle();
        burst(["#cdb4ff", "#fff", "#ffb7c8"]);
      }
    }
    paintPuffs();
    paintQuest();
    if (S.activeLevel && S.enemies.length === 0) winLevel(S.activeLevel);
    else if (!S.activeLevel && S.enemies.length < 3) setTimeout(spawnOneFar, 1800);
  }
  save();
  drawFoes();
}
function hurtPlayer() {
  if (Date.now() < (S.hurtUntil || 0)) return;
  S.hp = Math.max(0, (S.hp == null ? 3 : S.hp) - 1);
  S.hurtUntil = Date.now() + 1100;
  AudioBus.hit ? AudioBus.hit() : AudioBus.pop();
  buzz(24);
  toast("Nipped! " + S.hp + " hearts");
  paintHearts();
  const pl = $("#player");
  if (pl) { pl.classList.add("hurt"); setTimeout(() => pl.classList.remove("hurt"), 400); }
  if (S.hp <= 0) failLevel();
}
function failLevel() {
  const n = S.activeLevel || S.level || 1;
  S.enemies = [];
  S.activeLevel = 0;
  drawFoes();
  showSheet("Downed!", `
    <p>The pests piled on. Hearts gone.</p>
    <p class="muted">Mission ${n} is still waiting. Walk, zap, don't stand still.</p>
    <button class="btn gold wide" id="retry">Try mission ${n} again</button>`);
  $("#retry").onclick = () => { S.hp = 3; startLevel(n); };
}
function paintQuest() {
  const n = S.activeLevel || S.level || 1;
  const st = stageOf(n);
  const left = (S.enemies || []).length;
  const el = $("#quest");
  if (el) el.textContent = "Mission " + n + "/50";
  const bar = $("#missionbar");
  if (bar) {
    bar.innerHTML = `<b>Mission ${n}/50 · ${esc(st.place)}</b><span class="muted">${left ? "Clear " + left + " pests. They nibble hearts. Keep moving." : "Land is clear."}</span>`;
  }
}
function biomePic(id) {
  const key = { park: "park", river: "park", shrine: "park", cafe: "park", candy: "candy", fest: "candy", moon: "moon", storm: "moon", snow: "moon", galaxy: "galaxy" }[id] || "park";
  if (typeof PUNI_BIOME !== "undefined" && PUNI_BIOME[key]) return PUNI_BIOME[key];
  if (typeof PUNI_SCENE !== "undefined" && PUNI_SCENE.map) return PUNI_SCENE.map;
  return "";
}
function paintBiome(id) {
  const pic = biomePic(id);
  const img = $("#mapbg");
  if (img && pic) img.src = pic;
  const map = $("#map");
  if (map) map.style.filter = "none";
}
function startLevel(n) {
  const st = stageOf(n);
  if (n > (S.level || 1)) return toast("Clear the earlier levels first.");
  S.activeLevel = n;
  const biome = BIOMES.find(x => x.id === st.biome) || BIOMES[0];
  paintBiome(st.biome);
  S.hp = 3;
  S.hurtUntil = 0;
  paintHearts();
  const around = [[-320,40],[340,-90],[-40,-380],[420,240],[-400,200],[160,-300],[-240,340],[280,380],[-480,-40],[500,120]];
  S.enemies = [];
  const count = Math.min(8, 5 + Math.floor(n / 8) + (st.boss ? 1 : 0));
  for (let i = 0; i < count; i++) {
    const kind = FOES[i % FOES.length];
    const hp = kind.hp + 1 + Math.floor(n / 6);
    const off = around[i % around.length];
    const x = S.x + off[0], y = S.y + off[1];
    S.enemies.push({
      id: uid(), kind: kind.kind, name: kind.name, emoji: kind.emoji,
      hp, max: hp, puff: kind.puff + n, x, y, homeX: x, homeY: y
    });
  }
  if (st.boss) {
    const x = S.x, y = S.y - 240;
    S.enemies.push({
      id: uid(), kind: "sour", name: st.boss.name, emoji: st.boss.emoji,
      hp: st.boss.hp + Math.floor(n / 7), max: st.boss.hp, puff: st.boss.puff,
      x, y, homeX: x, homeY: y, boss: true
    });
  }
  save();
  closeSheet();
  drawFoes();
  paintQuest();
  toast(st.place + " · " + st.name);
}
async function winLevel(n) {
  const st = stageOf(n);
  S.activeLevel = 0;
  S.level = Math.max(S.level || 1, n + 1);
  S.puffs += st.prizePuffs;
  const loot = [];
  loot.push(st.prizePuffs + " puffs");
  if (n === 1 || n % 5 === 0) {
    S.wings = true;
    loot.push("Fairy Wings stay on");
  }
  if (n % 5 === 0) {
    S.inbox.push({ id: uid(), type: "mystery", from: st.boss ? st.boss.name : st.place, opened: false });
    loot.push("Mystery gift");
  }
  if (n % 10 === 0) {
    const rare = SPECIES.filter(s => s.rarity === "Sparkle" || s.rarity === "Dream");
    const sp = rare[n % rare.length];
    const inst = makeInstance(sp, { perfects: 1 }, { colorway: n >= 30 ? "golden" : "blush" });
    addInstance(inst);
    loot.push(sp.name + " prize");
  }
  if (n === 50) {
    const moon = makeInstance(species("tsukimochi"), { perfects: 2 }, { colorway: "moonkissed", shiny: true });
    addInstance(moon);
    loot.push("Moon rabbit + Champion sticker");
    S.prizes = (S.prizes || []).concat("Champion of Puni Town");
  }
  S.prizes = S.prizes || [];
  if (!S.prizes.includes(st.place + " " + n)) S.prizes.push(st.place + " " + n);
  save();
  paintPuffs();
  paintQuest();
  paintBiome("park");
  AudioBus.sparkle();
  burst(["#ffd15c", "#fff", "#ff8fab"]);
  showSheet("Level " + n + " clear!", `
    <p><b>${esc(st.name)}</b></p>
    <p class="muted">${esc(st.place)} is peaceful again.</p>
    <p>${loot.map(x => "★ " + esc(x)).join("<br>")}</p>
    <p class="muted">${n >= 50 ? "You finished all 50. Town kids will talk." : "Level " + Math.min(50, n + 1) + " is unlocked."}</p>
    ${n < 50 ? `<button class="btn gold wide" id="nextlv">Play level ${n + 1}</button>` : ""}
    <button class="btn primary wide" id="stay" style="margin-top:8px">Back to town</button>`);
  const nx = $("#nextlv");
  if (nx) nx.onclick = () => startLevel(n + 1);
  $("#stay").onclick = () => closeSheet();
}
function openQuest() {
  const cur = Math.min(50, S.level || 1);
  const k = kit();
  const cards = STAGES.map(st => {
    const lock = st.n > cur;
    const boss = st.boss ? " · BOSS" : "";
    return `<button class="card ${lock ? "miss" : ""}" data-lv="${st.n}" ${lock ? "disabled" : ""}>
      <small>Lv ${st.n}${boss}</small>
      <b>${esc(st.place)}</b>
      <small class="muted">${lock ? "locked" : st.prizePuffs + " puffs"}</small>
    </button>`;
  }).join("");
  showSheet("Adventure 50", `
    <p class="muted">50 levels. A boss every 5. A prize every win. Different lands each stage.</p>
    <p><b>Weapon:</b> ${esc(k.weapon)} · ${esc(k.skill)}</p>
    <p>You are on level <b>${cur}</b> / 50.</p>
    <div class="grid">${cards}</div>
    <button class="btn gold wide" id="playcur" style="margin-top:8px">Play level ${cur}</button>`);
  $("#sheet").querySelectorAll("[data-lv]").forEach(b => b.onclick = () => startLevel(Number(b.dataset.lv)));
  $("#playcur").onclick = () => startLevel(cur);
}
function startFly() {
  if (!canFly()) {
    toast("Clear the park mission — or pick the fairy, unicorn, or witch.");
    openQuest();
    return;
  }
  S.flyUntil = Date.now() + 4500;
  const pl = $("#player");
  if (pl) pl.classList.add("flying");
  AudioBus.sparkle();
  toast(kit().skill + "! Wings out.");
  setTimeout(() => {
    const p = $("#player");
    if (p) p.classList.remove("flying");
  }, 4500);
}
function drawShoulder() {
  const el = $("#shoulder");
  if (!el) return;
  const L = lead();
  el.innerHTML = L ? squishSVG(species(L.speciesId), L, 36) : "";
}
function paintPuffs() { const el = $("#puffs"); if (el) el.textContent = S.puffs + " puffs"; }
function paintGiftDot() {
  const nav = $("#nav");
  if (!nav) return;
  const btn = nav.querySelector('[data-tab="gifts"]');
  const old = btn.querySelector(".dot");
  if (old) old.remove();
  const pending = S.inbox.some(g => !g.opened) || S.lastLucky !== today() || S.lastTown !== today();
  if (pending) {
    const d = document.createElement("i");
    d.className = "dot";
    btn.appendChild(d);
  }
  const cap = nav.querySelector('[data-tab="capsule"]');
  const old2 = cap.querySelector(".dot");
  if (old2) old2.remove();
  if (S.lastLucky !== today()) {
    const d = document.createElement("i");
    d.className = "dot";
    cap.appendChild(d);
  }
}

function bindMap() {
  const joyEl = $("#joy");
  const knob = $("#knob");
  function setJoy(cx, cy, px, py) {
    const dx = px - cx, dy = py - cy;
    const max = 36, len = Math.hypot(dx, dy) || 1;
    const c = Math.min(max, len);
    joy.x = (dx / len) * (c / max);
    joy.y = (dy / len) * (c / max);
    knob.style.left = (30 + (dx / len) * c) + "px";
    knob.style.top = (30 + (dy / len) * c) + "px";
  }
  joyEl.addEventListener("pointerdown", e => {
    joy.on = true; follow = null;
    joyEl.setPointerCapture(e.pointerId);
    const b = joyEl.getBoundingClientRect();
    setJoy(b.left + b.width / 2, b.top + b.height / 2, e.clientX, e.clientY);
  });
  joyEl.addEventListener("pointermove", e => {
    if (!joy.on) return;
    const b = joyEl.getBoundingClientRect();
    setJoy(b.left + b.width / 2, b.top + b.height / 2, e.clientX, e.clientY);
  });
  const end = () => { joy.on = false; joy.x = 0; joy.y = 0; knob.style.left = "30px"; knob.style.top = "30px"; };
  joyEl.addEventListener("pointerup", end);
  joyEl.addEventListener("pointercancel", end);
  $("#glow").onclick = () => { AudioBus.ui(); fireWand(); };
  const fight = $("#fight");
  if (fight) fight.onclick = () => { AudioBus.ui(); demoBattle(); };
  const flyb = $("#flybtn");
  if (flyb) flyb.onclick = () => { AudioBus.ui(); startFly(); };
  const quest = $("#quest");
  if (quest) quest.onclick = () => openQuest();
  paintWeather();
  root.querySelectorAll(".bloom").forEach(el => {
    el.onclick = ev => {
      ev.stopPropagation();
      el.classList.add("popped");
      S.puffs += 1;
      paintPuffs();
      toast("A flower left a puff.");
      AudioBus.heal();
    };
  });
  $("#action").onclick = () => doAction(nearestAction());
  $("#about").onclick = () => openAbout();
  $("#puffs").onclick = () => toast("Puffs open capsules. Earn them by squeezing.");
  $("#nav").querySelectorAll("button").forEach(b => b.onclick = () => openTab(b.dataset.tab));
  $("#map").addEventListener("pointerdown", e => {
    if (e.target.closest(".hud, .nav, .joy, .glow-btn, .action, .coach, .sheet, .scrim, .pin, .rival, .orb, .foe")) return;
    const world = $("#world").getBoundingClientRect();
    follow = { x: e.clientX - world.left, y: e.clientY - world.top, then: null };
  });
}

function followNearest() {
  const foes = [...(S.enemies || [])].sort((a, b) => dist(S.x, S.y, a.x, a.y) - dist(S.x, S.y, b.x, b.y));
  if (foes[0]) {
    follow = { x: foes[0].x, y: foes[0].y, then: () => hitFoe(foes[0].id) };
    toast("Chasing " + foes[0].name);
    return;
  }
  const o = [...S.orbs].sort((a, b) => dist(S.x, S.y, a.x, a.y) - dist(S.x, S.y, b.x, b.y))[0];
  if (!o) { toast("The town is quiet. Try Adventure."); return; }
  follow = { x: o.x, y: o.y, then: () => openEncounter(o.id) };
}
function walkToOrb(id) {
  const o = S.orbs.find(x => x.id === id);
  if (!o) return;
  if (dist(S.x, S.y, o.x, o.y) < 86) openEncounter(id);
  else follow = { x: o.x, y: o.y, then: () => openEncounter(id) };
}
function walkToPlace(id) {
  const p = PLACES.find(x => x.id === id);
  if (dist(S.x, S.y, p.x, p.y) < 110) openPlace(p);
  else follow = { x: p.x, y: p.y, then: () => openPlace(p) };
}
function walkToRival(id) {
  const r = RIVALS.find(x => x.id === id);
  if (dist(S.x, S.y, r.x, r.y) < 100) openRival(r);
  else follow = { x: r.x, y: r.y, then: () => openRival(r) };
}
function nearestAction() {
  let best = null, bd = 86;
  for (const o of S.orbs) {
    const d = dist(S.x, S.y, o.x, o.y);
    if (d < bd) { bd = d; best = { type: "orb", id: o.id, label: "Squeeze the " + GLOW[o.rarity] + " orb" }; }
  }
  for (const f of (S.enemies || [])) {
    const d = dist(S.x, S.y, f.x, f.y);
    if (d < 240 && d < bd + 80) { bd = d; best = { type: "foe", id: f.id, label: "Zap " + f.name }; }
  }
  for (const r of RIVALS) {
    const d = dist(S.x, S.y, r.x, r.y);
    if (d < 100 && d < bd + 10) { bd = d; best = { type: "rival", id: r.id, label: "Squish-duel " + r.name }; }
  }
  for (const p of PLACES) {
    const d = dist(S.x, S.y, p.x, p.y);
    if (d < 110 && (!best || d < bd)) {
      const labels = { den: "Enter your den", cafe: "Open the cafe", shrine: "Visit the shrine", moon: "Listen for the moon", park: "Picnic in the park", river: "Watch the river", arena: "Enter the Squish Ring" };
      best = { type: "place", id: p.id, label: labels[p.kind] };
      bd = d;
    }
  }
  return best;
}
function doAction(a) {
  if (!a) return;
  if (a.type === "orb") openEncounter(a.id);
  if (a.type === "rival") openRival(RIVALS.find(r => r.id === a.id));
  if (a.type === "place") openPlace(PLACES.find(p => p.id === a.id));
  if (a.type === "foe") fireWand(a.id);
}

function cam() {
  const world = $("#world");
  if (!world || mode !== "map" || sheet) return;
  const r = root.getBoundingClientRect();
  world.style.transform = `translate(${r.width / 2 - S.x}px, ${r.height / 2 - S.y - 30}px)`;
  const player = $("#player");
  if (player) { player.style.left = S.x + "px"; player.style.top = S.y + "px"; }
  const wand = $("#wand");
  const nf = nearestFoe();
  if (wand && nf) {
    const deg = Math.atan2(nf.y - S.y, nf.x - S.x) * 180 / Math.PI;
    wand.style.transform = `rotate(${deg}deg)`;
  }
  const act = nearestAction();
  const btn = $("#action");
  if (btn) {
    if (act) { btn.hidden = false; btn.textContent = act.label; }
    else btn.hidden = true;
  }
}

function loop(t) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.032, (t - last) / 1000 || 0);
  last = t;
  if (mode !== "map" || sheet) { cam(); return; }
  let mx = joy.x, my = joy.y;
  if (keys["w"] || keys["arrowup"]) my -= 1;
  if (keys["s"] || keys["arrowdown"]) my += 1;
  if (keys["a"] || keys["arrowleft"]) mx -= 1;
  if (keys["d"] || keys["arrowright"]) mx += 1;
  const len = Math.hypot(mx, my);
  const flying = Date.now() < (S.flyUntil || 0);
  function step(nx, ny) {
    const ox = S.x, oy = S.y;
    if (flying || !blocked(nx, S.y)) S.x = nx;
    if (flying || !blocked(S.x, ny)) S.y = ny;
    S.x = Math.max(90, Math.min(WORLD.w - 90, S.x));
    S.y = Math.max(90, Math.min(WORLD.h - 90, S.y));
    if (S.x !== ox || S.y !== oy) walkBuf += Math.hypot(S.x - ox, S.y - oy);
  }
  if (len > 0.12) {
    follow = null;
    const sp = flying ? 300 : 210;
    step(S.x + (mx / len) * sp * dt, S.y + (my / len) * sp * dt);
  } else if (follow) {
    const d = dist(S.x, S.y, follow.x, follow.y);
    if (d < 24) {
      const then = follow.then;
      follow = null;
      if (then) then();
    } else {
      const sp = 170;
      const nx = S.x + ((follow.x - S.x) / d) * sp * dt;
      const ny = S.y + ((follow.y - S.y) / d) * sp * dt;
      const before = { x: S.x, y: S.y };
      step(nx, ny);
      if (S.x === before.x && S.y === before.y && d < 140) {
        S.x = follow.x; S.y = follow.y;
      }
    }
  }
  const pl = $("#player");
  if (pl) {
    pl.classList.toggle("walking", !!(len > 0.12 || follow) && !flying);
    pl.classList.toggle("flying", flying);
    const av = pl.querySelector(".avatar");
    if (av && mx < -0.15) av.style.transform = "scaleX(-1)";
    else if (av && mx > 0.15) av.style.transform = "scaleX(1)";
  }
  const pack = S.enemies || [];
  pack.forEach(f => {
    const d = dist(S.x, S.y, f.x, f.y) || 1;
    if (d < 48) {
      hurtPlayer();
      f.x += ((f.x - S.x) / d) * 90 * dt;
      f.y += ((f.y - S.y) / d) * 90 * dt;
    } else if (d < 360) {
      const chase = (f.boss ? 78 : 58) + (S.activeLevel || 1);
      f.x += ((S.x - f.x) / d) * chase * dt;
      f.y += ((S.y - f.y) / d) * chase * dt;
    } else {
      const hx = f.homeX || f.x, hy = f.homeY || f.y;
      f.x += Math.sin((t / 700) + f.x * 0.01) * 28 * dt + (hx - f.x) * 0.35 * dt;
      f.y += Math.cos((t / 800) + f.y * 0.01) * 28 * dt + (hy - f.y) * 0.35 * dt;
    }
    pack.forEach(o => {
      if (o.id === f.id) return;
      const g = dist(f.x, f.y, o.x, o.y) || 1;
      if (g < 90) {
        f.x += ((f.x - o.x) / g) * 40 * dt;
        f.y += ((f.y - o.y) / g) * 40 * dt;
      }
    });
    f.x = Math.max(120, Math.min(1480, f.x));
    f.y = Math.max(140, Math.min(1780, f.y));
    const el = document.querySelector(`[data-foe="${f.id}"]`);
    if (el) { el.style.left = f.x + "px"; el.style.top = f.y + "px"; }
  });
  shots = shots.filter(s => {
    s.t += dt;
    s.x += (s.tx - s.x) * Math.min(1, 10 * dt);
    s.y += (s.ty - s.y) * Math.min(1, 10 * dt);
    if (s.t > 0.55 || dist(s.x, s.y, s.tx, s.ty) < 22) {
      if ((S.enemies || []).some(x => x.id === s.tid)) hitFoe(s.tid);
      return false;
    }
    return true;
  });
  const bolts = $("#bolts");
  if (bolts) {
    bolts.innerHTML = shots.map(s => `<i style="position:absolute;left:${s.x}px;top:${s.y}px;width:18px;height:18px;margin:-9px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#ffd15c 40%,#ff6b9d);box-shadow:0 0 16px #ffd15c;z-index:12"></i>`).join("");
  }
  if (walkBuf > 220) {
    walkBuf = 0;
    if ((S.walkPuffs || 0) < 40) { S.puffs += 1; S.walkPuffs = (S.walkPuffs || 0) + 1; paintPuffs(); }
  }
  saveTimer += dt;
  if (saveTimer > 4) { saveTimer = 0; save(); }
  cam();
}

async function openEncounter(id) {
  const orb = S.orbs.find(o => o.id === id);
  if (!orb || mode !== "map") return;
  follow = null;
  mode = "busy";
  const score = await playSqueeze(orb.rarity);
  const sp = speciesFromOrb(orb);
  const inst = makeInstance(sp, score);
  const had = S.squishies.some(s => s.speciesId === sp.id);
  const info = addInstance(inst);
  info.isNew = !had;
  S.orbs = S.orbs.filter(o => o.id !== id);
  addOrb(randomSpot());
  save();
  await reveal(inst, info, info.isNew ? "New squishy!" : "A twin!");
  if (info.isNew && uniqueCount() === 4) toast("Four faces. The den looks happier.");
  mode = "map";
  enterMap();
}

function openTab(tab) {
  AudioBus.ui();
  if (tab === "map") { closeSheet(); return; }
  if (tab === "dex") openDex();
  if (tab === "capsule") openCapsule();
  if (tab === "gifts") openGifts();
  if (tab === "den") openDen();
}
function closeSheet() {
  sheet = null;
  const s = $("#scrim"), h = $("#sheet");
  if (s) s.remove();
  if (h) h.remove();
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === "map"));
}
function showSheet(title, body) {
  closeSheet();
  sheet = title;
  const scrim = document.createElement("div");
  scrim.className = "scrim";
  scrim.id = "scrim";
  scrim.onclick = closeSheet;
  const el = document.createElement("div");
  el.className = "sheet";
  el.id = "sheet";
  el.innerHTML = `<div class="handle"></div><h2>${esc(title)}</h2>${body}`;
  root.appendChild(scrim);
  root.appendChild(el);
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === sheetKey(title)));
}
function sheetKey(title) {
  if (title === "Squishuary") return "dex";
  if (title === "Puni Cafe") return "capsule";
  if (title === "Gifts") return "gifts";
  if (title === "Your Den") return "den";
  return "";
}

function openDex() {
  const got = uniqueCount();
  const cards = SPECIES.map(sp => {
    const n = countOf(sp.id);
    const inst = S.squishies.find(s => s.speciesId === sp.id);
    if (!inst) return `<button class="card miss" data-id="${sp.id}"><div style="height:72px;display:grid;place-items:center;font-size:28px">?</div><small>???</small></button>`;
    return `<button class="card" data-id="${sp.id}">${squishSVG(sp, inst, 72)}<small>${esc(sp.name)}</small><small>${n > 1 ? "×" + n : esc(inst.trait)}</small></button>`;
  }).join("");
  showSheet("Squishuary", `<p class="muted">${got} / ${SPECIES.length} faces. Collect them all.</p>
    <div class="progress"><span style="width:${Math.round(got / SPECIES.length * 100)}%"></span></div>
    <div class="grid">${cards}</div>`);
  $("#sheet").querySelectorAll(".card").forEach(c => c.onclick = () => { if (!c.classList.contains("miss")) openDetail(c.dataset.id); });
}
function openDetail(id) {
  const sp = species(id);
  const owned = S.squishies.filter(s => s.speciesId === id);
  const inst = owned[0];
  const L = lead();
  showSheet(sp.name, `
    <div class="pop">${squishSVG(sp, inst, 150)}</div>
    <p>${badge(sp.rarity)} ${typePill(sp.type)}</p>
    <p class="muted">${esc(sp.title)}. ${esc(sp.blurb)}</p>
    <p><b>Power:</b> ${esc(sp.power)}</p>
    <p class="muted">${esc(COLOR_NAME[inst.colorway])} · ${esc(inst.trait)}. ${esc(TRAIT_TEXT[inst.trait])}${inst.shiny ? " Shiny squeeze." : ""}</p>
    <p class="muted">You have ${owned.length}.</p>
    <div class="row">
      <button class="btn primary" id="makelead">${L && L.uid === inst.uid ? "Already lead" : "Make lead"}</button>
      <button class="btn ghost" id="wrap" ${owned.length < 2 ? "disabled" : ""}>Wrap a twin</button>
    </div>
    <button class="btn ghost wide" id="backdex" style="margin-top:8px">Back to the dex</button>`);
  $("#makelead").onclick = () => { S.lead = inst.uid; save(); drawShoulder(); toast(sp.name + " is walking with you"); openDetail(id); };
  $("#wrap").onclick = () => wrapTwin(owned[1] || owned[0]);
  $("#backdex").onclick = openDex;
}
function wrapTwin(inst) {
  if (countOf(inst.speciesId) < 2) return toast("Keep at least one.");
  S.squishies = S.squishies.filter(s => s.uid !== inst.uid);
  if (S.lead === inst.uid) S.lead = (S.squishies[0] || {}).uid || null;
  save();
  drawShoulder();
  const link = giftLink(inst);
  showSheet("A wrapped gift", `<p>Anyone who opens this gets a squeeze of <b>${esc(species(inst.speciesId).name)}</b>. Once per phone. You kept one.</p>
    <p class="muted" style="word-break:break-all">${esc(link)}</p>
    <button class="btn primary wide" id="sh">Share gift</button>
    <button class="btn ghost wide" id="cp" style="margin-top:8px">Copy link</button>`);
  $("#sh").onclick = () => shareLink(link, "I wrapped a squishy for you in Puni Go. Squeeze it. You will not know the colorway.");
  $("#cp").onclick = () => copy(link);
}

function openCapsule() {
  const lucky = S.lastLucky !== today();
  showSheet("Puni Cafe", `
    <div class="cap-card">
      <h3 style="margin:0 0 6px">Lucky Squeeze</h3>
      <p class="muted">One free mystery a day. You will not know the face.</p>
      <button class="btn gold wide" id="lucky" ${lucky ? "" : "disabled"}>${lucky ? "Squeeze today's luck" : "Come back tomorrow"}</button>
    </div>
    <div class="cap-card">
      <h3 style="margin:0 0 6px">Soft capsule · 40 puffs</h3>
      <p class="muted">Mostly everyday and blush. A glitter leak is possible.</p>
      <button class="btn primary wide" id="softc">Crank it</button>
    </div>
    <div class="cap-card">
      <h3 style="margin:0 0 6px">Sparkle capsule · 120 puffs</h3>
      <p class="muted">Better odds. Sparkle promise in ${Math.max(1, 8 - S.pity)} ${S.pity >= 7 ? "— next one is promised" : "cranks"}.</p>
      <button class="btn gold wide" id="sparkc">Crank the glitter</button>
    </div>
    <p class="tiny">No real-money pulls in this playtest. Puffs are earned.</p>`);
  $("#lucky").onclick = () => doLucky();
  $("#softc").onclick = () => doCapsule("soft");
  $("#sparkc").onclick = () => doCapsule("sparkle");
}
async function doLucky() {
  if (S.lastLucky === today()) return;
  S.lastLucky = today();
  save();
  closeSheet();
  mode = "busy";
  const rarity = (() => { const r = Math.random() * 100; if (r < 4) return "Dream"; if (r < 22) return "Sparkle"; if (r < 70) return "Soft Rare"; return "Everyday"; })();
  const score = await playSqueeze(rarity);
  const sp = rollSpecies(rarity);
  const inst = makeInstance(sp, score);
  const had = S.squishies.some(s => s.speciesId === sp.id);
  const info = addInstance(inst);
  info.isNew = !had;
  await reveal(inst, info, "Lucky squeeze");
  mode = "map";
  enterMap();
}
function capsuleRarity(kind) {
  if (kind === "sparkle" && S.pity >= 7) return Math.random() < 0.12 ? "Dream" : "Sparkle";
  const r = Math.random() * 100;
  if (kind === "sparkle") {
    if (r < 1.2) return "Moon";
    if (r < 12) return "Dream";
    if (r < 50) return "Sparkle";
    if (r < 82) return "Soft Rare";
    return "Everyday";
  }
  if (r < 2) return "Dream";
  if (r < 13) return "Sparkle";
  if (r < 45) return "Soft Rare";
  return "Everyday";
}
async function doCapsule(kind) {
  const cost = kind === "sparkle" ? 120 : 40;
  if (S.puffs < cost) return toast("Need " + cost + " puffs");
  S.puffs -= cost;
  const rarity = capsuleRarity(kind);
  if (kind === "sparkle") S.pity = RANK[rarity] >= 3 ? 0 : S.pity + 1;
  save();
  paintPuffs();
  closeSheet();
  mode = "busy";
  const score = await playSqueeze(rarity);
  const sp = rarity === "Moon" ? (Math.random() < 0.62 ? species("tsukimochi") : rollSpecies("Dream")) : rollSpecies(rarity);
  const inst = makeInstance(sp, score);
  const had = S.squishies.some(s => s.speciesId === sp.id);
  const info = addInstance(inst);
  info.isNew = !had;
  await reveal(inst, info, "Capsule pop");
  mode = "map";
  enterMap();
}

function openGifts() {
  if (S.lastTown !== today()) {
    S.lastTown = today();
    S.inbox.push({ id: uid(), gid: "town-" + today(), type: "mystery", from: "Puni Cafe", opened: false });
    save();
  }
  const items = S.inbox.filter(g => !g.opened);
  const list = items.length ? items.map(g => {
    const label = g.type === "mystery" ? "Mystery squeeze" : g.type === "echo" ? "Echo of " + species(g.speciesId).name : species(g.speciesId).name + " gift";
    return `<button class="gift" data-id="${g.id}"><span style="font-size:28px">🎁</span><span><b>${esc(label)}</b><small class="muted" style="display:block">From ${esc(g.from)}</small></span></button>`;
  }).join("") : `<p class="muted">No wrapped gifts yet. Send one, or duel a showcase trainer.</p>`;
  const stamps = Math.min(7, S.squeezesToday || 0);
  showSheet("Gifts", `
    <p class="muted">Town squeezes today: ${townCount().toLocaleString()}. You added ${S.squeezesToday || 0}.</p>
    <div class="stamps">${Array.from({length: 7}, (_, i) => `<i class="${i < stamps ? "on" : ""}">${i < stamps ? "★" : "○"}</i>`).join("")}</div>
    <p class="tiny" style="margin-top:0">Seven squeezes fill the week sticker. Kids love a full row.</p>
    ${list}
    <button class="btn gold wide" id="chal" style="margin-top:8px">Challenge a friend</button>
    <button class="btn primary wide" id="sendm" style="margin-top:8px">Send a mystery squeeze</button>
    <p class="tiny">Friends open your link and fight your lead, or squeeze a mystery gift. No chat. No logins.</p>`);
  $("#sheet").querySelectorAll(".gift").forEach(b => b.onclick = () => openInboxItem(b.dataset.id));
  $("#sendm").onclick = shareMystery;
  $("#chal").onclick = shareChallenge;
  paintGiftDot();
}
async function openInboxItem(id) {
  const item = S.inbox.find(g => g.id === id && !g.opened);
  if (!item) return;
  closeSheet();
  mode = "busy";
  let sp, score;
  if (item.type === "mystery") {
    const rarity = Math.random() < 0.18 ? "Sparkle" : Math.random() < 0.55 ? "Soft Rare" : "Everyday";
    score = await playSqueeze(rarity);
    sp = rollSpecies(rarity);
  } else {
    sp = species(item.speciesId);
    score = await playSqueeze(sp.rarity);
  }
  const copied = item.type === "echo" && Math.random() < 0.4;
  const inst = makeInstance(sp, score, {
    colorway: copied ? item.colorHint : undefined,
    shiny: item.shiny ? true : undefined
  });
  const had = S.squishies.some(s => s.speciesId === sp.id);
  const info = addInstance(inst);
  info.isNew = !had;
  S.inbox = S.inbox.filter(g => g.id !== id);
  save();
  await reveal(inst, info, item.type === "echo" ? "Echo hatched" : "Gift opened");
  mode = "map";
  enterMap();
}
function giftLink(inst) {
  const gid = uid();
  const q = new URLSearchParams({ gift: inst.speciesId, cw: inst.colorway, from: S.name || "a friend", gid });
  if (inst.shiny) q.set("shiny", "1");
  return basePath() + "?" + q.toString();
}
function mysteryLink() {
  const q = new URLSearchParams({ gift: "mystery", from: S.name || "a friend", gid: uid() });
  return basePath() + "?" + q.toString();
}
function challengeLink() {
  const L = lead();
  if (!L) return null;
  const q = new URLSearchParams({
    duel: L.speciesId,
    cw: L.colorway || "classic",
    trait: L.trait || "bouncy",
    from: S.name || "a friend",
    cid: uid()
  });
  if (L.shiny) q.set("shiny", "1");
  return basePath() + "?" + q.toString();
}
function shareChallenge() {
  if (!lead()) return toast("Catch a squishy first, then challenge.");
  const link = challengeLink();
  shareLink(link, (S.name || "A friend") + " challenged you in Puni Go. Fight their " + lead().nickname + ". You both keep your originals.");
}
function shareMystery() { shareLink(mysteryLink(), "I squeezed a mystery orb in Puni Go. This one is for you — you won't know what you get."); }
async function shareLink(url, text) {
  AudioBus.ui();
  if (navigator.share) {
    try { await navigator.share({ title: "Puni Go", text, url }); return; } catch (e) {}
  }
  copy(url);
}
function copy(url) {
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast("Link copied")).catch(() => toast(url));
  else toast("Copy: " + url);
}

function openDen() {
  const mates = S.squishies.slice(0, 8);
  const decor = uniqueCount() >= 8 ? "A sakura branch unlocked." : uniqueCount() >= 4 ? "A paper lantern is glowing." : "Squeeze them. They like it.";
  showSheet("Your Den", `
    <div class="den" id="denroom">${mates.map((inst, i) => `<button class="mate" data-uid="${inst.uid}" style="left:${12 + (i % 4) * 24}%;top:${28 + Math.floor(i / 4) * 38}%">${squishSVG(species(inst.speciesId), inst, 78)}</button>`).join("")}</div>
    <p class="muted">${esc(decor)} Town squeezes today: ${townCount().toLocaleString()}.</p>
    <p class="tiny">Tap a squishy. Bond goes up. Sometimes a puff pops out.</p>
    <button class="btn ghost wide" id="chhero" style="margin-top:8px">Change my look</button>`);
  $("#sheet").querySelectorAll(".mate").forEach(b => b.onclick = () => {
    const inst = S.squishies.find(s => s.uid === b.dataset.uid);
    if (!inst) return;
    inst.bond = (inst.bond || 0) + 1;
    b.classList.remove("squashing");
    void b.offsetWidth;
    b.classList.add("squashing");
    AudioBus.pop();
    if (inst.bond % 5 === 0) { S.puffs += 2; toast("+2 puffs"); paintPuffs(); }
    save();
  });
  $("#chhero").onclick = () => { closeSheet(); askName(); };
}
function openPlace(p) {
  if (p.kind === "den") return openDen();
  if (p.kind === "cafe") return openCapsule();
  if (p.kind === "shrine") return openRival(RIVALS.find(r => r.id === "okami"));
  if (p.kind === "moon") return callMoon();
  if (p.kind === "arena") return demoBattle();
  if (p.kind === "park") {
    burst(["#ffb7c8", "#fff", "#cdb4ff"]);
    S.puffs += 1; paintPuffs(); save();
    return toast("Petals everywhere. +1 puff. Sakura Puff loves this park.");
  }
  if (p.kind === "river") {
    burst(["#9fe4ff", "#fff", "#7ee0b8"]);
    S.puffs += 1; paintPuffs(); save();
    return toast("The river sparkles. +1 puff. Watch for Pearl Otter.");
  }
}
function callMoon() {
  if (S.lastMoon === today()) {
    toast("The moon already listened today.");
    return;
  }
  S.lastMoon = today();
  addOrb({ x: 1180, y: 420, bias: "hill" }, "Moon");
  save();
  drawOrbs();
  toast("A moonlit orb settled on the hill.");
  AudioBus.legend();
}

function openAbout() {
  showSheet("Puni Go", `
    <p><b>Squeeze first. Ask later.</b></p>
    <p class="muted">Walk the town. Tap an orb. Squeeze when the rings kiss. You always catch something. A perfect squeeze makes the colorway, trait, and shiny chance luckier.</p>
    <p class="muted">Win a squish-duel to earn an <b>echo</b> of their squishy. Theirs stays. Yours hatches with a mystery finish. Once a day per trainer.</p>
    <p class="muted">Share a mystery link. Friends get a gift on their phone. Progress stays on this device.</p>
    <p class="muted">Add to your home screen from the browser share menu so it opens like an app.</p>
    <p class="tiny">Public playtest. Colorful on purpose. Original squishies. Not affiliated with Pokémon or Squishmallows. No real-money purchases. Digital prizes only.</p>
    <div class="row">
      <button class="btn ghost" id="mute">${S.muted ? "Sound off" : "Sound on"}</button>
      <button class="btn ghost" id="wipe">Reset town</button>
    </div>`);
  $("#mute").onclick = () => { S.muted = !S.muted; save(); toast(S.muted ? "Quiet town" : "Puni sounds on"); openAbout(); };
  $("#wipe").onclick = () => { if (confirm("Release every squishy on this phone?")) { S = blankSave(); save(); closeSheet(); showTitle(); } };
}

function paintWeather() {
  const layer = $("#wx");
  if (!layer) return;
  const w = weatherNow();
  const map = $("#map");
  if (map) {
    map.style.filter = w === "night" ? "brightness(0.72) saturate(1.1)" : w === "dusk" ? "sepia(0.18) saturate(1.15)" : "none";
  }
  if (w === "rain") {
    layer.innerHTML = Array.from({ length: 22 }, (_, i) =>
      `<i class="drop" style="left:${(i * 9) % 100}%;animation-delay:${(i % 7) * 0.18}s"></i>`).join("");
  } else if (w === "petals" || w === "dusk") {
    layer.innerHTML = Array.from({ length: 14 }, (_, i) =>
      `<i class="petal" style="left:${6 + i * 7}%;animation-delay:${i * 0.4}s;background:${["#ffb7c8","#fff","#cdb4ff"][i % 3]}"></i>`).join("");
  } else if (w === "night") {
    layer.innerHTML = Array.from({ length: 10 }, (_, i) =>
      `<i class="spark" style="left:${10 + i * 8}%;top:${8 + (i % 4) * 10}%;animation-delay:${i * 0.2}s"></i>`).join("");
  } else {
    layer.innerHTML = `<i class="sunbeam"></i>`;
  }
}
function demoBattle() {
  if (!lead()) return toast("Catch a squishy first, then fight.");
  if (S.pendingDuel) return openRival(S.pendingDuel);
  const pool = RIVALS;
  openRival(pool[Math.floor(Math.random() * pool.length)]);
}

function openRival(r) {
  if (!r) return;
  const sp = species(r.speciesId);
  const echo = S.echoDay[r.id] !== today();
  const team = S.squishies.map(inst => `<button class="card ${lead() && lead().uid === inst.uid ? "on" : ""}" data-uid="${inst.uid}" style="${lead() && lead().uid === inst.uid ? "outline:3px solid #ff8fab" : ""}">${squishSVG(species(inst.speciesId), inst, 64)}<small>${esc(inst.nickname)}</small></button>`).join("");
  showSheet(r.name, `
    <p class="muted">${esc(r.line)}</p>
    <div class="pop">${faceHTML(sp, { colorway: r.colorway, shiny: !!r.shiny, trait: r.trait }, 140)}</div>
    <p>${badge(sp.rarity)} ${typePill(sp.type)} · ${esc(sp.power)}</p>
    <p class="muted">${echo ? "Win and an echo egg forms. Their squishy stays with them. Colorway is still a mystery." : "You already echoed them today. A rematch still pays puffs."}</p>
    <p><b>Your lead</b></p>
    <div class="grid">${team}</div>
    <button class="btn primary wide" id="duel" style="margin-top:10px">Squish-duel</button>`);
  $("#sheet").querySelectorAll("[data-uid]").forEach(b => b.onclick = () => { S.lead = b.dataset.uid; save(); openRival(r); });
  $("#duel").onclick = () => startBattle(r);
}

function actorFrom(inst) {
  return { inst, name: inst.nickname, fluff: maxFluff(inst), max: maxFluff(inst), shield: false, web: false, sleepy: false, dodge: false, shyUsed: false, last: "" };
}
function typeMod(atk, def) {
  if (BEATS[atk] === def) return 1.45;
  if (BEATS[def] === atk) return 0.75;
  return 1;
}
function aiMove(b) {
  const f = b.foe, ratio = f.fluff / f.max;
  if (ratio < 0.34 && f.last !== "hug") return "hug";
  if (!b.powerUsed.foe && ratio < 0.75 && Math.random() < 0.45) return "power";
  if (ratio > 0.45 && Math.random() < 0.25) return "pop";
  if (Math.random() < 0.18) return "bounce";
  return "squish";
}
function resolveMove(actor, target, move, b, side) {
  if (actor.sleepy) { actor.sleepy = false; actor.last = "nap"; return actor.name + " is too snug and misses a turn."; }
  const webbed = actor.web;
  actor.web = false;
  if (webbed && move === "bounce") return actor.name + " is stuck in cotton and cannot bounce.";
  const sp = species(actor.inst.speciesId);
  const tp = species(target.inst.speciesId);
  let dmg = 0, heal = 0, recoil = 0, note = "";
  if (move === "squish") dmg = 18;
  else if (move === "bounce") { dmg = 8; actor.dodge = true; note = " They bounce, ready to slip aside."; }
  else if (move === "hug") { heal = 20 + (actor.inst.trait === "snuggly" ? 10 : 0); if (actor.last === "hug") actor.sleepy = true; note = actor.sleepy ? " Then they get too snug." : ""; }
  else if (move === "pop") { dmg = 32; recoil = 10; }
  else if (move === "power") {
    const fx = POWERS[sp.id] || { dmg: 20 };
    dmg = fx.dmg || 0; heal += fx.heal || 0; recoil += fx.recoil || 0;
    if (fx.shield) actor.shield = true;
    if (fx.web) target.web = true;
    if (fx.dodge) actor.dodge = true;
    if (fx.grow) { actor.max += fx.grow; actor.fluff += fx.grow; }
    if (fx.skip && Math.random() < fx.skip) target.sleepy = true;
    b.powerUsed[side] = true;
    note = " " + sp.power + " with the " + (WEAPON[sp.id] || "soft fist") + "!";
  }
  actor.last = move;
  if (dmg) {
    dmg *= typeMod(sp.type, tp.type);
    if (BEATS[sp.type] === tp.type) note += " Super squish!";
    if (actor.inst.trait === "brave") dmg *= 1.1;
    if (actor.inst.trait === "sparkly" && Math.random() < 0.18) { dmg *= 1.5; note += " Crit pop!"; }
    dmg *= 0.92 + Math.random() * 0.16;
    if (target.dodge) { target.dodge = false; if (Math.random() < 0.7) { dmg = 0; note += " They bounced aside!"; } }
    if (dmg > 0 && target.shield) { target.shield = false; dmg = 0; note += " It bounced off the mochi shield!"; }
    if (dmg > 0 && target.inst.trait === "shy" && !target.shyUsed) { target.shyUsed = true; dmg *= 0.62; note += " Shy fluff softened it."; }
    if (dmg > 0) dmg = Math.max(4, Math.round(dmg));
    target.fluff = Math.max(0, target.fluff - dmg);
  }
  if (heal) { actor.fluff = Math.min(actor.max, actor.fluff + heal); AudioBus.heal(); }
  if (recoil) actor.fluff = Math.max(1, actor.fluff - recoil);
  const verb = { squish: "goes puni", bounce: "bounces", hug: "hugs the fluff back", pop: "pops", power: "uses " + sp.power }[move];
  return actor.name + " " + verb + "." + (dmg ? " " + dmg + " fluff." : "") + note;
}

let battle = null;
function attackFX(move) {
  const burst = (typeof PUNI_SCENE !== "undefined" && PUNI_SCENE.burst) ? PUNI_SCENE.burst : "";
  const bits = Array.from({ length: 18 }, (_, i) => {
    const em = { squish: "💫", bounce: "⭐", hug: "💗", pop: "💥", power: "✨" }[move] || "✨";
    return `<i class="bit" style="--a:${i * 20}deg;--d:${80 + (i % 5) * 18}px;animation-delay:${(i % 6) * 0.03}s">${em}</i>`;
  }).join("");
  const title = { squish: "PUNI SQUISH", bounce: "BOUNCE AWAY", hug: "FLUFF HUG", pop: "POP BURST", power: "SUPER MOVE" }[move] || "PUNI!";
  return `<div class="fx fx-${move}">
    <div class="shock"></div>
    ${burst ? `<img class="burst" src="${burst}" alt="">` : ""}
    <div class="bits">${bits}</div>
    <b class="banner">${title}</b>
  </div>`;
}
function renderBattle() {
  const me = battle.me, foe = battle.foe;
  const sp = species(me.inst.speciesId), fp = species(foe.inst.speciesId);
  const ov = $("#battle");
  if (!ov) return;
  const hitFoe = battle.fx === "me";
  const hitMe = battle.fx === "foe";
  const arena = (typeof PUNI_SCENE !== "undefined" && PUNI_SCENE.arena) ? PUNI_SCENE.arena : "";
  ov.innerHTML = `<style>
    #battle{background:#16082c url(${arena}) center/cover no-repeat!important;color:#fff}
    #battle .arena{position:relative;overflow:hidden;border-radius:24px;padding:10px 8px 16px;min-height:100%}
    #battle .stage{display:flex;justify-content:space-between;align-items:flex-end;min-height:250px;padding:8px;position:relative;z-index:2}
    #battle .battler{width:46%;text-align:center}
    #battle .battler img,#battle .battler svg{animation:idleBob 1.1s ease-in-out infinite;filter:drop-shadow(0 12px 16px rgba(0,0,0,.35))}
    #battle .hit img,#battle .hit svg{animation:whack .4s ease}
    #battle .lunge img,#battle .lunge svg{animation:lunge .4s ease}
    @keyframes idleBob{50%{transform:translateY(-8px)}}
    @keyframes whack{0%{filter:brightness(1)}25%{transform:translate(16px,-8px) rotate(10deg);filter:brightness(2)}100%{transform:none}}
    @keyframes lunge{0%{transform:none}40%{transform:translate(22px,-14px) scale(1.12)}100%{transform:none}}
    #battle .fluff{background:rgba(255,255,255,.22)}
    #battle .fluff span{background:linear-gradient(90deg,#ffb3c6,#ff5d8f)}
    #battle .log{color:#fff;background:rgba(12,6,28,.55);border-radius:14px;padding:8px 10px;position:relative;z-index:3}
    #battle b, #battle small{color:#fff}
    #battle .muted{color:#f3e6dc}
    #battle .fx{position:absolute;inset:8% 6% 38%;z-index:4;pointer-events:none}
    #battle .burst{position:absolute;left:50%;top:46%;width:260px;height:260px;margin:-130px 0 0 -130px;animation:boom .55s ease forwards;mix-blend-mode:screen}
    @keyframes boom{0%{transform:scale(.2);opacity:0}40%{transform:scale(1.15);opacity:1}100%{transform:scale(1.35);opacity:0}}
    #battle .shock{position:absolute;left:50%;top:48%;width:20px;height:20px;margin:-10px;border:4px solid #fff;border-radius:50%;animation:shock .55s ease forwards}
    @keyframes shock{to{transform:scale(16);opacity:0}}
    #battle .banner{position:absolute;left:50%;top:8%;transform:translateX(-50%);background:linear-gradient(90deg,#ff8fab,#f6c453);color:#4a342e;padding:6px 16px;border-radius:999px;font-size:16px;animation:popIn .35s ease}
    #battle .bits{position:absolute;left:50%;top:48%}
    #battle .bit{position:absolute;left:0;top:0;animation:spray .7s ease forwards;font-size:22px}
    @keyframes spray{to{transform:rotate(var(--a)) translate(var(--d)) scale(1.4);opacity:0}}
    #battle.shake .arena{animation:rumble .35s ease}
    @keyframes rumble{25%{transform:translate(-6px,3px)}50%{transform:translate(7px,-2px)}75%{transform:translate(-4px,2px)}}
    #battle .fx-hug .shock{border-color:#ff8fab}
    #battle .fx-pop .shock{border-color:#ffe08a}
    #battle .fx-power .shock{border-color:#cdb4ff;border-width:6px}
  </style>
  <div class="battle arena">
    <div class="stage">
      <div class="battler ${hitMe ? "hit" : ""} ${battle.fx === "me" ? "lunge" : ""}">${faceHTML(sp, me.inst, 148)}
        <b>${esc(me.name)}</b>
        <div class="fluff ${me.fluff / me.max < 0.3 ? "low" : ""}"><span style="width:${Math.max(0, me.fluff / me.max * 100)}%"></span></div>
        <small class="muted">${esc(WEAPON[sp.id] || "Soft Fist")}</small>
      </div>
      <div class="battler foe ${hitFoe ? "hit" : ""}">${faceHTML(fp, foe.inst, 148)}
        <b>${esc(foe.name)}</b>
        <div class="fluff ${foe.fluff / foe.max < 0.3 ? "low" : ""}"><span style="width:${Math.max(0, foe.fluff / foe.max * 100)}%"></span></div>
        <small class="muted">${esc(WEAPON[fp.id] || "Soft Fist")}</small>
      </div>
    </div>
    ${battle.fx ? attackFX(battle.move || "squish") : ""}
    <div class="log">${esc(battle.log)}</div>
    <div class="moves">
      <button data-m="squish">Squish</button>
      <button data-m="bounce">Bounce</button>
      <button data-m="hug">Hug</button>
      <button data-m="pop">Pop</button>
    </div>
    <button class="power" data-m="power" ${battle.powerUsed.me ? "disabled" : ""}>${esc(sp.power)} · ${esc(WEAPON[sp.id] || "Soft Fist")}</button>
    <button class="btn ghost wide" id="run" style="margin-top:8px">Wiggle out</button>
  </div>`;
  ov.classList.toggle("shake", !!battle.fx);
  ov.querySelectorAll("[data-m]").forEach(b => b.onclick = () => playerMove(b.dataset.m));
  $("#run", ov).onclick = () => endBattle(false, true);
}
async function startBattle(r) {
  const L = lead();
  if (!L) return toast("You need a squishy first");
  closeSheet();
  mode = "battle";
  const foeInst = makeInstance(species(r.speciesId), { perfects: 1 }, { colorway: r.colorway, shiny: !!r.shiny, trait: r.trait });
  foeInst.nickname = species(r.speciesId).name;
  battle = {
    rival: r,
    me: actorFrom(L),
    foe: actorFrom(foeInst),
    log: r.name + " offers " + species(r.speciesId).name + ". Squish!",
    powerUsed: { me: false, foe: false },
    lock: false,
    over: false
  };
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.id = "battle";
  root.appendChild(ov);
  renderBattle();
}
async function playerMove(move) {
  if (!battle || battle.lock || battle.over) return;
  battle.lock = true;
  const foeFirst = battle.foe.inst.trait === "bouncy" && battle.me.inst.trait !== "bouncy";
  const order = foeFirst ? ["foe", "me"] : ["me", "foe"];
  for (const side of order) {
    if (battle.over) break;
    if (side === "me") {
      battle.move = move;
      battle.log = resolveMove(battle.me, battle.foe, move, battle, "me");
    } else {
      const ai = aiMove(battle);
      battle.move = ai;
      battle.log = resolveMove(battle.foe, battle.me, ai, battle, "foe");
    }
    battle.fx = side;
    renderBattle();
    AudioBus.pop();
    buzz(18);
    if (battle.foe.fluff <= 0) { await wait(500); return endBattle(true, false); }
    if (battle.me.fluff <= 0) { await wait(500); return endBattle(false, false); }
    await wait(620);
  }
  battle.lock = false;
  renderBattle();
}
function endBattle(win, fled) {
  if (!battle || battle.over) return;
  battle.over = true;
  const r = battle.rival;
  const ov = $("#battle");
  let echoItem = null;
  if (win && !fled) {
    S.wins++;
    const bonus = 28 + RANK[species(r.speciesId).rarity] * 8;
    S.puffs += bonus;
    if (S.echoDay[r.id] !== today()) {
      S.echoDay[r.id] = today();
      echoItem = { id: uid(), type: "echo", speciesId: r.speciesId, colorHint: r.colorway, from: r.name, opened: false };
      S.inbox.push(echoItem);
    }
    save();
    AudioBus.sparkle();
    burst(["#ffb7c8", "#fff3c4", "#fff"]);
  } else {
    S.puffs += fled ? 5 : 8;
    save();
  }
  const msg = fled ? "You wiggled out. No hard feelings." : win ? "You win the squish-off!" : "The fluff won this time. Your squishy is okay.";
  const extra = win ? `+${fled ? 5 : 28} puffs` : "+8 consolation puffs";
  ov.innerHTML = `<div class="battle">
    <h2>${esc(msg)}</h2>
    <p class="muted">${echoItem ? esc(r.name) + "'s " + esc(species(r.speciesId).name) + " left an echo egg. Theirs stays. Yours is still a mystery finish." : esc(extra)}</p>
    ${echoItem ? `<button class="btn gold wide" id="hatch">Squeeze the echo</button>` : ""}
    <button class="btn primary wide" id="back" style="margin-top:8px">Back to town</button>
  </div>`;
  if (echoItem) $("#hatch", ov).onclick = async () => {
    ov.remove();
    battle = null;
    await openInboxItem(echoItem.id);
  };
  $("#back", ov).onclick = () => { ov.remove(); battle = null; mode = "map"; enterMap(); };
}

function claimUrlDuel() {
  const q = new URLSearchParams(location.search);
  const duel = q.get("duel");
  if (!duel) return;
  const sp = species(duel);
  if (!sp) return;
  const from = (q.get("from") || "a friend").slice(0, 16);
  const traits = ["chubby", "bouncy", "snuggly", "shy", "brave", "sparkly"];
  const cws = ["classic", "blush", "mint", "golden", "moonkissed"];
  const key = "friend-" + from.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) + "-" + sp.id;
  S.pendingDuel = {
    id: key,
    name: from,
    line: from + " sent their " + sp.name + " to duel. Win an echo. Theirs stays on their phone.",
    speciesId: sp.id,
    colorway: cws.includes(q.get("cw")) ? q.get("cw") : "classic",
    trait: traits.includes(q.get("trait")) ? q.get("trait") : "bouncy",
    shiny: q.get("shiny") === "1",
    friend: true
  };
  save();
  history.replaceState({}, "", location.pathname);
  setTimeout(() => toast(from + " challenged you. Tap Battle."), 500);
}
function claimUrlGift() {
  const q = new URLSearchParams(location.search);
  const gift = q.get("gift");
  if (!gift) return;
  const gid = q.get("gid") || ("g-" + gift + "-" + (q.get("from") || ""));
  if (S.claimed.includes(gid)) {
    history.replaceState({}, "", location.pathname);
    return;
  }
  const from = (q.get("from") || "a friend").slice(0, 24);
  const item = { id: uid(), gid, from, opened: false };
  if (gift === "mystery" || !species(gift)) item.type = "mystery";
  else {
    item.type = "friend";
    item.speciesId = gift;
    item.colorHint = ["classic", "blush", "mint", "golden", "moonkissed"].includes(q.get("cw")) ? q.get("cw") : "classic";
    item.shiny = q.get("shiny") === "1";
  }
  S.inbox.push(item);
  S.claimed.push(gid);
  save();
  history.replaceState({}, "", location.pathname);
  setTimeout(() => toast("A gift from " + from + " is waiting"), 400);
}

function boot() {
  S = load();
  dayReset();
  claimUrlDuel();
  claimUrlGift();
  if (!S.started) showTitle();
  else enterMap();
  requestAnimationFrame(loop);
}
addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === " " && squeezeTap) { e.preventDefault(); squeezeTap(); }
  if (mode === "battle" && battle && !battle.lock) {
    const map = { "1": "squish", "2": "bounce", "3": "hug", "4": "pop", p: "power" };
    if (map[e.key.toLowerCase()]) playerMove(map[e.key.toLowerCase()]);
  }
  if (e.key === "Escape") closeSheet();
});
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
document.addEventListener("visibilitychange", () => { if (S) save(); });
boot();
