const url = "http://localhost:3000";
const endpoint = "/thread";
const thread_id = "thread_T4e3FqCxs0KCfcadzYGUZHjb";
const requestBody = {
    "message": "What is my name?"
};

fetch(url + endpoint + "/" + thread_id + "/message", {
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
