"use client";

import { useState } from "react";
import { Edit, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { BrandType, CategoryType, ProductType } from "@/lib/types";
import { deleteProduct, setProductStock } from "@/server/actions/product";
import withEditForm from "./edit-product-form";
import RowActions from "./row-actions";

interface ProductCardProps {
  product: ProductType;
  brands: BrandType;
  categories: CategoryType;
}

const ProductCard = ({
  product,
  brands,
  categories,
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
    setProductStock(product.id, stockValue);
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
    <Card className="overflow-hidden shadow-sm hover:shadow">
      <CardContent className="p-0">
        <div className="flex flex-row">
          {/* Image container with modest enhancements */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center border-r bg-gray-50 p-2 sm:h-24 sm:w-24">
            <div className="h-full w-full overflow-hidden rounded-md border border-gray-200 bg-white">
              <img
                src={primaryImage || "/placeholder.jpg"}
                alt={product.name}
                className="h-full w-full object-contain p-1"
                loading="lazy"
              />
            </div>
          </div>

          {/* Content container */}
          <div className="flex flex-1 flex-col p-2 sm:p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-sm font-medium sm:text-base">
                  {product.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  {brand?.name && <span>{brand.name}</span>}
                  {brand?.name && category?.name && <span>•</span>}
                  {category?.name && <span>{category.name}</span>}
                </div>
              </div>
              <Badge
                className={`${getStatusColor(product.status)} whitespace-nowrap border px-1.5 py-0.5 text-xs`}
              >
                {product.status.replace("_", " ")}
              </Badge>
            </div>

            {/* Price and stock info */}
            <div className="mt-1 flex items-center gap-3">
              <div className="font-medium text-gray-900">
                ${product.price.toFixed(2)}
              </div>
              <div
                className={`flex items-center ${getStockColor(product.stock)}`}
              >
                <Package className="mr-1 h-3.5 w-3.5" />
                <span className="text-sm font-medium">{product.stock}</span>
                <span className="ml-1 text-xs sm:text-sm">in stock</span>
              </div>
            </div>

            {/* Actions row */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    className="h-7 w-20 text-center text-xs"
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
                    className="h-7 px-2 text-xs"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant="reverse"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 px-2 text-xs"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit Stock
                </Button>
              )}

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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;