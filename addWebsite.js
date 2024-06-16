const url = "http://localhost:3000";
const endpoint = "/thread";
const thread_id = "thread_T4e3FqCxs0KCfcadzYGUZHjb";
const requestBody = {
    "url": "https://xstore.md/setup-pc-gaming/setup-pc-gaming-x01"
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
