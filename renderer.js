let allItems = [];
let allTags = [];
let allCollections = [];

let currentFilterType = 'all';
let currentCollectionFilter = null;
let filterOnlyFavorites = false;
let activeTag = null;
let searchQuery = '';
let currentSort = 'date-desc';
let currentViewMode = localStorage.getItem('shelfbox_view_mode') || 'grid'; // 'grid' или 'list'
let openedItemId = null;
let lastViewedItemId = null;
let lastNavTime = 0;

let selectedTagsForModal = [];
let selectedCollectionsForModal = [];
let currentCoverPath = null;
let selectedRating = null; // 1-10
let isFavoriteInModal = false;
let searchDebounceTimer = null;

// Элементы
const catalog = document.getElementById('catalog');
const mediaModal = document.getElementById('media-modal');
const modalHeading = document.getElementById('modal-heading');
const editItemId = document.getElementById('edit-item-id');
const mediaForm = document.getElementById('media-form');

const viewCatalog = document.getElementById('view-catalog');
const viewDetail = document.getElementById('view-detail');
const viewTags = document.getElementById('view-tags');
const tabCatalogBtn = document.getElementById('tab-catalog-btn');
const tabTagsBtn = document.getElementById('tab-tags-btn');

const viewModeGridBtn = document.getElementById('view-mode-grid');
const viewModeListBtn = document.getElementById('view-mode-list');

const detailBackBtn = document.getElementById('detail-back-btn');
const detailTitle = document.getElementById('detail-title');
const detailCoverContainer = document.getElementById('detail-cover-container');
const detailTypePill = document.getElementById('detail-type-pill');
const detailStatusPill = document.getElementById('detail-status-pill');
const detailRatingPill = document.getElementById('detail-rating-pill');
const detailTagsList = document.getElementById('detail-tags-list');
const detailCollectionsList = document.getElementById('detail-collections-list');
const detailDescription = document.getElementById('detail-description');
const detailNotes = document.getElementById('detail-notes');
const detailFavBtn = document.getElementById('detail-fav-btn');
const detailEditBtn = document.getElementById('detail-edit-btn');
const detailDeleteBtn = document.getElementById('detail-delete-btn');

const collectionModal = document.getElementById('collection-modal');
const collectionForm = document.getElementById('collection-form');
const newColInput = document.getElementById('new-col-input');
const newCollectionBtn = document.getElementById('new-collection-btn');
const closeColModalBtn = document.getElementById('close-col-modal-btn');
const closeColModalX = document.getElementById('close-col-modal-x');

const editTagModal = document.getElementById('edit-tag-modal');
const editTagForm = document.getElementById('edit-tag-form');
const editTagIdInput = document.getElementById('edit-tag-id');
const editTagNameInput = document.getElementById('edit-tag-name-input');
const closeEditTagModalBtn = document.getElementById('close-edit-tag-modal-btn');
const closeEditTagModalX = document.getElementById('close-edit-tag-modal-x');

const starsTrack = document.getElementById('stars-track');
const starScoreLabel = document.getElementById('star-score-label');
const clearRatingBtn = document.getElementById('clear-rating-btn');
let starsFgEl = null;

const favHeartBtn = document.getElementById('fav-heart-btn');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const coverPreview = document.getElementById('cover-preview');
const dropPlaceholder = document.getElementById('drop-placeholder');

const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const tagFilterSelect = document.getElementById('tag-filter-select');
const favFilterBtn = document.getElementById('filter-favorites');
const collectionsList = document.getElementById('collections-list');
const modalTagsPicker = document.getElementById('modal-tags-picker');
const modalCollectionsPicker = document.getElementById('modal-collections-picker');

const detailStatusHistory = document.getElementById('detail-status-history');

const tagCreateForm = document.getElementById('tag-create-form');
const tagsTableBody = document.getElementById('tags-table-body');
const tagsSearchInput = document.getElementById('tags-search-input');
let tagSearchFilterQuery = '';

const STAR_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

const typeIcons = {
  game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11h4M8 9v4"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.3 5H6.7A4 4 0 0 0 2.7 8.6L2 15a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.4-1.4A2 2 0 0 1 9.8 15h4.4a2 2 0 0 1 1.4.6L17 17c.5.5 1 1 2 1a3 3 0 0 0 3-3l-.7-6.4A4 4 0 0 0 17.3 5z"/></svg>',
  movie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
  series: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  anime: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  comics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/></svg>',
  manga: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M14 2v7l-2.5-1.5L9 9V2"/></svg>',
  boardgame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/></svg>'
};

const mediaLabels = {
  game: 'Игра',
  movie: 'Фильм',
  series: 'Сериал',
  anime: 'Аниме',
  book: 'Книга',
  comics: 'Комикс',
  manga: 'Манга',
  boardgame: 'Комикс'
};

async function init() {
  [allItems, allTags, allCollections] = await Promise.all([
    window.api.getItems(),
    window.api.getTags(),
    window.api.getCollections()
  ]);
  populateTagFilterSelect();
  buildStarRatingWidget();
  initHeartButton();
  updateViewModeToggle();
  renderCollectionsSidebar();
  renderCatalog();
}

function initHeartButton() {
  favHeartBtn.onclick = () => {
    isFavoriteInModal = !isFavoriteInModal;
    favHeartBtn.classList.toggle('active', isFavoriteInModal);
  };
}

function setHeartState(active) {
  isFavoriteInModal = Boolean(active);
  favHeartBtn.classList.toggle('active', isFavoriteInModal);
}

function updateViewModeToggle() {
  if (currentViewMode === 'list') {
    viewModeListBtn.classList.add('active');
    viewModeGridBtn.classList.remove('active');
    catalog.classList.remove('view-grid');
    catalog.classList.add('view-list');
  } else {
    viewModeGridBtn.classList.add('active');
    viewModeListBtn.classList.remove('active');
    catalog.classList.remove('view-list');
    catalog.classList.add('view-grid');
  }
}

viewModeGridBtn.onclick = () => {
  currentViewMode = 'grid';
  localStorage.setItem('shelfbox_view_mode', 'grid');
  updateViewModeToggle();
  renderCatalog();
};

viewModeListBtn.onclick = () => {
  currentViewMode = 'list';
  localStorage.setItem('shelfbox_view_mode', 'list');
  updateViewModeToggle();
  renderCatalog();
};

function buildStarRatingWidget() {
  starsTrack.innerHTML = '';

  const bg = document.createElement('div');
  bg.className = 'stars-bg';
  for (let i = 0; i < 5; i++) {
    bg.innerHTML += `<svg viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg>`;
  }
  starsTrack.appendChild(bg);

  starsFgEl = document.createElement('div');
  starsFgEl.className = 'stars-fg';
  for (let i = 0; i < 5; i++) {
    starsFgEl.innerHTML += `<svg viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg>`;
  }
  starsTrack.appendChild(starsFgEl);

  function getValFromEvent(e) {
    const rect = starsTrack.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = offsetX / rect.width;
    return Math.max(1, Math.min(10, Math.ceil(ratio * 10)));
  }

  starsTrack.onmousemove = (e) => {
    updateStarWidgetVisuals(getValFromEvent(e));
  };

  starsTrack.onclick = (e) => {
    selectedRating = getValFromEvent(e);
    updateStarWidgetVisuals(selectedRating);
  };

  starsTrack.onmouseleave = () => {
    updateStarWidgetVisuals(selectedRating);
  };

  clearRatingBtn.onclick = () => {
    selectedRating = null;
    updateStarWidgetVisuals(null);
  };
}

function updateStarWidgetVisuals(val) {
  if (!starsFgEl) return;
  if (!val) {
    starsFgEl.style.width = '0%';
    starScoreLabel.textContent = 'Нет оценки';
  } else {
    starsFgEl.style.width = `${val * 10}%`;
    const starCount = (val / 2).toFixed(1).replace('.0', '');
    starScoreLabel.textContent = `${starCount} / 5`;
  }
}

function createCardStarsElement(val) {
  if (!val) return null;

  const wrap = document.createElement('div');
  wrap.className = 'star-card-row';

  const icons = document.createElement('div');
  icons.className = 'star-card-icons';

  for (let i = 1; i <= 5; i++) {
    const starFullAt = i * 2;
    const starHalfAt = starFullAt - 1;

    let fill = '#27272a';
    if (val >= starFullAt) {
      fill = '#f59e0b';
    } else if (val === starHalfAt) {
      const halfSvg = `
        <svg viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half-grad-${val}">
              <stop offset="50%" stop-color="#f59e0b"/>
              <stop offset="50%" stop-color="#27272a"/>
            </linearGradient>
          </defs>
          <path fill="url(#half-grad-${val})" d="${STAR_PATH}"/>
        </svg>`;
      icons.innerHTML += halfSvg;
      continue;
    }

    icons.innerHTML += `<svg viewBox="0 0 24 24" fill="${fill}"><path d="${STAR_PATH}"/></svg>`;
  }

  wrap.appendChild(icons);

  const scoreText = document.createElement('span');
  scoreText.className = 'star-card-score';
  scoreText.textContent = (val / 2).toFixed(1).replace('.0', '');
  wrap.appendChild(scoreText);

  return wrap;
}

function createHeartButton(isActive, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `heart-badge-btn ${isActive ? 'active' : ''}`;
  btn.title = isActive ? 'В избранном' : 'Добавить в избранное';
  btn.innerHTML = `<svg viewBox="0 0 24 24" class="heart-icon"><path d="${HEART_PATH}"/></svg>`;
  btn.onclick = (e) => {
    e.stopPropagation();
    onClick();
  };
  return btn;
}

function renderCatalog() {
  const filtered = allItems.filter(item => {
    const matchType = currentFilterType === 'all' || item.media_type === currentFilterType;
    const matchFav = !filterOnlyFavorites || item.is_favorite === 1;

    let matchCollection = true;
    if (currentCollectionFilter !== null) {
      const itemCols = Array.isArray(item.collections) ? item.collections.map(Number) : [];
      matchCollection = itemCols.includes(Number(currentCollectionFilter));
    }

    let matchSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = Boolean(item.title && item.title.toLowerCase().includes(q));
      const descMatch = Boolean(item.description && item.description.toLowerCase().includes(q));
      const notesMatch = Boolean(item.notes && item.notes.toLowerCase().includes(q));

      const tagQ = q.startsWith('#') ? q.slice(1).trim() : q;
      let tagMatch = false;
      if (item.tags && tagQ) {
        try {
          const tagsArr = JSON.parse(item.tags);
          tagMatch = tagsArr.some(t => t.toLowerCase().includes(tagQ));
        } catch (e) {}
      }

      matchSearch = titleMatch || descMatch || notesMatch || tagMatch;
    }

    let matchTag = true;
    if (activeTag) {
      const itemTags = item.tags ? JSON.parse(item.tags) : [];
      matchTag = itemTags.includes(activeTag);
    }

    return matchType && matchFav && matchCollection && matchSearch && matchTag;
  });

  filtered.sort((a, b) => {
    if (currentSort === 'date-desc') return b.id - a.id;
    if (currentSort === 'date-asc') return a.id - b.id;
    if (currentSort === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
    if (currentSort === 'rating-asc') return (a.rating || 0) - (b.rating || 0);
    if (currentSort === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    if (currentSort === 'title-desc') return (b.title || '').localeCompare(a.title || '');
    return 0;
  });

  const fragment = document.createDocumentFragment();

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = currentViewMode === 'list' ? 'list-card' : 'card';
    card.onclick = () => openDetailPage(item.id);

    const favHeart = createHeartButton(item.is_favorite, () => toggleFav(item.id));

    // Обложка
    let coverEl;
    if (item.cover_path) {
      coverEl = document.createElement('img');
      coverEl.className = currentViewMode === 'list' ? 'list-cover' : 'card-cover';
      coverEl.loading = 'lazy';
      coverEl.src = `file:///${item.cover_path.replace(/\\/g, '/')}`;
      coverEl.onerror = () => { coverEl.replaceWith(createEmptyCover(currentViewMode === 'list')); };
    } else {
      coverEl = createEmptyCover(currentViewMode === 'list');
    }

    if (currentViewMode === 'grid') {
      card.appendChild(favHeart);
      card.appendChild(coverEl);

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body compact-body';

      const titleEl = document.createElement('div');
      titleEl.className = 'card-title';
      titleEl.textContent = item.title;
      cardBody.appendChild(titleEl);

      const statusRow = document.createElement('div');
      statusRow.className = 'status-row';
      const statusBadge = document.createElement('span');
      statusBadge.className = `badge ${getStatusClass(item.status || 'Запланировано')}`;
      statusBadge.textContent = item.status || 'Запланировано';
      statusRow.appendChild(statusBadge);
      cardBody.appendChild(statusRow);

      const starWrap = document.createElement('div');
      starWrap.className = 'rating-row-card';
      if (item.rating) {
        const starEl = createCardStarsElement(item.rating);
        if (starEl) starWrap.appendChild(starEl);
      } else {
        const noScore = document.createElement('span');
        noScore.className = 'no-score-text';
        noScore.textContent = 'Нет оценки';
        starWrap.appendChild(noScore);
      }
      cardBody.appendChild(starWrap);

      const footer = document.createElement('div');
      footer.className = 'card-footer';

      const typeBadge = document.createElement('div');
      typeBadge.className = 'type-badge-row';
      typeBadge.innerHTML = `${typeIcons[item.media_type] || ''}<span>${mediaLabels[item.media_type] || item.media_type}</span>`;
      footer.appendChild(typeBadge);

      const actions = document.createElement('div');
      actions.className = 'card-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'action-link edit-btn';
      editBtn.textContent = 'Ред.';
      editBtn.onclick = (e) => { e.stopPropagation(); openEditModal(item.id); };
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-link delete-btn';
      deleteBtn.textContent = 'Удалить';
      deleteBtn.onclick = (e) => { e.stopPropagation(); deleteItem(item.id); };
      actions.appendChild(deleteBtn);

      footer.appendChild(actions);
      cardBody.appendChild(footer);
      card.appendChild(cardBody);
    } else {
      // Режим списка: аккуратная строка
      card.appendChild(coverEl);

      const mainInfo = document.createElement('div');
      mainInfo.className = 'list-main-info';

      const rowTop = document.createElement('div');
      rowTop.className = 'list-top-line';

      const titleEl = document.createElement('div');
      titleEl.className = 'card-title';
      titleEl.textContent = item.title;
      rowTop.appendChild(titleEl);

      const typeBadge = document.createElement('div');
      typeBadge.className = 'type-badge-row';
      typeBadge.innerHTML = `${typeIcons[item.media_type] || ''}<span>${mediaLabels[item.media_type] || item.media_type}</span>`;
      rowTop.appendChild(typeBadge);

      const statusBadge = document.createElement('span');
      statusBadge.className = `badge ${getStatusClass(item.status || 'Запланировано')}`;
      statusBadge.textContent = item.status || 'Запланировано';
      rowTop.appendChild(statusBadge);

      if (item.rating) {
        const starEl = createCardStarsElement(item.rating);
        if (starEl) rowTop.appendChild(starEl);
      }

      mainInfo.appendChild(rowTop);

      if (item.description) {
        const descEl = document.createElement('p');
        descEl.className = 'list-desc';
        descEl.textContent = item.description;
        mainInfo.appendChild(descEl);
      }

      card.appendChild(mainInfo);

      const sideActions = document.createElement('div');
      sideActions.className = 'list-actions-col';
      sideActions.appendChild(favHeart);

      const btnsRow = document.createElement('div');
      btnsRow.className = 'card-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'action-link edit-btn';
      editBtn.textContent = 'Ред.';
      editBtn.onclick = (e) => { e.stopPropagation(); openEditModal(item.id); };
      btnsRow.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-link delete-btn';
      deleteBtn.textContent = 'Удалить';
      deleteBtn.onclick = (e) => { e.stopPropagation(); deleteItem(item.id); };
      btnsRow.appendChild(deleteBtn);

      sideActions.appendChild(btnsRow);
      card.appendChild(sideActions);
    }

    fragment.appendChild(card);
  });

  catalog.innerHTML = '';
  catalog.appendChild(fragment);
}

function createEmptyCover(isList = false) {
  const ph = document.createElement('div');
  ph.className = isList ? 'list-cover cover-empty' : 'card-cover cover-empty';
  ph.innerHTML = `
    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>`;
  return ph;
}

// Детальная страница проекта
function openDetailPage(id) {
  const item = allItems.find(i => Number(i.id) === Number(id));
  if (!item) return;
  openedItemId = item.id;
  lastViewedItemId = item.id;

  detailTitle.textContent = item.title;

  detailCoverContainer.innerHTML = '';
  if (item.cover_path) {
    const img = document.createElement('img');
    img.src = `file:///${item.cover_path.replace(/\\/g, '/')}`;
    img.className = 'detail-cover-img';
    img.onerror = () => {
      detailCoverContainer.innerHTML = createEmptyCover().outerHTML;
    };
    detailCoverContainer.appendChild(img);
  } else {
    detailCoverContainer.appendChild(createEmptyCover());
  }

  detailTypePill.innerHTML = `${typeIcons[item.media_type] || ''}<span>${mediaLabels[item.media_type] || item.media_type}</span>`;
  detailStatusPill.textContent = item.status || 'Запланировано';
  detailStatusPill.className = `badge meta-pill-badge ${getStatusClass(item.status || 'Запланировано')}`;

  detailRatingPill.innerHTML = '';
  if (item.rating) {
    const starEl = createCardStarsElement(item.rating);
    if (starEl) detailRatingPill.appendChild(starEl);
  } else {
    detailRatingPill.innerHTML = '<span class="empty-muted-label">Нет оценки</span>';
  }

  detailFavBtn.classList.toggle('active', Boolean(item.is_favorite));
  detailFavBtn.title = item.is_favorite ? 'В избранном' : 'Добавить в избранное';
  detailFavBtn.onclick = async () => {
    await toggleFav(item.id);
    const updated = allItems.find(i => Number(i.id) === Number(item.id));
    if (updated) {
      detailFavBtn.classList.toggle('active', Boolean(updated.is_favorite));
    }
  };

  detailEditBtn.onclick = () => openEditModal(item.id);
  detailDeleteBtn.onclick = async () => {
    await deleteItem(item.id);
    closeDetailPage();
  };

  // Теги
  const tagsArr = item.tags ? JSON.parse(item.tags) : [];
  detailTagsList.innerHTML = '';
  if (tagsArr.length > 0) {
    tagsArr.forEach(tName => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tName;
      tagEl.onclick = () => {
        closeDetailPage();
        setTagFilter(tName);
      };
      detailTagsList.appendChild(tagEl);
    });
  } else {
    detailTagsList.innerHTML = '<span class="empty-muted-label">Теги не привязаны</span>';
  }

  // Подборки
  const colIds = Array.isArray(item.collections) ? item.collections.map(Number) : [];
  const assignedCols = allCollections.filter(c => colIds.includes(Number(c.id)));
  detailCollectionsList.innerHTML = '';
  if (assignedCols.length > 0) {
    assignedCols.forEach(col => {
      const colEl = document.createElement('span');
      colEl.className = 'tag';
      colEl.textContent = col.name;
      colEl.onclick = () => {
        closeDetailPage();
        currentCollectionFilter = Number(col.id);
        renderCollectionsSidebar();
        renderCatalog();
      };
      detailCollectionsList.appendChild(colEl);
    });
  } else {
    detailCollectionsList.innerHTML = '<span class="empty-muted-label">Не состоит в подборках</span>';
  }

  // Описание / Синопсис
  if (item.description && item.description.trim() !== '') {
    detailDescription.className = 'detail-text-content';
    detailDescription.textContent = item.description;
  } else {
    detailDescription.className = 'empty-muted-label';
    detailDescription.textContent = 'Описание отсутствует';
  }

  // Личные заметки и мысли
  if (item.notes && item.notes.trim() !== '') {
    detailNotes.className = 'detail-notes-card';
    detailNotes.textContent = item.notes;
  } else {
    detailNotes.className = 'empty-muted-label';
    detailNotes.textContent = 'Личных заметок пока нет';
  }

  // История статусов
  renderDetailStatusHistory(item.id);

  viewCatalog.classList.remove('active');
  viewTags.classList.remove('active');
  viewDetail.classList.add('active');
}

function closeDetailPage() {
  openedItemId = null;
  viewDetail.classList.remove('active');
  viewCatalog.classList.add('active');
  tabCatalogBtn.classList.add('active');
}

detailBackBtn.onclick = closeDetailPage;

function getStatusClass(status) {
  switch (status) {
    case 'Запланировано':
      return 'status-badge-planned';
    case 'В процессе':
      return 'status-badge-in-progress';
    case 'Завершено':
      return 'status-badge-completed';
    case 'Брошено':
      return 'status-badge-dropped';
    default:
      return 'status-badge-default';
  }
}

function formatHistoryDate(dateStr) {
  if (!dateStr) return '';
  try {
    const formattedIso = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
    const date = new Date(formattedIso);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

async function renderDetailStatusHistory(itemId) {
  if (!detailStatusHistory) return;
  detailStatusHistory.innerHTML = '<span class="empty-muted-label">Загрузка истории...</span>';

  try {
    const history = await window.api.getStatusHistory(itemId);
    if (!history || history.length === 0) {
      detailStatusHistory.innerHTML = '<span class="empty-muted-label">История изменений пока пуста</span>';
      return;
    }

    const fragment = document.createDocumentFragment();
    history.forEach((entry, index) => {
      const row = document.createElement('div');
      row.className = `status-history-entry ${index === 0 ? 'status-active' : ''}`;

      const dot = document.createElement('div');
      dot.className = 'status-history-dot';

      const content = document.createElement('div');
      content.className = 'status-history-content';

      const statusBadge = document.createElement('span');
      statusBadge.className = `badge ${getStatusClass(entry.status)}`;
      statusBadge.textContent = entry.status;
      content.appendChild(statusBadge);

      const dateSpan = document.createElement('span');
      dateSpan.className = 'status-history-date';
      dateSpan.textContent = formatHistoryDate(entry.changed_at);
      content.appendChild(dateSpan);

      row.appendChild(dot);
      row.appendChild(content);
      fragment.appendChild(row);
    });

    detailStatusHistory.innerHTML = '';
    detailStatusHistory.appendChild(fragment);
  } catch (err) {
    console.error('Failed to load status history:', err);
    detailStatusHistory.innerHTML = '<span class="empty-muted-label">Не удалось загрузить историю статусов</span>';
  }
}

function populateTagFilterSelect() {
  if (!tagFilterSelect) return;
  const currentVal = tagFilterSelect.value;
  tagFilterSelect.innerHTML = '<option value="">Все теги</option>';
  allTags.forEach(tag => {
    const opt = document.createElement('option');
    opt.value = tag.name;
    opt.textContent = tag.name;
    tagFilterSelect.appendChild(opt);
  });
  if (activeTag && allTags.some(t => t.name === activeTag)) {
    tagFilterSelect.value = activeTag;
  } else if (currentVal && allTags.some(t => t.name === currentVal)) {
    tagFilterSelect.value = currentVal;
  } else {
    tagFilterSelect.value = '';
    if (activeTag && !allTags.some(t => t.name === activeTag)) {
      activeTag = null;
    }
  }
}

function renderCollectionsSidebar() {
  const fragment = document.createDocumentFragment();
  
  allCollections.forEach(col => {
    const colId = Number(col.id);
    const itemEl = document.createElement('div');
    itemEl.className = `nav-item collection-item ${Number(currentCollectionFilter) === colId ? 'active' : ''}`;
    
    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
    itemEl.appendChild(iconSpan.firstChild);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'collection-name';
    nameSpan.textContent = col.name;
    itemEl.appendChild(nameSpan);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'del-collection-btn';
    delBtn.textContent = '✕';
    delBtn.title = 'Удалить подборку';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteCollection(colId);
    };
    itemEl.appendChild(delBtn);

    itemEl.onclick = () => {
      if (viewDetail.classList.contains('active')) {
        closeDetailPage();
      }
      if (Number(currentCollectionFilter) === colId) {
        currentCollectionFilter = null;
      } else {
        currentCollectionFilter = colId;
      }
      renderCollectionsSidebar();
      renderCatalog();
    };

    fragment.appendChild(itemEl);
  });

  collectionsList.innerHTML = '';
  collectionsList.appendChild(fragment);
}

newCollectionBtn.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  newColInput.value = '';
  collectionModal.classList.remove('hidden');
  newColInput.focus();
};

function closeColModal() {
  collectionModal.classList.add('hidden');
}

closeColModalBtn.onclick = closeColModal;
closeColModalX.onclick = closeColModal;

collectionForm.onsubmit = async (e) => {
  e.preventDefault();
  const name = newColInput.value.trim();
  if (!name) return;

  try {
    await window.api.createCollection(name);
    closeColModal();
    allCollections = await window.api.getCollections();
    renderCollectionsSidebar();
  } catch (err) {
    alert('Подборка с таким названием уже существует!');
  }
};

async function deleteCollection(id) {
  if (confirm('Удалить эту подборку? Карточки останутся в каталоге.')) {
    await window.api.deleteCollection(Number(id));
    if (Number(currentCollectionFilter) === Number(id)) {
      currentCollectionFilter = null;
    }
    allCollections = await window.api.getCollections();
    allItems = await window.api.getItems();
    renderCollectionsSidebar();
    renderCatalog();
  }
}

function renderModalPickers() {
  modalTagsPicker.innerHTML = '';
  if (!allTags || allTags.length === 0) {
    modalTagsPicker.innerHTML = '<span class="empty-picker-hint">Нет созданных тегов</span>';
  } else {
    allTags.forEach(t => {
      const isSelected = selectedTagsForModal.includes(t.name);
      const pill = document.createElement('span');
      pill.className = `picker-item ${isSelected ? 'selected' : ''}`;
      pill.textContent = t.name;
      pill.onclick = () => {
        if (selectedTagsForModal.includes(t.name)) {
          selectedTagsForModal = selectedTagsForModal.filter(name => name !== t.name);
        } else {
          selectedTagsForModal.push(t.name);
        }
        renderModalPickers();
      };
      modalTagsPicker.appendChild(pill);
    });
  }

  modalCollectionsPicker.innerHTML = '';
  if (!allCollections || allCollections.length === 0) {
    modalCollectionsPicker.innerHTML = '<span class="empty-picker-hint">Нет созданных подборок</span>';
  } else {
    allCollections.forEach(c => {
      const colId = Number(c.id);
      const isSelected = selectedCollectionsForModal.includes(colId);
      const pill = document.createElement('span');
      pill.className = `picker-item ${isSelected ? 'selected' : ''}`;
      pill.textContent = c.name;
      pill.onclick = () => {
        if (selectedCollectionsForModal.includes(colId)) {
          selectedCollectionsForModal = selectedCollectionsForModal.filter(id => id !== colId);
        } else {
          selectedCollectionsForModal.push(colId);
        }
        renderModalPickers();
      };
      modalCollectionsPicker.appendChild(pill);
    });
  }
}

function openAddModal() {
  editItemId.value = '';
  modalHeading.textContent = 'Новая запись';
  currentCoverPath = null;
  selectedRating = null;
  updateStarWidgetVisuals(null);
  setHeartState(false);

  selectedTagsForModal = [];
  selectedCollectionsForModal = [];
  mediaForm.reset();
  coverPreview.classList.add('hidden');
  coverPreview.src = '';
  dropPlaceholder.classList.remove('hidden');
  renderModalPickers();
  mediaModal.classList.remove('hidden');
}

window.openEditModal = (id) => {
  const item = allItems.find(i => Number(i.id) === Number(id));
  if (!item) return;

  editItemId.value = item.id;
  modalHeading.textContent = `Редактировать: ${item.title}`;
  document.getElementById('title').value = item.title || '';
  document.getElementById('media_type').value = item.media_type || 'game';
  document.getElementById('status').value = item.status || 'Запланировано';
  document.getElementById('description').value = item.description || '';
  document.getElementById('notes').value = item.notes || '';

  setHeartState(item.is_favorite);

  selectedRating = item.rating || null;
  updateStarWidgetVisuals(selectedRating);

  currentCoverPath = item.cover_path;
  if (currentCoverPath) {
    coverPreview.src = `file:///${currentCoverPath.replace(/\\/g, '/')}`;
    coverPreview.classList.remove('hidden');
    dropPlaceholder.classList.add('hidden');
  } else {
    coverPreview.classList.add('hidden');
    coverPreview.src = '';
    dropPlaceholder.classList.remove('hidden');
  }

  selectedTagsForModal = item.tags ? JSON.parse(item.tags) : [];
  selectedCollectionsForModal = Array.isArray(item.collections) ? item.collections.map(Number) : [];
  renderModalPickers();
  mediaModal.classList.remove('hidden');
};

function closeMediaModal() {
  mediaModal.classList.add('hidden');
}

document.getElementById('open-add-modal-btn').onclick = openAddModal;
document.getElementById('close-media-modal-btn').onclick = closeMediaModal;
document.getElementById('close-media-modal-x').onclick = closeMediaModal;

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleCoverFile(e.dataTransfer.files[0]);
  }
});

browseBtn.onclick = () => fileInput.click();
dropZone.onclick = (e) => {
  if (e.target !== browseBtn) fileInput.click();
};

fileInput.onchange = (e) => {
  if (e.target.files && e.target.files.length > 0) {
    handleCoverFile(e.target.files[0]);
  }
};

async function handleCoverFile(fileOrPath) {
  if (!fileOrPath) return;

  try {
    let payload = null;

    if (fileOrPath instanceof File) {
      const buffer = await fileOrPath.arrayBuffer();
      payload = {
        name: fileOrPath.name,
        buffer: buffer
      };
      coverPreview.src = URL.createObjectURL(fileOrPath);
      coverPreview.classList.remove('hidden');
      dropPlaceholder.classList.add('hidden');
    } else if (typeof fileOrPath === 'string') {
      payload = fileOrPath;
    }

    const saved = await window.api.saveCover(payload);
    if (saved) {
      currentCoverPath = saved;
      coverPreview.src = `file:///${saved.replace(/\\/g, '/')}`;
      coverPreview.classList.remove('hidden');
      dropPlaceholder.classList.add('hidden');
    }
  } catch (err) {
    console.error('Ошибка обработки изображения:', err);
  }
}

mediaForm.onsubmit = async (e) => {
  e.preventDefault();

  const id = editItemId.value;
  const payload = {
    title: document.getElementById('title').value.trim(),
    media_type: document.getElementById('media_type').value,
    cover_path: currentCoverPath,
    rating: selectedRating,
    status: document.getElementById('status').value,
    is_favorite: isFavoriteInModal ? 1 : 0,
    tags: JSON.stringify(selectedTagsForModal),
    collections: selectedCollectionsForModal.map(Number),
    description: document.getElementById('description').value.trim(),
    notes: document.getElementById('notes').value.trim()
  };

  if (id) {
    payload.id = parseInt(id, 10);
    await window.api.updateItem(payload);
  } else {
    await window.api.addItem(payload);
  }

  closeMediaModal();
  allItems = await window.api.getItems();
  renderCatalog();
  if (openedItemId && Number(openedItemId) === Number(id)) {
    openDetailPage(openedItemId);
  }
};

window.toggleFav = async (id) => {
  await window.api.toggleFavorite(Number(id));
  allItems = await window.api.getItems();
  renderCatalog();
};

window.deleteItem = async (id) => {
  if (confirm('Удалить эту запись?')) {
    await window.api.deleteItem(Number(id));
    allItems = await window.api.getItems();
    renderCatalog();
    if (openedItemId && Number(openedItemId) === Number(id)) {
      closeDetailPage();
    }
  }
};

tabCatalogBtn.onclick = () => {
  tabCatalogBtn.classList.add('active');
  tabTagsBtn.classList.remove('active');
  viewDetail.classList.remove('active');
  viewCatalog.classList.add('active');
  viewTags.classList.remove('active');
};

tabTagsBtn.onclick = () => {
  tabTagsBtn.classList.add('active');
  tabCatalogBtn.classList.remove('active');
  viewDetail.classList.remove('active');
  viewTags.classList.add('active');
  viewCatalog.classList.remove('active');
  renderTagsTable();
};

if (tagsSearchInput) {
  tagsSearchInput.oninput = (e) => {
    tagSearchFilterQuery = e.target.value.toLowerCase().trim();
    renderTagsTable();
  };
}

function renderTagsTable() {
  const fragment = document.createDocumentFragment();

  const filteredTags = allTags.filter(tag => {
    if (!tagSearchFilterQuery) return true;
    return tag.name.toLowerCase().includes(tagSearchFilterQuery);
  });

  if (filteredTags.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyTd = document.createElement('td');
    emptyTd.colSpan = 3;
    emptyTd.style.textAlign = 'center';
    emptyTd.style.padding = '24px';
    emptyTd.style.color = '#71717a';
    emptyTd.textContent = tagSearchFilterQuery ? 'Теги не найдены' : 'Нет созданных тегов';
    emptyRow.appendChild(emptyTd);
    fragment.appendChild(emptyRow);
  } else {
    filteredTags.forEach(tag => {
      const usageCount = allItems.filter(it => {
        const arr = it.tags ? JSON.parse(it.tags) : [];
        return arr.includes(tag.name);
      }).length;

      const row = document.createElement('tr');
      
      const nameTd = document.createElement('td');
      const boldTag = document.createElement('b');
      boldTag.textContent = tag.name;
      nameTd.appendChild(boldTag);
      row.appendChild(nameTd);

      const countTd = document.createElement('td');
      countTd.textContent = `${usageCount} записей`;
      row.appendChild(countTd);

      const actTd = document.createElement('td');
      actTd.style.textAlign = 'right';

      const editBtn = document.createElement('button');
      editBtn.className = 'action-link edit-btn';
      editBtn.textContent = 'Изменить';
      editBtn.onclick = () => openEditTagModal(tag.id, tag.name);
      actTd.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'action-link delete-btn';
      delBtn.style.marginLeft = '8px';
      delBtn.textContent = 'Удалить';
      delBtn.onclick = () => deleteTag(tag.id);
      actTd.appendChild(delBtn);

      row.appendChild(actTd);
      fragment.appendChild(row);
    });
  }

  tagsTableBody.innerHTML = '';
  tagsTableBody.appendChild(fragment);
}

tagCreateForm.onsubmit = async (e) => {
  e.preventDefault();
  const input = document.getElementById('new-tag-name');
  const name = input.value.trim();
  if (!name) return;

  try {
    await window.api.createTag(name);
    input.value = '';
    allTags = await window.api.getTags();
    renderTagsTable();
    populateTagFilterSelect();
  } catch (err) {
    alert('Тег с таким именем уже существует!');
  }
};

function openEditTagModal(id, currentName) {
  editTagIdInput.value = id;
  editTagNameInput.value = currentName;
  editTagModal.classList.remove('hidden');
  editTagNameInput.focus();
  editTagNameInput.select();
}

function closeEditTagModal() {
  editTagModal.classList.add('hidden');
}

closeEditTagModalBtn.onclick = closeEditTagModal;
closeEditTagModalX.onclick = closeEditTagModal;

editTagForm.onsubmit = async (e) => {
  e.preventDefault();
  const id = Number(editTagIdInput.value);
  const newName = editTagNameInput.value.trim();
  if (!id || !newName) return;

  try {
    await window.api.updateTag({ id, name: newName });
    closeEditTagModal();
    [allTags, allItems] = await Promise.all([window.api.getTags(), window.api.getItems()]);
    renderTagsTable();
    populateTagFilterSelect();
    renderCatalog();
    if (openedItemId) openDetailPage(openedItemId);
  } catch (err) {
    alert('Не удалось изменить тег или такое имя уже существует.');
  }
};

window.deleteTag = async (id) => {
  if (confirm('Удалить тег? Он снимется со всех карточек.')) {
    await window.api.deleteTag(Number(id));
    [allTags, allItems] = await Promise.all([window.api.getTags(), window.api.getItems()]);
    renderTagsTable();
    populateTagFilterSelect();
    renderCatalog();
    if (openedItemId) openDetailPage(openedItemId);
  }
};

document.querySelectorAll('#media-types-filter .nav-item').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('#media-types-filter .nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilterType = btn.dataset.type;
    if (viewDetail.classList.contains('active')) closeDetailPage();
    renderCatalog();
  };
});

favFilterBtn.onclick = () => {
  filterOnlyFavorites = !filterOnlyFavorites;
  favFilterBtn.classList.toggle('active', filterOnlyFavorites);
  if (viewDetail.classList.contains('active')) closeDetailPage();
  renderCatalog();
};

searchInput.oninput = (e) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    searchQuery = e.target.value.toLowerCase().trim();
    if (viewDetail.classList.contains('active')) closeDetailPage();
    renderCatalog();
  }, 150);
};

sortSelect.onchange = (e) => {
  currentSort = e.target.value;
  renderCatalog();
};

if (tagFilterSelect) {
  tagFilterSelect.onchange = (e) => {
    const val = e.target.value;
    if (val) {
      window.setTagFilter(val);
    } else {
      window.clearTagFilter();
      if (viewDetail.classList.contains('active')) closeDetailPage();
    }
  };
}

window.setTagFilter = (tag) => {
  activeTag = tag;
  if (tagFilterSelect) {
    tagFilterSelect.value = tag;
  }
  if (viewDetail.classList.contains('active')) closeDetailPage();
  renderCatalog();
};

window.clearTagFilter = () => {
  activeTag = null;
  if (tagFilterSelect) {
    tagFilterSelect.value = '';
  }
  renderCatalog();
};

// Навигация кнопками мыши (Назад / Вперед)
function handleNavigateBack() {
  const now = Date.now();
  if (now - lastNavTime < 220) return;
  lastNavTime = now;

  // 1. Закрытие открытых модальных окон
  if (!mediaModal.classList.contains('hidden')) {
    closeMediaModal();
    return;
  }
  if (!collectionModal.classList.contains('hidden')) {
    closeColModal();
    return;
  }
  if (!editTagModal.classList.contains('hidden')) {
    closeEditTagModal();
    return;
  }

  // 2. Возврат из карточки просмотра в каталог
  if (viewDetail.classList.contains('active')) {
    closeDetailPage();
    return;
  }

  // 3. Возврат из раздела управления тегами в каталог
  if (viewTags.classList.contains('active')) {
    tabCatalogBtn.click();
    return;
  }

  // 4. Сброс фильтра по тегу в каталоге
  if (activeTag) {
    window.clearTagFilter();
    return;
  }

  // 5. Сброс фильтра по подборке
  if (currentCollectionFilter !== null) {
    currentCollectionFilter = null;
    renderCollectionsSidebar();
    renderCatalog();
    return;
  }

  // 6. Сброс фильтра избранного
  if (filterOnlyFavorites) {
    favFilterBtn.click();
    return;
  }

  // 7. Сброс типа медиа в «Все»
  if (currentFilterType !== 'all') {
    const allBtn = document.querySelector('#media-types-filter .nav-item[data-type="all"]');
    if (allBtn) allBtn.click();
    return;
  }
}

function handleNavigateForward() {
  const now = Date.now();
  if (now - lastNavTime < 220) return;
  lastNavTime = now;

  // Если мы на главной странице каталога и ранее смотрели карточку — открываем её снова
  if (viewCatalog.classList.contains('active') && lastViewedItemId) {
    openDetailPage(lastViewedItemId);
  }
}

// Перехват кликов дополнительных боковых кнопок мыши (3 = Back, 4 = Forward)
window.addEventListener('mouseup', (e) => {
  if (e.button === 3) {
    e.preventDefault();
    e.stopPropagation();
    handleNavigateBack();
  } else if (e.button === 4) {
    e.preventDefault();
    e.stopPropagation();
    handleNavigateForward();
  }
});

// Предотвращение стандартного поведения браузера на нажатие
window.addEventListener('mousedown', (e) => {
  if (e.button === 3 || e.button === 4) {
    e.preventDefault();
  }
});

// Горячие клавиши (Esc / Alt + Стрелки)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    handleNavigateBack();
  } else if (e.altKey && e.key === 'ArrowLeft') {
    e.preventDefault();
    handleNavigateBack();
  } else if (e.altKey && e.key === 'ArrowRight') {
    e.preventDefault();
    handleNavigateForward();
  }
});

// IPC-события от Electron (Windows WM_APPCOMMAND от драйверов мыши)
if (window.api && window.api.onNavBack) {
  window.api.onNavBack(handleNavigateBack);
}
if (window.api && window.api.onNavForward) {
  window.api.onNavForward(handleNavigateForward);
}

init();