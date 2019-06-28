import { app, BrowserWindow, ipcMain as ipc } from "electron";
import * as path from "path";
import * as fs from 'fs';

let mainWindow: Electron.BrowserWindow;
let pythonProcess: any = null;
let pythonPort: number = 4242;

function createPythonProcess() {
  let port = '' + pythonPort;
  // let script = path.join(__dirname, 'baldr', 'baldr', 'app.py');
  pythonProcess = require("child_process").spawn("python",
      ["-m", "notebook", "--no-browser", "--NotebookApp.allow_origin='*'",
        "--NotebookApp.disable_check_xsrf=True", "--NotebookApp.token=''"]);

  if (pythonProcess != null) {
    console.log("Child process started successfully.");
  }
}

const exitPythonProcess = () => {
  pythonProcess.kill();
  pythonProcess = null;
};

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true, // Needed for using 'require' in html file
                              // https://stackoverflow.com/a/44394999/2434951
      // preload: __dirname + '/preload.ts'
    }
  });

  // Setup an ipc between the main process and render process. Since the compiled js file
  // cannot access the fs package to load files locally, wait until it requests the file
  // to be loaded, and do so from the main electron process.
  ipc.on('rendererRequestData', (event, data) => {
    fs.readFile(path.join(__dirname, '../tmp/widget_code.json'), function(err, data){
        let notebook = JSON.parse(data.toString());
        event.sender.send('rendererReceiveData', notebook);
    });
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createPythonProcess);
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("will-quit", exitPythonProcess);

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
