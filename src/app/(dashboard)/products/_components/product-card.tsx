"use client";

import { useState } from "react";
import { Edit, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { BrandType, CategoryType, ProductType } from "@/lib/types";
import { deleteProduct } from "@/server/actions/product";
import withEditForm from "./edit-product-form";
import RowActions from "./row-actions";

interface ProductCardProps {
  product: ProductType;
  brands: BrandType;
  categories: CategoryType;
  onUpdateStock: (id: number, newStock: number) => void;
}

const ProductCard = ({
  product,
  brands,
  categories,
  onUpdateStock,
}: ProductCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stockValue, setStockValue] = useState(product.stock);

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "/placeholder.jpg";
  const brand = brands.find((b) => b.id === product.brandId);
  const category = categories.find((c) => c.id === product.categoryId);

  const handleSave = () => {
    onUpdateStock(product.id, stockValue);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-300";
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800 border-red-300";
      case "DISCONTINUED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getStockColor = (stock: number) => {
    if (stock > 10) return "text-green-600";
    if (stock > 0) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="bg-bg p-4">
        <div className="flex flex-row">
          {/* Image container - always on left side */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-muted/10 p-2">
            <img
              src={primaryImage || "/placeholder.jpg"}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>

          {/* Content container */}
          <div className="flex flex-1 flex-col p-3 sm:p-4">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-base font-medium">
                  {product.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  {brand?.name && <span>{brand.name}</span>}
                  {brand?.name && category?.name && <span>•</span>}
                  {category?.name && <span>{category.name}</span>}
                </div>
              </div>
              <Badge
                className={`${getStatusColor(product.status)} shrink-0 whitespace-nowrap border text-xs`}
              >
                {product.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
              {/* Stock section - now more prominent */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center ${getStockColor(product.stock)}`}
                >
                  <Package className="mr-1 h-4 w-4" />
                  <span className="text-base font-medium">{product.stock}</span>
                  <span className="ml-1 font-medium">in stock</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)}
                </div>
              </div>
              <div>
                {isEditing ? (
                  <div className="mt-2 flex items-center gap-1 sm:mt-0">
                    <Input
                      className="h-7 w-24 text-center"
                      value={stockValue}
                      type="number"
                      min="0"
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? 0
                            : Number.parseInt(e.target.value);
                        setStockValue(Math.max(0, value));
                      }}
                    />

                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="ml-1 h-7 text-xs"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-4 sm:mt-0">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-7 px-2 text-xs"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit Stock
                    </Button>
                    <RowActions
                      id={product.id}
                      renderEditComponent={withEditForm(
                        product,
                        categories,
                        brands,
                      )}
                      deleteFunction={deleteProduct}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
