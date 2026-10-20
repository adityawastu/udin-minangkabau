/* Rendering & interaksi. Ubah konten melalui invitation-data.js. */
(() => {
  "use strict";
  const data = window.INVITATION_DATA;
  const $ = (id) => document.getElementById(id);
  const text = (id, value) => {
    $(id).textContent = value;
  };
  const el = (tag, className, value) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (value !== undefined) n.textContent = value;
    return n;
  };
  const safeURL = (value, local = false) => {
    try {
      const u = new URL(value, location.href);
      return u.protocol === "https:" ||
        u.protocol === "http:" ||
        (local && u.protocol === "file:")
        ? u.href
        : "";
    } catch {
      return "";
    }
  };
  const date = (value) =>
    new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: data.timezone,
    }).format(new Date(value));
  const time = (value) =>
    new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: data.timezone,
    }).format(new Date(value));
  const utc = (value) =>
    new Date(value)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const image = (src, alt, cls) => {
    const i = el("img", cls);
    i.src = safeURL(src, true);
    i.alt = alt;
    i.loading = "lazy";
    i.decoding = "async";
    return i;
  };
  // Gambar latar: dimuat ringan, background di bawah fold memakai lazy loading.
  const backgroundSections = {
    cover: ".cover",
    opening: ".opening",
    couple: ".couple",
    events: ".events",
    countdown: ".countdown-section",
    gifts: ".gifts",
    gallery: ".gallery-section",
    wishes: ".wishes-section",
    closing: ".closing",
  };
  Object.entries(backgroundSections).forEach(([key, selector]) => {
    const section = document.querySelector(selector);
    const artwork = image(data.backgrounds[key], "", "section-artwork");
    artwork.setAttribute("aria-hidden", "true");
    if (key === "cover") {
      artwork.loading = "eager";
      artwork.setAttribute("fetchpriority", "high");
    }
    section.prepend(artwork);
  });
  // Label dan judul: semua bersumber dari konfigurasi.
  const ui = data.ui;
  const contentBindings = {
    ".tiny-label": "coverBlessing",
    ".guest > p:first-child": "guestSalutation",
    ".guest > p:last-child": "guestPlace",
    "#open-invitation span": "open",
    ".opening > .eyebrow": "openingEyebrow",
    ".couple > .eyebrow": "coupleEyebrow",
    ".couple > h2": "coupleHeading",
    ".events > .eyebrow": "eventsEyebrow",
    ".events > h2": "eventsHeading",
    ".countdown-section > .eyebrow": "countdownEyebrow",
    ".countdown-section > h2": "countdownHeading",
    ".gifts > .eyebrow": "giftsEyebrow",
    ".gifts > h2": "giftsHeading",
    ".gallery-section > .eyebrow": "galleryEyebrow",
    ".gallery-section > h2": "galleryHeading",
    ".closing > .eyebrow": "footerEyebrow",
  };
  Object.entries(contentBindings).forEach(([selector, key]) => {
    document.querySelector(selector).textContent = ui[key];
  });
  document.title = data.title;
  [
    "cover-label",
    "cover-names",
    "footer-names",
    "greeting",
    "intro",
    "quote",
    "quote-source",
    "event-intro",
    "gift-message",
    "closing",
    "closing-greeting",
    "footer-credit",
  ].forEach((id, i) =>
    text(
      id,
      [
        data.coverLabel,
        data.coupleNames,
        data.coupleNames,
        data.greeting,
        data.intro,
        data.quote,
        data.quoteSource,
        data.eventIntro,
        data.giftMessage,
        data.closing,
        data.closingGreeting,
        data.footerCredit,
      ][i],
    ),
  );
  text(
    "guest-name",
    new URLSearchParams(location.search).get("to")?.trim().slice(0, 200) ||
      data.guestFallback,
  );
  text("cover-date", date(data.events[0].start));
  $("cover-photo").src = safeURL(data.coverPhoto, true);
  data.profiles.forEach((p, i) => {
    if (i) $("profiles").append(el("div", "couple-divider", "&"));
    const card = el("article", "profile");
    const frame = el("div", "arch");
    frame.append(image(p.photo, p.alt));
    card.append(
      frame,
      el("div", "script", p.nickname),
      el("h3", "", p.name),
      el("p", "family", p.family),
    );
    $("profiles").append(card);
  });
  const icsEscape = (s) =>
    String(s)
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  data.events.forEach((event, index) => {
    const card = el("article", "event-card");
    card.append(
      image("assets/decor/gadang.svg", "", "house"),
      el("h3", "", event.title),
      el("div", "ornament", "✦"),
      el("p", "event-date", date(event.start)),
      el(
        "p",
        "event-time",
        `${time(event.start)} – ${time(event.end)} ${data.timeLabel}`,
      ),
      el("p", "event-venue", event.venue),
      el("p", "event-address", event.address),
    );
    const actions = el("div", "event-actions");
    const map = el("a", "button", `⌖ ${ui.maps}`);
    map.href = safeURL(event.mapUrl);
    map.target = "_blank";
    map.rel = "noopener noreferrer";
    actions.append(map);
    const calendar = el("button", "button secondary", ui.calendar);
    const options = el("div", "calendar-links");
    options.hidden = true;
    calendar.setAttribute("aria-expanded", "false");
    calendar.setAttribute("aria-controls", `calendar-${index}`);
    options.id = `calendar-${index}`;
    calendar.addEventListener("click", () => {
      options.hidden = !options.hidden;
      calendar.setAttribute("aria-expanded", String(!options.hidden));
    });
    const g = el("a", "button secondary", ui.googleCalendar);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.calendar.title,
      dates: `${utc(event.start)}/${utc(event.end)}`,
      details: event.calendar.description,
      location: event.calendar.location,
      ctz: data.timezone,
    });
    g.href = `https://calendar.google.com/calendar/render?${params}`;
    g.target = "_blank";
    g.rel = "noopener noreferrer";
    const apple = el("button", "button secondary", ui.appleCalendar);
    apple.addEventListener("click", () => {
      const rows = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Undangan Digital//ID",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:invitation-${index}-${utc(event.start)}@local`,
        `DTSTAMP:${utc(new Date())}`,
        `DTSTART:${utc(event.start)}`,
        `DTEND:${utc(event.end)}`,
        `SUMMARY:${icsEscape(event.calendar.title)}`,
        `DESCRIPTION:${icsEscape(event.calendar.description)}`,
        `LOCATION:${icsEscape(event.calendar.location)}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ];
      const url = URL.createObjectURL(
        new Blob([rows.join("\r\n") + "\r\n"], {
          type: "text/calendar;charset=utf-8",
        }),
      );
      const a = el("a");
      a.href = url;
      a.download = `acara-${index + 1}.ics`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
    options.append(g, apple);
    options.style.display = "";
    options.className = "event-actions";
    actions.append(calendar, options);
    card.append(actions);
    $("event-list").append(card);
  });
  ui.countdownUnits.forEach((label) => {
    const box = el("div");
    box.append(el("strong", "", "00"), el("span", "", label));
    $("countdown").append(box);
  });
  function countdown() {
    const seconds = Math.max(
      0,
      Math.floor((new Date(data.countdownTarget) - Date.now()) / 1000),
    );
    const values = [
      Math.floor(seconds / 86400),
      Math.floor(seconds / 3600) % 24,
      Math.floor(seconds / 60) % 60,
      seconds % 60,
    ];
    $("countdown")
      .querySelectorAll("strong")
      .forEach((n, i) => (n.textContent = String(values[i]).padStart(2, "0")));
    text(
      "countdown-caption",
      seconds ? data.countdownCaption : data.countdownFinished,
    );
  }
  countdown();
  setInterval(countdown, 1000);
  let toastTimer;
  function toast(message) {
    text("toast", message);
    $("toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 3500);
  }
  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      toast(ui.copySuccess);
    } catch {
      const input = el("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      const ok = document.execCommand("copy");
      input.remove();
      toast(ok ? ui.copySuccess : ui.copyFailed);
    }
  }
  data.accounts.forEach((account) => {
    const card = el("article", "account");
    const button = el("button", "button", account.label);
    button.addEventListener("click", () => copy(account.number));
    card.append(
      el("div", "account-provider", account.provider),
      el("p", "account-number", account.number),
      el("p", "account-holder", `a.n. ${account.holder}`),
      button,
    );
    $("accounts").append(card);
  });
  let current = 0;
  const lightbox = $("lightbox");
  function showPhoto(index) {
    current = (index + data.gallery.length) % data.gallery.length;
    const photo = data.gallery[current];
    $("lightbox-image").src = safeURL(photo.src, true);
    $("lightbox-image").alt = photo.alt;
    text("photo-counter", `${current + 1} / ${data.gallery.length}`);
  }
  data.gallery.forEach((photo, index) => {
    const button = el("button");
    button.setAttribute("aria-label", `Perbesar ${photo.alt}`);
    button.append(image(photo.src, photo.alt));
    button.addEventListener("click", () => {
      showPhoto(index);
      lightbox.showModal();
    });
    $("gallery").append(button);
  });
  lightbox
    .querySelector(".lightbox-close")
    .addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });
  $("photo-prev").addEventListener("click", () => showPhoto(current - 1));
  $("photo-next").addEventListener("click", () => showPhoto(current + 1));
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") showPhoto(current - 1);
    if (e.key === "ArrowRight") showPhoto(current + 1);
  });
  const music = $("music"),
    toggle = $("music-toggle");
  toggle.setAttribute("aria-label", ui.musicPlay);
  music.src = safeURL(data.music.src, true);
  music.volume = Math.max(0, Math.min(1, data.music.volume));
  function musicState(playing) {
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute("aria-label", playing ? ui.musicMute : ui.musicPlay);
    toggle.textContent = playing ? "Ⅱ" : "♪";
  }
  async function play() {
    try {
      await music.play();
      musicState(true);
    } catch {
      musicState(false);
      toast(ui.musicError);
    }
  }
  toggle.addEventListener("click", () => {
    if (music.paused) play();
    else {
      music.pause();
      musicState(false);
    }
  });
  $("open-invitation").addEventListener("click", () => {
    $("content").hidden = false;
    $("open-invitation").textContent = ui.opened;
    toggle.hidden = !data.music.enabled;
    if (data.music.enabled) play();
    $("opening").scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  });
  // Satu layar per halaman. Pindahkan node, bukan menyalin event handler.
  // Bagian panjang dipaginasi agar font dan tombol tetap nyaman disentuh.
  function nextPage(source) {
    const page = el("section", source.className);
    page.classList.remove("visible");
    const artwork = source.querySelector(".section-artwork");
    if (artwork) page.append(artwork.cloneNode(true));
    for (const child of source.children) {
      if (child.classList.contains("eyebrow") || child.tagName === "H2") {
        const heading = child.cloneNode(true);
        heading.removeAttribute("id");
        page.append(heading);
      }
    }
    source.after(page);
    return page;
  }
  const opening = $("opening");
  opening.append($("event-intro"));
  const quotePage = nextPage(opening);
  quotePage.classList.add("quote-page");
  quotePage.querySelector("h2")?.remove();
  quotePage.append(
    opening.querySelector(".ornament"),
    $("quote"),
    $("quote-source"),
  );
  function paginateCards(section, list, cardSelector, count) {
    const cards = [...list.querySelectorAll(cardSelector)];
    list.querySelectorAll(".couple-divider").forEach((node) => node.remove());
    let page = section;
    for (let i = count; i < cards.length; i += count) {
      const newPage = nextPage(page);
      const container = el("div", list.className);
      newPage.append(container);
      cards.slice(i, i + count).forEach((card) => container.append(card));
      page = newPage;
    }
  }
  $("profiles")
    .querySelectorAll(".couple-divider")
    .forEach((node) => node.remove());
  paginateCards($("events"), $("event-list"), ".event-card", 1);

  const closingPage = document.querySelector(".closing");
  const signaturePage = nextPage(closingPage);
  signaturePage.classList.add("signature-page");
  signaturePage.querySelector("h2")?.remove();
  signaturePage.querySelector(".eyebrow")?.remove();
  signaturePage.append(
    closingPage.querySelector(".eyebrow"),
    $("footer-names"),
    closingPage.querySelector(".ornament"),
    $("footer-credit"),
  );

  const galleryRows = Math.max(1, Math.ceil(data.gallery.length / 3));
  $("gallery").style.setProperty("--gallery-rows", galleryRows);

  // Kalender dibuka dalam dialog agar tinggi halaman acara tetap satu layar.
  const calendarDialog = el("dialog", "calendar-dialog");
  calendarDialog.setAttribute("aria-label", ui.calendar);
  const closeCalendar = el("button", "calendar-close", "×");
  closeCalendar.setAttribute("aria-label", ui.closeCalendar);
  const calendarBody = el("div", "calendar-dialog-body");
  calendarDialog.append(closeCalendar, calendarBody);
  document.body.append(calendarDialog);
  closeCalendar.addEventListener("click", () => calendarDialog.close());
  calendarDialog.addEventListener("click", (event) => {
    if (event.target === calendarDialog) calendarDialog.close();
  });
  document.querySelectorAll(".event-card").forEach((card) => {
    const trigger = card.querySelector("button[aria-controls]");
    const options = card.querySelector(".event-actions > .event-actions");
    // Replace the old expandable trigger with a modal trigger.
    const replacement = trigger.cloneNode(true);
    replacement.removeAttribute("aria-expanded");
    replacement.removeAttribute("aria-controls");
    replacement.setAttribute("aria-haspopup", "dialog");
    trigger.replaceWith(replacement);
    replacement.addEventListener("click", () => {
      calendarBody.replaceChildren(options);
      options.hidden = false;
      calendarDialog.showModal();
    });
  });

  // Teks yang sangat panjang atau zoom aksesibilitas tetap bisa digulir
  // di area isi sehingga tidak ada konten yang terpotong.
  document.querySelectorAll(".section").forEach((section) => {
    const body = el("div", "page-body");
    [...section.children].forEach((child) => {
      if (
        !child.classList.contains("section-artwork") &&
        !child.classList.contains("floral") &&
        !child.classList.contains("cover-house")
      )
        body.append(child);
    });
    section.append(body);
  });
  const invitation = $("invitation");
  let lastViewportHeight = window.visualViewport?.height || window.innerHeight;
  function updateViewport() {
    const pageIndex = Math.round(invitation.scrollTop / lastViewportHeight);
    const viewport = window.visualViewport;
    if (!viewport || viewport.scale === 1) {
      document.documentElement.style.setProperty(
        "--page-height",
        `${Math.round(viewport?.height || window.innerHeight)}px`,
      );
    }
    // Pertahankan halaman yang sama saat ukuran layar/address bar berubah.
    lastViewportHeight = viewport?.height || window.innerHeight;
    invitation.scrollTop = pageIndex * Math.round(lastViewportHeight);
  }
  updateViewport();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateViewport, 120);
  });
  window.visualViewport?.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateViewport, 120);
  });
  if ("IntersectionObserver" in window) {
    document.body.classList.add("js-observe");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((n) => observer.observe(n));
  }
  // Buku tamu Supabase: REST API bawaan, tanpa library tambahan.
  function setupWishes() {
    const form = $("wishes-form"), submit = $("wish-submit");
    const refresh = $("wish-refresh"), more = $("wish-more");
    const list = $("wish-list"), status = $("wish-status");
    const listStatus = $("wish-list-status"), config = data.supabase || {};
    const name = $("wish-name"), message = $("wish-message");
    name.value = new URLSearchParams(location.search).get("to")?.trim().slice(0, 100) || "";
    let endpoint;
    try {
      const base = new URL(config.url);
      if (base.protocol !== "https:" || base.hostname.includes("YOUR_PROJECT") ||
          !config.publishableKey?.startsWith("sb_publishable_") ||
          config.publishableKey.includes("GANTI_DENGAN")) throw new Error("configuration");
      endpoint = new URL("/rest/v1/invitation_comments", base);
    } catch {
      status.textContent = "Ucapan belum tersedia. Silakan hubungi pemilik undangan.";
      form.addEventListener("submit", (event) => event.preventDefault());
      return;
    }
    submit.disabled = false;
    refresh.disabled = false;
    const pageSize = 10;
    let loading = false, sending = false, offset = 0;
    const shown = new Set();
    const timestamp = new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit",
      minute: "2-digit", timeZone: data.timezone,
    });
    async function request(url, options = {}) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(url, {
          ...options, signal: controller.signal, cache: "no-store",
          headers: { apikey: config.publishableKey, ...options.headers },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return options.method === "POST" ? null : await response.json();
      } finally { clearTimeout(timer); }
    }
    function renderComment(row) {
      const card = el("article", "wish-card");
      const dateNode = el("time", "wish-date");
      const created = new Date(row.created_at);
      if (!Number.isNaN(created.getTime())) {
        dateNode.dateTime = created.toISOString();
        dateNode.textContent = timestamp.format(created);
      }
      // textContent melalui helper el(): teks tamu tidak dieksekusi sebagai HTML.
      card.append(el("h4", "wish-name", row.nama), dateNode, el("p", "wish-message", row.ucapan));
      return card;
    }
    async function loadComments(reset = false) {
      if (loading) return;
      loading = true;
      submit.disabled = true;
      refresh.disabled = more.disabled = true;
      list.setAttribute("aria-busy", "true");
      listStatus.textContent = "Memuat ucapan...";
      const nextOffset = reset ? 0 : offset;
      try {
        const url = new URL(endpoint);
        url.search = new URLSearchParams({
          select: "id,nama,ucapan,created_at", order: "created_at.desc,id.desc",
          limit: String(pageSize), offset: String(nextOffset),
        });
        const rows = await request(url);
        if (!Array.isArray(rows)) throw new Error("Invalid response");
        if (reset) { list.replaceChildren(); shown.clear(); }
        rows.forEach((row) => {
          if (!shown.has(row.id)) { list.append(renderComment(row)); shown.add(row.id); }
        });
        offset = nextOffset + rows.length;
        more.hidden = rows.length < pageSize;
        listStatus.textContent = shown.size ? "" : "Belum ada ucapan. Jadilah yang pertama memberi doa!";
      } catch {
        listStatus.textContent = "Ucapan belum dapat dimuat. Ketuk Perbarui untuk mencoba lagi.";
      } finally {
        loading = false;
        submit.disabled = sending;
        list.setAttribute("aria-busy", "false");
        refresh.disabled = more.disabled = sending;
      }
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (sending || loading) return;
      name.setCustomValidity(name.value.trim() ? "" : "Silakan isi nama Anda.");
      message.setCustomValidity(message.value.trim() ? "" : "Silakan isi ucapan Anda.");
      if (!form.reportValidity()) return;
      sending = true;
      submit.disabled = refresh.disabled = more.disabled = true;
      submit.textContent = "Mengirim...";
      status.textContent = "";
      try {
        await request(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ nama: name.value.trim(), ucapan: message.value.trim() }),
        });
        message.value = "";
        status.textContent = "Terima kasih! Ucapan Anda berhasil disimpan.";
        await loadComments(true);
      } catch {
        status.textContent = "Pengiriman belum dapat dikonfirmasi. Periksa daftar ucapan dengan tombol Perbarui sebelum mengirim ulang.";
      } finally {
        sending = false;
        submit.disabled = false;
        refresh.disabled = more.disabled = loading;
        submit.textContent = "Kirim Ucapan";
      }
    });
    name.addEventListener("input", () => name.setCustomValidity(""));
    message.addEventListener("input", () => message.setCustomValidity(""));
    refresh.addEventListener("click", () => loadComments(true));
    more.addEventListener("click", () => loadComments());
    // Ambil data ketika bagian ucapan mendekati layar agar pembukaan tetap ringan.
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadComments(true);
        }
      }, { root: $("invitation"), rootMargin: "200px" });
      observer.observe($("wishes"));
    } else { loadComments(true); }
  }
  setupWishes();

})();
