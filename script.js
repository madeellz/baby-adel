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

/* Extra detail for each week: Arabic name of the fruit/vegetable, what is being
   built right now, and what baby can sense. General, approximate information. */
const WEEK_EXTRA = {
  7:  { ar: "توت أزرق",          grow: "The brain, the face, and tiny arm and leg buds.", sense: "Nothing yet — the nervous system is only just forming." },
  8:  { ar: "توت العليق",        grow: "Fingers and toes, the upper lip and the tip of the nose.", sense: "Not yet — the first tiny movements are simple reflexes." },
  9:  { ar: "حبة عنب",           grow: "Eyelids, ears and the first muscles.", sense: "Not yet, but nerves are starting to connect to muscles." },
  10: { ar: "فراولة",            grow: "Fingernails, tooth buds, and organs that keep maturing.", sense: "The skin around the mouth begins to respond to touch." },
  11: { ar: "ليمونة خضراء",      grow: "Bones begin to harden; hands open and close.", sense: "Touch sensitivity is spreading out from the face." },
  12: { ar: "برقوق",             grow: "The kidneys start working; reflexes like curling the toes.", sense: "The palms and soles start to sense touch." },
  13: { ar: "خوخة",              grow: "Vocal cords, and a body that's catching up with the head.", sense: "Touch sensitivity keeps spreading across the body." },
  14: { ar: "ليمونة",            grow: "Fine downy hair (lanugo) and little facial expressions.", sense: "Most of the body now responds to touch." },
  15: { ar: "تفاحة",             grow: "A stronger skeleton and taste buds.", sense: "May sense light through closed eyelids." },
  16: { ar: "أفوكادو",           grow: "Eye movements and a strongly pumping heart.", sense: "The eyes can make slow movements." },
  17: { ar: "كمثرى",             grow: "First fat stores; cartilage turning into bone.", sense: "Feels its own movements and the soft walls around it." },
  18: { ar: "بطاطا حلوة",        grow: "Ears in their final position; nerves getting a protective coating.", sense: "Hearing begins — the first sounds may come through." },
  19: { ar: "مانجو",             grow: "A creamy protective coating (vernix) on the skin.", sense: "Brain areas for hearing, taste, smell, sight and touch are developing." },
  20: { ar: "موزة",              grow: "Swallowing practice and stronger kicks.", sense: "May taste flavours from {mother}'s meals in the fluid around them." },
  21: { ar: "جزرة",              grow: "Coordinated movements; bone marrow starts making blood cells.", sense: "Movements are becoming more deliberate." },
  22: { ar: "بابايا",            grow: "Lips, eyebrows and a stronger grip.", sense: "Touch is clearer — baby may hold the umbilical cord." },
  23: { ar: "جريب فروت",         grow: "Lungs preparing for breathing; skin still thin.", sense: "May react to loud sounds." },
  24: { ar: "كوز ذرة",           grow: "Lungs start making surfactant; the inner ear (balance) develops.", sense: "Starting to sense movement and position." },
  25: { ar: "قرنبيط",            grow: "Baby fat and hair growing.", sense: "May respond to your voices and to a hand on the bump." },
  26: { ar: "خسّة",              grow: "The eyes begin to open.", sense: "Reacts to sounds — your voices are becoming familiar." },
  27: { ar: "كرنب",              grow: "Regular sleep and wake times; a very busy brain.", sense: "Recognises familiar sounds more and more." },
  28: { ar: "باذنجانة",          grow: "Eyelashes and billions of new brain connections.", sense: "Can blink, and may notice bright light through the bump." },
  29: { ar: "قرع الجوز",         grow: "Muscles and lungs maturing; the head growing.", sense: "Kicks and stretches in response to sound and touch." },
  30: { ar: "جوزة هند",          grow: "The brain's surface begins to fold.", sense: "The eyes can detect light." },
  31: { ar: "أناناسة",           grow: "Fast brain growth and steady weight gain.", sense: "May turn toward light and sounds." },
  32: { ar: "حزمة كيل",          grow: "Nails grown in; practising breathing.", sense: "The senses are well developed and still maturing." },
  33: { ar: "كنتالوب",           grow: "Bones hardening (the skull stays soft); the immune system builds.", sense: "The pupils can react to light." },
  34: { ar: "شمّامة",            grow: "Nervous system and lungs maturing.", sense: "May recognise your voices." },
  35: { ar: "خس روماني",         grow: "Most growth is weight now; the kidneys are fully developed.", sense: "Rolls and stretches in a cosy space." },
  36: { ar: "كرّاث",             grow: "Shedding the downy hair and adding fat.", sense: "Hearing is well developed." },
  37: { ar: "حزمة سلق",          grow: "Practising breathing, sucking and grasping.", sense: "Getting ready to know your voices from day one." },
  38: { ar: "بطيخة صغيرة",       grow: "Organs ready for life outside.", sense: "A surprisingly firm grip." },
  39: { ar: "يقطينة صغيرة",      grow: "Adding a little more fat to stay warm.", sense: "Hearing, touch and taste are ready." },
  40: { ar: "بطيخة",             grow: "Fully developed and ready to meet you.", sense: "Already familiar with {mother}'s voice." }
};

/* Milestones in rough order. `group` draws a heading; `week` milestones show the
   calendar date that week begins. IDs are what saved ticks are stored under, so
   never rename an existing one. */
const MILESTONES = [
  { id: "positive",  group: "First trimester", title: "First positive test", hint: "The moment everything changed" },
  { id: "tellfam",   title: "Telling our families",           hint: "Sharing the happiest news" },
  { id: "doctor",    title: "First doctor appointment",       hint: "Usually around weeks 6–10" },
  { id: "ultra1",    title: "First ultrasound",               hint: "Often in the first trimester" },
  { id: "heartbeat", title: "First heartbeat",                hint: "That tiny flicker on the screen" },
  { id: "hear",      title: "First time hearing the heartbeat", hint: "The best sound in the world" },
  { id: "see",       title: "First time seeing baby",         hint: "Hello, little one" },
  { id: "ntscan",    title: "First-trimester screening scan", hint: "Often offered around weeks 11–14" },
  { id: "tri2",      group: "Second trimester", title: "Second trimester begins", hint: "Week 14", week: 14 },
  { id: "bumpshow",  title: "The bump starts to show",        hint: "Often somewhere in the second trimester" },
  { id: "sex",       title: "Finding out: {boy} or {girl}?",  hint: "From around week 10, depending on the test" },
  { id: "anatomy",   title: "Anatomy scan",                   hint: "Usually around weeks 18–22" },
  { id: "half",      title: "Halfway there",                  hint: "Week 20", week: 20 },
  { id: "kicks",     title: "First kicks",                    hint: "Often between weeks 16–25" },
  { id: "papakick",  title: "{father} feels a kick",          hint: "Usually a few weeks after {mother} first feels them" },
  { id: "glucose",   title: "Glucose screening test",         hint: "Usually around weeks 24–28" },
  { id: "tri3",      group: "Third trimester", title: "Final trimester", hint: "Week 28", week: 28 },
  { id: "photoshoot", title: "Maternity photoshoot",          hint: "Many couples choose weeks 28–34" },
  { id: "nursery",   title: "Preparing the nursery",          hint: "A little room for a little person" },
  { id: "shower",    title: "Baby shower",                    hint: "Celebrating with family & friends" },
  { id: "hospital",  title: "Choosing the hospital",          hint: "Visit, ask questions, plan the route" },
  { id: "carseat",   title: "Car seat installed",             hint: "Ready for the first ride home" },
  { id: "headdown",  title: "Baby settles head-down",         hint: "Many babies turn by around weeks 32–36" },
  { id: "bag",       title: "Hospital bag packed",            hint: "Ideally by around week 36" },
  { id: "w36",       title: "36 weeks",                       hint: "The home stretch", week: 36 },
  { id: "w37",       title: "37 weeks",                       hint: "Early term", week: 37 },
  { id: "w38",       title: "38 weeks",                       hint: "Any day now…", week: 38 },
  { id: "w39",       title: "39 weeks",                       hint: "Full term", week: 39 },
  { id: "w40",       title: "40 weeks",                       hint: "Due date week", week: 40 },
  { id: "due",       title: "Due date",                       hint: "", due: true },
  { id: "birth",     group: "Meeting you", title: "Welcome to the world", hint: "The day we finally meet you" },
  { id: "hold",      title: "First time holding you",         hint: "The moment we'll never forget" },
  { id: "home",      title: "First day at home",              hint: "Our family of three" }
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

/* Photo albums. `prompt` is shown on the empty "add the first one" tile.
   The first seven IDs match the old single-photo slots, so old photos move in. */
const ALBUMS = [
  { id: "ultrasound", title: "Ultrasounds", prompt: "First ultrasound" },
  { id: "bump",       title: "Bump",        prompt: "First bump photo" },
  { id: "family",     title: "Family",      prompt: "First family photo" },
  { id: "nursery",    title: "Nursery",     prompt: "The nursery" },
  { id: "shower",     title: "Baby shower", prompt: "Baby shower" },
  { id: "hospital",   title: "Hospital",    prompt: "Hospital day" },
  { id: "first",      title: "Baby",        prompt: "First photo of baby" },
  { id: "everyday",   title: "Everyday",    prompt: "Little everyday moments" }
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
  const extra = WEEK_EXTRA[w] || {};
  // "a bunch of kale" → "Bunch of kale"
  const label = entry.name.replace(/^an? /, "");
  $("#weekFruitName").textContent = label.charAt(0).toUpperCase() + label.slice(1);
  $("#weekFruitAr").textContent = extra.ar || "";
  $("#weekGrow").textContent = fill(extra.grow || "");
  $("#weekSense").textContent = fill(extra.sense || "");
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
// Saved milestone dates are "YYYY-MM-DD" (older saves were full timestamps — both work).
const msDate = (v) => parseDate(v) || new Date(v);
// Which pregnancy week a calendar date fell in, e.g. "wk 7".
function weekAt(date) {
  const due = getDueDate(); if (!due) return "";
  const g = 280 - calendarDaysBetween(new Date(date.getFullYear(), date.getMonth(), date.getDate()), due);
  return g >= 0 && g < 42 * 7 ? `wk ${Math.floor(g / 7)}` : "";
}

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
    let state = "";
    if (d) {
      const dt = msDate(d), wk = weekAt(dt);
      state = `<span class="ms__state">✓ ${fmtDate(dt, short)}${wk ? ` · ${wk}` : ""}</span>`;
    }
    const head = m.group ? `<li class="ms-group" aria-hidden="true"><span>${esc(m.group)}</span></li>` : "";
    return `${head}<li class="ms ${d ? "is-done" : ""} ${m.id === nextId ? "is-next" : ""}" data-id="${m.id}">
      <button type="button" aria-haspopup="dialog" aria-label="${esc(fill(m.title))}${d ? ", done" : ""} — choose date">
        <span class="ms__dot"><svg><use href="#i-check"/></svg></span>
        <span class="ms__main"><span><span class="ms__title">${esc(fill(m.title))}</span><br><span class="ms__sub">${esc(hint)}</span></span>
        ${state}</span>
      </button></li>`;
  }).join("");
  const n = Object.keys(done).filter(k => MILESTONES.some(m => m.id === k)).length;
  $("#msCount").textContent = `${n} of ${MILESTONES.length}`;
}

/* Tapping a milestone opens a small sheet to pick the day it happened. */
function initMilestones() {
  renderMilestones();
  const sheet = $("#msSheet"), input = $("#msDateInput");
  let openId = null, lastFocus = null;
  const close = () => { sheet.hidden = true; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
  const save = (id, value) => {
    const done = store.get("milestones", {});
    if (value) done[id] = value; else delete done[id];
    store.set("milestones", done);
    renderMilestones();
    if (value) { const fresh = $(`.ms[data-id="${id}"]`); fresh && fresh.classList.add("pop"); toast("Moment saved ❤️"); }
  };

  $("#milestoneList").addEventListener("click", e => {
    const li = e.target.closest(".ms"); if (!li) return;
    openId = li.dataset.id;
    const m = MILESTONES.find(x => x.id === openId);
    const done = store.get("milestones", {});
    const p = pregnancy();
    // Default: the saved date, else that week's start (if already reached), else today.
    let def = done[openId] ? msDate(done[openId]) : startOfToday();
    if (!done[openId] && p && m.week && weekStart(p, m.week) <= startOfToday()) def = weekStart(p, m.week);
    if (!done[openId] && p && m.due && p.due <= startOfToday()) def = p.due;
    input.value = toISO(def);
    input.max = toISO(startOfToday());
    $("#msSheetTitle").textContent = fill(m.title);
    $("#msSheetHint").textContent = fill(m.hint) || "";
    $("#msRemove").hidden = !done[openId];
    lastFocus = document.activeElement;
    sheet.hidden = false; document.body.style.overflow = "hidden";
    input.focus();
  });
  $("#msSave").addEventListener("click", () => {
    const v = input.value;
    if (!parseDate(v)) { toast("Please choose a date"); return; }
    if (parseDate(v) > startOfToday()) { toast("That date is in the future"); return; }
    save(openId, v); close();
  });
  $("#msToday").addEventListener("click", () => { save(openId, toISO(startOfToday())); close(); });
  $("#msRemove").addEventListener("click", () => { save(openId, null); close(); toast("Milestone cleared"); });
  $$("[data-ms-close]", sheet).forEach(b => b.addEventListener("click", close));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) close(); });
}

/* ---------- Doctor visits: questions, answers, notes ----------
   Saved under "visits" as a list of
   { id, doctor, date, time, place, done, notes, questions: [{ id, text, asked, answer }] }.
   The "current" visit is the earliest one not marked done.                      */
const SUGGESTED_QUESTIONS = {
  1: ["Which prenatal vitamins should I take, and for how long?",
      "Which foods and drinks should I avoid?",
      "Is my current medication safe to continue?",
      "Which symptoms mean I should call you straight away?",
      "Which screening tests do you recommend, and when?",
      "Is it safe to keep exercising? Which kinds?",
      "When is my next scan?"],
  2: ["When is the anatomy scan?",
      "Could we find out the baby's sex at the next scan?",
      "When should I do the glucose test?",
      "How much weight gain is healthy for me?",
      "Is it safe for me to travel?",
      "Which sleeping position is best now?",
      "When should I expect to feel movements?"],
  3: ["How should I keep track of the baby's movements?",
      "What are the signs that labour is starting?",
      "When should we go to the hospital?",
      "What happens when we arrive at the hospital?",
      "What pain relief options are there?",
      "What happens if I go past my due date?",
      "Is there anything we should prepare before the birth?"]
};

const visitsAll = () => store.get("visits", []);
const visitsSave = (v) => store.set("visits", v);
const sortVisits = (v) => v.sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
const currentVisit = (v) => sortVisits(v.filter(x => !x.done))[0] || null;

function visitWhen(v) {
  if (!v.date) return { big: "Date not set yet", small: "" };
  const d = parseDate(v.date);
  const days = calendarDaysBetween(startOfToday(), d);
  const big = fmtDate(d, { weekday: "short", day: "numeric", month: "long" }) + (v.time ? ` · ${v.time}` : "");
  const rel = days === 0 ? "Today" : days === 1 ? "Tomorrow" : days > 1 ? `In ${days} days`
    : days === -1 ? "Yesterday — add the answers" : `${-days} days ago — add the answers`;
  const wk = weekAt(d);
  return { big, small: rel + (wk ? ` · ${wk.replace("wk", "week")}` : ""), past: days < 0 };
}

function visitForm(v, title) {
  v = v || {};
  return `<form class="visit-form" data-form="${v.id || "new"}">
    <h3>${esc(title)}</h3>
    <div class="visit-form__grid">
      <label>Doctor<input name="doctor" list="doctorList" maxlength="60" placeholder="Dr. …" value="${esc(v.doctor || "")}"></label>
      <label>Date<input name="date" type="date" value="${esc(v.date || "")}"></label>
      <label>Time <small>(optional)</small><input name="time" type="time" value="${esc(v.time || "")}"></label>
      <label>Clinic / hospital <small>(optional)</small><input name="place" maxlength="80" value="${esc(v.place || "")}"></label>
    </div>
    <div class="visit-form__btns">
      <button class="btn" type="submit">${v.id ? "Save changes" : "Save visit"}</button>
      ${v.id || v.cancel ? `<button class="btn btn--ghost" type="button" data-act="cancel-edit">Cancel</button>` : ""}
    </div>
  </form>`;
}

function questionItem(q) {
  return `<li class="vq ${q.asked ? "is-asked" : ""} ${q.answer ? "has-answer" : ""}" data-q="${q.id}">
    <div class="vq__row">
      <button type="button" class="vq__tick" data-act="ask" role="checkbox" aria-checked="${!!q.asked}" aria-label="Asked"><svg><use href="#i-check"/></svg></button>
      <p class="vq__text">${esc(q.text)}</p>
      <button type="button" class="vq__del" data-act="del-q" aria-label="Remove question">×</button>
    </div>
    <label class="vq__answer"><span>Doctor's answer</span>
      <textarea data-field="answer" rows="2" placeholder="What did the doctor say?">${esc(q.answer || "")}</textarea></label>
  </li>`;
}

let visitEditing = false;
function renderVisits() {
  const all = visitsAll();
  let cur = currentVisit(all);
  const past = all.filter(x => x.done).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const doctors = [...new Set(all.map(x => x.doctor).filter(Boolean))];
  $("#doctorList").innerHTML = doctors.map(d => `<option value="${esc(d)}">`).join("");

  let html = "";
  if (visitEditing && !cur) {
    const last = past[0];
    html += `<article class="visit">${visitForm({ doctor: last ? last.doctor : "", place: last ? last.place : "", cancel: true }, "Next appointment")}</article>`;
  } else if (visitEditing) {
    html += `<article class="visit">${visitForm(cur, "Edit visit")}</article>`;
  } else {
    // No visit booked yet: still show the question list, so questions can be
    // written down any time. Adding the first one creates the visit.
    const draft = !cur;
    if (draft) cur = { id: "", doctor: "", date: "", questions: [], notes: "" };
    const w = draft ? { big: "Not booked yet", small: "" } : visitWhen(cur);
    const qs = cur.questions || [];
    const asked = qs.filter(q => q.asked).length;
    const p = cur.date ? null : pregnancy();
    const tri = cur.date ? (() => { const wk = parseInt((weekAt(parseDate(cur.date)) || "wk 0").slice(3), 10); return wk < 14 ? 1 : wk < 28 ? 2 : 3; })() : (p ? p.trimester : 1);
    const have = new Set(qs.map(q => q.text.toLowerCase()));
    const sugg = SUGGESTED_QUESTIONS[tri].filter(s => !have.has(s.toLowerCase())).slice(0, 4);
    html += `<article class="visit ${w.past ? "is-past" : ""}" data-visit="${cur.id}">
      <div class="visit__head">
        <div>
          <p class="visit__label">Next appointment</p>
          <p class="visit__date">${esc(w.big)}</p>
          <p class="visit__meta">${draft ? "Add the doctor and date once it's booked" : [cur.doctor, cur.place].filter(Boolean).map(esc).join(" · ") || "Add the doctor's name"}${w.small ? ` <span class="visit__rel">${esc(w.small)}</span>` : ""}</p>
        </div>
        <button class="btn ${draft ? "" : "btn--ghost"} btn--sm" data-act="edit">${draft ? "Add date & doctor" : "Edit"}</button>
      </div>
      <div class="visit__qhead"><h3>Questions to ask</h3>${qs.length ? `<span>${asked} of ${qs.length} asked</span>` : ""}</div>
      <ol class="vq-list">${qs.map(questionItem).join("")}</ol>
      ${qs.length ? "" : `<p class="vq-empty">No questions yet — type one below, or tap an idea.</p>`}
      <form class="vq-add" data-form="add-q">
        <input name="q" maxlength="200" placeholder="Type a question…" aria-label="New question" autocomplete="off">
        <button type="submit" aria-label="Add question"><svg><use href="#i-plus"/></svg></button>
      </form>
      ${sugg.length ? `<div class="vq-sugg"><p>Ideas for this stage — tap to add</p>${sugg.map(s => `<button type="button" data-act="sugg">${esc(s)}</button>`).join("")}</div>` : ""}
      ${draft ? "" : `<label class="visit__notes"><span>Notes from the visit</span>
        <textarea data-field="notes" rows="3" placeholder="Weight, blood pressure, scan results, next steps…">${esc(cur.notes || "")}</textarea></label>`}
      ${attachBlock(cur.id)}
      ${draft ? "" : `<div class="visit__foot">
        <button class="btn btn--ghost btn--sm" data-act="export"><svg><use href="#i-download"/></svg>Save as text</button>
        <button class="btn btn--sm" data-act="done"><svg><use href="#i-check"/></svg>Visit done</button>
      </div>`}
    </article>`;
  }

  if (past.length) {
    // keep any open past visit open after a redraw
    const openIds = new Set($$("#visitApp .pv[open]").map(d => d.dataset.visit));
    html += `<div class="visit-past"><h3>Past visits</h3>${past.map(v => {
      const qs = v.questions || [];
      const nFiles = visitFiles.list.filter(f => f.visit === v.id).length;
      const bits = [`${qs.length} ${qs.length === 1 ? "question" : "questions"}`];
      if (nFiles) bits.push(`${nFiles} ${nFiles === 1 ? "file" : "files"}`);
      return `<details class="pv" data-visit="${v.id}" ${openIds.has(v.id) ? "open" : ""}>
        <summary><span class="pv__date">${v.date ? fmtDate(parseDate(v.date), { day: "numeric", month: "short", year: "numeric" }) : "No date"}</span>
          <span class="pv__doc">${esc(v.doctor || "")}</span><span class="pv__n">${bits.join(" · ")}</span></summary>
        <div class="pv__body">
          ${qs.length ? `<ol class="vq-list vq-list--past">${qs.map(questionItem).join("")}</ol>` : ""}
          <label class="visit__notes"><span>Notes from the visit</span>
            <textarea data-field="notes" rows="2" placeholder="Weight, blood pressure, scan results, next steps…">${esc(v.notes || "")}</textarea></label>
          ${attachBlock(v.id)}
          <div class="pv__btns">
            <button class="btn btn--text" data-act="export">Save as text</button>
            <button class="btn btn--text" data-act="reopen">Reopen</button>
            <button class="btn btn--text" data-act="del-visit">Delete</button>
          </div>
        </div></details>`;
    }).join("")}</div>`;
  }
  $("#visitApp").innerHTML = html;
}

function visitText(v) {
  const lines = [`Doctor visit — ${v.date ? fmtDate(parseDate(v.date), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "date not set"}${v.time ? " at " + v.time : ""}`];
  if (v.doctor || v.place) lines.push([v.doctor, v.place].filter(Boolean).join(" · "));
  lines.push("");
  (v.questions || []).forEach((q, i) => { lines.push(`${i + 1}. ${q.text}${q.asked ? " ✓" : ""}`); lines.push(`   ${q.answer || "—"}`); lines.push(""); });
  if (v.notes) { lines.push("Notes:"); lines.push(v.notes); }
  const files = visitFiles.list.filter(f => f.visit === v.id);
  if (files.length) { lines.push(""); lines.push("Attachments (saved on the website):"); files.forEach(f => lines.push(`- ${f.name}`)); }
  return lines.join("\n");
}

/* ---- Attachments: doctor's letters, prescriptions, results (photos or PDFs) ---- */
const visitFiles = { list: [], urls: new Map() };
const fileURL = (f) => {
  if (!visitFiles.urls.has(f.id)) visitFiles.urls.set(f.id, URL.createObjectURL(f.blob));
  return visitFiles.urls.get(f.id);
};
const fmtSize = (b) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
function attachBlock(visitId) {
  const files = visitFiles.list.filter(f => f.visit === visitId).sort((a, b) => a.added - b.added);
  return `<div class="vfiles">
    <div class="vfiles__head"><span>Letters &amp; reports</span>
      <button type="button" class="vfiles__add" data-act="add-file"><svg><use href="#i-plus"/></svg>Add file</button></div>
    ${files.length ? `<ul class="vfiles__list">${files.map(f => `<li class="vfile" data-file="${f.id}">
        <button type="button" class="vfile__open" data-act="open-file" title="Open ${esc(f.name)}">
          ${/^image\//.test(f.type) ? `<img src="${fileURL(f)}" alt="">` : `<span class="vfile__pdf">PDF</span>`}
          <span class="vfile__name">${esc(f.name)}</span><span class="vfile__size">${fmtSize(f.size)}</span></button>
        <button type="button" class="vfile__del" data-act="del-file" aria-label="Remove ${esc(f.name)}">×</button></li>`).join("")}</ul>`
      : `<p class="vfiles__empty">Keep the doctor's letters, prescriptions, test results or scan reports here — photos or PDFs.</p>`}
  </div>`;
}
async function addVisitFiles(files, visitId) {
  let ok = 0, skipped = 0;
  for (const f of files) {
    try {
      let blob, type, name = f.name || "file";
      if (/^image\//.test(f.type) || /\.(jpe?g|png|heic|heif|webp)$/i.test(name)) {
        blob = (await shrink(f)).full; type = "image/jpeg";   // 2000px is plenty to read a letter
        name = name.replace(/\.\w+$/, "") + ".jpg";
      } else if (f.type === "application/pdf" || /\.pdf$/i.test(name)) {
        if (f.size > 25 * 1048576) { skipped++; continue; }
        blob = f; type = "application/pdf";
      } else { skipped++; continue; }
      const rec = { id: newId(), visit: visitId, name, type, size: blob.size, added: Date.now(), blob };
      await fileDB.put(rec);
      visitFiles.list.push(rec); ok++;
    } catch (e) { console.warn("Attachment not saved", f.name, e); skipped++; }
  }
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}
  renderVisits();
  toast(skipped ? `${ok} saved · ${skipped} skipped (photos or PDFs under 25 MB only)` : `${ok} ${ok === 1 ? "file" : "files"} saved ❤️`);
}
async function deleteVisitFiles(visitId, fileId) {
  const gone = visitFiles.list.filter(f => fileId ? f.id === fileId : f.visit === visitId);
  for (const f of gone) {
    try { await fileDB.del(f.id); } catch {}
    if (visitFiles.urls.has(f.id)) { URL.revokeObjectURL(visitFiles.urls.get(f.id)); visitFiles.urls.delete(f.id); }
  }
  visitFiles.list = visitFiles.list.filter(f => !gone.includes(f));
}

function initVisits() {
  renderVisits();
  const app = $("#visitApp");
  const fileInput = $("#visitFileInput");
  let fileTarget = null;
  fileInput.addEventListener("change", () => { if (fileTarget && fileInput.files.length) addVisitFiles([...fileInput.files], fileTarget); });
  // attachments live in IndexedDB; draw them once they've loaded
  if ("indexedDB" in window) fileDB.all().then(list => { visitFiles.list = list || []; renderVisits(); }).catch(e => console.warn("Attachments unavailable", e));
  const update = (id, fn, rerender = true) => {
    const all = visitsAll();
    let v = all.find(x => x.id === id);
    if (!v && !id) {   // first question before any visit is booked → start one
      v = { id: newId(), doctor: "", date: "", time: "", place: "", done: false, notes: "", questions: [] };
      all.push(v);
    }
    if (!v) return;
    fn(v, all); visitsSave(all); if (rerender) renderVisits();
  };
  const visitId = (el) => { const c = el.closest("[data-visit]"); return c && c.dataset.visit; };

  app.addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target, kind = f.dataset.form;
    if (kind === "add-q") {
      const text = f.q.value.trim(); if (!text) return;
      update(visitId(f), v => { (v.questions = v.questions || []).push({ id: newId(), text, asked: false, answer: "" }); });
      const inp = $(".vq-add input", app); inp && inp.focus();
      return;
    }
    const data = { doctor: f.doctor.value.trim(), date: parseDate(f.date.value) ? f.date.value : "", time: f.time.value, place: f.place.value.trim() };
    if (kind === "new") {
      visitEditing = false;
      const all = visitsAll();
      all.push({ id: newId(), ...data, done: false, notes: "", questions: [] });
      visitsSave(all); renderVisits(); toast("Visit saved ❤️");
    } else {
      visitEditing = false;
      update(kind, v => Object.assign(v, data));
    }
  });

  app.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    flush();   // keyboard users don't trigger pointerdown
    const act = b.dataset.act, id = visitId(b), qid = b.closest("[data-q]") && b.closest("[data-q]").dataset.q;
    if (act === "edit") { visitEditing = true; renderVisits(); }
    else if (act === "cancel-edit") { visitEditing = false; renderVisits(); }
    else if (act === "ask") {
      let nowAsked = false;
      update(id, v => { const q = v.questions.find(x => x.id === qid); q.asked = !q.asked; nowAsked = q.asked && !q.answer; });
      // ticked → jump straight into writing the doctor's answer
      if (nowAsked) { const ta = $(`.vq[data-q="${qid}"] textarea`, app); ta && ta.focus(); }
    }
    else if (act === "del-q") update(id, v => { v.questions = v.questions.filter(x => x.id !== qid); });
    else if (act === "sugg") update(id, v => { (v.questions = v.questions || []).push({ id: newId(), text: b.textContent, asked: false, answer: "" }); });
    else if (act === "done") {
      update(id, v => { v.done = true; if (!v.date) v.date = toISO(startOfToday()); });
      toast("Visit saved to past visits ❤️");
    }
    else if (act === "reopen") {
      if (currentVisit(visitsAll())) { toast("Finish or delete the next visit first."); return; }
      update(id, v => { v.done = false; });
    }
    else if (act === "del-visit") {
      if (!confirm("Delete this visit, its answers and its files?")) return;
      visitsSave(visitsAll().filter(x => x.id !== id));
      deleteVisitFiles(id).then(renderVisits);
    }
    else if (act === "add-file") {
      // a file added before any visit is booked starts one, like a first question
      let target = id;
      if (!target) update("", v => { target = v.id; });
      fileTarget = target; fileInput.value = ""; fileInput.click();
    }
    else if (act === "open-file") {
      const f = visitFiles.list.find(x => x.id === b.closest("[data-file]").dataset.file);
      if (f) window.open(fileURL(f), "_blank");
    }
    else if (act === "del-file") {
      const fid = b.closest("[data-file]").dataset.file;
      const f = visitFiles.list.find(x => x.id === fid);
      if (!f || !confirm(`Remove "${f.name}"?`)) return;
      deleteVisitFiles(null, fid).then(renderVisits);
    }
    else if (act === "export") {
      const v = visitsAll().find(x => x.id === id); if (!v) return;
      download(`doctor-visit-${v.date || "undated"}.txt`, visitText(v), "text/plain");
    }
  });

  // Answers and notes save as she types (no re-render, so the keyboard stays open)
  let t, pending = null;
  app.addEventListener("input", e => {
    const field = e.target.dataset.field; if (!field) return;
    const id = visitId(e.target), qid = e.target.closest("[data-q]") && e.target.closest("[data-q]").dataset.q, val = e.target.value;
    const li = e.target.closest(".vq"); if (li) li.classList.toggle("has-answer", !!val.trim());
    clearTimeout(t);
    pending = () => update(id, v => {
      if (field === "notes") v.notes = val;
      else { const q = v.questions.find(x => x.id === qid); if (q) q.answer = val; }
    }, false);
    t = setTimeout(() => { pending && pending(); pending = null; }, 500);
  });
  // Any button or form saves unsaved typing first, before the list redraws
  const flush = () => { if (pending) { clearTimeout(t); pending(); pending = null; } };
  app.addEventListener("pointerdown", flush, true);
  app.addEventListener("submit", flush, true);
  addEventListener("pagehide", flush);
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

/* ---------- Memories: a photo album saved on this device ----------
   Photos live in IndexedDB (room for hundreds of photos; localStorage only
   fits a handful). Each photo keeps a full-size copy (max 2000px) and a small
   thumbnail for the grid.                                                   */
// One IndexedDB database with two stores: "photos" (album) and "files" (visit attachments)
const idbStore = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open("babyAdel", 2);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains("photos")) db.createObjectStore("photos", { keyPath: "id" });
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "id" });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  return (name) => {
    const run = async (mode, fn) => {
      const db = await open();
      return new Promise((res, rej) => {
        const t = db.transaction(name, mode), req = fn(t.objectStore(name));
        t.oncomplete = () => res(req ? req.result : undefined);
        t.onerror = t.onabort = () => rej(t.error);
      });
    };
    return {
      all:   () => run("readonly", s => s.getAll()),
      put:   (rec) => run("readwrite", s => s.put(rec)),
      del:   (id) => run("readwrite", s => s.delete(id)),
      clear: () => run("readwrite", s => s.clear())
    };
  };
})();
const photoDB = idbStore("photos");
const fileDB = idbStore("files");   // { id, visit, name, type, size, added, blob }

const loadImage = (src) => new Promise((res, rej) => {
  const img = new Image();
  img.onload = () => res(img); img.onerror = () => rej(new Error("unreadable")); img.src = src;
});
const toJpeg = (img, max, q) => new Promise((res, rej) => {
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  c.toBlob(b => b ? res(b) : rej(new Error("encode")), "image/jpeg", q);
});
// File, Blob or data: URL → { full, thumb } JPEG blobs
async function shrink(src) {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = await loadImage(url);
    return { full: await toJpeg(img, 2000, .85), thumb: await toJpeg(img, 480, .78) };
  } finally { if (typeof src !== "string") URL.revokeObjectURL(url); }
}
const blobToDataURL = (b) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const albumTitle = (id) => (ALBUMS.find(a => a.id === id) || ALBUMS[ALBUMS.length - 1]).title;

const gallery = { photos: [], album: "all", urls: new Map(), list: [], at: -1, fullUrl: null, ready: false };
const sortPhotos = () => gallery.photos.sort((a, b) => (b.taken || "").localeCompare(a.taken || "") || b.added - a.added);
const thumbURL = (p) => {
  if (!gallery.urls.has(p.id)) gallery.urls.set(p.id, URL.createObjectURL(p.thumb));
  return gallery.urls.get(p.id);
};
const visiblePhotos = () => gallery.album === "all" ? gallery.photos : gallery.photos.filter(p => p.album === gallery.album);

function renderGallery() {
  const counts = {};
  gallery.photos.forEach(p => { counts[p.album] = (counts[p.album] || 0) + 1; });
  $("#albumChips").innerHTML = [{ id: "all", title: "All" }, ...ALBUMS].map(a => {
    const n = a.id === "all" ? gallery.photos.length : counts[a.id] || 0;
    return `<button role="tab" data-album="${a.id}" aria-selected="${gallery.album === a.id}">${esc(a.title)}${n ? `<small>${n}</small>` : ""}</button>`;
  }).join("");

  const list = visiblePhotos();
  let html = list.map((p, i) => {
    const wk = p.taken ? weekAt(parseDate(p.taken)) : "";
    return `<button class="photo" data-i="${i}" aria-label="Open photo${p.caption ? ": " + esc(p.caption) : ""}">
      <img src="${thumbURL(p)}" alt="" loading="lazy">
      ${wk ? `<span class="photo__wk">${wk}</span>` : ""}
      ${p.caption ? `<span class="photo__cap">${esc(p.caption)}</span>` : ""}</button>`;
  }).join("");
  // Gentle prompts for moments that don't have a photo yet
  const empty = gallery.album === "all" ? ALBUMS.filter(a => !counts[a.id]) : list.length ? [] : ALBUMS.filter(a => a.id === gallery.album);
  html += empty.map(a => `<button class="photo photo--add" data-add="${a.id}">
      <span class="photo__icon"><svg><use href="#i-camera"/></svg></span>
      <span class="photo__prompt">${esc(a.prompt)}</span><span class="photo__cta">Add photos</span></button>`).join("");
  $("#albumGrid").innerHTML = html;
  updateStorageNote();
}

async function updateStorageNote() {
  const n = gallery.photos.length;
  let txt = n ? `${n} ${n === 1 ? "photo" : "photos"} saved on this device` : "Photos are saved privately on this device";
  try {
    if (n && navigator.storage && navigator.storage.estimate) {
      const { usage } = await navigator.storage.estimate();
      if (usage) txt += ` · about ${Math.max(1, Math.round(usage / 1048576))} MB used`;
    }
  } catch {}
  $("#albumStorage").textContent = txt + ".";
}

async function addPhotos(files, album) {
  files = [...files].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|heic|heif|webp)$/i.test(f.name));
  if (!files.length) return;
  const prog = $("#albumProgress");
  prog.hidden = false;
  let ok = 0, failed = 0;
  for (const [i, f] of files.entries()) {
    prog.textContent = `Adding photo ${i + 1} of ${files.length}…`;
    try {
      const { full, thumb } = await shrink(f);
      const rec = { id: newId(), album, caption: "", taken: toISO(new Date(f.lastModified || Date.now())), added: Date.now(), full, thumb };
      await photoDB.put(rec);
      gallery.photos.push(rec); ok++;
    } catch (e) { console.warn("Photo not added", f.name, e); failed++; }
  }
  prog.hidden = true;
  sortPhotos(); renderGallery();
  // Ask the browser not to clear these photos when space runs low
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}
  toast(failed ? `${ok} added · ${failed} couldn't be opened (try JPG or PNG)` : `${ok} ${ok === 1 ? "photo" : "photos"} added ❤️`);
}

/* ---- Full-screen viewer ---- */
function openViewer(i) {
  gallery.list = visiblePhotos().slice();
  gallery.at = i;
  $("#viewerAlbum").innerHTML = ALBUMS.map(a => `<option value="${a.id}">${esc(a.title)}</option>`).join("");
  showViewerPhoto();
  $("#viewer").hidden = false; document.body.style.overflow = "hidden";
  $("#viewer [data-v=close]").focus();
}
function closeViewer() {
  $("#viewer").hidden = true; document.body.style.overflow = "";
  if (gallery.fullUrl) { URL.revokeObjectURL(gallery.fullUrl); gallery.fullUrl = null; }
  $("#viewerImg").removeAttribute("src");
}
function showViewerPhoto() {
  const p = gallery.list[gallery.at]; if (!p) return closeViewer();
  if (gallery.fullUrl) URL.revokeObjectURL(gallery.fullUrl);
  gallery.fullUrl = URL.createObjectURL(p.full);
  $("#viewerImg").src = gallery.fullUrl;
  $("#viewerCaption").value = p.caption || "";
  $("#viewerAlbum").value = p.album;
  $("#viewerDate").value = p.taken || "";
  $("#viewerDate").max = toISO(startOfToday());
  const wk = p.taken ? weekAt(parseDate(p.taken)) : "";
  $("#viewerWeek").textContent = wk ? wk.replace("wk", "Week") : "";
  $("#viewerCount").textContent = `${gallery.at + 1} / ${gallery.list.length}`;
  $("#viewer [data-v=prev]").disabled = gallery.at <= 0;
  $("#viewer [data-v=next]").disabled = gallery.at >= gallery.list.length - 1;
}
const stepViewer = (d) => { const n = gallery.at + d; if (n >= 0 && n < gallery.list.length) { gallery.at = n; showViewerPhoto(); } };
async function updateViewerPhoto(patch) {
  const p = gallery.list[gallery.at]; if (!p) return;
  Object.assign(p, patch);
  try { await photoDB.put(p); } catch { toast("Couldn't save that change."); }
  sortPhotos(); renderGallery();
}

async function migrateOldMemories() {
  // Photos from the old one-per-moment version were stored in localStorage
  for (const a of ALBUMS) {
    const old = store.get("mem." + a.id, null);
    if (!old || !old.img) continue;
    try {
      const { full, thumb } = await shrink(old.img);
      await photoDB.put({ id: newId(), album: a.id, caption: "", taken: toISO(new Date(old.at || Date.now())), added: old.at || Date.now(), full, thumb });
      store.del("mem." + a.id);
    } catch (e) { console.warn("Could not move old photo", a.id, e); }
  }
}

async function initMemories() {
  const input = $("#photoInput");
  let target = "everyday";
  const pick = (album) => { target = album; input.value = ""; input.click(); };

  $("#albumChips").addEventListener("click", e => {
    const b = e.target.closest("[data-album]"); if (!b) return;
    gallery.album = b.dataset.album; renderGallery();
  });
  $("#addPhotos").addEventListener("click", () => pick(gallery.album === "all" ? "everyday" : gallery.album));
  $("#albumGrid").addEventListener("click", e => {
    const add = e.target.closest("[data-add]"); if (add) return pick(add.dataset.add);
    const ph = e.target.closest("[data-i]"); if (ph) openViewer(+ph.dataset.i);
  });
  input.addEventListener("change", () => addPhotos(input.files, target));

  // viewer controls
  const viewer = $("#viewer");
  viewer.addEventListener("click", async e => {
    const v = e.target.closest("[data-v]"); if (!v) return;
    const act = v.dataset.v, p = gallery.list[gallery.at];
    if (act === "close") closeViewer();
    else if (act === "prev") stepViewer(-1);
    else if (act === "next") stepViewer(1);
    else if (act === "download" && p) {
      const a = document.createElement("a");
      a.href = gallery.fullUrl; a.download = `baby-${slug(CONFIG.babySurname)}-${p.taken || "photo"}-${p.id}.jpg`;
      document.body.appendChild(a); a.click(); a.remove();
    } else if (act === "delete" && p) {
      if (!confirm("Delete this photo from this device?")) return;
      try { await photoDB.del(p.id); } catch { return toast("Couldn't delete that photo."); }
      gallery.photos = gallery.photos.filter(x => x.id !== p.id);
      if (gallery.urls.has(p.id)) { URL.revokeObjectURL(gallery.urls.get(p.id)); gallery.urls.delete(p.id); }
      gallery.list.splice(gallery.at, 1);
      if (gallery.at >= gallery.list.length) gallery.at = gallery.list.length - 1;
      renderGallery();
      gallery.list.length ? showViewerPhoto() : closeViewer();
      toast("Photo deleted");
    }
  });
  $("#viewerCaption").addEventListener("change", e => updateViewerPhoto({ caption: e.target.value.trim() }));
  $("#viewerAlbum").addEventListener("change", e => updateViewerPhoto({ album: e.target.value }));
  $("#viewerDate").addEventListener("change", e => { if (parseDate(e.target.value)) { updateViewerPhoto({ taken: e.target.value }); showViewerPhoto(); } });
  document.addEventListener("keydown", e => {
    if (viewer.hidden || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
      if (!viewer.hidden && e.key === "Escape") closeViewer();
      return;
    }
    if (e.key === "Escape") closeViewer();
    else if (e.key === "ArrowLeft") stepViewer(-1);
    else if (e.key === "ArrowRight") stepViewer(1);
  });
  // swipe left/right on phones
  let x0 = null;
  $("#viewerStage").addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  $("#viewerStage").addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) stepViewer(dx < 0 ? 1 : -1);
  });

  renderGallery();   // empty state straight away, photos fill in below
  if (!("indexedDB" in window)) { $("#albumStorage").textContent = "This browser can't store photos."; return; }
  try {
    await migrateOldMemories();
    gallery.photos = await photoDB.all();
    sortPhotos(); gallery.ready = true; renderGallery();
  } catch (e) {
    console.warn("Photo album unavailable", e);
    $("#albumStorage").textContent = "Photos can't be saved in this browser (private mode?).";
  }
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

  $("#exportData").addEventListener("click", async () => {
    const out = {};
    store.keys().forEach(k => { out[k] = localStorage.getItem(k); });
    let photos = [];
    try {
      if (gallery.photos.length) toast(`Preparing ${gallery.photos.length} photos…`);
      photos = await Promise.all(gallery.photos.map(async p => ({ id: p.id, album: p.album, caption: p.caption, taken: p.taken, added: p.added, full: await blobToDataURL(p.full) })));
    } catch (e) { console.warn("Photos left out of backup", e); toast("Photos couldn't be added to the backup."); }
    let files = [];
    try {
      files = await Promise.all(visitFiles.list.map(async f => ({ id: f.id, visit: f.visit, name: f.name, type: f.type, added: f.added, data: await blobToDataURL(f.blob) })));
    } catch (e) { console.warn("Visit files left out of backup", e); toast("Visit files couldn't be added to the backup."); }
    download(`baby-${slug(CONFIG.babySurname)}-backup-${toISO(new Date())}.json`, JSON.stringify({ app: "baby-adel", v: 3, data: out, photos, files }), "application/json");
  });
  $("#importData").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try {
      const json = JSON.parse(await f.text());
      if (!json || json.app !== "baby-adel" || !json.data) throw new Error("not ours");
      if (!confirm("Replace the ticks, letter and photos on this device with the backup?")) return;
      store.keys().forEach(k => localStorage.removeItem(k));
      Object.entries(json.data).forEach(([k, v]) => { if (k.startsWith(KEY)) localStorage.setItem(k, v); });
      // Photos: replace the album with the backup's (older backups keep photos in `data`, which move in on reload)
      toast("Restoring…");
      await photoDB.clear();
      for (const p of json.photos || []) {
        try {
          const full = await (await fetch(p.full)).blob();
          const { thumb } = await shrink(p.full);
          await photoDB.put({ id: p.id || newId(), album: p.album || "everyday", caption: p.caption || "", taken: p.taken || "", added: p.added || Date.now(), full, thumb });
        } catch (err) { console.warn("Photo not restored", err); }
      }
      await fileDB.clear();
      for (const f of json.files || []) {
        try {
          const blob = await (await fetch(f.data)).blob();
          await fileDB.put({ id: f.id || newId(), visit: f.visit, name: f.name || "file", type: f.type || blob.type, size: blob.size, added: f.added || Date.now(), blob });
        } catch (err) { console.warn("File not restored", err); }
      }
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
    $$(".section__head, .who, .know, .week-card, .milestones, .prep-total, .note-of-day, .care-grid, .disclaimer, .mission, .letter, .baby-letter, .album").forEach(el => { el.classList.add("reveal"); rv.observe(el); });
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
  initVisits();
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
