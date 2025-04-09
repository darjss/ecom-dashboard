"use server";
import "server-only";
import {
  BrandInsertType,
  CategoryInsertType,
  CustomerInsertType,
  CustomersTable,
  ProductImagesTable,
  ProductsTable,
  PurchasesTable,
  BrandsTable,
  CategoriesTable,
} from "@/server/db/schema";
import { addProductType } from "@/lib/zod/schema";
import { addBrand } from "@/server/actions/brand";
import { addCategory } from "@/server/actions/category";
import { revalidateTag } from "next/cache";

import { db } from "@/server/db";
import { eq, sql } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { deliveryProvider, orderStatus, paymentStatus } from "./constants";
import {
  OrderDeliveryProviderType,
  OrderStatusType,
  PaymentStatusType,
} from "./types";
import { seedOrder } from "@/server/actions/order";

// Sample data for brands
const brandsData: BrandInsertType[] = [
  { name: "NOW Foods", logoUrl: "https://picsum.photos/600/400?random=26" },
  {
    name: "Nature's Best",
    logoUrl: "https://picsum.photos/600/400?random=27",
  },
  {
    name: "Microingredients",
    logoUrl: "https://picsum.photos/600/400?random=28",
  },
  { name: "NutraCost", logoUrl: "https://picsum.photos/600/400?random=28" },
  {
    name: "Doctor's Best",
    logoUrl: "https://picsum.photos/600/400?random=29",
  },
];

// Sample data for categories
const categoriesData: CategoryInsertType[] = [
  { name: "Vitamins" },
  { name: "Minerals" },
  { name: "Herbal Supplements" },
  { name: "Probiotics" },
  { name: "Energy Supplements" },
];

// Generate more diverse product data
const generateProductsData = (
  numProducts: number,
  brandIds: number[],
  categoryIds: number[],
): addProductType[] => {
  const products: addProductType[] = [];
  const productNameSet = new Set<string>(); // Ensure unique product names

  for (let i = 0; i < numProducts; i++) {
    let name = faker.commerce.productName();
    // Ensure unique name
    while (productNameSet.has(name)) {
      name = faker.commerce.productName();
    }
    productNameSet.add(name);

    const brandId = brandIds[Math.floor(Math.random() * brandIds.length)];
    const categoryId =
      categoryIds[Math.floor(Math.random() * categoryIds.length)];
    const price = faker.number.int({ min: 10000, max: 300000 }); // Price in cents

    // Ensure brandId and categoryId are valid before pushing
    if (brandId === undefined || categoryId === undefined) {
      console.warn(
        `Skipping product "${name}" due to missing brandId or categoryId.`,
      );
      continue; // Skip this iteration if IDs are missing
    }

    products.push({
      name: name,
      description: faker.commerce.productDescription(),
      dailyIntake: faker.number.int({ min: 1, max: 3 }),
      brandId: brandId,
      categoryId: categoryId,
      amount: `${faker.number.int({ min: 30, max: 180 })} ${faker.helpers.arrayElement(["capsules", "tablets", "softgels", "grams"])}`,
      potency: `${faker.number.int({ min: 10, max: 1000 })} ${faker.helpers.arrayElement(["mg", "mcg", "IU", "%"])}`,
      stock: faker.number.int({ min: 50, max: 500 }),
      price: price,
      images: Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        (_, index) => ({
          url: `https://picsum.photos/600/400?random=${faker.string.uuid()}`, // Use UUID for more unique random images
          isPrimary: index === 0,
        }),
      ) as [
        { url: string; isPrimary: boolean },
        ...{ url: string; isPrimary: boolean }[],
      ], // Cast to non-empty tuple type
      status: faker.helpers.arrayElement(["active", "out_of_stock", "draft"]),
    });
  }
  return products;
};

export const seedFakeOrders = async (
  numOrders: number,
  insertedProducts: { id: number; price: number }[],
) => {
  try {
    // Step 1: Generate fake customers in batches
    const BATCH_SIZE = 10;
    const fakeCustomers: { phone: number; address: string }[] = [];
    const phoneSet = new Set<number>();

    while (fakeCustomers.length < 50) {
      const phone =
        Math.floor(Math.random() * (99999999 - 60000000 + 1)) + 60000000;
      if (!phoneSet.has(phone)) {
        phoneSet.add(phone);
        fakeCustomers.push({
          phone,
          address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.zipCode()}`,
        });
      }
    }

    // Step 2: Insert customers one by one (removed transaction wrapper)
    console.log(`Inserting ${fakeCustomers.length} customers...`);
    for (const customer of fakeCustomers) {
      try {
        await db.insert(CustomersTable).values(customer);
      } catch (error) {
        console.error(
          `Failed to insert customer with phone ${customer.phone}:`,
          error,
        );
        // Decide how to handle customer insertion failure. Continue or throw?
        // For seeding, maybe just log and continue.
      }
    }
    console.log("Customer insertion complete.");

    // Step 3: Generate all fake orders first
    const fakeOrders = Array.from({ length: numOrders }, () => {
      const customer =
        fakeCustomers[Math.floor(Math.random() * fakeCustomers.length)];
      const numProducts = Math.floor(Math.random() * 5) + 1;
      const orderProducts = [];

      for (let j = 0; j < numProducts; j++) {
        const product =
          insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
        if (product && customer) {
          orderProducts.push({
            productId: product.id,
            quantity: Math.floor(Math.random() * 10) + 1,
            price: product.price,
          });
        }
      }

      if (!customer) return null;

      return {
        customerPhone: customer.phone,
        address: customer.address,
        notes: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        status: orderStatus[
          Math.floor(Math.random() * orderStatus.length)
        ] as OrderStatusType,
        paymentStatus: paymentStatus[
          Math.floor(Math.random() * paymentStatus.length)
        ] as PaymentStatusType,
        deliveryProvider: deliveryProvider[
          Math.floor(Math.random() * deliveryProvider.length)
        ] as OrderDeliveryProviderType,
        isNewCustomer: false,
        products: orderProducts,
        createdAt: faker.date.past({ years: 0.1 }),
      };
    }).filter((order): order is NonNullable<typeof order> => order !== null);

    // Step 4: Sort orders by createdAt
    fakeOrders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    console.log(`Starting to seed ${fakeOrders.length} orders...`);
    let successCount = 0;
    let failCount = 0;
    const ORDER_BATCH_SIZE = 20; // Define batch size

    for (let i = 0; i < fakeOrders.length; i += ORDER_BATCH_SIZE) {
      const batch = fakeOrders.slice(i, i + ORDER_BATCH_SIZE);
      console.log(
        `Processing order batch ${i / ORDER_BATCH_SIZE + 1}/${Math.ceil(fakeOrders.length / ORDER_BATCH_SIZE)}...`,
      );

      const batchPromises = batch.map(async (order) => {
        if (order == undefined) {
          return; // Skip if order is somehow undefined
        }
        try {
          await seedOrder(order, order.createdAt);
          successCount++;
        } catch (error) {
          failCount++;
          console.error(
            `Error seeding order with phone ${order.customerPhone}:`,
            error,
          );
          // Optionally: throw error here if one failure should stop the whole batch/seed
        }
      });

      // Wait for all promises in the current batch to settle
      await Promise.all(batchPromises);

      console.log(
        `Batch ${i / ORDER_BATCH_SIZE + 1} complete. Total successes: ${successCount}, Total failures: ${failCount}`,
      );

      // Add a small delay between batches if needed
      if (i + ORDER_BATCH_SIZE < fakeOrders.length) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Delay between batches
      }
    }

    console.log(
      `Seeding complete: ${successCount} orders added, ${failCount} failed.`,
    );
  } catch (error) {
    console.error("Error in seedFakeOrders:", error);
    throw error;
  }
};

// New server action to seed only orders
export const seedOnlyOrders = async (numOrders: number) => {
  "use server";
  console.log(`Starting to seed ${numOrders} orders only...`);
  try {
    // Fetch necessary product data (id and price)
    const products = await db
      .select({ id: ProductsTable.id, price: ProductsTable.price })
      .from(ProductsTable);

    if (!products || products.length === 0) {
      console.error(
        "No products found in the database. Cannot seed orders without products.",
      );
      throw new Error("No products found to create orders from.");
    }

    // Call the existing function to seed orders
    await seedFakeOrders(numOrders, products);

    console.log(`Successfully initiated seeding of ${numOrders} orders.`);
  } catch (error) {
    console.error("Error during seedOnlyOrders:", error);
    // Re-throw the error so the Server Action signals failure
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    // Step 1: Add brands and categories in parallel
    await Promise.all([
      ...brandsData.map((brand) => addBrand(brand)),
      ...categoriesData.map((category) => addCategory(category)),
    ]);

    // Fetch inserted brand and category IDs
    const brands = await db.select({ id: BrandsTable.id }).from(BrandsTable);
    const categories = await db
      .select({ id: CategoriesTable.id })
      .from(CategoriesTable);
    const brandIds = brands.map((b) => b.id);
    const categoryIds = categories.map((c) => c.id);

    // Generate products data
    const productsData = generateProductsData(40, brandIds, categoryIds); // Generate 100 products

    revalidateTag("brandCategory");

    // Step 2: Add products and their images in parallel batches
    console.log("Seeding products and images...");
    const PRODUCT_BATCH_SIZE = 10; // Adjust batch size based on performance/memory
    const insertedProducts: { id: number; stock: number; price: number }[] = [];

    for (let i = 0; i < productsData.length; i += PRODUCT_BATCH_SIZE) {
      const batch = productsData.slice(i, i + PRODUCT_BATCH_SIZE);
      console.log(`Processing product batch ${i / PRODUCT_BATCH_SIZE + 1}...`);

      await Promise.all(
        batch.map(async (product: addProductType) => {
          try {
            const productResult = await db
              .insert(ProductsTable)
              .values({
                name: product.name,
                slug: product.name.replace(/\s+/g, "-").toLowerCase(),
                description: product.description,
                discount: 0,
                amount: product.amount,
                potency: product.potency,
                stock: 0,
                price: product.price,
                dailyIntake: product.dailyIntake,
                categoryId: product.categoryId,
                brandId: product.brandId,
                status: "active",
              })
              .returning({ id: ProductsTable.id });

            if (productResult[0]) {
              const productId = productResult[0].id;
              insertedProducts.push({
                id: productId,
                stock: product.stock,
                price: product.price,
              });

              // Add images for this product in parallel
              await Promise.all(
                (
                  product.images as Array<{ url: string; isPrimary: boolean }>
                ).map((image) =>
                  db.insert(ProductImagesTable).values({
                    productId: productId,
                    url: image.url,
                    isPrimary: image.isPrimary,
                  }),
                ),
              );
            }
          } catch (error) {
            console.error(`Error inserting product ${product.name}:`, error);
          }
        }),
      );

      // Add a small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Step 3: Handle purchases and stock updates in smaller transactions
    for (const insertedProduct of insertedProducts) {
      try {
        await db.transaction(async (tx) => {
          const unitCost = Math.floor(0.7 * insertedProduct.price);

          // Add purchase record
          await tx.insert(PurchasesTable).values({
            productId: insertedProduct.id,
            quantityPurchased: insertedProduct.stock,
            unitCost: unitCost,
          });

          // Update stock
          await tx
            .update(ProductsTable)
            .set({
              stock: sql`${ProductsTable.stock} + ${insertedProduct.stock}`,
            })
            .where(eq(ProductsTable.id, insertedProduct.id));
        });
      } catch (error) {
        console.error(
          `Error processing purchase for product ${insertedProduct.id}:`,
          error,
        );
      }
    }

    // Step 4: Seed orders with retry mechanism
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let success = false;

    while (!success && retryCount < MAX_RETRIES) {
      try {
        await seedFakeOrders(100, insertedProducts);
        success = true;
      } catch (error) {
        retryCount++;
        console.error(`Attempt ${retryCount} failed to seed orders:`, error);
        if (retryCount < MAX_RETRIES) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000),
          );
        }
      }
    }

    if (!success) {
      throw new Error("Failed to seed orders after maximum retries");
    }

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error during database seeding:", error);
    throw error;
  }
};
