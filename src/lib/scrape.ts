"use server"
import * as cheerio from "cheerio";

export interface AmazonScrapeProduct {
  productName: string;
  productUrl: string;
  thumbnailUrl: string;
}

export interface AmazonProductDetails {
  productName: string;
  price: string;
  description: string;   mainImageUrl: string | undefined;
  additionalImages: string[];
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 1000,
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    console.log(response.status)
    if (response.ok) {
      return response;
    }
    if (
      response.status === 403 ||
      response.status === 429 ||
      response.status === 503
    ) {
            if (retries > 0) {
        console.warn(
          `Request failed (${response.status}), retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);       }
    }

    throw new Error(
      `Request failed with status ${response.status} after multiple retries`,
    );
  } catch (error) {
    if (retries > 0) {
      console.warn(`Request failed (${error}), retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;   }
}

export async function getProductDetails(
  productUrl: string,
): Promise<AmazonProductDetails> {
  try {
    const response = await fetchWithRetry(productUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const productDetails: AmazonProductDetails = {
      productName: $("#productTitle").text().trim(),
      price: getPrice($),
      description: getProductDescription($),       mainImageUrl: getMainImage($),
      additionalImages: getAdditionalImages($),
    };
    console.log("product",productDetails);
    return productDetails;
  } catch (error) {
    console.error(`Error fetching product details from ${productUrl}:`, error);
        return {
      productName: "Error fetching name",
      price: "Error fetching price",
      description: "Error fetching description",       mainImageUrl: undefined,
      additionalImages: [],
    };
  }
}

function getPrice($: cheerio.CheerioAPI): string {
  let price = "";

    const priceSelectors = [
    "#priceblock_ourprice",
    "span.a-offscreen",
    "#price_inside_buybox",
    ".a-price > .a-offscreen",
    "#corePrice_desktop div.a-section.a-spacing-none.aok-align-center > div.a-section.a-spacing-micro > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span.a-offscreen",     "#corePrice_feature_div > div > span > span.a-offscreen",
  ];

  for (const selector of priceSelectors) {
    price = $(selector).first().text().trim();
    if (price) {
      break;     }
  }

  if (!price) {
    price = "Price not found";   }
  return price;
}

function getProductDescription($: cheerio.CheerioAPI): string {
  let description = "";

    $("#feature-bullets ul li span.a-list-item").each((i, el) => {
    description += $(el).text().trim() + "\n";   });

    if (description.length === 0) {
    $("#productDescription p, #productDescription_feature_div p").each(
      (i, el) => {
        description += $(el).text().trim() + "\n";       },
    );
  }

    if (description.length === 0) {
    $("#detailBullets_feature_div ul li span.a-list-item").each((i, el) => {
      description += $(el).text().trim() + "\n";
    });
  }

  return description.trim(); }

function getMainImage($: cheerio.CheerioAPI): string | undefined {
    let mainImage =
    $("#imgBlkFront").attr("src") || $("#landingImage").attr("src");

  if (!mainImage) {
    mainImage = $("#main-image[data-old-hires]").attr("data-old-hires");   }
  return mainImage;
}

function getAdditionalImages($: cheerio.CheerioAPI): string[] {
  const additionalImages: string[] = [];

  $("#altImages ul li span.a-button-thumbnail img").each((i, el) => {
    const thumbUrl = $(el).attr("src");

    if (thumbUrl) {
            let fullSizeUrl = thumbUrl.replace(/._.*_\./g, ".");

            fullSizeUrl = fullSizeUrl.replace(/._AC_.*_\./g, ".");       fullSizeUrl = fullSizeUrl.replace(/._SL\d+_./g, "."); 
      additionalImages.push(fullSizeUrl);
    }
  });

  return additionalImages;
}

export async function searchAmazonProducts(
  searchTerm: string,
): Promise<AmazonScrapeProduct[]> {
  try {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const url = `https:
    const response = await fetchWithRetry(url, {
            headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const products: AmazonScrapeProduct[] = [];

        $(
      'div.s-result-item[data-component-type=s-search-result]:not([data-cel-widget^="sp-sponsored-label"])',
    ).each((index, element) => {
                  const productUrlRelative = $(element)
        .find("a.a-link-normal.s-no-outline, a.a-link-normal.a-text-normal")
        .attr("href");       const productUrl = productUrlRelative
        ? `https:        : "";

            const productName = $(element).find("span.a-text-normal").text().trim();
        console.log(productName)
            const thumbnailUrl = $(element).find("img.s-image").attr("src") || "";

            if (productName && productUrl && thumbnailUrl) {
        products.push({ productName, productUrl, thumbnailUrl });
      }
    });
    console.log("result", products)
    return products;
  } catch (error) {
    console.error("Error searching Amazon:", error);
        return [];
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  try {
    const searchTerm = "wireless headphones";
    const products = await searchAmazonProducts(searchTerm);

    if (products.length === 0) {
      console.log("No products found for the search term.");
      return;
    }

    console.log(
      `Found ${products.length} products. Fetching details for the first two...`,
    );

    const allProductDetails = [];
        for (let i = 0; i < Math.min(2, products.length); i++) {
      const product = products[i];
      if (product === undefined) {
        return;
      }
      try {
        const details = await getProductDetails(product.productUrl);
        allProductDetails.push(details);
        console.log(`Fetched details for: ${details.productName}`);         await sleep(3000);       } catch (error) {
        console.error(
          `Error fetching details for ${product.productUrl}:`,
          error,
        );
      }
    }

    console.log("First two product details:", allProductDetails);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

