const CDP = require('chrome-remote-interface');
const fs = require('fs');

CDP(async (client) => {
    try {
        const traceConfig = {
            includedCategories: ['-*', 'devtools.timeline', 'v8.execute', 'disabled-by-default-devtools.timeline',
                'disabled-by-default-devtools.timeline.frame', 'toplevel',
                'blink.console', 'blink.user_timing', 'latencyInfo', 'disabled-by-default-devtools.timeline.stack',
                'disabled-by-default-v8.cpu_profiler', 'disabled-by-default-v8.cpu_profiler.hires'
                ],
                enableSampling: true,
                enableSystrace: true
        };
        const {Page, Tracing} = client;
        // enable Page domain events
        await Page.enable();
        // trace a page load
        const events = [];
        Tracing.dataCollected(({value}) => {
            events.push(...value);
        });
        await Tracing.start(traceConfig);
        await Page.navigate({url: 'https://github.com'});
        await Page.loadEventFired();
        await Tracing.end();
        await Tracing.tracingComplete();
        // save the tracing data
        fs.writeFileSync('./GithubProfileUsingCDP.json', JSON.stringify(events));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}).on('error', (err) => {
    console.error(err);
});