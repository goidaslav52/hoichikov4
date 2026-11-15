const MEDIA_STORAGE_KEY = "hoichikov4_media_custom_v1";

// Базовые записи по внешним ссылкам (видны всем посетителям сайта)
const DEFAULT_MEDIA_ITEMS = [
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
  figure.className = "media-card";
  figure.dataset.type = item.type === "video" ? "video" : "photo";

  const frame = document.createElement("div");
  frame.className = "media-frame";

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.url;
    video.controls = true;
    video.preload = "metadata";
    frame.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.caption || "Изображение из медиатеки";
    img.loading = "lazy";
    frame.appendChild(img);
  }

  const caption = document.createElement("figcaption");
  caption.className = "media-caption";

  const title = document.createElement("span");
  title.className = "media-title";
  title.textContent = item.caption;

  const badge = document.createElement("span");
  badge.className = "media-meta";
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

document.addEventListener("DOMContentLoaded", () => {
  let currentFilter = "all";
  renderMediaLibrary(currentFilter);

  // Фильтры: Все / Фото / Видео
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter || "all";
      filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
      applyActiveFilter(currentFilter);
    });
  });

  // Добавление новой карточки по ссылке
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

  // Кнопка очистки только локальных карточек из браузера
  const clearBtn = document.getElementById("clear-local-media");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(MEDIA_STORAGE_KEY);
      renderMediaLibrary(currentFilter);
    });
  }
});
