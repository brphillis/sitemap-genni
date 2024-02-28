const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");
const { DOMParser, XMLSerializer } = require("xmldom");
const { Pool } = require("pg");

// Function to fetch HTML content of a URL
const fetchHTML = async (url) => {
  const response = await axios.get(url);
  return { html: response.data, status: response.status };
};

// Function to extract links from HTML content
const extractLinks = (html, baseUrl) => {
  const $ = cheerio.load(html);
  const links = [];
  const baseDomain = new URL(baseUrl).hostname; // Extract the domain of the baseUrl

  $("a").each((_, element) => {
    const href = $(element).attr("href");
    if (href) {
      const absoluteUrl = new URL(href, baseUrl).href;
      const domain = new URL(absoluteUrl).hostname; // Extract the domain of the current link
      if (domain === baseDomain) {
        links.push(absoluteUrl); // Add the link only if it belongs to the same domain
      }
    }
  });
  return links;
};

// Function to recursively crawl the website and generate sitemap content
const crawlAndGenerateSitemap = async (url, visited = new Set()) => {
  if (visited.has(url)) return "";

  visited.add(url);
  let sitemapContent = "";

  try {
    const { html, status } = await fetchHTML(url);

    // Check if the response status is 200 (OK)
    if (status === 200) {
      const links = extractLinks(html, url);

      for (const link of links) {
        if (!visited.has(link)) {
          // Exclude URLs without query strings that start with '/product/'
          if (!isProductPageWithoutQueryString(link)) {
            sitemapContent += `<url><loc>${link}</loc></url>\n`; // Add each URL to the sitemap content wrapped in <url> tags
            sitemapContent += await crawlAndGenerateSitemap(link, visited);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
  }

  return sitemapContent;
};

// Function to check if a URL is a product page without a query string
const isProductPageWithoutQueryString = (url) => {
  const parsedUrl = new URL(url);
  return (
    parsedUrl.pathname.startsWith("/product/") && parsedUrl.search.length === 0
  );
};

// Function to serialize the XML document to a string
const serializeXML = (xmlDoc) => {
  return new XMLSerializer().serializeToString(xmlDoc);
};

// Function to upload serialized XML content to the SiteMap table in PostgreSQL
const uploadToDatabase = async (serializedXML) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();

    // Check if row with id = 1 exists
    const result = await client.query(
      'SELECT COUNT(*) FROM "SiteMap" WHERE id = 1'
    );
    const rowCount = parseInt(result.rows[0].count);

    if (rowCount === 0) {
      // If row with id = 1 does not exist, insert a new row
      await client.query('INSERT INTO "SiteMap" (id, value) VALUES (1, $1)', [
        serializedXML,
      ]);
    } else {
      // If row with id = 1 exists, update the value column
      await client.query('UPDATE "SiteMap" SET value = $1 WHERE id = 1', [
        serializedXML,
      ]);
    }

    console.log("Sitemap uploaded to the database successfully.");
    client.release();
  } catch (error) {
    console.error("Error uploading sitemap to the database:", error);
  } finally {
    await pool.end();
  }
};

const generateSitemap = async (websiteURL) => {
  const websiteUrl = websiteURL;

  try {
    const siteMapContent = await crawlAndGenerateSitemap(websiteUrl);

    if (siteMapContent) {
      // Wrap the sitemap content in <urlset> tags
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${siteMapContent}
        </urlset>`;

      // Parse the generated string into valid XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

      // Serialize the XML document back to string
      const serializedXML = serializeXML(xmlDoc);

      // Write the content to a JavaScript file in the root directory (optional)
      fs.writeFileSync("./sitemap.xml", serializedXML, "utf8");

      // Upload the serialized XML content to the SiteMap table
      await uploadToDatabase(serializedXML);

      return true;
    }
  } catch (err) {
    console.log("an error has occurred:", err);
    return false;
  }
};

module.exports = { generateSitemap };
