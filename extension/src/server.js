const express = require('express');
const Bot = require('./Bot');
const cors = require('cors');

// const {scrapeProductData} = require('./scrap');
const app = express();
const port = 3000;
const bot = new Bot();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeProductData(url) {
    try {
        // Fetch the webpage content
        const response = await axios.get(url);
        const html = response.data;

        // Load HTML into cheerio
        const $ = cheerio.load(html);

        // Determine which site we are scraping
        const domain = new URL(url).hostname;

        let productData = {};

        if (domain.includes('xstore.md')) {
            // Xstore.md scraping logic
            const name = $('.h2').text().trim();
            const price = $('.xp-price').text().replace(/\s/g, '').trim();
            const description = $('meta[name="description"]').attr('content').trim();
            const specifications = {};
            $('#myTabContent #char .chars-item').each((index, element) => {
                const key = $(element).find('.chr-title').text().trim();
                const value = $(element).find('.xatt-value').map((i, el) => $(el).text().trim()).get().join(', ');
                if (key && value) {
                    specifications[key] = value;
                }
            });
            productData = { name, price, description, specifications };
        } else if (domain.includes('makeup.md')) {
            // Makeup.md scraping logic
            const title = $('.product-item__name').text().trim();
            const price = $('.price_item[itemprop="price"]').text().trim();
            const specifications = {};
            $('.product-item-tabs__content li').each((index, element) => {
                let key = '';
                let value = '';
                $(element).contents().each((i, el) => {
                    if (el.type === 'tag' && el.tagName === 'strong') {
                        key = $(el).text().replace(':', '').trim();
                    } else if (el.type === 'text') {
                        value += $(el).text().trim() + ' ';
                    } else if (el.tagName === 'br') {
                        if (key && value.trim()) {
                            specifications[key] = value.trim();
                        }
                        key = '';
                        value = '';
                    }
                });
            });
            productData = { title, price, specifications };
        } else {
            throw new Error('Unsupported website');
        }

        return productData;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return null;
    }
}


async function scrapeCatalogText(url) {
    try {
        // Fetch the webpage content
        const response = await axios.get(url);
        const html = response.data;

        // Load HTML into cheerio
        const $ = cheerio.load(html);

        // Find the catalog div and extract its text content, excluding scripts and images
        const $catalogDiv = $('.catalog');
        
        // Remove script and image tags from inside the catalog div
        $catalogDiv.find('script, img').remove();

        // Extract plain text content from the catalog div
        const catalogText = $catalogDiv.text().trim();

        return catalogText;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return null;
    }
}



// Initialize bot
    try {
        bot.initSync();
    } catch (error) {
        console.log('Error:', error.message);
    }

// Retrieve thread
app.get('/thread/:id', async (req, res) => {
    console.log('Retrieving thread:', req.params.id);
    try {
        const thread = await bot.retrieveThread(req.params.id);
        res.status(200).send(thread);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Add message to thread
app.post('/thread/:id/message', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await bot.addMessageToThread(req.params.id, message);
        res.status(200).send(response);
        console.log("Message added");
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get answer from assistant
app.get('/thread/:id/answer', async (req, res) => {
    try {
        const response = await bot.getAnswer(req.params.id);
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Run thread
app.post('/thread/:id/run', async (req, res) => {
    try {
        const response = await bot.runThread(req.params.id);
        res.status(200).send(response);
        console.log("Thread run");
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// List messages in thread
app.get('/thread/:id/messages', async (req, res) => {
    console.log('Listing messages in thread:', req.params.id);
    try {
        let messagesList=[]
        const messages = await bot.listMessagesInThread(req.params.id);
        // console.log(messages.body.data[0].content[0]);
        for (let i = 0; i < messages.body.data.length; i++) {
            let messageRole = messages.body.data[i].role;
            let messageContent =""
            if (messages.body.data[i].content[0].type=='text'){
                messageContent = messages.body.data[i].content[0].text.value;
            }
            messagesList.push({"role": messageRole, "content": messageContent});
        }
        res.status(200).send(messagesList);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

app.post('/thread/:id/addwebsite', async (req, res) => {
    console.log('Adding website:', req.body.url);
    try{
        const {url} = req.body;
        let allText = await scrapeProductData(url);
        allText=JSON.stringify(allText);
        const response = await bot.addMessageToThread(req.params.id, allText);
        res.status(200).send(response);
        console.log("Site added");
    }
    catch(error){
        res.status(500).send({ error: error.message });
    }
});