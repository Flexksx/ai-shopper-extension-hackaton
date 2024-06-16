const express = require('express');
const Bot = require('./Bot');
const cors = require('cors');
const dotenv = require('dotenv');
// const {scrapeProductData} = require('./scrap');
const app = express();
const port = 3000;
const bot = new Bot();

dotenv.config();
console.log(dotenv.config());

// Function to get Reddit comments
async function getRedditComments(searchQuery) {
  const auth = {
    username: process.env.CLIENT_ID,
    password: process.env.SECRET_KEY
  };
  console.log(auth);

  const data = {
    grant_type: 'password',
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  };

  const headers = {
    'User-Agent': 'MyApi/0.0.1'
  };

  try {
    // Get access token
    const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', new URLSearchParams(data), {
      auth: auth,
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const accessToken = tokenResponse.data.access_token;

    // Update headers with access token
    const authHeaders = {
      ...headers,
      'Authorization': `bearer ${accessToken}`
    };

    // Search for posts
    const searchUrl = `https://oauth.reddit.com/search/?q=${encodeURIComponent(searchQuery)}&type=link`;
    const searchRes = await axios.get(searchUrl, { headers: authHeaders });
    const posts = searchRes.data.data.children;

    if (posts.length === 0) {
      console.log("No posts found.");
      return;
    }

    const firstPostTitle = posts[0].data.title;
    const firstPostId = posts[0].data.id;

    // Get comments
    const commentsUrl = `https://oauth.reddit.com/comments/${firstPostId}.json`;
    const commentsRes = await axios.get(commentsUrl, { headers: authHeaders });

    if (commentsRes.status !== 200) {
      console.log(`Failed to retrieve comments: ${commentsRes.status}`);
      return;
    }

    const commentsData = commentsRes.data;
    const comments = commentsData[1].data.children;

    console.log(`Title: ${firstPostTitle}`);
    console.log("=".repeat(40));

    // Print comments
    // printComments(comments);
    return comments;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

function printComments(comments, level = 0) {
  for (const comment of comments.slice(0, 15)) {
    if (comment.data.body) {
      const author = comment.data.author;
      const body = comment.data.body;
      console.log(`${' '.repeat(level * 2)}Author: ${author}`);
      console.log(`${' '.repeat(level * 2)}Comment: ${body}`);
      console.log(`${'-'.repeat(40)}`);
      if (comment.data.replies) {
        const subcomments = comment.data.replies.data.children;
        printComments(subcomments, level + 1);
      }
    }
  }
}



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
        console.log(messages.body.data[0].content[0]);
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

app.post('/getreddit', async (req, res) => {
    console.log('Getting reddit:', req.body.searchQuery);
    try{
        const {searchQuery} = req.body;
        let comments = await getRedditComments(searchQuery);
        res.status(200).send(comments);
    }catch(error){
        res.status(500).send({ error: error.message });
    }
});