import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  savePDF: (judul,htmlString) => ipcRenderer.invoke('save-pdf', judul,htmlString)
})


contextBridge.exposeInMainWorld('electron', {
  openFile: (path:string) => ipcRenderer.invoke('open-file', path)
});


contextBridge.exposeInMainWorld('updater', {
  check: () => ipcRenderer.invoke('check-update'),
  install: () => ipcRenderer.invoke('install-update'),
  onStatus: (callback:any) =>
    ipcRenderer.on('update-status', (_, status) => callback(status)),
  onProgress: (callback:any) =>
    ipcRenderer.on('update-progress', (_, percent) => callback(percent)),
});


contextBridge.exposeInMainWorld("appInfo", {
    getVersion: () => ipcRenderer.invoke("get-app-version")
});
