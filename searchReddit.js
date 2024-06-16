const fs = require('fs');
const url = "http://localhost:3000";
const endpoint = "/getreddit";
const query = "Birds of Paradise Palette review";
const requestBody = {
    "searchQuery": query
};

fetch(url + endpoint,{
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: {
        "Content-Type": "application/json"
    }
})
.then(response => response.json())
.then(data => {
    // console.log(data);
    fs.writeFileSync(`${query.split(' ').join('')}.json`, JSON.stringify(data, null, 2));
})
.catch(error => {
    console.error('Error:', error);
});
