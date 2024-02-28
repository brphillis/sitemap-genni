if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const express = require("express");
const { generateSitemap } = require("./sitemap");

const app = express();
const port = process.env.PORT;

app.get("/sitemap", async (req, res) => {
  try {
    const url = req.query.url;

    // Remove any surrounding quotes from the URL
    const cleanedUrl = url.replace(/^"(.*)"$/, "$1");

    let websiteUrl;

    // Check if the protocol is included in the URL, if not, prepend 'https://' as a default
    if (!cleanedUrl.includes("://")) {
      websiteUrl = "https://" + cleanedUrl;
    } else {
      websiteUrl = cleanedUrl;
    }

    if (!websiteUrl) {
      return res.status(400).json({ error: "Website URL is required." });
    }

    const sitemapContent = await generateSitemap(websiteUrl);
    res.header("Content-Type", "application/xml");
    res.send(sitemapContent);
  } catch (error) {
    console.error(`Error generating sitemap: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(
    `SiteMap Generator Server is running on http://localhost:${port}`
  );
});
