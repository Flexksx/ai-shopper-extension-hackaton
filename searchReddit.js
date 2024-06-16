const url = "http://localhost:3000";
const endpoint = "/getreddit";
const requestBody = {
    "searchQuery": "Asus ROG Strix G15 Ryzen 7 4800H RTX3060 review"
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
    console.log(data);
})
.catch(error => {
    console.error('Error:', error);
});
