---
title: URL Shortener Web Application with Node.js
author: Bedirhan Celayir
date: 2020-12-06T21:00:00Z
hero_image: "/src/assets/content/images/kalea-jerielle-_gi_sp5k3hc-unsplash.jpg"

---
# Creating custom URL shortener with Nodejs Vue MongoDB

This small project has an Express api that user can send url that wants to make it more small and looking nice.And also if someone makes a get request to this shortened url server routes user to original url.

This project is hosted on github and it wasn't necesarry to deploy client and server seperately and also used Vue from cdn.

This is file structure of project.

![](/src/assets/content/images/file-structure.PNG)

Start with installing dependancies

    npm install express morgan cors helmet yup monk path dotenv nanoid slowDown rateLimit path 

Now lets require them to use these libraries.

    const express = require("express");
    const morgan = require("morgan");
    const cors = require("cors");
    const helmet = require("helmet");
    let yup = require("yup");
    const { nanoid } = require("nanoid");
    const monk = require("monk");
    const path = require("path");
    const rateLimit = require("express-rate-limit");
    const slowDown = require("express-slow-down");

Now lets connect mongoDB with our app and 

    /* monk connects us to db */
    const db = monk(process.env.MONGO_URI);
    
    /* Indexing urls with their slug*/
    const urls = db.get("urls");
    urls.createIndex({ slug: 1 }, { unique: true });
    const app = express();
    

Start express app and use middlewares.

    const app = express();
    app.enable("trust proxy");
    app.use(helmet());
    app.use(morgan("common"));
    app.use(cors());
    

Handle body parsing with express.json no need to use external body-parser.

And static file serving directory also we specify our 404 file to handle 404 errors.

    app.use(express.json());
    app.use(express.static("./public"));
    const notFoundPath = path.join(__dirname, "public/404.html");

Now lets connect mongoDB with our app and 

Now lets connect mongoDB with our app and 