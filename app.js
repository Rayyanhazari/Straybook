(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "catdex_v1_collection";
  const MAX_IMAGE_EDGE = 1100;
  const JPEG_QUALITY = 0.76;
  let cats = [];
  let photoData = "";
  let cameraStream = null;
  let currentFilter = "all";
  let selectedId = null;

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    cats = Array.isArray(stored) ? stored : [];
  } catch {
    cats = [];
  }

  function saveCats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
      $("storageMessage").textContent = "Saved in this browser on this device. Export a backup to move your collection.";
      return true;
    } catch (error) {
      $("storageMessage").textContent = "Storage is full. Try a smaller photo or export and remove older entries.";
      $("formMessage").textContent = "Could not save this entry. Browser storage may be full.";
      return false;
    }
  }

  function compressImage(source, callback) {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    image.onerror = () => {
      $("cameraMessage").textContent = "Sorry, that image could not be read. Try another photo.";
    };
    image.src = source;
  }

  function stopCamera() {
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    $("cameraVideo").srcObject = null;
    $("cameraVideo").hidden = true;
    $("scanFrame").hidden = true;
    $("captureButton").disabled = true;
    $("cameraButton").textContent = "◎ Open scanner";
  }

  function setPhoto(data) {
    photoData = data;
    $("photoPreview").src = data;
    $("photoPreview").hidden = false;
    $("placeholder").hidden = true;
    stopCamera();
    $("cameraMessage").textContent = "Photo ready! Add the cat's details below.";
  }

  function updateStats() {
    $("total").textContent = cats.length;
    $("notesCount").textContent = cats.filter(cat => (cat.notes || "").trim()).length;
    $("entryCount").textContent = `${cats.length} ${cats.length === 1 ? "ENTRY" : "ENTRIES"}`;
  }

  function makeCard(cat) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "cat-card";
    card.setAttribute("aria-label", `Open cat record for ${cat.name}`);

    if (cat.photo) {
      const image = document.createElement("img");
      image.src = cat.photo;
      image.alt = `Photo of ${cat.name}`;
      image.loading = "lazy";
      card.appendChild(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "cat-placeholder";
      placeholder.textContent = "🐈";
      card.appendChild(placeholder);
    }

    const body = document.createElement("div");
    body.className = "cat-card-body";
    const name = document.createElement("h3");
    name.textContent = cat.name;
    const appearance = document.createElement("span");
    appearance.className = "tag";
    appearance.textContent = cat.appearance || "Unknown appearance";
    const location = document.createElement("div");
    location.className = "cat-location";
    location.textContent = cat.location || "Location not recorded";
    body.append(name, appearance, location);
    card.appendChild(body);
    card.addEventListener("click", () => openDetails(cat.id));
    return card;
  }

  function render() {
    updateStats();
    const grid = $("catGrid");
    grid.replaceChildren();
    const shown = cats.filter(cat =>
      currentFilter === "all" ||
      (currentFilter === "photo" && !!cat.photo) ||
      (currentFilter === "notes" && !!(cat.notes || "").trim())
    );
    if (!shown.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      const emoji = document.createElement("div");
      emoji.className = "emoji";
      emoji.textContent = "🔎";
      const title = document.createElement("strong");
      title.textContent = cats.length ? "No cats match this filter." : "Your collection is waiting.";
      const description = document.createElement("p");
      description.textContent = cats.length
        ? "Try another filter."
        : "Your first encounter could be just around the corner. Scan a cat to get started!";
      empty.append(emoji, title, description);
      grid.appendChild(empty);
      return;
    }
    shown.slice().reverse().forEach(cat => grid.appendChild(makeCard(cat)));
  }

  function openDetails(id) {
    const cat = cats.find(item => item.id === id);
    if (!cat) return;
    selectedId = id;
    const photoHost = $("dialogPhoto");
    photoHost.replaceChildren();
    if (cat.photo) {
      const image = document.createElement("img");
      image.className = "dialog-photo";
      image.src = cat.photo;
      image.alt = `Photo of ${cat.name}`;
      photoHost.appendChild(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "dialog-photo-placeholder";
      placeholder.textContent = "🐈";
      photoHost.appendChild(placeholder);
    }
    $("dialogName").textContent = cat.name;
    $("dialogInfo").textContent =
      `Appearance: ${cat.appearance || "Not recorded"}\n` +
      `Where spotted: ${cat.location || "Not recorded"}\n` +
      `First recorded: ${new Date(cat.date).toLocaleDateString()}\n\n` +
      (cat.notes || "No field notes yet.");
    $("catDialog").showModal();
  }

  $("cameraButton").addEventListener("click", async () => {
    if (cameraStream) {
      stopCamera();
      $("cameraMessage").textContent = "Scanner closed.";
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access needs localhost or HTTPS. Run this app with VS Code Live Server, or choose a photo instead.");
      }
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }, audio: false
      });
      $("cameraVideo").srcObject = cameraStream;
      $("cameraVideo").hidden = false;
      $("photoPreview").hidden = true;
      $("placeholder").hidden = true;
      $("scanFrame").hidden = false;
      $("captureButton").disabled = false;
      $("cameraButton").textContent = "✕ Close scanner";
      $("cameraMessage").textContent = "Aim at the cat and capture when ready.";
    } catch (error) {
      $("cameraMessage").textContent = error.message || "Could not open camera. Check browser permissions or choose a photo.";
      cameraStream = null;
    }
  });

  $("captureButton").addEventListener("click", () => {
    const video = $("cameraVideo");
    if (!cameraStream || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, MAX_IMAGE_EDGE / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    $("photoInput").value = "";
  });

  $("galleryButton").addEventListener("click", () => $("photoInput").click());

  function handleSelectedPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      $("cameraMessage").textContent = "Please choose an image file.";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      $("cameraMessage").textContent = "Please choose an image under 20 MB.";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => compressImage(reader.result, setPhoto);
    reader.onerror = () => { $("cameraMessage").textContent = "Could not read that file."; };
    reader.readAsDataURL(file);
    event.target.value = "";
  }
  $("photoInput").addEventListener("change", handleSelectedPhoto);

  $("catForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = $("catName").value.trim();
    if (!name) return;
    const entry = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.slice(0, 40),
      appearance: $("catAppearance").value.trim().slice(0, 60),
      location: $("catLocation").value.trim().slice(0, 80),
      notes: $("catNotes").value.trim().slice(0, 500),
      photo: photoData,
      date: new Date().toISOString()
    };
    cats.push(entry);
    if (!saveCats()) {
      cats.pop();
      return;
    }
    $("catForm").reset();
    photoData = "";
    $("photoPreview").removeAttribute("src");
    $("photoPreview").hidden = true;
    $("placeholder").hidden = false;
    $("photoInput").value = "";
    stopCamera();
    $("cameraMessage").textContent = "Ready for the next encounter.";
    $("formMessage").textContent = `✨ ${entry.name} added to your collection!`;
    currentFilter = "all";
    document.querySelectorAll(".filter").forEach(button =>
      button.classList.toggle("active", button.dataset.filter === "all")
    );
    render();
  });

  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      document.querySelectorAll(".filter").forEach(item =>
        item.classList.toggle("active", item === button)
      );
      render();
    });
  });

  $("closeDialog").addEventListener("click", () => $("catDialog").close());

  $("renameButton").addEventListener("click", () => {
    const cat = cats.find(item => item.id === selectedId);
    if (!cat) return;
    const newName = prompt(`Give ${cat.name} a new nickname:`, cat.name);
    if (newName === null) return;
    if (!newName.trim()) {
      alert("A cat needs a nickname!");
      return;
    }
    const oldName = cat.name;
    cat.name = newName.trim().slice(0, 40);
    if (!saveCats()) { cat.name = oldName; return; }
    render();
    openDetails(cat.id);
  });

  $("deleteButton").addEventListener("click", () => {
    const cat = cats.find(item => item.id === selectedId);
    if (!cat || !confirm(`Remove ${cat.name} from your CatDex?`)) return;
    const oldCats = cats;
    cats = cats.filter(item => item.id !== selectedId);
    if (!saveCats()) { cats = oldCats; return; }
    $("catDialog").close();
    selectedId = null;
    render();
  });

  $("exportButton").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ app: "CatDex", version: 1, exportedAt: new Date().toISOString(), cats }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `catdex-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    $("storageMessage").textContent = "Backup exported. Keep the JSON file somewhere safe.";
  });

  $("importInput").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const imported = Array.isArray(parsed) ? parsed : parsed.cats;
      if (!Array.isArray(imported) || !imported.every(cat => cat && typeof cat.name === "string")) {
        throw new Error("This doesn't look like a CatDex backup.");
      }
      if (!confirm(`Import ${imported.length} cat entries? This will add them to your current collection.`)) return;
      const existing = new Set(cats.map(cat => cat.id));
      const safe = imported.map(cat => ({
        id: existing.has(cat.id) ? `${cat.id}-import-${Math.random().toString(36).slice(2, 6)}` : (cat.id || crypto.randomUUID()),
        name: String(cat.name).slice(0, 40),
        appearance: String(cat.appearance || "").slice(0, 60),
        location: String(cat.location || "").slice(0, 80),
        notes: String(cat.notes || "").slice(0, 500),
        photo: typeof cat.photo === "string" && cat.photo.startsWith("data:image/") ? cat.photo : "",
        date: cat.date || new Date().toISOString()
      }));
      const previous = cats;
      cats = cats.concat(safe);
      if (!saveCats()) { cats = previous; return; }
      currentFilter = "all";
      document.querySelectorAll(".filter").forEach(button => button.classList.toggle("active", button.dataset.filter === "all"));
      render();
      $("storageMessage").textContent = `Imported ${safe.length} cat entries.`;
    } catch (error) {
      alert(error.message || "Could not import that backup.");
    } finally {
      event.target.value = "";
    }
  });

  window.addEventListener("pagehide", stopCamera);
  render();

  // Enable offline app-shell caching when served from HTTPS or localhost.
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }
})();
