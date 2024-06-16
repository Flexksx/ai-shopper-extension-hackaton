const url = "http://localhost:3000";
const endpoint = "/thread";
const thread_id = "thread_T4e3FqCxs0KCfcadzYGUZHjb";
const requestBody = {
    "url": "https://xstore.md/laptopuri/gaming/asus-rog-strix-g16-g614jz-16-i7-13650hx-32gb-ram-1tb-ssd-rtx4080"
};

fetch(url + endpoint + "/" + thread_id + "/addwebsite", {
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
