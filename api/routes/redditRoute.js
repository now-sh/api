require('dotenv').config();
const express = require('express');
const redditRoute = express.Router();
const cors = require('cors');

const { fetchRedditData } = require('../utils/redditHelper');
const default_route = ['/', '/help'];

redditRoute.get(default_route, cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        Jason: `${req.protocol}://${req.headers.host}/api/v1/reddit/jason`,
        Users: `${req.protocol}://${req.headers.host}/api/v1/reddit/u/:user`,
        Reddits: `${req.protocol}://${req.headers.host}/api/v1/reddit/:subreddit`,
      })
    );
  } catch (err) {
    res.json({ error: err.message });
  }
});

redditRoute.get('/jason', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const data = await fetchRedditData('casjay');
    
    if (data && data.data && data.data.children) {
      // Remove first 3 posts if we have enough
      let posts = data.data.children;
      if (posts.length > 3) {
        posts = posts.slice(3);
      }
      
      res.send(
        JSON.stringify({
          reddit: posts,
          totalPosts: posts.length
        })
      );
    } else {
      res.send(
        JSON.stringify({
          reddit: [],
          totalPosts: 0,
          message: "No data available"
        })
      );
    }
  } catch (error) {
    console.error('Reddit API error:', error);
    res.send(
      JSON.stringify({
        reddit: [],
        totalPosts: 0,
        message: "Reddit API is currently unavailable"
      })
    );
  }
});

redditRoute.get('/u/:id', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const data = await fetchRedditData(req.params.id);
    
    if (data && data.data && data.data.children) {
      // Remove first 3 posts if we have enough
      let posts = data.data.children;
      if (posts.length > 3) {
        posts = posts.slice(3);
      }
      
      res.send(
        JSON.stringify({
          reddit: posts,
          totalPosts: posts.length
        })
      );
    } else {
      res.send(
        JSON.stringify({
          reddit: [],
          totalPosts: 0,
          message: "No data available"
        })
      );
    }
  } catch (error) {
    console.error('Reddit API error:', error);
    res.send(
      JSON.stringify({
        reddit: [],
        totalPosts: 0,
        message: "Reddit API is currently unavailable"
      })
    );
  }
});

redditRoute.get('/r/:id', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const data = await fetchRedditData(null, req.params.id);
    
    if (data && data.data && data.data.children) {
      // Remove first 3 posts if we have enough
      let posts = data.data.children;
      if (posts.length > 3) {
        posts = posts.slice(3);
      }
      
      res.send(
        JSON.stringify({
          reddit: posts,
          totalPosts: posts.length
        })
      );
    } else {
      res.send(
        JSON.stringify({
          reddit: [],
          totalPosts: 0,
          message: "No data available"
        })
      );
    }
  } catch (error) {
    console.error('Reddit API error:', error);
    res.send(
      JSON.stringify({
        reddit: [],
        totalPosts: 0,
        message: "Reddit API is currently unavailable"
      })
    );
  }
});

redditRoute.get('/:id', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const data = await fetchRedditData(null, req.params.id);
    
    if (data && data.data && data.data.children) {
      // Remove first 3 posts if we have enough
      let posts = data.data.children;
      if (posts.length > 3) {
        posts = posts.slice(3);
      }
      
      res.send(
        JSON.stringify({
          reddit: posts,
          totalPosts: posts.length
        })
      );
    } else {
      res.send(
        JSON.stringify({
          reddit: [],
          totalPosts: 0,
          message: "No data available"
        })
      );
    }
  } catch (error) {
    console.error('Reddit API error:', error);
    res.send(
      JSON.stringify({
        reddit: [],
        totalPosts: 0,
        message: "Reddit API is currently unavailable"
      })
    );
  }
});

module.exports = redditRoute;
