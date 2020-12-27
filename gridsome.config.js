const config = require("./src/assets/content/data/config.json")
const infoData = require("./src/assets/content/data/info.json")

module.exports = {
  siteName: config.title,
  //make editable config & data files available to graphql
  metadata: {
    siteName: config.title,
    siteDescription: config.description,
    infoData: infoData,
  },
  plugins: [
    {
      use: '@gridsome/source-filesystem',
      options: {
        typeName: 'Blog',
        baseDir: "./src/assets/content/",
        path: 'blog/**/*.md',
        resolveAbsolutePaths: true,
        remark: {
          externalLinksTarget: "_blank",
          externalLinksRel: ["nofollow", "noopener", "noreferrer"]
        }
      }
    },
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'blog/**/*.md',
        route: '/blog/:year/:month/:day/:slug',
        remark: {
          plugins: [
            '@gridsome/remark-prismjs'
          ]
        }
      }
    }
  ]
}