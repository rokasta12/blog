---
title: URL Shortener Web Application with Node.js
author: Bedirhan Celayir
date: 2020-12-06T21:00:00.000+00:00
hero_image: "/src/assets/content/images/kalea-jerielle-_gi_sp5k3hc-unsplash.jpg"

---
# Creating custom URL shortener with Nodejs Vue MongoDB

This small project has an Express api that user can send url that wants to make it more small and looking nice.And also if someone makes a get request to this shortened url server routes user to original url.

This project is hosted on github and it wasn't necesarry to deploy client and server seperately and also used Vue from cdn.

#### [Demo](https://urlkisaltici.herokuapp.com/ "Demo - App")

This is file structure of project.

![](/src/assets/content/images/file-structure.PNG "Project Structure")

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

Our First route when someone goes to shortened page  go find original url from database and if exists redirect to this page else send 404.

    //redirect to url
    app.get("/:id", async (req, res) => {
      const { id: slug } = req.params;
      try {
        const url = await urls.findOne({ slug });
        if (url) {
          res.redirect(url.url);
        }
        return res.status(404).sendFile(notFoundPath);
      } catch (error) {
        return res.status(404).sendFile(notFoundPath);
      }
    });

Now we need to create other two routes.Before routes lets create our url's data schema and configure  rate limits to  prevent our api.

    const linkSchema = yup.object().shape({
      slug: yup
        .string()
        .trim()
        .matches(/^[\w\-]+$/i),
      url: yup.string().trim().url(),
    });
    const slowerDownLimiter = slowDown({
      windowMs: 30 * 1000,
      delayAfter: 3,
      delayMs: 500,
    });
    
    const rateLimiter = rateLimit({
      windowMs: 30 * 1000,
      max: 3,
    });

Route for creating url document.First gets body from request and checks if url shortened before if not created uses nanoid for random string and sends response.

    // create a shory url
    app.post("/url", slowerDownLimiter, rateLimiter, async (req, res, next) => {
      let url = req.body.url;
      let slug = req.body.slug;
    
      try {
        await linkSchema.validate(slug, url);
        const existingUrl = await urls.findOne({ url });
        if (existingUrl) {
          res.json(existingUrl);
        } else {
          if (!slug) {
            slug = nanoid(5);
          } else {
            const existing = await urls.findOne({ slug });
            if (existing) {
              throw new Error("slug in use ");
            }
          }
          slug = slug.toLowerCase();
          const newUrl = {
            url,
            slug,
          };
          const created = await urls.insert(newUrl);
          res.json(created);
        }
      } catch (error) {
        next(error);
      }
    });

Error Handler -> end...

    app.use((req, res, next) => {
      res.status(404).sendFile(notFoundPath);
    });
    
    app.use((error, req, res, next) => {
      if (error.status) {
        res.status(error.status);
      } else {
        res.status(500);
      }
      res.json({
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
      });
    });
    
    const port = process.env.PORT || 1337;
    
    app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}`);
    });
    