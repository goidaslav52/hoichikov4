const MEDIA_STORAGE_KEY = "hoichikov4_media_custom_v1";

// Записи, которые видят все посетители сайта
const DEFAULT_MEDIA_ITEMS = [
  {
    id: "custom-1794773263122",
    url: "https://i.postimg.cc/zy3tN4RY/photo-2026-11-15-22-05-40.jpg",
    type: "photo",
    caption: "Гои"
  },
  {
    id: "default-1",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    type: "photo",
    caption: "Горный пейзаж у озера"
  },
  {
    id: "default-2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    type: "video",
    caption: "Тестовый ролик в формате MP4"
  }
];

function getCustomItems() {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setCustomItems(items) {
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
}

function getAllItems() {
  return [...getCustomItems(), ...DEFAULT_MEDIA_ITEMS];
}

function createMediaCard(item) {
  const figure = document.createElement("figure");
  figure.className = "media-card bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col";
  figure.dataset.type = item.type === "video" ? "video" : "photo";

  const frame = document.createElement("div");
  frame.className = "media-frame aspect-video bg-slate-900 overflow-hidden";

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.url;
    video.controls = true;
    video.preload = "metadata";
    video.className = "w-full h-full object-cover";
    frame.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.caption || "Изображение из медиатеки";
    img.loading = "lazy";
    img.className = "w-full h-full object-cover cursor-zoom-in";
    frame.appendChild(img);
  }

  const caption = document.createElement("figcaption");
  caption.className = "media-caption p-3.5 flex flex-col gap-1";

  const title = document.createElement("span");
  title.className = "media-title font-semibold text-sm text-white";
  title.textContent = item.caption;

  const badge = document.createElement("span");
  badge.className = "media-meta text-xs text-slate-400";
  badge.textContent = item.type === "video" ? "Видео" : "Фото";

  caption.append(title, badge);
  figure.append(frame, caption);

  return figure;
}

function applyActiveFilter(activeFilter) {
  const cards = document.querySelectorAll(".media-card");
  cards.forEach((card) => {
    const matches = activeFilter === "all" || card.dataset.type === activeFilter;
    card.classList.toggle("is-hidden", !matches);
  });
}

function renderMediaLibrary(activeFilter = "all") {
  const grid = document.getElementById("external-media-grid");
  if (!grid) return;

  grid.innerHTML = "";
  const items = getAllItems();

  items.forEach((item) => {
    grid.appendChild(createMediaCard(item));
  });

  applyActiveFilter(activeFilter);
}

function setupLightbox() {
  const modal = document.getElementById("lightboxModal");
  const modalImg = document.getElementById("lightboxImg");
  const modalCaption = document.getElementById("lightboxCaption");
  const modalLink = document.getElementById("lightboxOriginalLink");
  const closeBtn = document.getElementById("lightboxClose");
  const grid = document.getElementById("external-media-grid");

  if (!modal || !modalImg || !modalCaption || !grid) return;

  function closeLightbox() {
    modal.classList.add("hidden");
    modalImg.src = "";
    modalImg.alt = "";
  }

  grid.addEventListener("click", (event) => {
    const img = event.target.closest("img");
    if (!img) return;

    const card = img.closest(".media-card");
    const titleEl = card ? card.querySelector(".media-title") : null;
    const captionText = (titleEl && titleEl.textContent) || img.alt || "Изображение";

    modalImg.src = img.src;
    modalImg.alt = captionText;
    modalCaption.textContent = captionText;
    if (modalLink) {
      modalLink.href = img.src;
    }

    modal.classList.remove("hidden");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeLightbox();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  let currentFilter = "all";
  renderMediaLibrary(currentFilter);
  setupLightbox();

  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter || "all";
      filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
      applyActiveFilter(currentFilter);
    });
  });

  const form = document.getElementById("add-media-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const urlInput = document.getElementById("media-url");
      const typeInput = document.getElementById("media-type");
      const captionInput = document.getElementById("media-caption");

      const url = urlInput ? urlInput.value.trim() : "";
      const type = typeInput ? typeInput.value : "photo";
      const caption = captionInput ? captionInput.value.trim() : "";

      if (!url || !caption) return;

      const customItems = getCustomItems();
      customItems.unshift({
        id: `custom-${Date.now()}`,
        url,
        type,
        caption
      });

      setCustomItems(customItems);
      renderMediaLibrary(currentFilter);
      form.reset();
    });
  }

  const clearBtn = document.getElementById("clear-local-media");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(MEDIA_STORAGE_KEY);
      renderMediaLibrary(currentFilter);
    });
  }
});
