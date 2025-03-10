"use server";
import "server-only";
import { addImageType } from "@/lib/zod/schema";
import { db } from "../db";
import { ProductImageInsertType, ProductImagesTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { SQLiteNumericBuilderInitial } from "drizzle-orm/sqlite-core";

export const addImage = async (image: ProductImageInsertType) => {
  try {
    await db.insert(ProductImagesTable).values(image);
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
  return { message: "Successfully added product" };
};
export const uploadImagesFromUrl = async (images: ProductImageInsertType[]) => {
  try {
    const imageUrls = images.map((image) => ({ url: image.url }));

    const response = await fetch(
      process.env.BACKEND_URL + "/upload/image/urls",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imageUrls),
      },
    );
    console.log(response.body);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Image upload failed:",
        response.status,
        response.statusText,
        errorText,
      );
      throw new Error(
        `Image upload failed: ${response.status} ${response.statusText} ${errorText}`,
      );
    }

    const uploadedImages = (await response.json()) as {
      images: { url: string }[];
      status: string;
      time: number;
    };

    const addImagePromises = uploadedImages.images.map(
      (uploadedImage, index) => {
        return addImage({
          ...images[index],
          url: uploadedImage.url,
        } as ProductImageInsertType);
      },
    );

    return await Promise.all(addImagePromises);
  } catch (e) {
    console.error("Error in uploadImagesFromUrl:", e);
    return { message: "Operation failed", error: e };
  }
};
export const updateImage = async (
  newImages: addImageType,
  productId: number,
) => {
  try {
    const existingImages = await db
      .select({
        id: ProductImagesTable.id,
        url: ProductImagesTable.url,
      })
      .from(ProductImagesTable)
      .where(eq(ProductImagesTable.productId, productId));
    console.log("existing", existingImages);
    console.log("updated", newImages);
    let isDiff: boolean = false;
    if (newImages.length != existingImages.length) {
      isDiff = true;
    } else {
      const sortedNewImages = newImages.toSorted((a, b) =>
        a.url.localeCompare(b.url),
      );
      const sortedExistingImages = existingImages.toSorted((a, b) =>
        a.url.localeCompare(b.url),
      );
      for (let i = 0; i < newImages.length; i++) {
        if (sortedNewImages[i]?.url !== sortedExistingImages[i]?.url) {
          isDiff = true;
        }
      }
    }
    if (isDiff) {
      const deletePromises = existingImages.map((image) =>
        db
          .delete(ProductImagesTable)
          .where(eq(ProductImagesTable.id, image.id)),
      );
      Promise.allSettled(deletePromises);
      const insertPromises = newImages.map((image, index) =>
        addImage({
          productId: productId,
          url: image.url,
          isPrimary: index === 0 ? true : false,
        }),
      );
      Promise.allSettled(insertPromises);
    }
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};
