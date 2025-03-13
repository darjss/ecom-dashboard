"use server";
import "server-only";
import {
  BrandInsertType,
  CategoryInsertType,
  CustomersTable,
  ProductImagesTable,
  ProductsTable,
  PurchasesTable,
} from "@/server/db/schema";
import { addProductType } from "@/lib/zod/schema";
import { addBrand } from "@/server/actions/brand";
import { addCategory } from "@/server/actions/category";
import { addProduct } from "@/server/actions/product";
import { revalidateTag } from "next/cache";
import { addOrder } from "@/server/actions/order";
import { db } from "@/server/db";
import { eq, sql } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { orderStatus, paymentStatus } from "./constants";
import { OrderStatusType, PaymentStatusType } from "./types";
import { set } from "lodash";

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
const ordersData = [
  {
    customerPhone: 60123456,
    address: "123 Main Street, Kuala Lumpur, 50000",
    notes: "Please call before delivery",
    status: "pending" as const,
    paymentStatus: "success" as const,
    isNewCustomer: true,
    products: [
      { productId: 1, quantity: 2, price: 50000 },
      { productId: 3, quantity: 1, price: 75000 },
    ],
  },
  {
    customerPhone: 61234567,
    address: "45 Garden Avenue, Petaling Jaya, 47301",
    notes: null,
    status: "pending" as const,
    paymentStatus: "pending" as const,
    isNewCustomer: true,
    products: [
      { productId: 2, quantity: 3, price: 80000 },
      { productId: 5, quantity: 1, price: 120000 },
    ],
  },
  {
    customerPhone: 62345678,
    address: "78 Jalan Bukit Bintang, Kuala Lumpur, 55100",
    notes: "Leave with security guard if not at home",
    status: "delivered" as const,
    paymentStatus: "success" as const,
    isNewCustomer: true,
    products: [
      { productId: 4, quantity: 1, price: 90000 },
      { productId: 6, quantity: 2, price: 150000 },
    ],
  },
  {
    customerPhone: 63456789,
    address: "221 Jalan Ampang, Ampang, 68000",
    notes: "Fragile items, handle with care",
    status: "pending" as const,
    paymentStatus: "pending" as const,
    isNewCustomer: true,
    products: [
      { productId: 7, quantity: 1, price: 60000 },
      { productId: 9, quantity: 1, price: 85000 },
    ],
  },
  {
    customerPhone: 64567890,
    address: "15 Jalan Tun Razak, Kuala Lumpur, 50400",
    notes: null,
    status: "pending" as const,
    paymentStatus: "failed" as const,
    isNewCustomer: true,
    products: [
      { productId: 8, quantity: 2, price: 70000 },
      { productId: 10, quantity: 1, price: 100000 },
    ],
  },
  {
    customerPhone: 65678901,
    address: "88 Lebuh Armenian, Georgetown, Penang, 10200",
    notes: "Please deliver after 6pm",
    status: "delivered" as const,
    paymentStatus: "success" as const,
    isNewCustomer: true,
    products: [
      { productId: 1, quantity: 1, price: 50000 },
      { productId: 5, quantity: 1, price: 120000 },
      { productId: 9, quantity: 1, price: 85000 },
    ],
  },
  {
    customerPhone: 66789012,
    address: "32 Jalan Wong Ah Fook, Johor Bahru, 80000",
    notes: "Contact on WhatsApp before delivery",
    status: "pending" as const,
    paymentStatus: "success" as const,
    isNewCustomer: true,
    products: [
      { productId: 2, quantity: 1, price: 80000 },
      { productId: 4, quantity: 2, price: 90000 },
    ],
  },
  {
    customerPhone: 67890123,
    address: "55 Jalan Laksamana, Melaka, 75000",
    notes: null,
    status: "pending" as const,
    paymentStatus: "pending" as const,
    isNewCustomer: true,
    products: [
      { productId: 3, quantity: 3, price: 75000 },
      { productId: 6, quantity: 1, price: 150000 },
    ],
  },
  {
    customerPhone: 68901234,
    address: "101 Jalan Sultan Ismail, Kuala Lumpur, 50250",
    notes: "Gift wrapping requested",
    status: "delivered" as const,
    paymentStatus: "success" as const,
    isNewCustomer: true,
    products: [
      { productId: 7, quantity: 2, price: 60000 },
      { productId: 10, quantity: 1, price: 100000 },
    ],
  },
  {
    customerPhone: 69012345,
    address: "77 Jalan Sri Hartamas, Kuala Lumpur, 50480",
    notes: "Delivery to office building",
    status: "pending" as const,
    paymentStatus: "pending" as const,
    isNewCustomer: true,
    products: [
      { productId: 8, quantity: 1, price: 70000 },
      { productId: 9, quantity: 1, price: 85000 },
      { productId: 1, quantity: 1, price: 50000 },
    ],
  },
];
export const seedFakeOrders = async (
  numOrders: number,
  insertedProducts: { id: number; price: number }[],
) => {
  try {
    // Step 1: Generate fake customers
    const fakeCustomers = [];
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

    // Step 2: Insert fake customers into the database
    for (const customer of fakeCustomers) {
      await db.insert(CustomersTable).values(customer);
    }

    // Step 3: Generate fake orders
    const fakeOrders = [];
    for (let i = 0; i < numOrders; i++) {
      const customer =
        fakeCustomers[Math.floor(Math.random() * fakeCustomers.length)];
      const numProducts = Math.floor(Math.random() * 5) + 1; // 1 to 5 products
      const orderProducts = [];
      for (let j = 0; j < numProducts; j++) {
        const product =
          insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
          if(product===undefined || customer===undefined){
            console.log("product or customer is undefined");
            continue;
          }
        orderProducts.push({
          productId: product.id,
          quantity: Math.floor(Math.random() * 10) + 1, // 1 to 10 units
          price: product.price, // Use current price for simplicity
        });
      }
      if(customer===undefined){
        console.log("customer is undefined");
        continue;
      }
      fakeOrders.push({
        customerPhone: customer.phone,
        address: customer.address,
        notes: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        status: orderStatus[Math.floor(Math.random() * orderStatus.length)] as OrderStatusType,
        paymentStatus:
          paymentStatus[Math.floor(Math.random() * paymentStatus.length)] as PaymentStatusType,
        isNewCustomer: false, // Customers are pre-inserted
        products: orderProducts,
        createdAt: faker.date.past({ years: 0.1 }), // Random date in the past ~30 days
      });
    }

    // Step 4: Sort fake orders by createdAt to maintain chronological order
    fakeOrders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Step 5: Add orders sequentially using addOrder
    for (const order of fakeOrders) {
      setTimeout(async () => {
        await addOrder(order, order.createdAt);
      }, 1000);
    }

    console.log(`${numOrders} fake orders seeded successfully.`);
  } catch (error) {
    console.error("Error seeding fake orders:", error);
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    // Add brands
    for (const brand of brandsData) {
      await addBrand(brand);
    }

    // Add categories
    for (const category of categoriesData) {
      await addCategory(category);
    }
    revalidateTag("brandCategory");

    // Add products with initial stock set to 0
    const insertedProducts: { id: number; stock: number; price: number }[] = [];
    for (const product of productsData) {
      const productResult = await db
        .insert(ProductsTable)
        .values({
          name: product.name,
          slug: product.name.replace(/\s+/g, "-").toLowerCase(),
          description: product.description,
          discount: 0,
          amount: product.amount,
          potency: product.potency,
          stock: 0, // Set initial stock to 0
          price: product.price,
          dailyIntake: product.dailyIntake,
          categoryId: product.categoryId,
          brandId: product.brandId,
          status: "active",
        })
        .returning({ id: ProductsTable.id });

      if (productResult[0]) {
        const productId = productResult[0].id;
        // Store product details for purchases
        insertedProducts.push({
          id: productId,
          stock: product.stock,
          price: product.price,
        });

        // Add images directly to database
        const imagePromises = product.images.map((image, index) =>
          db.insert(ProductImagesTable).values({
            productId: productId,
            url: image.url,
            isPrimary: index === 0 ? true :false , // Use 1/0 for SQLite boolean
          }),
        );
        await Promise.all(imagePromises);
      }
    }

    // Add purchasing data to set initial stock
    await db.transaction(async (tx) => {
      for (const insertedProduct of insertedProducts) {
        const unitCost = Math.floor(0.7 * insertedProduct.price); // 70% of selling price
        await tx.insert(PurchasesTable).values({
          productId: insertedProduct.id,
          quantityPurchased: insertedProduct.stock,
          unitCost: unitCost,
        });

        // Update stock by adding the purchased quantity
        await tx
          .update(ProductsTable)
          .set({
            stock: sql`${ProductsTable.stock} + ${insertedProduct.stock}`,
          })
          .where(eq(ProductsTable.id, insertedProduct.id));
      }
    });

    // Add orders
    console.log("Starting to seed orders...");
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Existing delay
    try{
      await seedFakeOrders(100, insertedProducts);
    }
    catch(error){
      console.error("Error seeding fake orders:", error);
    }

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
};