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
const favFilterBtn = document.getElementById('filter-favorites');
const activeTagPill = document.getElementById('active-tag-filter');
const tagNameSpan = document.getElementById('tag-name');
const clearTagBtn = document.getElementById('clear-tag-btn');

const collectionsList = document.getElementById('collections-list');
const modalTagsPicker = document.getElementById('modal-tags-picker');
const modalCollectionsPicker = document.getElementById('modal-collections-picker');

const tagCreateForm = document.getElementById('tag-create-form');
const tagsTableBody = document.getElementById('tags-table-body');

const STAR_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

const typeIcons = {
  game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4m-2-2v4m7-2h.01m3 0h.01"/></svg>',
  movie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
  series: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  anime: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>',
  boardgame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/></svg>'
};

const mediaLabels = {
  game: 'Игра',
  movie: 'Фильм',
  series: 'Сериал',
  book: 'Книга',
  anime: 'Аниме',
  boardgame: 'Настолка'
};

async function init() {
  [allItems, allTags, allCollections] = await Promise.all([
    window.api.getItems(),
    window.api.getTags(),
    window.api.getCollections()
  ]);
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

    const matchSearch = !searchQuery || 
      (item.title && item.title.toLowerCase().includes(searchQuery)) || 
      (item.description && item.description.toLowerCase().includes(searchQuery)) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery));

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
      statusBadge.className = 'badge';
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
      statusBadge.className = 'badge';
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

  modalCollectionsPicker.innerHTML = '';
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

function renderTagsTable() {
  const fragment = document.createDocumentFragment();

  allTags.forEach(tag => {
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

window.setTagFilter = (tag) => {
  activeTag = tag;
  tagNameSpan.textContent = tag;
  activeTagPill.classList.remove('hidden');
  if (viewDetail.classList.contains('active')) closeDetailPage();
  renderCatalog();
};

clearTagBtn.onclick = () => {
  activeTag = null;
  activeTagPill.classList.add('hidden');
  renderCatalog();
};

init();