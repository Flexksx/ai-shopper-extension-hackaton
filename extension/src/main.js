const Bot = require('./Bot.js');

async function main() {
    try {
        const bot = new Bot();
        await bot.initSync();

        // const thread = await bot.createThread();
        // console.log('Created thread:', thread);
        const thread = await bot.retrieveThread('thread_T4e3FqCxs0KCfcadzYGUZHjb');
        console.log('Retrieved thread:', thread);
        const message = 'Hello, which laptop should I choose?';
        const response = await bot.addMessageToThread(thread.id, message);
        console.log('Added message to thread:', response);
        // const messageList = await bot.listMessagesInThread(thread.id);
        // console.log(messageList);
        const res = await bot.getAnswer(thread.id);
        // console.log('Ran thread:', res);
        for (const message of res.data) {
            if (message.role === 'assistant')
                console.log(`Assistant: ${message.content[0].text.value}`);
            else
                console.log(`User: ${message.content[0].text.value}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
