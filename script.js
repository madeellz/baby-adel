/* =========================================================================
   Baby Adel — script.js
   =========================================================================

   ✏️  CONFIG — this is the only part you normally need to edit.

   dueDate  : the expected due date, written as "YYYY-MM-DD".
              The first version is estimated from "about 231 days left"
              on 5 October 2026  →  24 May 2027  (that puts today at 7w+0d).
              When the doctor gives you the official date, change it here.

              The countdown, current week, trimester and progress are all
              calculated live from this date — nothing else is hard-coded.

   gender   : "unknown"  → neutral cream / champagne theme
              "boy"      → soft blue theme + "Hello, Yassin 💙"
              "girl"     → soft pink theme + "Hello, Lily 🩷"

   After editing, upload the new script.js and both phones get the update.
   ========================================================================= */

const CONFIG = {
  motherName:  "Marwa",
  fatherName:  "Mohamed",
  babySurname: "Adel",
  boyName:     "Yassin",
  girlName:    "Lily",
  gender:      "unknown",      // "unknown" | "boy" | "girl"
  dueDate:     "2027-05-24"    // YYYY-MM-DD
};

/* ========================================================================= */
/*  Nothing below needs editing — but feel free to look around.              */
/* ========================================================================= */

(() => {
"use strict";

const KEY = "babyAdel.v1.";
const DAY = 86400000;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fill = (s) => String(s)
  .replace(/\{mother\}/g, CONFIG.motherName).replace(/\{father\}/g, CONFIG.fatherName)
  .replace(/\{boy\}/g, CONFIG.boyName).replace(/\{girl\}/g, CONFIG.girlName)
  .replace(/\{surname\}/g, CONFIG.babySurname);

/* ---------- Safe localStorage ---------- */
const store = {
  get(k, fallback) {
    try { const v = localStorage.getItem(KEY + k); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(k, v) {
    try { localStorage.setItem(KEY + k, JSON.stringify(v)); return true; }
    catch (e) { console.warn("Could not save", k, e); return false; }
  },
  del(k) { try { localStorage.removeItem(KEY + k); } catch {} },
  keys() {
    try { return Object.keys(localStorage).filter(k => k.startsWith(KEY)); } catch { return []; }
  }
};

/* ---------- Dates ---------- */
function parseDate(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || "").trim());
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);           // local midnight
  return isNaN(d) || d.getMonth() !== +m[2] - 1 ? null : d;
}
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const startOfToday = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
const fmtDate = (d, opts = { day: "numeric", month: "long", year: "numeric" }) => d.toLocaleDateString("en-GB", opts);
const calendarDaysBetween = (a, b) => Math.round((b - a) / DAY);  // rounding absorbs daylight-saving shifts

/* ---------- Settings: CONFIG + optional on-device overrides ----------
   An on-device change (from the Settings sheet) wins until CONFIG itself
   is edited — then the new CONFIG value wins. So editing script.js always
   updates both phones, even if someone tapped the toggle earlier.        */
const saved = () => store.get("settings", {});
function effective(name) {
  const s = saved();
  if (s[name] !== undefined && s[name + "Base"] === CONFIG[name]) return s[name];
  return CONFIG[name];
}
function setOverride(name, value) {
  const s = saved();
  s[name] = value; s[name + "Base"] = CONFIG[name];
  store.set("settings", s);
}

/* The due date comes ONLY from CONFIG.dueDate, so every phone shows the same
   countdown. If it's missing or mistyped we return null and the page says so,
   rather than inventing a date from "today". */
function getDueDate() {
  return parseDate(CONFIG.dueDate);
}
function getGender() {
  const g = effective("gender");
  return ["boy", "girl"].includes(g) ? g : "unknown";
}

/* ---------- Pregnancy maths (40 weeks = 280 days from LMP) ---------- */
function pregnancy() {
  const due = getDueDate();
  if (!due) return null;
  const today = startOfToday();
  const daysLeft = calendarDaysBetween(today, due);
  const gestDays = 280 - daysLeft;
  const week = Math.floor(gestDays / 7);
  return {
    due, daysLeft, gestDays, week, dayOfWeek: ((gestDays % 7) + 7) % 7,
    trimester: week < 14 ? 1 : week < 28 ? 2 : 3,
    percent: Math.max(0, Math.min(100, (gestDays / 280) * 100)),
    timelineWeek: Math.max(7, Math.min(40, week))
  };
}
// The calendar date on which a given week (N weeks + 0 days) begins.
const weekStart = (p, w) => new Date(p.due.getFullYear(), p.due.getMonth(), p.due.getDate() - (280 - w * 7));

/* ======================= DATA ======================= */

/* Sizes are approximate averages from common pregnancy references.
   Weeks 7–19: crown-to-rump length. Week 20+: head-to-heel length. */
const WEEKS = [
  { w: 7,  name: "a blueberry", cm: 1.3, g: "under 1 g", art: { t: "round", f: "#5B6FA8", r: 58, crown: 1 },
    baby: "The brain and face are forming fast. Tiny arm and leg buds are growing, and the little heart is already beating.",
    mama: "Tiredness, nausea and tender breasts are very common now. Small, frequent snacks and plenty of rest can help." },
  { w: 8,  name: "a raspberry", cm: 1.6, g: "about 1 g", art: { t: "raspberry", f: "#D9566E" },
    baby: "Fingers and toes are starting to form (still a little webbed), and baby makes tiny movements — far too small to feel yet.",
    mama: "Nausea and fatigue often peak around weeks 8–10. Tell the doctor if you can't keep food or fluids down." },
  { w: 9,  name: "a grape", cm: 2.3, g: "about 2 g", art: { t: "grapes", f: "#9C7BB8" },
    baby: "The face is more defined now — eyelids, the tip of the nose and the ears are taking shape.",
    mama: "Mood swings and food aversions are common as hormones rise. Be extra kind to yourself." },
  { w: 10, name: "a strawberry", cm: 3.1, g: "about 4 g", art: { t: "strawberry", f: "#E25D5D" },
    baby: "The major organs are in place and will keep developing for months. From about now, the embryo is called a fetus. Tiny nails are beginning.",
    mama: "Clothes may feel snug around the waist, even before there's a visible bump." },
  { w: 11, name: "a lime", cm: 4.1, g: "about 7 g", art: { t: "round", f: "#8DBF5A", r: 56, leaf: 1, citrus: 1 },
    baby: "Baby can open and close tiny hands, bones are beginning to harden, and tooth buds are forming under the gums.",
    mama: "For some, nausea starts to ease over the coming weeks — but every pregnancy is different." },
  { w: 12, name: "a plum", cm: 5.4, g: "about 14 g", art: { t: "round", f: "#8C5A8E", r: 58, stem: 1, crease: 1 },
    baby: "Reflexes are developing — baby may curl tiny toes or startle. The kidneys are starting to work.",
    mama: "Many women feel a little more energy as the first trimester comes to an end.",
    note: "A first-trimester scan and screening are often offered around 11–14 weeks — ask the doctor what's available." },
  { w: 13, name: "a peach", cm: 7.4, g: "about 23 g", art: { t: "round", f: "#F4A77E", r: 60, leaf: 1, crease: 1, blush: "#EE8C7A" },
    baby: "The last week of the first trimester. Vocal cords are developing, and the body is starting to catch up with the head.",
    mama: "Goodbye, first trimester! Many couples choose around now to share their happy news." },
  { w: 14, name: "a lemon", cm: 8.7, g: "about 43 g", art: { t: "oval", f: "#F2D35B", rx: 52, ry: 66, rot: 35, tips: 1 },
    baby: "Baby can squint, frown and make little faces, and fine downy hair (lanugo) is starting to grow.",
    mama: "Welcome to the second trimester — for many, the most comfortable stretch, with more energy." },
  { w: 15, name: "an apple", cm: 10.1, g: "about 70 g", art: { t: "round", f: "#E0605A", r: 62, stem: 1, leaf: 1, apple: 1 },
    baby: "Bones keep hardening, and baby may sense light through closed eyelids.",
    mama: "A stuffy nose or sensitive gums can happen as blood volume increases. Keep up gentle dental care." },
  { w: 16, name: "an avocado", cm: 11.6, g: "about 100 g", art: { t: "avocado", f: "#6E8B3D" },
    baby: "The eyes can make small movements, and the heart is pumping lots of blood every day.",
    mama: "Some feel the first flutters somewhere between about 16 and 25 weeks — often later in a first pregnancy." },
  { w: 17, name: "a pear", cm: 13, g: "about 140 g", art: { t: "pear", f: "#C9D46A" },
    baby: "Fat stores are beginning to develop, and the skeleton is changing from soft cartilage to bone.",
    mama: "Appetite may pick up. You might feel twinges as the ligaments stretch around the growing bump." },
  { w: 18, name: "a sweet potato", cm: 14.2, g: "about 190 g", art: { t: "oval", f: "#B5654A", rx: 44, ry: 76, rot: 62, potato: 1 },
    baby: "The ears are now in position, and baby may start to hear sounds — maybe even your voices.",
    mama: "As the bump grows, sleeping on your side may feel more comfortable.",
    note: "The detailed anatomy scan usually happens between about 18 and 22 weeks." },
  { w: 19, name: "a mango", cm: 15.3, g: "about 240 g", art: { t: "oval", f: "#F2B04A", rx: 56, ry: 72, rot: -28, blush: "#E9835A", leaf: 1 },
    baby: "A protective creamy coating called vernix is forming on the skin, and the senses are developing quickly.",
    mama: "Backaches or a little dizziness can happen. Stand up slowly and mention anything worrying to the doctor." },
  { w: 20, name: "a banana", cm: 25.6, g: "about 300 g", art: { t: "banana", f: "#F3D35C" },
    baby: "Halfway there! Baby is swallowing and practising kicks. From now on, length is measured head-to-heel.",
    mama: "The bump is usually more noticeable now. Halfway — what a milestone!" },
  { w: 21, name: "a carrot", cm: 26.7, g: "about 360 g", art: { t: "carrot", f: "#EE8A3C" },
    baby: "Movements are becoming more coordinated, and baby is getting stronger every day.",
    mama: "Kicks may start to feel clearer. Some mild swelling of the feet and ankles is common." },
  { w: 22, name: "a papaya", cm: 27.8, g: "about 430 g", art: { t: "papaya", f: "#F08A4B" },
    baby: "Lips, eyelids and eyebrows are more distinct, and baby's grip is getting stronger.",
    mama: "Stretch marks or other skin changes may appear. A gentle moisturiser can feel soothing." },
  { w: 23, name: "a grapefruit", cm: 28.9, g: "about 500 g", art: { t: "citrusHalf", f: "#F28A72" },
    baby: "Baby can feel movement and may respond to loud sounds. The lungs are developing for breathing later on.",
    mama: "Some feel 'practice' tightenings (Braxton Hicks). Ask the doctor what's normal and what isn't." },
  { w: 24, name: "an ear of corn", cm: 30, g: "about 600 g", art: { t: "corn", f: "#F2CC4E" },
    baby: "The lungs are growing branches and the cells that make surfactant, which helps breathing after birth.",
    mama: "Many doctors check for gestational diabetes at around 24–28 weeks." },
  { w: 25, name: "a cauliflower", cm: 34.6, g: "about 660 g", art: { t: "cauliflower", f: "#F4EEDC" },
    baby: "Baby is adding baby fat, and the skin is smoothing out. Hair is growing, too.",
    mama: "Heartburn and trouble sleeping are common. Smaller meals and an extra pillow may help." },
  { w: 26, name: "a head of lettuce", cm: 35.6, g: "about 760 g", art: { t: "leafy", f: "#9CCB6B" },
    baby: "Around now the eyes begin to open, and baby reacts to sounds — your voices are becoming familiar.",
    mama: "More aches and pressure are normal. Keep moving gently if the doctor says it's fine." },
  { w: 27, name: "a cabbage", cm: 36.6, g: "about 875 g", art: { t: "leafy", f: "#A9C98C", cabbage: 1 },
    baby: "The brain is very active, and baby now has regular times of sleeping and waking.",
    mama: "The last week of the second trimester! Leg cramps may visit at night." },
  { w: 28, name: "an eggplant", cm: 37.6, g: "about 1 kg", art: { t: "eggplant", f: "#6B4A86" },
    baby: "Third trimester! Baby can blink, and the brain is busy making billions of new connections.",
    mama: "Doctor's appointments often become more frequent from now on." },
  { w: 29, name: "a butternut squash", cm: 38.6, g: "about 1.15 kg", art: { t: "pear", f: "#E9B36A", squash: 1 },
    baby: "Muscles and lungs keep maturing, and the head is growing to make room for a growing brain.",
    mama: "Kicks are strong now. Tiredness may return — rest whenever you can." },
  { w: 30, name: "a coconut", cm: 39.9, g: "about 1.3 kg", art: { t: "coconut", f: "#8A6146" },
    baby: "Baby is putting on weight steadily, and the surface of the brain is beginning to fold.",
    mama: "Feeling short of breath can happen as baby takes up more room." },
  { w: 31, name: "a pineapple", cm: 41.1, g: "about 1.5 kg", art: { t: "pineapple", f: "#E7B44A" },
    baby: "The senses keep maturing, and baby may react to light and to sounds from outside.",
    mama: "Braxton Hicks may be more noticeable. Call the doctor if tightenings become regular or painful." },
  { w: 32, name: "a bunch of kale", cm: 42.4, g: "about 1.7 kg", art: { t: "leafy", f: "#5E8A5A", kale: 1 },
    baby: "Baby is practising breathing and swallowing, and the fingernails and toenails have grown in.",
    mama: "Many babies settle head-down over the coming weeks." },
  { w: 33, name: "a cantaloupe", cm: 43.7, g: "about 1.9 kg", art: { t: "round", f: "#E8C07A", r: 68, net: 1 },
    baby: "Bones are hardening (the skull stays soft for birth), and the immune system is building up.",
    mama: "Sleep may be harder to find. Side-sleeping with a pillow between the knees can help." },
  { w: 34, name: "a honeydew melon", cm: 45, g: "about 2.1 kg", art: { t: "round", f: "#CFE0A0", r: 70, stem: 1 },
    baby: "The nervous system and lungs keep maturing, and baby's arms and legs are filling out.",
    mama: "A good time to finish the hospital bag and plan the route to the hospital." },
  { w: 35, name: "a romaine lettuce", cm: 46.2, g: "about 2.4 kg", art: { t: "leafy", f: "#8EC06C", tall: 1 },
    baby: "Space is getting cosy, so movements feel more like rolls and stretches. Most growth now is weight.",
    mama: "More bathroom trips are normal as baby settles lower." },
  { w: 36, name: "a leek", cm: 47.4, g: "about 2.6 kg", art: { t: "leek", f: "#7FAE5E" },
    baby: "Baby is shedding most of the downy lanugo hair and gaining weight quickly.",
    mama: "Check-ups may become weekly. Keep the hospital bag by the door." },
  { w: 37, name: "a bunch of chard", cm: 48.6, g: "about 2.9 kg", art: { t: "leafy", f: "#5F9356", tall: 1, chard: 1 },
    baby: "Baby is practising breathing, sucking and grasping — getting ready for the outside world.",
    mama: "Rest, rest, rest. Any day in the coming weeks could be the day.",
    note: "From 37 weeks a baby is considered 'early term'; 39–40 weeks is 'full term'." },
  { w: 38, name: "a small watermelon", cm: 49.8, g: "about 3.1 kg", art: { t: "round", f: "#6FA35A", r: 70, stripes: 1 },
    baby: "The organs are ready for life outside, and baby has a surprisingly firm grip.",
    mama: "Swelling and pelvic pressure are common. Keep the doctor's guidance on signs of labour close by." },
  { w: 39, name: "a small pumpkin", cm: 50.7, g: "about 3.3 kg", art: { t: "pumpkin", f: "#EC9A48" },
    baby: "Baby is fully developed and keeps adding a little fat to stay warm after birth.",
    mama: "Almost there. Breathe, rest, and let {father} spoil you." },
  { w: 40, name: "a watermelon", cm: 51.2, g: "about 3.4 kg", art: { t: "round", f: "#5E9A4E", r: 74, stripes: 1 },
    baby: "Due date week! Only a few babies arrive exactly on their due date — whenever you come, you're right on time.",
    mama: "The doctor will guide what happens next if baby needs a little extra time." }
];

const MILESTONES = [
  { id: "positive",  title: "First positive test",            hint: "The moment everything changed" },
  { id: "doctor",    title: "First doctor appointment",       hint: "Usually around weeks 6–10" },
  { id: "ultra1",    title: "First ultrasound",               hint: "Often in the first trimester" },
  { id: "heartbeat", title: "First heartbeat",                hint: "That tiny flicker on the screen" },
  { id: "hear",      title: "First time hearing the heartbeat", hint: "The best sound in the world" },
  { id: "see",       title: "First time seeing baby",         hint: "Hello, little one" },
  { id: "sex",       title: "Finding out: {boy} or {girl}?",  hint: "From around week 10, depending on the test" },
  { id: "anatomy",   title: "Anatomy scan",                   hint: "Usually around weeks 18–22" },
  { id: "kicks",     title: "First kicks",                    hint: "Often between weeks 16–25" },
  { id: "nursery",   title: "Preparing the nursery",          hint: "A little room for a little person" },
  { id: "shower",    title: "Baby shower",                    hint: "Celebrating with family & friends" },
  { id: "bag",       title: "Hospital bag packed",            hint: "Ideally by around week 36" },
  { id: "tri3",      title: "Final trimester",                hint: "Week 28", week: 28 },
  { id: "w36",       title: "36 weeks",                       hint: "The home stretch", week: 36 },
  { id: "w37",       title: "37 weeks",                       hint: "Early term", week: 37 },
  { id: "w38",       title: "38 weeks",                       hint: "Any day now…", week: 38 },
  { id: "w39",       title: "39 weeks",                       hint: "Full term", week: 39 },
  { id: "w40",       title: "40 weeks",                       hint: "Due date week", week: 40 },
  { id: "due",       title: "Due date",                       hint: "", due: true }
];

const PREP = [
  { id: "ess", title: "Baby essentials", groups: [{ items: ["Newborn clothes", "Bodysuits", "Sleepsuits", "Socks", "Hats", "Blankets", "Swaddles"] }] },
  { id: "sleep", title: "Sleep", groups: [{ items: ["Crib / bassinet", "Mattress", "Fitted sheets", "Waterproof mattress protector"] }] },
  { id: "feed", title: "Feeding", groups: [{ items: ["Bottles", "Bottle brush", "Burp cloths", "Breastfeeding supplies (if needed)"] }] },
  { id: "go", title: "Transportation", groups: [{ items: ["Infant car seat", "Stroller", "Baby carrier"] }] },
  { id: "bath", title: "Bath & hygiene", groups: [{ items: ["Baby bathtub", "Towels", "Washcloths", "Diapers", "Wipes", "Changing mat", "Diaper cream"] }] },
  { id: "bag", title: "Hospital bag", groups: [
    { label: "For {mother}", items: ["Comfortable clothes", "Nursing bras", "Toiletries", "Maternity pads", "Phone charger", "Documents"] },
    { label: "For baby", items: ["Newborn clothes", "Diapers", "Blanket", "Hat", "Going-home outfit"] },
    { label: "For {father}", items: ["Charger", "Comfortable clothes", "Snacks", "Documents", "Water"] }
  ] }
];

const MISSION = [
  { id: "care",   t: "Take care of {mother}",            s: "Primary objective. Non-negotiable. Forever." },
  { id: "appts",  t: "Attend appointments when possible", s: "Hold her hand, ask the questions, remember the answers." },
  { id: "learn",  t: "Learn about baby care",            s: "Diapers, burping, swaddling. Yes, there will be a test." },
  { id: "nurs",   t: "Prepare the nursery",              s: "Assemble the furniture. Bonus points for zero leftover screws." },
  { id: "bag",    t: "Prepare the hospital bag",         s: "Chargers, documents, snacks. Especially the snacks." },
  { id: "names",  t: "Choose baby names",                s: "{boy} or {girl}? Honestly, already nailed it." },
  { id: "photos", t: "Take pregnancy photos",            s: "Same spot every month. Watch the bump grow." },
  { id: "hugs",   t: "Give {mother} extra hugs",         s: "Recommended dose: unlimited. No side effects." },
  { id: "sleep",  t: "Prepare for sleepless nights 😂",   s: "Training: wake up at 3 a.m. for no reason. Smile anyway." },
  { id: "meet",   t: "Be ready to meet {boy} / {girl}",  s: "The final mission. The best day of your life." }
];
const RANKS = ["Recruit", "Recruit", "Trainee Dad", "Trainee Dad", "Dad-in-Training", "Dad-in-Training", "Senior Dad Agent", "Senior Dad Agent", "Elite Papa", "Elite Papa", "Legendary Papa ❤️"];

const NOTES = [
  "You are growing a heartbeat. Take it easy today.",
  "Our little one is so lucky to have you as a mother.",
  "Every week they grow a little bigger — and so does my love for you.",
  "Resting is part of the job now. You're doing beautifully.",
  "I'm so proud of you, every single day.",
  "Whatever you need today, just ask. I'm right here.",
  "Two hearts in one body. I love you both.",
  "You make this whole journey beautiful.",
  "One day closer to meeting our little one.",
  "You are stronger than you know.",
  "Have a glass of water, beautiful. Doctor's orders — well, mine.",
  "Thank you for carrying our whole world.",
  "Some days are hard. You don't have to be perfect — just you.",
  "I fall for you a little more every week."
];

const MEMORIES = [
  { id: "ultrasound", title: "First ultrasound" },
  { id: "bump",       title: "First bump photo" },
  { id: "family",     title: "First family photo" },
  { id: "nursery",    title: "Nursery" },
  { id: "shower",     title: "Baby shower" },
  { id: "hospital",   title: "Hospital day" },
  { id: "first",      title: "First photo of baby" }
];

/* ======================= FRUIT ILLUSTRATIONS (SVG) ======================= */

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
const LEAF = "#7FAF6B", STEM = "#7A5A3E";
const leafPath = (x, y, rot = -30, s = 1, c = LEAF) =>
  `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0 C 10 -14, 30 -14, 38 0 C 30 12, 10 12, 0 0 Z" fill="${c}"/><path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M3 0 H 32" stroke="${shade(c, -.25)}" stroke-width="1.5" stroke-linecap="round"/>`;
const shine = (cx, cy, rx, ry, rot = -30) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#fff" opacity=".35"/>`;

const ART = {
  round(a) {
    const r = a.r || 60, f = a.f, d = shade(f, -.22);
    let s = `<circle cx="100" cy="${110 - (60 - r) * .2}" r="${r}" fill="${f}"/>`;
    const cy = 110 - (60 - r) * .2, top = cy - r;
    if (a.blush) s += `<circle cx="${100 + r * .25}" cy="${cy + r * .15}" r="${r * .72}" fill="${a.blush}" opacity=".45"/>`;
    if (a.apple) s += `<path d="M${100 - r * .35} ${top + 4} Q100 ${top + 16} ${100 + r * .35} ${top + 4}" stroke="${d}" stroke-width="3" fill="none" opacity=".5"/>`;
    if (a.citrus) for (let i = 0; i < 26; i++) { const an = i * 2.4, rr = r * (.25 + (i % 5) * .14); s += `<circle cx="${100 + Math.cos(an) * rr}" cy="${cy + Math.sin(an) * rr}" r="1.4" fill="${d}" opacity=".35"/>`; }
    if (a.crease) s += `<path d="M100 ${top + 6} Q ${100 + r * .35} ${cy} 100 ${cy + r - 4}" stroke="${d}" stroke-width="2.5" fill="none" opacity=".45" stroke-linecap="round"/>`;
    if (a.net) s += `<clipPath id="clipN${r}"><circle cx="100" cy="${cy}" r="${r - 1}"/></clipPath>`;
    if (a.net) for (let i = -3; i <= 3; i++) {
      s += `<path d="M${100 + i * r * .28} ${top + 4} Q ${100 + i * r * .28 + r * .5} ${cy} ${100 + i * r * .28} ${cy + r - 4}" stroke="${shade(f, .45)}" stroke-width="2" fill="none" opacity=".8" clip-path="url(#clipN${r})"/>`;
      s += `<path d="M${100 + i * r * .28} ${top + 4} Q ${100 + i * r * .28 - r * .5} ${cy} ${100 + i * r * .28} ${cy + r - 4}" stroke="${shade(f, .45)}" stroke-width="2" fill="none" opacity=".8" clip-path="url(#clipN${r})"/>`;
    }
    if (a.stripes) {
      s += `<clipPath id="clipW${r}"><circle cx="100" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#clipW${r})">`;
      for (let i = -3; i <= 3; i++) s += `<path d="M${100 + i * r * .32} ${top - 4} q ${r * .18} ${r * .5} 0 ${r} q ${-r * .18} ${r * .5} 0 ${r}" stroke="${shade(f, -.35)}" stroke-width="${r * .12}" fill="none" stroke-linejoin="round"/>`;
      s += `</g>`;
    }
    s += shine(100 - r * .38, cy - r * .38, r * .2, r * .11);
    if (a.crown) s += `<path d="M${100 - 9} ${top + 8} l4 5 l5 -6 l5 6 l4 -5 l-2 9 h-14 z" fill="${shade(f, -.35)}"/>`;
    if (a.stem) s += `<path d="M100 ${top + 6} q 2 -12 8 -18" stroke="${STEM}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    if (a.leaf) s += leafPath(102, top + 2, -28, r / 60);
    return s;
  },
  raspberry(a) {
    const f = a.f; let s = "";
    const rows = [[100, 70, 3], [100, 86, 4], [100, 102, 5], [100, 118, 5], [100, 134, 4], [100, 150, 3]];
    rows.forEach(([cx, y, n], ri) => { for (let i = 0; i < n; i++) { const x = cx + (i - (n - 1) / 2) * 17; s += `<circle cx="${x}" cy="${y}" r="10" fill="${ri % 2 ? f : shade(f, -.08)}"/><circle cx="${x - 3}" cy="${y - 3}" r="3" fill="#fff" opacity=".35"/>`; } });
    s += leafPath(100, 58, -150, .9) + leafPath(100, 58, -30, .9) + leafPath(100, 58, -90, .7);
    return s;
  },
  grapes(a) {
    const f = a.f; let s = `<path d="M100 48 q 4 -12 14 -16" stroke="${STEM}" stroke-width="4" fill="none" stroke-linecap="round"/>` + leafPath(104, 50, -20, .9);
    [[78, 70], [102, 68], [126, 72], [88, 92], [114, 92], [100, 114], [76, 112], [124, 112], [90, 134], [112, 134], [101, 154]].forEach(([x, y], i) =>
      s += `<circle cx="${x}" cy="${y}" r="15" fill="${i % 3 ? f : shade(f, -.1)}"/><circle cx="${x - 5}" cy="${y - 5}" r="4" fill="#fff" opacity=".4"/>`);
    return s;
  },
  strawberry(a) {
    const f = a.f; let s = `<path d="M100 172 C 60 150, 42 110, 52 82 C 60 62, 82 58, 100 64 C 118 58, 140 62, 148 82 C 158 110, 140 150, 100 172 Z" fill="${f}"/>`;
    for (let i = 0; i < 22; i++) { const x = 68 + (i % 5) * 16 + (Math.floor(i / 5) % 2) * 8, y = 84 + Math.floor(i / 5) * 18; if (Math.abs(x - 100) < 52 - (y - 84) * .45) s += `<ellipse cx="${x}" cy="${y}" rx="2" ry="3" fill="#F7E07A"/>`; }
    s += shine(74, 86, 10, 6);
    s += `<path d="M72 66 L88 58 L84 46 L100 56 L116 46 L112 58 L128 66 L106 68 L100 76 L94 68 Z" fill="${LEAF}"/>`;
    return s;
  },
  oval(a) {
    const f = a.f; let s = `<g transform="rotate(${a.rot || 0} 100 105)">`;
    s += `<ellipse cx="100" cy="105" rx="${a.rx}" ry="${a.ry}" fill="${f}"/>`;
    if (a.tips) s += `<ellipse cx="100" cy="${105 - a.ry + 2}" rx="7" ry="6" fill="${f}"/><ellipse cx="100" cy="${105 + a.ry - 2}" rx="6" ry="5" fill="${shade(f, -.06)}"/>`;
    if (a.blush) s += `<ellipse cx="${100 + a.rx * .2}" cy="${105 + a.ry * .25}" rx="${a.rx * .75}" ry="${a.ry * .6}" fill="${a.blush}" opacity=".35"/>`;
    if (a.potato) [[-14, -30], [10, -6], [-8, 22], [14, 40]].forEach(([x, y]) => s += `<path d="M${100 + x - 5} ${105 + y} q5 -3 10 0" stroke="${shade(f, -.3)}" stroke-width="2" fill="none" stroke-linecap="round"/>`);
    s += shine(100 - a.rx * .4, 105 - a.ry * .45, a.rx * .2, a.ry * .1, 0);
    if (a.leaf) s += `<path d="M100 ${105 - a.ry + 4} q 2 -10 6 -14" stroke="${STEM}" stroke-width="4" fill="none" stroke-linecap="round"/>` + leafPath(104, 105 - a.ry - 6, -40, .9);
    return s + `</g>`;
  },
  avocado(a) {
    const f = a.f;
    return `<path d="M100 38 C 124 38, 132 70, 146 104 C 160 142, 134 172, 100 172 C 66 172, 40 142, 54 104 C 68 70, 76 38, 100 38 Z" fill="${f}"/>
      <path d="M100 50 C 118 50, 124 76, 136 106 C 148 138, 126 160, 100 160 C 74 160, 52 138, 64 106 C 76 76, 82 50, 100 50 Z" fill="#E6EDA6"/>
      <path d="M100 62 C 114 62, 118 82, 126 106 C 134 132, 120 150, 100 150 C 80 150, 66 132, 74 106 C 82 82, 86 62, 100 62 Z" fill="#D2E08A" opacity=".6"/>
      <circle cx="100" cy="122" r="22" fill="#9A6A45"/><circle cx="93" cy="115" r="6" fill="#fff" opacity=".3"/>`;
  },
  pear(a) {
    const f = a.f, sq = a.squash;
    const body = sq
      ? `<path d="M100 40 C 120 40, 122 62, 120 84 C 118 100, 148 116, 146 142 C 144 168, 122 178, 100 178 C 78 178, 56 168, 54 142 C 52 116, 82 100, 80 84 C 78 62, 80 40, 100 40 Z" fill="${f}"/>`
      : `<path d="M100 46 C 118 46, 124 64, 124 80 C 124 96, 150 110, 150 138 C 150 164, 128 176, 100 176 C 72 176, 50 164, 50 138 C 50 110, 76 96, 76 80 C 76 64, 82 46, 100 46 Z" fill="${f}"/>`;
    let s = body + shine(78, 130, 9, 16, 10);
    if (sq) s += `<path d="M100 40 v -10" stroke="${STEM}" stroke-width="7" stroke-linecap="round"/><ellipse cx="100" cy="148" rx="20" ry="18" fill="${shade(f, -.08)}" opacity=".5"/>`;
    else s += `<path d="M100 48 q 0 -12 -6 -18" stroke="${STEM}" stroke-width="4" fill="none" stroke-linecap="round"/>` + leafPath(100, 44, -35, .8);
    return s;
  },
  banana(a) {
    const f = a.f;
    return `<path d="M38 70 C 46 128, 100 166, 164 136 C 172 132, 170 124, 162 124 C 108 140, 66 114, 54 66 C 52 58, 40 58, 38 70 Z" fill="${f}"/>
      <path d="M54 76 C 70 122, 110 142, 158 130" stroke="${shade(f, -.18)}" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>
      <path d="M38 70 L 34 56 L 46 54 L 48 64 Z" fill="${STEM}"/><circle cx="166" cy="130" r="4" fill="${STEM}"/>`;
  },
  carrot(a) {
    const f = a.f;
    return `<g transform="rotate(25 100 110)"><path d="M100 178 C 92 150, 76 90, 78 68 C 80 56, 120 56, 122 68 C 124 90, 108 150, 100 178 Z" fill="${f}"/>
      ${[86, 102, 118, 134].map((y, i) => `<path d="M${84 + i * 2} ${y} h ${8 - i}" stroke="${shade(f, -.22)}" stroke-width="2.5" stroke-linecap="round"/>`).join("")}
      ${shine(90, 80, 4, 12, 0)}
      <path d="M100 62 C 98 46, 90 36, 80 32 M100 62 C 100 44, 102 34, 104 26 M100 62 C 104 46, 114 38, 124 36" stroke="${LEAF}" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  },
  papaya(a) {
    const f = a.f;
    let s = `<g transform="rotate(-20 100 105)"><ellipse cx="100" cy="105" rx="52" ry="74" fill="#9CB55B"/><ellipse cx="100" cy="105" rx="46" ry="68" fill="${f}"/><ellipse cx="100" cy="112" rx="18" ry="34" fill="#F5B184"/>`;
    for (let i = 0; i < 14; i++) s += `<circle cx="${100 + Math.sin(i * 1.7) * 10}" cy="${90 + i * 3.4}" r="4" fill="#3A2C2A"/>`;
    return s + shine(76, 66, 6, 14, 0) + `</g>`;
  },
  citrusHalf(a) {
    const f = a.f; let s = `<circle cx="100" cy="108" r="66" fill="#F6C27A"/><circle cx="100" cy="108" r="58" fill="#FBEBD7"/><circle cx="100" cy="108" r="53" fill="${f}"/>`;
    for (let i = 0; i < 10; i++) { const an = i * Math.PI / 5; s += `<line x1="100" y1="108" x2="${100 + Math.cos(an) * 53}" y2="${108 + Math.sin(an) * 53}" stroke="#FBEBD7" stroke-width="3"/>`; }
    return s + `<circle cx="100" cy="108" r="6" fill="#FBEBD7"/>` + shine(76, 84, 10, 5);
  },
  corn(a) {
    const f = a.f; let s = `<g transform="rotate(30 100 105)"><ellipse cx="100" cy="100" rx="28" ry="66" fill="${f}"/>`;
    for (let y = 44; y < 160; y += 11) for (let x = -2; x <= 2; x++) { const w = 28 * Math.sqrt(Math.max(0, 1 - ((y - 100) / 66) ** 2)); const cx = 100 + x * 10.5; if (Math.abs(cx - 100) < w - 5) s += `<rect x="${cx - 4.5}" y="${y - 4.5}" width="9" height="9" rx="3.5" fill="${shade(f, x % 2 ? .12 : -.04)}"/>`; }
    s += `<path d="M100 178 C 70 150, 64 110, 70 70 C 76 120, 90 150, 100 166 Z" fill="${LEAF}"/><path d="M100 178 C 130 150, 136 110, 130 70 C 124 120, 110 150, 100 166 Z" fill="${shade(LEAF, -.1)}"/>`;
    return s + `</g>`;
  },
  cauliflower(a) {
    let s = leafPath(100, 140, 200, 1.6) + leafPath(100, 140, -20, 1.6) + leafPath(100, 150, 250, 1.3) + leafPath(100, 150, -70, 1.3);
    [[100, 80, 24], [72, 96, 22], [128, 96, 22], [86, 118, 22], [114, 118, 22], [60, 120, 16], [140, 120, 16], [100, 104, 22]].forEach(([x, y, r]) => s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${a.f}"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#E2D8BE" stroke-width="2"/>`);
    return s;
  },
  leafy(a) {
    const f = a.f, d = shade(f, -.2), l = shade(f, .25); let s = "";
    if (a.tall) {
      const stem = a.chard ? "#D6545E" : shade(f, .5);
      [[-34, -18], [34, 18], [-16, -6], [16, 6], [0, 0]].forEach(([dx, rot], i) => {
        s += `<g transform="rotate(${rot} 100 178)"><path d="M100 178 C ${80 + dx * .5} 140, ${66 + dx} 70, ${100 + dx * .6} 30 C ${134 + dx} 70, ${120 + dx * .5} 140, 100 178 Z" fill="${i % 2 ? f : d}"/><path d="M100 176 L ${100 + dx * .55} 40" stroke="${stem}" stroke-width="${a.chard ? 5 : 3.5}" stroke-linecap="round"/></g>`;
      });
      return s;
    }
    if (a.kale) {
      [[-40, 0], [40, 0], [-20, -6], [20, -6], [0, -10]].forEach(([dx, dy], i) => {
        const x = 100 + dx, y = 92 + dy;
        s += `<path d="M100 178 L ${x} ${y}" stroke="${shade(f, .4)}" stroke-width="4" stroke-linecap="round"/>`;
        for (let k = 0; k < 6; k++) s += `<circle cx="${x + Math.cos(k) * 16}" cy="${y + Math.sin(k * 1.3) * 14 - 8}" r="16" fill="${(i + k) % 2 ? f : d}"/>`;
      });
      return s;
    }
    s += `<circle cx="100" cy="112" r="64" fill="${d}"/>`;
    for (let k = 0; k < 7; k++) { const an = k / 7 * Math.PI * 2; s += `<ellipse cx="${100 + Math.cos(an) * 34}" cy="${112 + Math.sin(an) * 34}" rx="34" ry="28" transform="rotate(${an * 57} ${100 + Math.cos(an) * 34} ${112 + Math.sin(an) * 34})" fill="${f}"/>`; }
    s += `<circle cx="100" cy="110" r="34" fill="${l}"/>`;
    if (a.cabbage) for (let k = 0; k < 4; k++) s += `<path d="M${70 + k * 8} ${92 + k * 2} Q 100 ${74 + k * 10} ${130 - k * 8} ${92 + k * 2}" stroke="${d}" stroke-width="2" fill="none" opacity=".6"/>`;
    else for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI * 2; s += `<path d="M100 110 L ${100 + Math.cos(an) * 30} ${110 + Math.sin(an) * 30}" stroke="${f}" stroke-width="2.5" stroke-linecap="round"/>`; }
    return s;
  },
  eggplant(a) {
    const f = a.f;
    return `<g transform="rotate(-30 100 110)"><path d="M100 54 C 122 54, 124 82, 132 110 C 142 148, 124 178, 100 178 C 76 178, 58 148, 68 110 C 76 82, 78 54, 100 54 Z" fill="${f}"/>
      ${shine(82, 120, 6, 20, 8)}
      <path d="M78 64 C 86 48, 114 48, 122 64 L 112 60 L 100 70 L 88 60 Z" fill="${LEAF}"/><path d="M100 52 v -18" stroke="${shade(LEAF, -.15)}" stroke-width="7" stroke-linecap="round"/></g>`;
  },
  coconut(a) {
    const f = a.f;
    return `<circle cx="100" cy="110" r="64" fill="${f}"/>
      ${Array.from({ length: 16 }, (_, i) => `<path d="M${60 + (i % 4) * 26} ${70 + Math.floor(i / 4) * 22} l 10 4" stroke="${shade(f, -.25)}" stroke-width="2" stroke-linecap="round"/>`).join("")}
      <circle cx="88" cy="76" r="6" fill="${shade(f, -.4)}"/><circle cx="108" cy="72" r="6" fill="${shade(f, -.4)}"/><circle cx="100" cy="90" r="6" fill="${shade(f, -.4)}"/>
      ${shine(66, 82, 10, 6)}`;
  },
  pineapple(a) {
    const f = a.f; let s = "";
    [[-26, -40], [-12, -24], [0, -10], [12, 24], [26, 40], [-4, 0], [6, 12]].forEach(([dx, rot]) => s += `<path d="M100 82 C ${96 + dx * .4} 60, ${96 + dx} 36, ${100 + dx} 18 C ${104 + dx * .6} 40, ${106} 62, 100 82 Z" fill="${dx % 2 ? LEAF : shade(LEAF, -.15)}" transform="rotate(${rot * .3} 100 82)"/>`);
    s += `<ellipse cx="100" cy="130" rx="46" ry="54" fill="${f}"/><clipPath id="pClip"><ellipse cx="100" cy="130" rx="46" ry="54"/></clipPath><g clip-path="url(#pClip)" stroke="${shade(f, -.3)}" stroke-width="2.5" opacity=".7">`;
    for (let i = -6; i <= 6; i++) s += `<line x1="${100 + i * 16}" y1="70" x2="${100 + i * 16 + 70}" y2="190"/><line x1="${100 + i * 16}" y1="70" x2="${100 + i * 16 - 70}" y2="190"/>`;
    return s + `</g>` + shine(78, 108, 6, 12, 10);
  },
  leek(a) {
    const f = a.f;
    return `<g transform="rotate(35 100 105)"><rect x="88" y="78" width="24" height="96" rx="12" fill="#F3F1DC"/><rect x="88" y="78" width="24" height="40" fill="#D8E6B0"/>
      <path d="M94 176 l -6 8 M100 178 v 8 M106 176 l 6 8" stroke="#D9CFA8" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M90 82 C 80 50, 70 30, 64 14 C 82 30, 94 54, 100 80 Z" fill="${f}"/><path d="M110 82 C 120 50, 132 30, 140 16 C 120 30, 106 54, 100 80 Z" fill="${shade(f, -.15)}"/><path d="M100 80 C 98 50, 100 30, 104 8 C 108 30, 106 54, 104 80 Z" fill="${shade(f, .1)}"/></g>`;
  },
  pumpkin(a) {
    const f = a.f, d = shade(f, -.15);
    return `<ellipse cx="62" cy="118" rx="36" ry="52" fill="${d}"/><ellipse cx="138" cy="118" rx="36" ry="52" fill="${d}"/>
      <ellipse cx="82" cy="118" rx="34" ry="56" fill="${f}"/><ellipse cx="118" cy="118" rx="34" ry="56" fill="${f}"/><ellipse cx="100" cy="118" rx="26" ry="58" fill="${shade(f, .08)}"/>
      <path d="M100 64 q -2 -16 10 -26" stroke="${STEM}" stroke-width="8" fill="none" stroke-linecap="round"/>${leafPath(108, 56, -10, .9)}
      ${shine(90, 88, 5, 14, 0)}`;
  }
};

function fruitSVG(entry) {
  const a = entry.art;
  // grow gently with the week: week 7 ≈ 72% → week 40 = 100%
  const s = .72 + .28 * Math.sqrt((entry.w - 7) / 33);
  const body = (ART[a.t] || ART.round)(a);
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Illustration of ${esc(entry.name)}">
    <ellipse cx="100" cy="${100 + 82 * s}" rx="${54 * s}" ry="${7 * s}" fill="#000" opacity=".07"/>
    <g transform="translate(${100 - 100 * s} ${100 - 100 * s}) scale(${s})">${body}</g></svg>`;
}

/* ======================= UI ======================= */

function bindNames() {
  const map = { mother: CONFIG.motherName, father: CONFIG.fatherName, surname: CONFIG.babySurname, boy: CONFIG.boyName, girl: CONFIG.girlName };
  $$("[data-bind]").forEach(el => { const v = map[el.dataset.bind]; if (v) el.textContent = v; });
  document.title = `Baby ${CONFIG.babySurname} ❤️`;   // applyGender() then sets the final title
}

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("is-on"), 2600);
}

/* ---------- Countdown ---------- */
function tick() {
  const p = pregnancy();
  if (!p) return;
  const now = new Date();
  const diff = Math.max(0, p.due - now);
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const set = (id, v) => { const el = document.getElementById(id); if (el.textContent !== String(v)) el.textContent = v; };

  set("cdWeeks", Math.floor(days / 7));
  set("cdDays", days % 7);
  set("cdHours", String(Math.floor(s % 86400 / 3600)).padStart(2, "0"));
  set("cdMinutes", String(Math.floor(s % 3600 / 60)).padStart(2, "0"));
  set("cdSeconds", String(s % 60).padStart(2, "0"));

  // The big number counts calendar days (tomorrow = 1 day away).
  if (p.daysLeft > 0) {
    set("cdDaysBig", p.daysLeft);
    set("cdDaysBigLabel", p.daysLeft === 1 ? "day" : "days");
    set("cdUntil", p.daysLeft === 1 ? "until we meet you — tomorrow!" : "until we meet you");
  } else if (p.daysLeft === 0) {
    set("cdDaysBig", "0"); set("cdDaysBigLabel", "days");
    set("cdUntil", "Today is our due date — any moment now ❤️");
  } else {
    set("cdDaysBig", Math.abs(p.daysLeft)); set("cdDaysBigLabel", Math.abs(p.daysLeft) === 1 ? "day" : "days");
    set("cdUntil", "past our due date — you're worth the wait ❤️");
  }
}

function renderProgress() {
  const p = pregnancy();
  if (!p) {
    $("#heroWeekText").textContent = "";
    $("#heroDueText").textContent = "";
    return;
  }
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  // Standard notation: completed weeks + days (e.g. 7 weeks + 0 days = "7w0d").
  $("#heroWeekText").textContent = p.gestDays < 0 ? "Just beginning"
    : `${plural(p.week, "week")} + ${plural(p.dayOfWeek, "day")}`;
  $("#heroDueText").textContent = `Due ${fmtDate(p.due, { day: "numeric", month: "short", year: "numeric" })}`;
  $("#heroProgressFill").style.width = p.percent + "%";
  $("#heroProgress").setAttribute("aria-valuenow", Math.round(p.percent));
  $("#heroProgress").setAttribute("aria-valuetext", `${Math.round(p.percent)}% · trimester ${p.trimester}`);
  $$(".progress-tri span").forEach((s, i) => s.classList.toggle("is-now", i + 1 === p.trimester));

  // "When will we know?" status lines
  const until = (w) => w * 7 - p.gestDays;
  const phr = (d) => d < 7 ? plural(d, "day") : `about ${plural(Math.round(d / 7), "week")}`;
  const n = until(10), sc = until(18), scEnd = until(23);
  $("#niptStatus").textContent = n > 0 ? `That's ${phr(n)} from now.` : "This is now an option — ask the doctor whether it's offered.";
  $("#scanStatus").textContent = sc > 0 ? `That's ${phr(sc)} from now.` : scEnd > 0 ? "We're in this window now!" : "This window has passed — we may already know!";
  $("#knowYou").style.left = `${Math.max(0, Math.min(100, (p.gestDays / 7 - 7) / 33 * 100))}%`;
}

/* ---------- Floating particles ---------- */
function particles() {
  const box = $("#particles");
  // With "Reduce motion" on, keep a few still sparkles instead of none at all.
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = innerWidth < 640;
  const n = phone ? 9 : 10;
  const shapes = ["i-heart", "i-star", "i-sparkle", "i-heart"];
  for (let i = 0; i < n; i++) {
    const el = document.createElement("span");
    const size = (phone ? 8 : 6) + Math.random() * (phone ? 8 : 10);
    // spread evenly across the width (with a little jitter) so a small screen never gets clumps
    const left = (i + .2 + Math.random() * .6) / n * 100;
    el.className = still ? "particle particle--still" : "particle";
    el.style.cssText = `left:${left}%;width:${size}px;height:${size}px;animation-duration:${16 + Math.random() * 18}s;animation-delay:${-Math.random() * 30}s;--x:${(Math.random() - .5) * (phone ? 70 : 120)}px;--r:${(Math.random() - .5) * 120}deg;--o:${(phone ? .35 : .25) + Math.random() * .35}` +
      (still ? `;bottom:${12 + Math.random() * 76}%` : "");
    el.innerHTML = `<svg><use href="#${shapes[i % shapes.length]}"/></svg>`;
    box.appendChild(el);
  }
  // Pause every hero animation while the hero is scrolled out of view (saves battery).
  if ("IntersectionObserver" in window) {
    const hero = $(".hero");
    new IntersectionObserver(([en]) => hero.classList.toggle("is-idle", !en.isIntersecting)).observe(hero);
  }
}

/* ---------- Gender / theme ---------- */
const THEME_COLOR = { unknown: "#FBF6EF", boy: "#F4F8FB", girl: "#FCF5F3" };
function applyGender(celebrate = false) {
  const g = getGender();
  document.documentElement.dataset.theme = g === "unknown" ? "neutral" : g;
  $('meta[name="theme-color"]').setAttribute("content", THEME_COLOR[g]);
  $("#who").dataset.gender = g;
  $$("#genderSeg button, #genderSeg2 button").forEach(b => b.setAttribute("aria-checked", String(b.dataset.gender === g)));

  const hello = $("#heroHello");
  // Top-left brand: "Baby Adel" → "Yassin Adel" / "Lily Adel" once we know.
  const first = g === "boy" ? CONFIG.boyName : g === "girl" ? CONFIG.girlName : "Baby";
  const heart = g === "boy" ? "💙" : g === "girl" ? "🩷" : "❤️";
  $("#navFirst").textContent = first;
  $("#letterFirst").textContent = first;   // "Dear Baby Adel…" → "Dear Yassin Adel…" / "Dear Lily Adel…"
  document.title = `${first} ${CONFIG.babySurname} ${heart}`;   // tab title: "Baby Adel ❤️" / "Yassin Adel 💙" / "Lily Adel 🩷"
  $("#heroTitle").classList.toggle("is-name", g !== "unknown");
  if (g === "unknown") {
    hello.hidden = true;
    $("#heroTitle").textContent = "Our Little Miracle";
    $("#whoLead").textContent = "We're waiting to meet you…";
    $("#whoNote").innerHTML = `One day soon, we'll know whether we're welcoming our little ${esc(CONFIG.boyName)} or our little ${esc(CONFIG.girlName)}.`;
  } else {
    const name = first;
    // Small "Hello," above, then the full name as the big title: "Yassin Adel 💙"
    hello.hidden = false;
    hello.textContent = "Hello,";
    $("#heroTitle").innerHTML = `${esc(name)} ${esc(CONFIG.babySurname)} <span class="hero__heart" aria-hidden="true">${heart}</span>`;
    $("#whoLead").textContent = g === "boy" ? "It's a boy!" : "It's a girl!";
    $("#whoNote").innerHTML = `Welcome to the family, little ${esc(name)} ${esc(CONFIG.babySurname)}. We already love you more than words.`;
  }
  updateLetterPlaceholder();
  if (celebrate && g !== "unknown") confetti();
}

function setGender(g) {
  setOverride("gender", g);
  applyGender(true);
  toast(g === "unknown" ? "Back to our little surprise ✨" : `Hello, ${g === "boy" ? CONFIG.boyName + " 💙" : CONFIG.girlName + " 🩷"}`);
}

function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = $("#confetti"); box.innerHTML = "";
  const icons = ["i-heart", "i-star", "i-sparkle"];
  for (let i = 0; i < 46; i++) {
    const el = document.createElement("i");
    const sz = 8 + Math.random() * 12;
    el.style.cssText = `left:${Math.random() * 100}%;width:${sz}px;height:${sz}px;color:var(${i % 3 ? "--accent" : "--accent-2"});animation-duration:${2.4 + Math.random() * 2.2}s;animation-delay:${Math.random() * .6}s;--r:${(Math.random() - .5) * 720}deg`;
    el.innerHTML = `<svg><use href="#${icons[i % 3]}"/></svg>`;
    box.appendChild(el);
  }
  setTimeout(() => (box.innerHTML = ""), 5500);
}

/* ---------- Week journey ---------- */
let selectedWeek = 7;
const NO_DATE = { timelineWeek: 7, week: -1 };
function renderWeekStrip() {
  const p = pregnancy() || NO_DATE;
  const strip = $("#weekStrip");
  strip.innerHTML = WEEKS.map(w => {
    const sep = w.w === 14 ? `<span class="tri-sep">2nd tri</span>` : w.w === 28 ? `<span class="tri-sep">3rd tri</span>` : "";
    const cls = [w.w < p.timelineWeek ? "is-past" : "", w.w === p.timelineWeek && p.week >= 7 && p.week <= 40 ? "is-current" : ""].join(" ");
    return `${sep}<button role="tab" class="${cls}" data-week="${w.w}" aria-selected="false" aria-label="Week ${w.w}${w.w === p.timelineWeek ? ", this week" : ""}"><small>wk</small><b>${w.w}</b></button>`;
  }).join("");
}
function showWeek(w, scroll = true) {
  const entry = WEEKS.find(x => x.w === w); if (!entry) return;
  const p = pregnancy() || NO_DATE;
  selectedWeek = w;
  $$("#weekStrip button").forEach(b => b.setAttribute("aria-selected", String(+b.dataset.week === w)));
  const fruit = $("#weekFruit");
  fruit.innerHTML = fruitSVG(entry);
  fruit.classList.remove("swap"); void fruit.offsetWidth; fruit.classList.add("swap");

  const isNow = w === p.timelineWeek && p.week >= 7 && p.week <= 40;
  $("#weekHere").hidden = !isNow;
  $("#weekNum").textContent = w;
  $("#weekTri").textContent = w < 14 ? "First trimester" : w < 28 ? "Second trimester" : "Third trimester";
  $("#weekSize").textContent = `${isNow ? "Your little one is" : w < p.week ? "Baby was" : "Baby will be"} around the size of ${entry.name}.`;
  $("#weekMeasure").textContent = `≈ ${entry.cm} cm ${w < 20 ? "crown to rump" : "head to heel"} · ${entry.g}`;
  $("#weekBaby").textContent = fill(entry.baby);
  $("#weekMama").textContent = fill(entry.mama);
  const note = $("#weekNote"); note.hidden = !entry.note; note.textContent = entry.note ? fill(entry.note) : "";
  $("#weekPrev").disabled = w <= 7; $("#weekNext").disabled = w >= 40;

  if (scroll) {
    const btn = $(`#weekStrip button[data-week="${w}"]`), strip = $("#weekStrip");
    if (btn) strip.scrollTo({ left: btn.offsetLeft - strip.clientWidth / 2 + btn.offsetWidth / 2, behavior: "smooth" });
  }
}

/* ---------- Milestones ---------- */
function renderMilestones() {
  const done = store.get("milestones", {});
  const p = pregnancy();
  const list = $("#milestoneList");
  const nextId = (MILESTONES.find(m => !done[m.id]) || {}).id;
  list.innerHTML = MILESTONES.map(m => {
    const d = done[m.id];
    // Week milestones show the calendar date they begin, worked out from the due date.
    const short = { day: "numeric", month: "short", year: "numeric" };
    const hint = !p ? fill(m.hint)
      : m.due ? fmtDate(p.due)
      : m.week ? `${m.hint} · from ${fmtDate(weekStart(p, m.week), short)}`
      : fill(m.hint);
    const state = d ? `<span class="ms__state">✓ ${fmtDate(new Date(d), { day: "numeric", month: "short" })}</span>` : "";
    return `<li class="ms ${d ? "is-done" : ""} ${m.id === nextId ? "is-next" : ""}" data-id="${m.id}">
      <button type="button" aria-pressed="${!!d}">
        <span class="ms__dot"><svg><use href="#i-check"/></svg></span>
        <span class="ms__main"><span><span class="ms__title">${esc(fill(m.title))}</span><br><span class="ms__sub">${esc(hint)}</span></span>
        ${state}</span>
      </button></li>`;
  }).join("");
  const n = Object.keys(done).filter(k => MILESTONES.some(m => m.id === k)).length;
  $("#msCount").textContent = `${n} of ${MILESTONES.length}`;
}
function initMilestones() {
  renderMilestones();
  $("#milestoneList").addEventListener("click", e => {
    const li = e.target.closest(".ms"); if (!li) return;
    const done = store.get("milestones", {});
    const id = li.dataset.id;
    if (done[id]) delete done[id]; else done[id] = new Date().toISOString();
    store.set("milestones", done);
    renderMilestones();
    const fresh = $(`.ms[data-id="${id}"]`);
    if (done[id]) { fresh.classList.add("pop"); toast("Moment saved ❤️"); }
  });
}

/* ---------- Checklists (shopping + papa) ---------- */
function checkBtn(key, text, sub, checked) {
  return `<button type="button" class="check" role="checkbox" aria-checked="${checked}" data-key="${esc(key)}">
    <span class="check__box"><svg><use href="#i-check"/></svg></span>
    <span class="check__text">${sub ? `<b>${esc(text)}</b><small>${esc(sub)}</small>` : esc(text)}</span>
    ${sub ? "" : `<span class="check__tag">Purchased</span>`}</button>`;
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function renderPrep() {
  const bought = store.get("shopping", {});
  const custom = store.get("shoppingCustom", {});
  let total = 0, have = 0;
  $("#prepGrid").innerHTML = PREP.map(cat => {
    let cTotal = 0, cHave = 0;
    const groups = cat.groups.map((g, gi) => {
      const items = g.items.map(it => {
        const key = `${cat.id}.${gi}.${slug(it)}`; cTotal++; if (bought[key]) cHave++;
        return `<li>${checkBtn(key, it, null, !!bought[key])}</li>`;
      }).join("");
      return `${g.label ? `<p class="prep__group">${esc(fill(g.label))}</p>` : ""}<ul class="check-list">${items}</ul>`;
    }).join("");
    const extra = (custom[cat.id] || []).map(it => {
      const key = `${cat.id}.c.${it.id}`; cTotal++; if (bought[key]) cHave++;
      return `<li class="check-row">${checkBtn(key, it.text, null, !!bought[key])}<button class="check-del" data-del="${cat.id}:${it.id}" aria-label="Remove ${esc(it.text)}">×</button></li>`;
    }).join("");
    total += cTotal; have += cHave;
    return `<article class="prep" data-cat="${cat.id}">
      <div class="prep__head"><h3>${esc(cat.title)}</h3><span>${cHave}/${cTotal}</span></div>
      <div class="prep__bar"><i style="width:${cTotal ? cHave / cTotal * 100 : 0}%"></i></div>
      ${groups}${extra ? `<p class="prep__group">Our extras</p><ul class="check-list">${extra}</ul>` : ""}
      <form class="add-item" data-add="${cat.id}"><input type="text" maxlength="60" placeholder="Add something…" aria-label="Add an item to ${esc(cat.title)}"><button type="submit" aria-label="Add"><svg><use href="#i-plus"/></svg></button></form>
    </article>`;
  }).join("");
  const pct = total ? Math.round(have / total * 100) : 0;
  $("#prepDone").textContent = have; $("#prepAll").textContent = total;
  $("#prepPct").textContent = pct + "%"; $("#prepRing").style.setProperty("--p", pct);
}
function initPrep() {
  renderPrep();
  const grid = $("#prepGrid");
  grid.addEventListener("click", e => {
    const del = e.target.closest("[data-del]");
    if (del) {
      const [cat, id] = del.dataset.del.split(":");
      const custom = store.get("shoppingCustom", {});
      custom[cat] = (custom[cat] || []).filter(x => x.id !== id);
      store.set("shoppingCustom", custom); renderPrep(); return;
    }
    const b = e.target.closest(".check"); if (!b) return;
    const bought = store.get("shopping", {});
    const k = b.dataset.key;
    if (bought[k]) delete bought[k]; else bought[k] = Date.now();
    store.set("shopping", bought);
    // update in place (keeps focus) then refresh counters
    b.setAttribute("aria-checked", String(!!bought[k]));
    const y = scrollY; renderPrep(); scrollTo(0, y);
    const again = $(`.check[data-key="${CSS.escape(k)}"]`); again && again.focus({ preventScroll: true });
  });
  grid.addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target.closest("[data-add]"); const input = $("input", form);
    const text = input.value.trim(); if (!text) return;
    const custom = store.get("shoppingCustom", {});
    (custom[form.dataset.add] = custom[form.dataset.add] || []).push({ id: Date.now().toString(36), text });
    store.set("shoppingCustom", custom); renderPrep();
    const f2 = $(`[data-add="${form.dataset.add}"] input`); f2 && f2.focus();
  });
}

function renderMission() {
  const done = store.get("mission", {});
  $("#missionList").innerHTML = MISSION.map(m => `<li>${checkBtn("m." + m.id, fill(m.t), fill(m.s), !!done[m.id])}</li>`).join("");
  const n = MISSION.filter(m => done[m.id]).length;
  $("#papaRank").textContent = `${RANKS[Math.min(n, RANKS.length - 1)]} · ${n}/${MISSION.length}`;
}
function initMission() {
  renderMission();
  $("#missionList").addEventListener("click", e => {
    const b = e.target.closest(".check"); if (!b) return;
    const id = b.dataset.key.slice(2);
    const done = store.get("mission", {});
    if (done[id]) delete done[id]; else done[id] = Date.now();
    store.set("mission", done); renderMission();
    const n = MISSION.filter(m => done[m.id]).length;
    if (done[id]) toast(n === MISSION.length ? "Mission complete. Legendary Papa unlocked ❤️" : "Mission progress saved 🫡");
  });
}

/* ---------- Letter to baby ---------- */
function updateLetterPlaceholder() {
  const g = getGender();
  const who = g === "boy" ? CONFIG.boyName : g === "girl" ? CONFIG.girlName : `${CONFIG.boyName} / ${CONFIG.girlName}`;
  $("#babyLetter").placeholder = `Dear ${who},\n\nWe can't wait to meet you...`;
}
function initLetter() {
  const ta = $("#babyLetter"), state = $("#letterState");
  const data = store.get("letter", null);
  if (data && data.text) { ta.value = data.text; showSaved(data.at); }
  function showSaved(at) {
    state.classList.add("is-saved");
    state.textContent = `Saved · ${new Date(at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`;
  }
  function save(manual) {
    const at = Date.now();
    if (store.set("letter", { text: ta.value, at })) { showSaved(at); if (manual) toast("Letter saved ❤️"); }
    else toast("Couldn't save — storage is full or disabled.");
  }
  let t;
  ta.addEventListener("input", () => { state.classList.remove("is-saved"); state.textContent = "Writing…"; clearTimeout(t); t = setTimeout(() => save(false), 900); });
  $("#letterSave").addEventListener("click", () => save(true));
  $("#letterDownload").addEventListener("click", () => {
    const text = ta.value.trim() || ta.placeholder;
    download(`letter-to-baby-${slug(CONFIG.babySurname)}.txt`, text, "text/plain");
  });
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

/* ---------- Memories (photos saved on this device) ---------- */
let pendingMemory = null;
function renderMemories() {
  $("#memoryGrid").innerHTML = MEMORIES.map(m => {
    const data = store.get("mem." + m.id, null);
    if (data && data.img) {
      return `<figure class="memory" data-id="${m.id}"><img src="${data.img}" alt="${esc(m.title)}" loading="lazy" data-zoom>
        <figcaption class="memory__cap"><span><b>${esc(m.title)}</b><small>${fmtDate(new Date(data.at), { day: "numeric", month: "short", year: "numeric" })}</small></span>
        <span class="memory__menu"><button data-change="${m.id}">Change</button><button data-remove="${m.id}">Remove</button></span></figcaption></figure>`;
    }
    return `<figure class="memory" data-id="${m.id}"><button class="memory__add" data-change="${m.id}">
      <span class="memory__icon"><svg><use href="#i-camera"/></svg></span>
      <span class="memory__title">${esc(m.title)}</span><span class="memory__cta">Add photo</span></button></figure>`;
  }).join("");
}
function compress(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1100, k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", .78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unreadable")); };
    img.src = url;
  });
}
function initMemories() {
  renderMemories();
  const input = $("#memoryInput");
  $("#memoryGrid").addEventListener("click", e => {
    const ch = e.target.closest("[data-change]"), rm = e.target.closest("[data-remove]"), zoom = e.target.closest("[data-zoom]");
    if (ch) { pendingMemory = ch.dataset.change; input.value = ""; input.click(); }
    else if (rm) { if (confirm("Remove this photo from this device?")) { store.del("mem." + rm.dataset.remove); renderMemories(); } }
    else if (zoom) {
      const lb = document.createElement("div"); lb.className = "lightbox";
      lb.innerHTML = `<img src="${zoom.src}" alt="${esc(zoom.alt)}">`;
      lb.addEventListener("click", () => lb.remove()); document.body.appendChild(lb);
    }
  });
  input.addEventListener("change", async () => {
    const file = input.files && input.files[0]; if (!file || !pendingMemory) return;
    try {
      const img = await compress(file);
      if (store.set("mem." + pendingMemory, { img, at: Date.now() })) { renderMemories(); toast("Memory saved ❤️"); }
      else toast("This phone's storage for the site is full — try removing a photo first.");
    } catch { toast("Sorry, that photo couldn't be opened. Try a JPG or PNG."); }
  });
}

/* ---------- Note of the day ---------- */
function noteOfDay() {
  const idx = Math.floor(startOfToday().getTime() / DAY) % NOTES.length;
  $("#noteOfDay").textContent = NOTES[(idx + NOTES.length) % NOTES.length];
}

/* ---------- Settings sheet ---------- */
function initSettings() {
  const sheet = $("#settings");
  let lastFocus = null;
  const showDue = () => { const d = getDueDate(); $("#setDue").textContent = d ? fmtDate(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Not set — check CONFIG.dueDate"; };
  const open = () => { lastFocus = document.activeElement; showDue(); sheet.hidden = false; document.body.style.overflow = "hidden"; $("[data-close].icon-btn", sheet).focus(); };
  const close = () => { sheet.hidden = true; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
  $("#openSettings").addEventListener("click", open);
  $$("[data-close]", sheet).forEach(b => b.addEventListener("click", close));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) close(); });

  $$("#genderSeg button, #genderSeg2 button").forEach(b => b.addEventListener("click", () => setGender(b.dataset.gender)));

  $("#resetSettings").addEventListener("click", () => {
    store.del("settings"); applyGender(); refreshAll();
    toast("Using the CONFIG values from script.js");
  });

  $("#exportData").addEventListener("click", () => {
    const out = {};
    store.keys().forEach(k => { out[k] = localStorage.getItem(k); });
    download(`baby-${slug(CONFIG.babySurname)}-backup-${toISO(new Date())}.json`, JSON.stringify({ app: "baby-adel", v: 1, data: out }), "application/json");
  });
  $("#importData").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try {
      const json = JSON.parse(await f.text());
      if (!json || json.app !== "baby-adel" || !json.data) throw new Error("not ours");
      if (!confirm("Replace the ticks, letter and photos on this device with the backup?")) return;
      store.keys().forEach(k => localStorage.removeItem(k));
      Object.entries(json.data).forEach(([k, v]) => { if (k.startsWith(KEY)) localStorage.setItem(k, v); });
      location.reload();
    } catch { toast("That file doesn't look like a Baby Adel backup."); }
    e.target.value = "";
  });
}

/* ---------- Navigation ---------- */
function initNav() {
  const nav = $("#nav"), menu = $("#mobileMenu"), btn = $("#menuToggle");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const setMenu = (open) => {
    menu.hidden = !open; btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    $("use", btn).setAttribute("href", open ? "#i-close" : "#i-menu");
    document.body.style.overflow = open ? "hidden" : "";
    nav.classList.toggle("is-scrolled", open || scrollY > 20);
    $$("a", menu).forEach((a, i) => a.style.setProperty("--i", i));
  };
  btn.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });
  addEventListener("resize", () => { if (innerWidth > 1020 && !menu.hidden) setMenu(false); });

  // highlight the section you're reading
  if ("IntersectionObserver" in window) {
    const links = $$("#navLinks a");
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(s => io.observe(s));

    const rv = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); rv.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".section__head, .who, .know, .week-card, .milestones, .prep-total, .note-of-day, .care-grid, .disclaimer, .mission, .letter, .baby-letter, .memories").forEach(el => { el.classList.add("reveal"); rv.observe(el); });
  }
}

/* ---------- Boot ---------- */
function refreshAll() {
  renderProgress(); tick();
  renderWeekStrip(); showWeek((pregnancy() || NO_DATE).timelineWeek, false);
  renderMilestones();
}

function showMissingDate() {
  console.error(`CONFIG.dueDate must be a real date written as "YYYY-MM-DD" — got:`, CONFIG.dueDate);
  $("#cdDaysBig").textContent = "—";
  $("#cdDaysBigLabel").textContent = "";
  $("#cdUntil").textContent = "Add the due date to CONFIG in script.js (YYYY-MM-DD)";
  $(".countdown__units").hidden = true;
  $(".hero__progress").hidden = true;
}

function init() {
  bindNames();
  applyGender();
  particles();
  renderProgress();
  tick();
  if (!getDueDate()) showMissingDate();
  setInterval(tick, 1000);
  // re-check the date every minute (so the week and progress roll over at midnight)
  let lastDay = startOfToday().getTime();
  setInterval(() => { const d = startOfToday().getTime(); if (d !== lastDay) { lastDay = d; refreshAll(); noteOfDay(); } }, 60000);

  renderWeekStrip();
  showWeek((pregnancy() || NO_DATE).timelineWeek, false);
  $("#weekStrip").addEventListener("click", e => { const b = e.target.closest("button[data-week]"); if (b) showWeek(+b.dataset.week); });
  $("#weekPrev").addEventListener("click", () => showWeek(selectedWeek - 1));
  $("#weekNext").addEventListener("click", () => showWeek(selectedWeek + 1));
  // centre the current week in the strip once laid out
  requestAnimationFrame(() => { const strip = $("#weekStrip"), b = $(`#weekStrip button[data-week="${selectedWeek}"]`); if (b) strip.scrollLeft = b.offsetLeft - strip.clientWidth / 2 + b.offsetWidth / 2; });

  initMilestones();
  initPrep();
  initMission();
  initLetter();
  initMemories();
  noteOfDay();
  initSettings();
  initNav();

  // Expose a tiny API for testing in the browser console
  window.BabyAdel = { CONFIG, pregnancy, getDueDate, getGender, WEEKS, fruitSVG };
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
