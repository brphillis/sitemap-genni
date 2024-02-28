# Sitemap Genni

## Overview

This API generates XML sitemaps by crawling a given URL and saving the sitemap as a stringified XML format into a database table named "Sitemap". It is built on Express, providing a straightforward way to create sitemaps for websites.

## Setup

1. **Clone Repository**: Clone this repository to your local machine.

2. **Install Dependencies**: Run `npm install` to install all necessary dependencies.

3. **Environment Variables**: Create a `.env` file in the root directory of the project and define the following variables:

PORT=3000 # Port number the API server will run on
DATABASE_URL=your_database_url_here # URL for your database

4. **Database Setup**: Ensure your database is configured and accessible. The API will store the sitemap data in a table named "Sitemap".

5. **Start the Server**: Execute `npm start` to start the Express server.

## How to Use

To generate a sitemap, perform a GET request to the following endpoint:

GET localhost:{PORT}/sitemap?url=www.example.com

Replace `{PORT}` with the port number defined in your `.env` file.

Replace `www.example.com` with the URL you want to crawl and generate the sitemap for.

## Example

GET localhost:3000/sitemap?url=www.example.com

This request will trigger the API to crawl `www.example.com` and save the resulting sitemap as a stringified XML format into the database.

## Error Handling

- If the URL parameter is missing or malformed, the API will respond with an appropriate error message.
- If there are any issues during the crawling process or database interaction, an error response will be returned along with relevant details.

## Development Environment

During development, ensure the following:

- Modify the `.env` file to include the appropriate port number and database URL.
- Use a tool like Postman or cURL to test the API endpoints.
- Monitor server logs and database interactions for debugging purposes.

## Feedback and Contributions

Feedback and contributions are welcome! If you encounter any issues, have suggestions, or want to contribute to the project, feel free to open an issue or submit a pull request on the GitHub repository.

## Disclaimer

This API is provided as-is without any warranties. Use it at your own risk.
