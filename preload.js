const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getItems: () => ipcRenderer.invoke('get-items'),
  addItem: (item) => ipcRenderer.invoke('add-item', item),
  updateItem: (item) => ipcRenderer.invoke('update-item', item),
  deleteItem: (id) => ipcRenderer.invoke('delete-item', id),
  toggleFavorite: (id) => ipcRenderer.invoke('toggle-favorite', id),
  saveCover: (payload) => ipcRenderer.invoke('save-cover', payload),

  getTags: () => ipcRenderer.invoke('get-tags'),
  createTag: (tag) => ipcRenderer.invoke('create-tag', tag),
  updateTag: (tag) => ipcRenderer.invoke('update-tag', tag),
  deleteTag: (id) => ipcRenderer.invoke('delete-tag', id),

  getCollections: () => ipcRenderer.invoke('get-collections'),
  createCollection: (name) => ipcRenderer.invoke('create-collection', name),
  deleteCollection: (id) => ipcRenderer.invoke('delete-collection', id),

  getStatusHistory: (itemId) => ipcRenderer.invoke('get-status-history', itemId),

  onNavBack: (cb) => ipcRenderer.on('nav-back', () => cb()),
  onNavForward: (cb) => ipcRenderer.on('nav-forward', () => cb())
});