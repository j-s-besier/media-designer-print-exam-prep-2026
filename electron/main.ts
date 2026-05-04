import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow } from "electron";
import { startServer, type StartedServer } from "../server/index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");

let apiServer: StartedServer | null = null;
let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  apiServer = await startServer({
    runtimeMode: "packaged",
    resourceDir: app.isPackaged ? path.join(process.resourcesPath, "data") : path.join(projectRoot, "data"),
    userDataDir: app.getPath("userData"),
    privateSolutionsDir: process.env.APP_PRIVATE_SOLUTIONS_DIR || null,
    frontendDistDir: app.isPackaged ? path.join(process.resourcesPath, "dist") : path.join(projectRoot, "dist"),
    port: 0
  });

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await mainWindow.loadURL(apiServer.url);
}

async function shutdownApi() {
  if (!apiServer) return;
  const current = apiServer;
  apiServer = null;
  await current.close();
}

app.whenReady().then(() => {
  void createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", (event) => {
  if (!apiServer) return;
  event.preventDefault();
  void shutdownApi().finally(() => app.quit());
});
