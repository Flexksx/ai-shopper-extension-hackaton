const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeLaptopsData(url) {
    try {
        // Fetch the webpage content
        const response = await axios.get(url);
        const html = response.data;

        // Load HTML into cheerio
        const $ = cheerio.load(html);

        const products = [];

        // Extract each product's information
        $('.category-prods .row > .col-sm-6').each((index, element) => {
            const title = $(element).find('.xp-title').text().trim();
            const link = $(element).find('.xp-title').attr('href');
            const price = $(element).find('.xprice').text().trim();
            const description = $(element).find('.xp-attr').text().trim();

            // Extract category
            const categories = [];
            $(element).find('.xp-categ a').each((i, el) => {
                categories.push($(el).text().trim());
            });
            const category = categories.join(' / ');

            const product = {
                title,
                link,
                price,
                description,
                category
            };

            products.push(product);
        });

        return products;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return null;
    }
}


const targetUrl = 'https://xstore.md/ru/search?search=asus+rog+strix';
scrapeLaptopsData(targetUrl).then(products => {
    console.log('Products Data:', products);
});
