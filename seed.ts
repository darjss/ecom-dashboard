"use server";

import { BrandInsertType, CategoryInsertType } from "@/server/db/schema";
import { addProductType } from "@/lib/zod/schema";
import { addBrand } from "@/server/actions/brand";
import { addCategory } from "@/server/actions/category";
import { addProduct } from "@/server/actions/product";

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
