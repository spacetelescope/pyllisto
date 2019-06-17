#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');

program.version('0.1.0');

program.command("serve <notebook>")
    .description("Serve the notebook as a standalone web app in the browser.")
    .option("-E, --electron", "Use electron to serve the notebook.")
    .option("-A, --address <address>", "Location of running jupyter kernel.")
    .action((notebook, options) => {
        let mode = options.electron ? 'electron' : 'browser';
        let address = options.address || 'https://localhost:8888';

        // let widgetMounter = new Mounter(address, notebook.substr(0, notebook.lastIndexOf('.')) + ".json");

        console.log(`Serving ${notebook} in ${mode} mode at ${address}...`);
    });

program.parse(process.argv);
