const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeCatalog(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Check if the URL has a product in href, indicating it's a single product page
        if (url.includes('product') || isSingleProductPage($, url)) {
            return await scrapeProductData($, url);
        } else {
            // Determine which scraper to use based on the URL
            if (url.includes('makeup.md') || url.includes('makeup.ro')) {
                return scrapeMakeupProducts($, url);
            } else if (url.includes('xstore.md')) {
                return scrapeXstoreProducts($);
            } else {
                throw new Error('Unsupported website.');
            }
        }
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return null;
    }
}


function isSingleProductPage($, url) {
    // Check if the URL has 'product' in it, indicating a single product page
    if (url.includes('product')) {
        return true;
    }

    // Further checks based on content selectors
    if (url.includes('makeup.md') || url.includes('makeup.ro')) {
        return $('.product-item__name').length > 0;
    } else if (url.includes('xstore.md')) {
        return $('.h2').length > 0 && !$('.category-prods .row > .col-sm-6').length;
    }
    
    return false;
}

async function scrapeProductData($, url) {
    try {
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

function scrapeMakeupProducts($, url) {
    const products = [];
    const baseUrl = 'https://makeup.ro';

    $('div.catalog-products ul.simple-slider-list > li').each((index, element) => {
        const title = $(element).find('.simple-slider-list__name').text().trim();
        const relativeLink = $(element).find('.simple-slider-list__name').attr('href');
        const link = baseUrl + relativeLink; // Concatenate base URL with relative URL
        const description = $(element).find('.simple-slider-list__description').text().trim();
        
        let price = $(element).find('.simple-slider-list__price .price_item').text().trim();
        if (!price) {
            price = $(element).find('.simple-slider-list__price_old .price_item').text().trim();
        }
        if (price) {
            price += ' ' + $(element).find('.simple-slider-list__price .currency').text().trim();
        }

        const reviewCount = $(element).find('.simple-slider-list__reviews-count').text().trim() || '0';
        const activeStars = $(element).find('.star-list__item:not(.star-list__item-gray)').length;

        const product = {
            title,
            link,
            price: price || 'N/A',
            description,
            reviewCount,
            activeStars
        };

        products.push(product);
    });

    return products;
}

function scrapeXstoreProducts($) {
    const products = [];

    $('.category-prods .row > .col-sm-6').each((index, element) => {
        const title = $(element).find('.xp-title').text().trim();
        const link = $(element).find('.xp-title').attr('href');
        const price = $(element).find('.xprice').text().trim();
        const description = $(element).find('.xp-attr').text().trim();

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
}

//const link = 'https://makeup.ro/categorys/37541/'; // Replace with the actual URL
//const link = 'https://makeup.md/ru/product/600089/';

//const link = 'https://xstore.md/ru/search?search=asus+rog+strix'; 
//const link = 'https://xstore.md/ru/noutbuki/igrovye/asus-rog-strix-g16-g614jz-16-i7-13650hx-16gb-ram-1tb-ssd-rtx4080';

// scrapeCatalog(link).then(products => {
//     console.log('Products:', products);
// });