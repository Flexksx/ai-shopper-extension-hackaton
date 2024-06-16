const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeProductsData(url) {
    try {
        // Fetch the webpage content
        const response = await axios.get(url);
        const html = response.data;

        // Load HTML into cheerio
        const $ = cheerio.load(html);

        const products = [];

        // Extract each product's information from the right part of the page
        $('.simple-slider-list-wrap .simple-slider-list > li').each((index, element) => {
            const name = $(element).find('.simple-slider-list__name').text().trim();
            const description = $(element).find('.simple-slider-list__description').text().trim();

            // Extract price
            const price = $(element).find('.simple-slider-list__price .price_item').first().text().trim();

            // Calculate grade (star count)
            const grade = $(element).find('.star-list__item').length - $(element).find('.star-list__item-gray').length;

            const product = {
                name,
                description,
                price: price ? `${price} MDL` : 'N/A',
                grade
            };

            products.push(product);
        });

        return products;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return null;
    }
}

// Example usage:
const targetUrl = 'https://makeup.md/ru/categorys/2419/#o[2243][]=73649&price_from=200&price_to=1000'; // Replace with the actual URL of the product list page
scrapeProductsData(targetUrl).then(products => {
    if (products) {
        console.log('Products Data:', products);
    } else {
        console.log('Failed to fetch product data.');
    }
});
