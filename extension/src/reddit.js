const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

// Load the credentials
dotenv.config();
console.log(dotenv.config());

// Function to get Reddit comments
async function getRedditComments(searchQuery) {
  const auth = {
    username: process.env.CLIENT_ID,
    password: process.env.SECRET_KEY
  };
  console.log(auth);

  const data = {
    grant_type: 'password',
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  };

  const headers = {
    'User-Agent': 'MyApi/0.0.1'
  };

  try {
    // Get access token
    const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', new URLSearchParams(data), {
      auth: auth,
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const accessToken = tokenResponse.data.access_token;

    // Update headers with access token
    const authHeaders = {
      ...headers,
      'Authorization': `bearer ${accessToken}`
    };

    // Search for posts
    const searchUrl = `https://oauth.reddit.com/search/?q=${encodeURIComponent(searchQuery)}&type=link`;
    const searchRes = await axios.get(searchUrl, { headers: authHeaders });
    const posts = searchRes.data.data.children;

    if (posts.length === 0) {
      console.log("No posts found.");
      return;
    }

    const firstPostTitle = posts[0].data.title;
    const firstPostId = posts[0].data.id;

    // Get comments
    const commentsUrl = `https://oauth.reddit.com/comments/${firstPostId}.json`;
    const commentsRes = await axios.get(commentsUrl, { headers: authHeaders });

    if (commentsRes.status !== 200) {
      console.log(`Failed to retrieve comments: ${commentsRes.status}`);
      return;
    }

    const commentsData = commentsRes.data;
    const comments = commentsData[1].data.children;
    let commentsList = retrieveCommentsList(comments)
    // console.log(`Title: ${firstPostTitle}`);
    // console.log("=".repeat(40));

    // Print comments
    // printComments(comments);
    return commentsList
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

function printComments(comments, level = 0) {
  for (const comment of comments.slice(0, 15)) {
    if (comment.data.body) {
      const author = comment.data.author;
      const body = comment.data.body;
      console.log(`${' '.repeat(level * 2)}Author: ${author}`);
      console.log(`${' '.repeat(level * 2)}Comment: ${body}`);
      console.log(`${'-'.repeat(40)}`);
      if (comment.data.replies) {
        const subcomments = comment.data.replies.data.children;
        printComments(subcomments, level + 1);
      }
    }
  }
}

function retrieveCommentsList(comments,level=0){
  let commentsList = []
  for (const comment of comments.slice(0, 15)) {
    if (comment.data.body) {
      const author = comment.data.author;
      const body = comment.data.body;
      commentsList.push(body)
      if (comment.data.replies) {
        const subcomments = comment.data.replies.data.children;
        retrieveCommentsList(subcomments, level + 1);
      }
    }
  }
  return commentsList
}

// Run the function with the search query
const searchQuery = 'Asus Rog Strix G15 review';
getRedditComments(searchQuery);
