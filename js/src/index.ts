import 'font-awesome/css/font-awesome.css';
import * as jQuery from 'jquery';
// import * as fs from 'fs';
import { IpcRenderer } from 'electron';

declare global {
    interface Window {
        require: (module: 'electron') => {
            ipcRenderer: IpcRenderer
        };
    }
}

import {
    WidgetManager
} from './manager';

import {
    Kernel, ServerConnection, KernelMessage
} from '@jupyterlab/services';

let BASEURL = 'http://localhost:8888';
let WSURL = 'ws:' + BASEURL.split(':').slice(1).join(':');

var Manager = { kernel: null };

// Mount the manager on the browser window global so the kernel connection
// can be accessed from other js sources loaded on the page.
// window['Manager'] = Manager;

document.addEventListener('DOMContentLoaded', function(event) {

    // Connect to the notebook webserver.
    let connectionInfo = ServerConnection.makeSettings({
        baseUrl: BASEURL,
        wsUrl: WSURL
    });

    Kernel.getSpecs(connectionInfo).then(kernelSpecs => {
        return Kernel.startNew({
            name: kernelSpecs.default,
            serverSettings: connectionInfo
        });
    }).then(kernel => {
        Manager.kernel = kernel;

        var userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.indexOf(' electron/') > -1) {
            const { ipcRenderer } = window.require('electron');

            ipcRenderer.once('rendererReceiveData', (event, response) => {
                console.log(response);
                loadNotebook(response);
            });

            ipcRenderer.send('rendererRequestData');
        } else {
            jQuery.getJSON('/fetch-data', (data) => {
                console.log(data);
                // data = JSON.parse(data);
                loadNotebook(data);
            });
        }
    });
});


export function loadNotebook(data) {
    // let notebook = require('../examples/widget_code.json');
    // let path = '../examples/widget_code.json';
    let kernel = Manager.kernel;
    let codeBlocks = [];

    if ('cells' in data) {
        for (let cell of data.cells) {
            if (cell['cell_type'] == 'code') {
                codeBlocks.push(cell['source'].join('\n'));
            }
        }
    }

    // Create the widget area and widget manager
    let widgetArea = document.getElementsByClassName('widgetarea')[0] as HTMLElement;
    let manager = new WidgetManager(kernel, widgetArea);

    for (let code of codeBlocks) {
        // Run backend code to create the widgets.
        let execution = kernel.requestExecute({ code: code });

        execution.onIOPub = (msg) => {
            // If we have a display message, display the widget.
            if (KernelMessage.isDisplayDataMsg(msg)) {
                let widgetData: any = msg.content.data['application/vnd.jupyter.widget-view+json'];

                if (widgetData !== undefined && widgetData.version_major === 2) {
                    let model = manager.get_model(widgetData.model_id);
                    if (model !== undefined) {
                        model.then(model => {
                            manager.display_model(msg, model);
                        });
                    }
                }
            }
        };
    }
}

