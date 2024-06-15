// Load environment variables from .env file
require('dotenv').config();
const OPENAI_API_KEY= process.env.OPENAI_API_KEY
console.log(OPENAI_API_KEY);
// Import the OpenAI package
const OpenAI = require('openai');

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Async function to call the OpenAI API
async function main() {
    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: 'Say this is a test' }],
            model: 'gpt-3.5-turbo',
        });

        console.log(chatCompletion);
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
    }
}

// Call the main function
main();
