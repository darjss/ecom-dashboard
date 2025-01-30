"use server";
import { addProduct, addBrand, addCategory } from "@/server/queries";
import { BrandInsertType, CategoryInsertType } from "@/server/db/schema";
import { addProductType } from "@/lib/zod/schema";

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
      { url: "https://example.com/product1_image1.jpg" },
      { url: "https://example.com/product1_image2.jpg" },
      { url: "" }, // Empty string at the end
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
      { url: "https://example.com/product2_image1.jpg" },
      { url: "https://example.com/product2_image2.jpg" },
      { url: "" },
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
      { url: "https://example.com/product3_image1.jpg" },
      { url: "https://example.com/product3_image2.jpg" },
      { url: "" },
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
      { url: "https://example.com/product4_image1.jpg" },
      { url: "https://example.com/product4_image2.jpg" },
      { url: "" },
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
      { url: "https://example.com/product5_image1.jpg" },
      { url: "https://example.com/product5_image2.jpg" },
      { url: "" },
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
      { url: "https://example.com/product6_image1.jpg" },
      { url: "https://example.com/product6_image2.jpg" },
      { url: "" },
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
      { url: "https://example.com/product7_image1.jpg" },
      { url: "https://example.com/product7_image2.jpg" },
      { url: "" },
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
      { url: "https://example.com/product8_image1.jpg" },
      { url: "https://example.com/product8_image2.jpg" },
      { url: "" },
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
      { url: "https://example.com/product9_image1.jpg" },
      { url: "https://example.com/product9_image2.jpg" },
      { url: "" },
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
      { url: "https://example.com/product10_image1.jpg" },
      { url: "https://example.com/product10_image2.jpg" },
      { url: "" },
    ],
    status: "active",
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

    // Add products
    for (const product of productsData) {
      await addProduct(product);
    }

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
};
