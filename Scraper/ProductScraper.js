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

const xstoreUrl = 'https://makeup.md/ru/product/620186/';
// const makeupUrl = 'https://makeup.md/ru/product/620186/';
scrapeProductData(xstoreUrl).then(productData => {
    console.log('Product Data:', productData);
});
