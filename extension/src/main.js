const Bot = require('./Bot.js');

async function main() {
    try {
        const bot = new Bot();
        await bot.initSync();

        // const thread = await bot.createThread();
        // console.log('Created thread:', thread);
        const thread = await bot.createThread();
        console.log('Created thread:', thread);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
