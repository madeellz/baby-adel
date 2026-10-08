# Baby Adel ❤️ — Marwa & Mohamed's journey

A private, static family website: countdown, week-by-week journey, milestones,
baby checklist, letters and memories. No server, no database, no tracking.

```
baby-adel/
├── index.html      ← page structure & text (the letter to Marwa lives here)
├── style.css       ← design, colours for the 3 themes
├── script.js       ← CONFIG at the top + all the logic & week-by-week content
├── README.md       ← this file
└── assets/
    ├── favicon.svg
    └── apple-touch-icon.png
```

---

## ✏️ What to change in CONFIG (top of `script.js`)

```js
const CONFIG = {
  motherName:  "Marwa",
  fatherName:  "Mohamed",
  babySurname: "Adel",
  boyName:     "Yassin",
  girlName:    "Lily",
  gender:      "unknown",      // "unknown" | "boy" | "girl"
  dueDate:     "2027-05-24"    // YYYY-MM-DD
};
```

* **When the doctor confirms the due date** → change `dueDate`, e.g. `"2027-05-19"`.
  Everything (countdown, current week, "You are here", progress) recalculates automatically.
* **When you know it's a boy** → `gender: "boy"` (blue theme + "Hello, Yassin 💙").
* **When you know it's a girl** → `gender: "girl"` (pink theme + "Hello, Lily 🩷").
* Then upload the new `script.js` (see "Updating the site" below). Both phones get it.

The due date is read **only** from `CONFIG.dueDate`, so both phones always show the
same countdown. The countdown, current week, trimester, progress bar and the dates on
the 28/36–40 week milestones are all calculated live from it — nothing is hard-coded
to the day the site was built. If the date is missing or mistyped, the page says so
instead of guessing.

The ⚙️ Settings button can set the gender on **one phone only**. Editing CONFIG is the
way to change it for everyone (a later CONFIG edit wins over the old phone setting).

---

## 🔒 Privacy & where your data lives

* No analytics, no ads, no accounts, no cookies. The page also tells search engines not to index it.
* The only outside request is to Google Fonts for the typefaces.
* Ticks, milestone dates, the baby letter and photos are saved in **this browser on this device**
  (localStorage, and IndexedDB for the photo album, which has room for hundreds of photos).
  They do **not** sync between Mohamed's phone and Marwa's phone — that would need a server/database.
  - Workaround: ⚙️ Settings → **Download backup** on one phone, send the file to the other phone
    (e.g. WhatsApp), then ⚙️ Settings → **Restore backup** there.
  - Clearing browser data / using private mode erases saved items. Download a backup now and then.
* Your GitHub Pages URL is public to anyone who has the link (it's just hard to guess).
  Photos and letters are NOT uploaded anywhere — they stay on the phone.

---

## 🚀 Publish for free — GitHub Pages (recommended, easiest)

### 1. Create the repository
1. Go to **https://github.com** and sign up (free) or sign in.
2. Click the **+** at the top right → **New repository**.
3. Repository name: e.g. `baby-adel`.
4. Choose **Public** (GitHub Pages is free for public repositories).
5. Tick **Add a README file** → click **Create repository**.

### 2. Upload the files
1. In the new repository, click **Add file → Upload files**.
2. Drag in **`index.html`, `style.css`, `script.js`** and the whole **`assets`** folder
   (drag the folder itself so the files land in `assets/`). You can include this README too.
3. Scroll down and click **Commit changes**.

> `index.html` must be at the top level of the repository, not inside another folder.

### 3. Turn on GitHub Pages
1. In the repository, click **Settings** (top menu) → **Pages** (left menu).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → **Save**.

### 4. Get your link
Wait 1–2 minutes and refresh the Pages settings screen. You'll see:
**"Your site is live at `https://YOUR-USERNAME.github.io/baby-adel/`"**.
Open it on both phones and use **Share → Add to Home Screen** for an app-like icon.

### 5. Update the site later
1. Open the repository → click the file (e.g. `script.js`) → click the ✏️ pencil icon.
2. Make the change (e.g. `gender: "girl"`) → **Commit changes**.
3. Wait ~1 minute, then refresh the site. If a phone still shows the old version,
   close the tab and reopen it (or pull down to refresh).

To replace files instead: **Add file → Upload files**, upload the new version with the same name, commit.

---

## ☁️ Alternative — Cloudflare Pages (also free)

1. Sign up at **https://dash.cloudflare.com** (free).
2. Go to **Workers & Pages → Create → Pages → Upload assets** ("Direct Upload").
3. Name the project (e.g. `baby-adel`) → **Create project**.
4. Drag in the project folder (or the zip) → **Deploy site**.
5. Your link: `https://baby-adel.pages.dev` (or similar).
6. To update: open the project → **Create new deployment** → upload the updated folder again.

Cloudflare can also connect to your GitHub repository so every GitHub change deploys automatically.
Cloudflare Access (free for small teams) can even put an email login in front of the site
if you'd ever like it fully private.

---

## Medical note
This website is a personal family journal and is not a substitute for medical advice.
Week-by-week sizes are approximate; Marwa should always follow her doctor's advice.
