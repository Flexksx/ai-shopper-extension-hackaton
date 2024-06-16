const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

class Bot {
    constructor() {
        this.OPENAI_API_KEY = null;
        this.ASSISTANT_ID = null;
        this.openaiClient = null;
        this.assistantObj = null;
    }

    async initSync() {
        console.log("--INIT LOG--");
        await this.loadEnvironmentVariables();
        console.log("OPENAI_API_KEY and ASSISTANT_ID loaded successfully");
        await this.initOpenAIClient();
        console.log("OpenAI client initialized");
        await this.initAssistant();
        console.log("Assistant initialized");
        console.log("--END INIT LOG--");
        console.log();
    }

    async loadEnvironmentVariables() {
        this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        this.ASSISTANT_ID = process.env.ASSISTANT_ID;
        if (!this.OPENAI_API_KEY || !this.ASSISTANT_ID) {
            throw new Error("Missing OPENAI_API_KEY or ASSISTANT_ID in environment variables");
        }
    }

    async initOpenAIClient() {
        this.openaiClient = new OpenAI({
            apiKey: this.OPENAI_API_KEY,
        });
    }

    async initAssistant() {
        this.assistantObj = await this.openaiClient.beta.assistants.retrieve(this.ASSISTANT_ID);
    }

    async createThread() {
        const thread = await this.openaiClient.beta.threads.create();
        return thread;
    }

    async retrieveThread(threadId) {
        const thread = await this.openaiClient.beta.threads.retrieve(threadId);
        return thread;
    }

    async addMessageToThread(threadId, message) {
        const response = await this.openaiClient.beta.threads.messages.create(
            threadId,
            {
                "role": "user",
                "content": message 
            }
        );
        return response;
    }

    async listMessagesInThread(threadId,runId) {
        let params = {
            "order":"desc",
            "limit":20,
        }
        if (runId) {
            params["run_id"] = runId;
        }
        const messages = await this.openaiClient.beta.threads.messages.list(
            threadId,
            params
        );
        return messages;
    }

    async getAnswer(threadId){
        const run = await this.#createRun(threadId);
        const completedRun = await this.#waitForRunCompletion(threadId,run.id);
        let messagesList = await this.listMessagesInThread(threadId);
        return messagesList
    }

    async runThread(threadId) {
        const run = await this.#createRun(threadId);
        const completedRun = await this.#waitForRunCompletion(threadId,run.id);
        return completedRun;
    }

    async #createRun(threadId) {
        const run = await this.openaiClient.beta.threads.runs.create(
            threadId,
            {
                "assistant_id": this.ASSISTANT_ID
            }
        );
        return run;
    }

    async #waitForRunCompletion(threadId,runId) {
        let run = await this.openaiClient.beta.threads.runs.retrieve(threadId,runId);
        while (run.status !== "completed") {
            await new Promise(resolve => setTimeout(resolve, 100));
            run = await this.openaiClient.beta.threads.runs.retrieve(threadId,runId);
        }
        return run;
    }

    async loadContentToVectorStore(content) {
        
    }
}

module.exports = Bot;
