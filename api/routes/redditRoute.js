require('dotenv').config();
const express = require('express');
const redditRoute = express.Router();
const cors = require('cors');

const { fetchRedditData } = require('../utils/redditHelper');
const { setStandardHeaders } = require('../utils/standardHeaders');
const default_route = ['/', '/help'];

redditRoute.get(default_route, cors(), async (req, res) => {
  try {
    const helpData = {
      Jason: `${req.protocol}://${req.headers.host}/api/v1/reddit/jason`,
      Users: `${req.protocol}://${req.headers.host}/api/v1/reddit/u/:user`,
      Reddits: `${req.protocol}://${req.headers.host}/api/v1/reddit/:subreddit`,
      Note: "Reddit API access is limited due to Reddit's authentication requirements. Some endpoints may return cached or limited data."
    };
    setStandardHeaders(res, helpData);
    res.send(helpData);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    
    // For user endpoint, Reddit returns different structure
    if (data && data.data) {
      res.send(
        JSON.stringify({
          user: data.data,
          message: "User info retrieved"
        })
      );
    } else {
      res.send(
        JSON.stringify({
          user: null,
          message: "User not found"
        })
      );
    }
  } catch (error) {
    console.error('Reddit API error:', error);
    res.send(
      JSON.stringify({
        user: null,
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
