const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Определение директории приложения (работает в dev, portable и установленной версии)
const isPackaged = app.isPackaged;
const appRootDir = isPackaged
  ? (process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath))
  : __dirname;

// Определение и создание папки covers в корне
function getCoversDir() {
  const targetCoversDir = path.join(appRootDir, 'covers');
  try {
    if (!fs.existsSync(targetCoversDir)) {
      fs.mkdirSync(targetCoversDir, { recursive: true });
    }
    // Проверка прав на запись
    const testFile = path.join(targetCoversDir, '.perm_test');
    fs.writeFileSync(testFile, '');
    fs.unlinkSync(testFile);
    return targetCoversDir;
  } catch (e) {
    console.warn('Нет прав на запись в корень программы, используем userData:', e);
    const fallbackDir = path.join(app.getPath('userData'), 'covers');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackDir;
  }
}

// Определение и создание пути к базе данных в корне проекта
function getDatabasePath() {
  const targetDbPath = path.join(appRootDir, 'catalog.db');

  try {
    // Проверка прав на запись в корень программы
    const testFile = path.join(appRootDir, '.perm_test_db');
    fs.writeFileSync(testFile, '');
    fs.unlinkSync(testFile);

    // Список возможных мест хранения старой базы для автоматического переноса
    const candidateDbPaths = [
      path.join(app.getPath('userData'), 'catalog.db'),
      path.join(app.getPath('appData'), 'catalog', 'catalog.db'),
      path.join(app.getPath('appData'), 'Game Shelf', 'catalog.db')
    ];

    const rootStat = fs.existsSync(targetDbPath) ? fs.statSync(targetDbPath) : null;

    for (const oldPath of candidateDbPaths) {
      if (fs.existsSync(oldPath) && path.resolve(oldPath) !== path.resolve(targetDbPath)) {
        const oldStat = fs.statSync(oldPath);
        if (!rootStat || rootStat.size < oldStat.size) {
          console.log(`Перенос существующей базы данных из ${oldPath} в корень программы...`);
          fs.copyFileSync(oldPath, targetDbPath);
          break;
        }
      }
    }

    return targetDbPath;
  } catch (e) {
    console.warn('Нет прав на запись в корень программы, используем userData:', e);
    return path.join(app.getPath('userData'), 'catalog.db');
  }
}

const coversDir = getCoversDir();
const dbPath = getDatabasePath();

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    media_type TEXT DEFAULT 'game',
    cover_path TEXT,
    rating INTEGER,
    status TEXT,
    is_favorite INTEGER DEFAULT 0,
    tags TEXT,
    description TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS item_collections (
    item_id INTEGER,
    collection_id INTEGER,
    PRIMARY KEY(item_id, collection_id)
  );

  CREATE TABLE IF NOT EXISTS status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_items_type ON items(media_type);
  CREATE INDEX IF NOT EXISTS idx_items_fav ON items(is_favorite);
  CREATE INDEX IF NOT EXISTS idx_status_history_item ON status_history(item_id);
`);

// Миграция колонки genres для существующих баз данных
try {
  const itemColumns = db.pragma('table_info(items)');
  if (!itemColumns.some(c => c.name === 'genres')) {
    db.exec('ALTER TABLE items ADD COLUMN genres TEXT;');
  }
} catch (e) {
  console.warn('Ошибка миграции столбца genres:', e);
}

// Миграция старых записей настолок в комиксы
try {
  db.exec("UPDATE items SET media_type = 'comics' WHERE media_type = 'boardgame'");
} catch (e) {}

// Автозаполнение начальной истории для существующих записей
try {
  db.exec(`
    INSERT INTO status_history (item_id, status, changed_at)
    SELECT id, COALESCE(status, 'Запланировано'), COALESCE(created_at, CURRENT_TIMESTAMP)
    FROM items
    WHERE id NOT IN (SELECT DISTINCT item_id FROM status_history);
  `);
} catch (e) {}

const stmts = {
  getAllItems: db.prepare('SELECT * FROM items ORDER BY is_favorite DESC, id DESC'),
  getItemCollections: db.prepare('SELECT collection_id FROM item_collections WHERE item_id = ?'),
  insertItem: db.prepare(`
    INSERT INTO items (title, media_type, cover_path, rating, status, is_favorite, tags, genres, description, notes)
    VALUES (@title, @media_type, @cover_path, @rating, @status, @is_favorite, @tags, @genres, @description, @notes)
  `),
  updateItem: db.prepare(`
    UPDATE items SET
      title = @title,
      media_type = @media_type,
      cover_path = @cover_path,
      rating = @rating,
      status = @status,
      is_favorite = @is_favorite,
      tags = @tags,
      genres = @genres,
      description = @description,
      notes = @notes
    WHERE id = @id
  `),
  getItemMeta: db.prepare('SELECT id, status, cover_path FROM items WHERE id = ?'),
  getCoverById: db.prepare('SELECT cover_path FROM items WHERE id = ?'),
  deleteItem: db.prepare('DELETE FROM items WHERE id = ?'),
  toggleFavorite: db.prepare('UPDATE items SET is_favorite = ((is_favorite | 1) - (is_favorite & 1)) WHERE id = ?'),

  insertStatusHistory: db.prepare('INSERT INTO status_history (item_id, status, changed_at) VALUES (?, ?, CURRENT_TIMESTAMP)'),
  getItemStatusHistory: db.prepare('SELECT id, status, changed_at FROM status_history WHERE item_id = ? ORDER BY id DESC'),
  deleteStatusHistory: db.prepare('DELETE FROM status_history WHERE item_id = ?'),

  linkCollection: db.prepare('INSERT OR IGNORE INTO item_collections (item_id, collection_id) VALUES (?, ?)'),
  unlinkCollections: db.prepare('DELETE FROM item_collections WHERE item_id = ?'),
  deleteCollectionLinks: db.prepare('DELETE FROM item_collections WHERE collection_id = ?'),

  getAllTags: db.prepare('SELECT id, name FROM tags ORDER BY name ASC'),
  getTagById: db.prepare('SELECT name FROM tags WHERE id = ?'),
  insertTag: db.prepare('INSERT INTO tags (name) VALUES (?)'),
  updateTag: db.prepare('UPDATE tags SET name = ? WHERE id = ?'),
  deleteTag: db.prepare('DELETE FROM tags WHERE id = ?'),
  getItemsWithTag: db.prepare('SELECT id, tags FROM items WHERE tags LIKE ?'),
  updateItemTags: db.prepare('UPDATE items SET tags = ? WHERE id = ?'),

  getAllGenres: db.prepare('SELECT id, name FROM genres ORDER BY name ASC'),
  getGenreById: db.prepare('SELECT name FROM genres WHERE id = ?'),
  insertGenre: db.prepare('INSERT INTO genres (name) VALUES (?)'),
  updateGenre: db.prepare('UPDATE genres SET name = ? WHERE id = ?'),
  deleteGenre: db.prepare('DELETE FROM genres WHERE id = ?'),
  getItemsWithGenre: db.prepare('SELECT id, genres FROM items WHERE genres LIKE ?'),
  updateItemGenres: db.prepare('UPDATE items SET genres = ? WHERE id = ?'),

  getAllCollections: db.prepare('SELECT * FROM collections ORDER BY name ASC'),
  insertCollection: db.prepare('INSERT INTO collections (name) VALUES (?)'),
  deleteCollection: db.prepare('DELETE FROM collections WHERE id = ?')
};

// Нормализация пути для сохранения в БД в относительном виде (covers/name.ext)
function normalizeCoverPath(coverPath) {
  if (!coverPath) return null;
  return `covers/${path.basename(coverPath)}`;
}

// Преобразование относительного пути из БД в реальный абсолютный путь на текущей системе
function resolveCoverFullPath(coverPath) {
  if (!coverPath) return null;
  const fileName = path.basename(coverPath);
  const targetFile = path.join(coversDir, fileName);

  if (fs.existsSync(targetFile)) {
    return targetFile;
  }
  if (path.isAbsolute(coverPath) && fs.existsSync(coverPath)) {
    return coverPath;
  }
  const oldUserDataFile = path.join(app.getPath('userData'), 'covers', fileName);
  if (fs.existsSync(oldUserDataFile)) {
    return oldUserDataFile;
  }
  return targetFile;
}

// Безопасное удаление файла обложки с диска
function removeCoverFile(coverPath) {
  if (!coverPath) return;
  const fullPath = resolveCoverFullPath(coverPath);
  if (fullPath && fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (e) {
      console.warn('Не удалось удалить файл обложки:', fullPath, e);
    }
  }
}

const addItemTx = db.transaction((item) => {
  const itemToSave = {
    ...item,
    cover_path: normalizeCoverPath(item.cover_path),
    genres: item.genres || '[]',
    tags: item.tags || '[]'
  };
  const info = stmts.insertItem.run(itemToSave);
  const itemId = info.lastInsertRowid;
  if (Array.isArray(item.collections)) {
    for (const colId of item.collections) {
      stmts.linkCollection.run(itemId, Number(colId));
    }
  }
  // Добавляем начальный статус в историю
  if (item.status) {
    stmts.insertStatusHistory.run(itemId, item.status);
  }
  return info;
});

const updateItemTx = db.transaction((item) => {
  // Получаем текущие метаданные для проверки обложки и статуса
  const currentRecord = stmts.getItemMeta.get(item.id);
  const newNormalizedCover = normalizeCoverPath(item.cover_path);

  if (currentRecord && currentRecord.cover_path && currentRecord.cover_path !== newNormalizedCover) {
    removeCoverFile(currentRecord.cover_path);
  }

  // Если статус изменился — логируем новое состояние в историю статусов!
  if (currentRecord && item.status && currentRecord.status !== item.status) {
    stmts.insertStatusHistory.run(item.id, item.status);
  }

  const itemToSave = {
    ...item,
    cover_path: newNormalizedCover,
    genres: item.genres || '[]',
    tags: item.tags || '[]'
  };
  stmts.updateItem.run(itemToSave);
  stmts.unlinkCollections.run(item.id);
  if (Array.isArray(item.collections)) {
    for (const colId of item.collections) {
      stmts.linkCollection.run(item.id, Number(colId));
    }
  }
});

const deleteItemTx = db.transaction((id) => {
  const item = stmts.getItemMeta.get(id);
  if (item && item.cover_path) {
    removeCoverFile(item.cover_path);
  }
  stmts.unlinkCollections.run(id);
  stmts.deleteStatusHistory.run(id);
  stmts.deleteItem.run(id);
});

const updateTagTx = db.transaction(({ id, name }) => {
  const oldTag = stmts.getTagById.get(id);
  if (!oldTag) return;
  stmts.updateTag.run(name, id);
  if (oldTag.name !== name) {
    const items = stmts.getItemsWithTag.all(`%"${oldTag.name}"%`);
    for (const it of items) {
      let current = JSON.parse(it.tags || '[]');
      current = current.map(t => t === oldTag.name ? name : t);
      stmts.updateItemTags.run(JSON.stringify(current), it.id);
    }
  }
});

const deleteTagTx = db.transaction((id) => {
  const tag = stmts.getTagById.get(id);
  if (tag) {
    const items = stmts.getItemsWithTag.all(`%"${tag.name}"%`);
    for (const it of items) {
      let current = JSON.parse(it.tags || '[]');
      current = current.filter(t => t !== tag.name);
      stmts.updateItemTags.run(JSON.stringify(current), it.id);
    }
  }
  return stmts.deleteTag.run(id);
});

const updateGenreTx = db.transaction(({ id, name }) => {
  const oldGenre = stmts.getGenreById.get(id);
  if (!oldGenre) return;
  stmts.updateGenre.run(name, id);
  if (oldGenre.name !== name) {
    const items = stmts.getItemsWithGenre.all(`%"${oldGenre.name}"%`);
    for (const it of items) {
      let current = JSON.parse(it.genres || '[]');
      current = current.map(g => g === oldGenre.name ? name : g);
      stmts.updateItemGenres.run(JSON.stringify(current), it.id);
    }
  }
});

const deleteGenreTx = db.transaction((id) => {
  const genre = stmts.getGenreById.get(id);
  if (genre) {
    const items = stmts.getItemsWithGenre.all(`%"${genre.name}"%`);
    for (const it of items) {
      let current = JSON.parse(it.genres || '[]');
      current = current.filter(g => g !== genre.name);
      stmts.updateItemGenres.run(JSON.stringify(current), it.id);
    }
  }
  return stmts.deleteGenre.run(id);
});

const deleteCollectionTx = db.transaction((id) => {
  stmts.deleteCollectionLinks.run(id);
  stmts.deleteCollection.run(id);
});

function createWindow() {
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 980,
    minHeight: 680,
    autoHideMenuBar: true,
    backgroundColor: '#121214',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    }
  });

  win.removeMenu();
  win.loadFile('index.html');

  // Обработка боковых кнопок мыши Windows (Назад / Вперед)
  win.on('app-command', (e, cmd) => {
    if (cmd === 'browser-backward') {
      win.webContents.send('nav-back');
    } else if (cmd === 'browser-forward') {
      win.webContents.send('nav-forward');
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('save-cover', async (event, payload) => {
  try {
    if (!payload) return null;

    if (typeof payload === 'object' && payload.buffer) {
      const ext = path.extname(payload.name || '') || '.jpg';
      const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const destPath = path.join(coversDir, fileName);
      fs.writeFileSync(destPath, Buffer.from(payload.buffer));
      return destPath;
    }

    if (typeof payload === 'string') {
      const ext = path.extname(payload) || '.jpg';
      const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const destPath = path.join(coversDir, fileName);
      fs.copyFileSync(payload, destPath);
      return destPath;
    }

    return null;
  } catch (err) {
    console.error('Ошибка сохранения файла:', err);
    return null;
  }
});

ipcMain.handle('get-items', () => {
  const items = stmts.getAllItems.all();
  return items.map(item => ({
    ...item,
    cover_path: resolveCoverFullPath(item.cover_path),
    collections: stmts.getItemCollections.all(item.id).map(c => Number(c.collection_id))
  }));
});

ipcMain.handle('add-item', (event, item) => addItemTx(item));
ipcMain.handle('update-item', (event, item) => updateItemTx(item));
ipcMain.handle('delete-item', (event, id) => deleteItemTx(id));

ipcMain.handle('toggle-favorite', (event, id) => stmts.toggleFavorite.run(id));

ipcMain.handle('get-tags', () => stmts.getAllTags.all());
ipcMain.handle('create-tag', (event, name) => stmts.insertTag.run(name));
ipcMain.handle('update-tag', (event, tag) => updateTagTx(tag));
ipcMain.handle('delete-tag', (event, id) => deleteTagTx(id));

ipcMain.handle('get-genres', () => stmts.getAllGenres.all());
ipcMain.handle('create-genre', (event, name) => stmts.insertGenre.run(name));
ipcMain.handle('update-genre', (event, genre) => updateGenreTx(genre));
ipcMain.handle('delete-genre', (event, id) => deleteGenreTx(id));

ipcMain.handle('get-collections', () => stmts.getAllCollections.all());
ipcMain.handle('create-collection', (event, name) => stmts.insertCollection.run(name));
ipcMain.handle('delete-collection', (event, id) => deleteCollectionTx(id));

ipcMain.handle('get-status-history', (event, itemId) => {
  return stmts.getItemStatusHistory.all(Number(itemId));
});