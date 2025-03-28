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
} from "@/server/db/schema";
import { addProductType } from "@/lib/zod/schema";
import { addBrand } from "@/server/actions/brand";
import { addCategory } from "@/server/actions/category";
import { revalidateTag } from "next/cache";
import { addOrder } from "@/server/actions/order";
import { db } from "@/server/db";
import { eq, sql } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { deliveryProvider, orderStatus, paymentStatus } from "./constants";
import {
  OrderDeliveryProviderType,
  OrderStatusType,
  PaymentStatusType,
} from "./types";

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

// Sample data for products (10 vitamin products)
const productsData: addProductType[] = [
  {
    name: "Vitamin A",
    description: "High-quality Vitamin A supplement.",
    dailyIntake: 1,
    brandId: 1,
    categoryId: 1,
    amount: "60 capsules",
    potency: "1000 IU per capsule",
    stock: 100,
    price: 50000,
    images: [
      { url: "https://picsum.photos/600/400?random=1" },
      { url: "https://picsum.photos/600/400?random=2" },
    ],
    status: "active",
  },
  {
    name: "Vitamin C",
    description: "Natural Vitamin C supplement from citrus sources.",
    dailyIntake: 2,
    brandId: 2,
    categoryId: 1,
    amount: "120 tablets",
    potency: "1000 mg per tablet",
    stock: 150,
    price: 80000,
    images: [
      { url: "https://picsum.photos/600/400?random=3" },
      { url: "https://picsum.photos/600/400?random=4" },
    ],
    status: "active",
  },
  {
    name: "Vitamin D3",
    description: "Cholecalciferol form of Vitamin D3.",
    dailyIntake: 1,
    brandId: 3,
    categoryId: 1,
    amount: "90 softgels",
    potency: "2000 IU per softgel",
    stock: 200,
    price: 75000,
    images: [
      { url: "https://picsum.photos/600/400?random=5" },
      { url: "https://picsum.photos/600/400?random=6" },
    ],
    status: "active",
  },
  {
    name: "Vitamin E",
    description: "Tocopherol-rich Vitamin E supplement.",
    dailyIntake: 1,
    brandId: 4,
    categoryId: 1,
    amount: "60 capsules",
    potency: "400 IU per capsule",
    stock: 120,
    price: 90000,
    images: [
      { url: "https://picsum.photos/600/400?random=7" },
      { url: "https://picsum.photos/600/400?random=8" },
    ],
    status: "active",
  },
  {
    name: "Vitamin B Complex",
    description: "Complete B vitamin complex for energy metabolism.",
    dailyIntake: 1,
    brandId: 5,
    categoryId: 1,
    amount: "60 tablets",
    potency: "50 mg per tablet",
    stock: 180,
    price: 120000,
    images: [
      { url: "https://picsum.photos/600/400?random=9" },
      { url: "https://picsum.photos/600/400?random=10" },
    ],
    status: "active",
  },
  {
    name: "Vitamin K2",
    description: "Vitamin K2 for bone and heart health.",
    dailyIntake: 1,
    brandId: 1,
    categoryId: 1,
    amount: "60 capsules",
    potency: "100 mcg per capsule",
    stock: 90,
    price: 150000,
    images: [
      { url: "https://picsum.photos/600/400?random=11" },
      { url: "https://picsum.photos/600/400?random=12" },
    ],
    status: "active",
  },
  {
    name: "Vitamin B12",
    description: "Cyanocobalamin form of Vitamin B12.",
    dailyIntake: 1,
    brandId: 2,
    categoryId: 1,
    amount: "60 tablets",
    potency: "1000 mcg per tablet",
    stock: 110,
    price: 60000,
    images: [
      { url: "https://picsum.photos/600/400?random=13" },
      { url: "https://picsum.photos/600/400?random=14" },
    ],
    status: "active",
  },
  {
    name: "Vitamin B6",
    description: "Pyridoxine form of Vitamin B6.",
    dailyIntake: 1,
    brandId: 3,
    categoryId: 1,
    amount: "60 capsules",
    potency: "50 mg per capsule",
    stock: 130,
    price: 70000,
    images: [
      { url: "https://picsum.photos/600/400?random=15" },
      { url: "https://picsum.photos/600/400?random=16" },
    ],
    status: "active",
  },
  {
    name: "Vitamin B5",
    description: "Pantothenic acid for energy production.",
    dailyIntake: 1,
    brandId: 4,
    categoryId: 1,
    amount: "60 capsules",
    potency: "500 mg per capsule",
    stock: 140,
    price: 85000,
    images: [
      { url: "https://picsum.photos/600/400?random=17" },
      { url: "https://picsum.photos/600/400?random=18" },
    ],
    status: "active",
  },
  {
    name: "Vitamin B3",
    description: "Niacin form of Vitamin B3 for skin health.",
    dailyIntake: 1,
    brandId: 5,
    categoryId: 1,
    amount: "60 tablets",
    potency: "50 mg per tablet",
    stock: 160,
    price: 100000,
    images: [
      { url: "https://picsum.photos/600/400?random=19" },
      { url: "https://picsum.photos/600/400?random=20" },
    ],
    status: "active",
  },
];
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

    // Step 2: Insert customers in a single transaction
    await db.transaction(async (tx) => {
      for (const customer of fakeCustomers) {
        await tx.insert(CustomersTable).values(customer);
      }
    });

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

    // Step 5: Process orders in batches
    const batches = [];
    for (let i = 0; i < fakeOrders.length; i += BATCH_SIZE) {
      batches.push(fakeOrders.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      await Promise.all(batch.map((order) => addOrder(order, order.createdAt)));
      // Add a small delay between batches to prevent overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`${numOrders} fake orders seeded successfully.`);
  } catch (error) {
    console.error("Error seeding fake orders:", error);
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

    revalidateTag("brandCategory");

    // Step 2: Add products in batches
    const BATCH_SIZE = 5;
    const insertedProducts: { id: number; stock: number; price: number }[] = [];

    // Process products in batches
    for (let i = 0; i < productsData.length; i += BATCH_SIZE) {
      const batch = productsData.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (product) => {
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

              // Add images for this product
              await Promise.all(
                product.images.map((image, index) =>
                  db.insert(ProductImagesTable).values({
                    productId: productId,
                    url: image.url,
                    isPrimary: index === 0,
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
