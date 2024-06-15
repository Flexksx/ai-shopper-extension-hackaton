const Bot = require('./Bot.js');

async function main() {
    try {
        const bot = new Bot();
        await bot.initSync();

        const thread = await bot.retrieveThread('thread_T4e3FqCxs0KCfcadzYGUZHjb');
        console.log('Retrieved thread:', thread);
        const message = 'Hello, which laptop should I choose?';
        const response = await bot.addMessageToThread(thread.id, message);
        console.log('Added message to thread:', response);

        const res = await bot.getAnswer(thread.id);
        for (const message of res.data) {
            console.log(message);
            break;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
