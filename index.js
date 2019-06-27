const CDP = require('chrome-remote-interface');
const fs = require('fs');

CDP(async (client) => {
    try {
        const {Page, Tracing} = client;
        // enable Page domain events
        await Page.enable();
        // trace a page load
        const events = [];
        Tracing.dataCollected(({value}) => {
            events.push(...value);
        });
        await Tracing.start();
        await Page.navigate({url: 'https://github.com'});
        await Page.loadEventFired();
        await Tracing.end();
        await Tracing.tracingComplete();
        // save the tracing data
        fs.writeFileSync('./GithubProfileUsingCDP.json', JSON.stringify(events, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}).on('error', (err) => {
    console.error(err);
});