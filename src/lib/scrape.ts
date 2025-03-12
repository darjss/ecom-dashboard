// "use server"
// import * as cheerio from "cheerio";

// export interface AmazonScrapeProduct {
//   productName: string;
//   productUrl: string;
//   thumbnailUrl: string;
// }

// export interface AmazonProductDetails {
//   productName: string;
//   price: string;
//   description: string; // Changed to string
//   mainImageUrl: string | undefined;
//   additionalImages: string[];
// }

// // Helper function for retries with exponential backoff
// async function fetchWithRetry(
//   url: string,
//   options: RequestInit,
//   retries: number = 3,
//   delay: number = 1000,
// ): Promise<Response> {
//   try {
//     const response = await fetch(url, options);
//     console.log(response.status)
//     if (response.ok) {
//       return response;
//     }
//     if (
//       response.status === 403 ||
//       response.status === 429 ||
//       response.status === 503
//     ) {
//       // 403 Forbidden, 429 Too Many Requests, 503 Service Unavailable
//       if (retries > 0) {
//         console.warn(
//           `Request failed (${response.status}), retrying in ${delay}ms...`,
//         );
//         await new Promise((resolve) => setTimeout(resolve, delay));
//         return fetchWithRetry(url, options, retries - 1, delay * 2); // Exponential backoff
//       }
//     }

//     throw new Error(
//       `Request failed with status ${response.status} after multiple retries`,
//     );
//   } catch (error) {
//     if (retries > 0) {
//       console.warn(`Request failed (${error}), retrying in ${delay}ms...`);
//       await new Promise((resolve) => setTimeout(resolve, delay));
//       return fetchWithRetry(url, options, retries - 1, delay * 2);
//     }
//     throw error; // Re-throw the error after all retries have failed
//   }
// }

// // Optimized detail fetching with more robust selectors and error handling
// export async function getProductDetails(
//   productUrl: string,
// ): Promise<AmazonProductDetails> {
//   try {
//     const response = await fetchWithRetry(productUrl, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
//         "Accept-Language": "en-US,en;q=0.9",
//       },
//     });

//     const html = await response.text();
//     const $ = cheerio.load(html);

//     const productDetails: AmazonProductDetails = {
//       productName: $("#productTitle").text().trim(),
//       price: getPrice($),
//       description: getProductDescription($), // Now returns a single string
//       mainImageUrl: getMainImage($),
//       additionalImages: getAdditionalImages($),
//     };
//     console.log("product",productDetails);
//     return productDetails;
//   } catch (error) {
//     console.error(`Error fetching product details from ${productUrl}:`, error);
//     // Return a partial object with available data, rather than throwing
//     return {
//       productName: "Error fetching name",
//       price: "Error fetching price",
//       description: "Error fetching description", // Single string for error
//       mainImageUrl: undefined,
//       additionalImages: [],
//     };
//   }
// }

// // More robust price extraction, handling multiple possible locations and formats.
// function getPrice($: cheerio.CheerioAPI): string {
//   let price = "";

//   // Array of selectors, in order of preference
//   const priceSelectors = [
//     "#priceblock_ourprice",
//     "span.a-offscreen",
//     "#price_inside_buybox",
//     ".a-price > .a-offscreen",
//     "#corePrice_desktop div.a-section.a-spacing-none.aok-align-center > div.a-section.a-spacing-micro > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span.a-offscreen", //selector found through debugging, more specific.
//     "#corePrice_feature_div > div > span > span.a-offscreen",
//   ];

//   for (const selector of priceSelectors) {
//     price = $(selector).first().text().trim();
//     if (price) {
//       break; // Stop as soon as a price is found
//     }
//   }

//   if (!price) {
//     price = "Price not found"; // Fallback
//   }
//   return price;
// }

// // Modified description extraction to return a single string.
// function getProductDescription($: cheerio.CheerioAPI): string {
//   let description = "";

//   // Try to get bullet points first
//   $("#feature-bullets ul li span.a-list-item").each((i, el) => {
//     description += $(el).text().trim() + "\n"; // Concatenate with newline
//   });

//   // If no bullet points, get product description paragraph(s)
//   if (description.length === 0) {
//     $("#productDescription p, #productDescription_feature_div p").each(
//       (i, el) => {
//         description += $(el).text().trim() + "\n"; // Concatenate with newline
//       },
//     );
//   }

//   //if both are missing use about this item:
//   if (description.length === 0) {
//     $("#detailBullets_feature_div ul li span.a-list-item").each((i, el) => {
//       description += $(el).text().trim() + "\n";
//     });
//   }

//   return description.trim(); // Remove trailing newline
// }

// // Improved main image extraction, with fallback.
// function getMainImage($: cheerio.CheerioAPI): string | undefined {
//   // Use a more robust selector that combines multiple possibilities
//   let mainImage =
//     $("#imgBlkFront").attr("src") || $("#landingImage").attr("src");

//   if (!mainImage) {
//     mainImage = $("#main-image[data-old-hires]").attr("data-old-hires"); //check for data-old-hires attribute.
//   }
//   return mainImage;
// }

// // Improved additional images extraction.
// function getAdditionalImages($: cheerio.CheerioAPI): string[] {
//   const additionalImages: string[] = [];

//   $("#altImages ul li span.a-button-thumbnail img").each((i, el) => {
//     const thumbUrl = $(el).attr("src");

//     if (thumbUrl) {
//       // Improved replacement logic for full-size URLs
//       let fullSizeUrl = thumbUrl.replace(/._.*_\./g, ".");

//       // Handle different Amazon URL formats
//       fullSizeUrl = fullSizeUrl.replace(/._AC_.*_\./g, "."); // Remove resolution suffixes
//       fullSizeUrl = fullSizeUrl.replace(/._SL\d+_./g, "."); // Remove size indicators

//       additionalImages.push(fullSizeUrl);
//     }
//   });

//   return additionalImages;
// }

// // Improved search with better error handling and result parsing.
// export async function searchAmazonProducts(
//   searchTerm: string,
// ): Promise<AmazonScrapeProduct[]> {
//   try {
//     const encodedSearchTerm = encodeURIComponent(searchTerm);
//     const url = `https://www.amazon.com/s?k=${encodedSearchTerm}`;

//     const response = await fetchWithRetry(url, {
//       // Use fetchWithRetry here
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
//         "Accept-Language": "en-US,en;q=0.9",
//       },
//     });

//     const html = await response.text();
//     const $ = cheerio.load(html);
//     const products: AmazonScrapeProduct[] = [];

//     // More precise selector for search result items
//     $(
//       'div.s-result-item[data-component-type=s-search-result]:not([data-cel-widget^="sp-sponsored-label"])',
//     ).each((index, element) => {
//       // Exclude sponsored results
//       // Improved URL extraction
//       const productUrlRelative = $(element)
//         .find("a.a-link-normal.s-no-outline, a.a-link-normal.a-text-normal")
//         .attr("href"); //more robust url finding.
//       const productUrl = productUrlRelative
//         ? `https://www.amazon.com${productUrlRelative}`
//         : "";

//       // More robust name extraction
//       const productName = $(element).find("span.a-text-normal").text().trim();
//         console.log(productName)
//       // Extract thumbnail
//       const thumbnailUrl = $(element).find("img.s-image").attr("src") || "";

//       // Only add complete product entries
//       if (productName && productUrl && thumbnailUrl) {
//         products.push({ productName, productUrl, thumbnailUrl });
//       }
//     });
//     console.log("result", products)
//     return products;
//   } catch (error) {
//     console.error("Error searching Amazon:", error);
//     // Return an empty array instead of throwing, to continue program execution
//     return [];
//   }
// }

// // Helper function for delays
// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// // Main function with improved error handling and limited detail fetching
// async function main() {
//   try {
//     const searchTerm = "wireless headphones";
//     const products = await searchAmazonProducts(searchTerm);

//     if (products.length === 0) {
//       console.log("No products found for the search term.");
//       return;
//     }

//     console.log(
//       `Found ${products.length} products. Fetching details for the first two...`,
//     );

//     const allProductDetails = [];
//     // Fetch details only for the first two results.
//     for (let i = 0; i < Math.min(2, products.length); i++) {
//       const product = products[i];
//       if (product === undefined) {
//         return;
//       }
//       try {
//         const details = await getProductDetails(product.productUrl);
//         allProductDetails.push(details);
//         console.log(`Fetched details for: ${details.productName}`); //use details.product name in case it fails to fetch
//         await sleep(3000); // Wait for 3 seconds between requests
//       } catch (error) {
//         console.error(
//           `Error fetching details for ${product.productUrl}:`,
//           error,
//         );
//       }
//     }

//     console.log("First two product details:", allProductDetails);
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// }

// // main();
