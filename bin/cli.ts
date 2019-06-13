const program = require('commander');

program.version('0.1.0');

program.command("serve <notebook>")
    .description("Serve the notebook as a standalone web app in the browser")
    .option("-E, --electron", "Use electron to serve the notebook.")
    .action((notebook, options) => {
        let mode = options.electron ? 'electron' : 'browser';
        console.log(`Serving ${notebook} in ${mode} mode...`);
    });

program.parse(process.argv);