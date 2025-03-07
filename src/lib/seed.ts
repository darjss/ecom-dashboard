"use server";
import "server-only";
import { BrandInsertType, CategoryInsertType, ProductImagesTable, ProductsTable } from "@/server/db/schema";
import { addProductType } from "@/lib/zod/schema";
import { addBrand } from "@/server/actions/brand";
import { addCategory } from "@/server/actions/category";
import { addProduct } from "@/server/actions/product";
import { revalidateTag } from "next/cache";
import { addOrder } from "@/server/actions/order";
import { db } from "@/server/db";

// Sample data for brands
const brandsData: BrandInsertType[] = [
  { name: "NOW Foods", logoUrl: "https://example.com/now_foods_logo.jpg" },
  {
    name: "Nature's Best",
    logoUrl: "https://example.com/natures_best_logo.jpg",
  },
  {
    name: "Microingredients",
    logoUrl: "https://example.com/microingredients_logo.jpg",
  },
  { name: "NutraCost", logoUrl: "https://example.com/nutracost_logo.jpg" },
  {
    name: "Doctor's Best",
    logoUrl: "https://example.com/doctors_best_logo.jpg",
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

// Seed function to populate the database
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
    // Add products
    for (const product of productsData) {
      // Create a modified version of the addProduct function that doesn't upload images
      const productResult = await db
        .insert(ProductsTable)
        .values({
          name: product.name,
          slug: product.name.replace(/\s+/g, "-").toLowerCase(),
          description: product.description,
          discount: 0,
          amount: product.amount,
          potency: product.potency,
          stock: product.stock,
          price: product.price,
          dailyIntake: product.dailyIntake,
          categoryId: product.categoryId,
          brandId: product.brandId,
          status: "active",
        })
        .returning();
        
      if (productResult[0]) {
        const productId = productResult[0].id;
        // Add images directly to database without uploading
        const imagePromises = product.images.map((image, index) => 
          db.insert(ProductImagesTable).values({
            productId: productId,
            url: image.url, // Use the URL directly without uploading
            isPrimary: index === 0 ? true : false,
          })
        );
        await Promise.all(imagePromises);
      }
    }

    // Wait a moment for the database to be ready after product inserts
    console.log("Starting to seed orders...");
    
    // Wait for products to fully finish processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Try with just the first order
    try {
        setTimeout(async () => {
          for (const order of ordersData) {
            await addOrder(order);
          }
            console.log("Orders seeded successly");
          }, 1500);
    } catch (error) {
      console.error("Error during order seeding:", error);
    }
    console.log("Orders seeded successfully");
    console.log("Database seeding delivered successly.");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
};
