import requests
from bs4 import BeautifulSoup
import json

def get_announce_Data(announce, file):
    
    response = requests.get(announce)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    title = soup.find('title').string
    
    description = soup.find('div', class_='adPage__content__description', itemprop='description').get_text(strip=True)
    
    #Get Price
    price_ul = soup.find('ul', class_='adPage__content__price-feature__prices')
    price_list = price_ul.find_all('li')
    price_span = price_list[0].find_all('span')
    price = price_span[0].text.strip() + price_span[1].text.strip()
    
    #Get Specifications
    general_div = soup.select('div.adPage__content__features__col ul')
    specifications = [li for ul in general_div for li in ul.find_all('li')]
    
    data = {
        'url': announce,
        'title': title,
        'description': description,
        'price': price
    } 
    
    for li in specifications:
        spans = li.find_all('span')
        value0 = spans[0].text.strip()
        value1 = spans[1].text.strip()
        data[value0] = value1


    with open(file, 'w') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)    
        
url = 'https://999.md/ro/86010352'
file = 'announceData.json'
get_announce_Data(url, file)
