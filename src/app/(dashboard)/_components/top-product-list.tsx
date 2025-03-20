import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  productId: number;
  name: string | null;
  imageUrl: string | null;
  totalSold: number;
}

interface TopProductsListProps {
  products: Product[];
  period: string;
}

const TopProductsList: React.FC<TopProductsListProps> = ({
  products,
  period,
}) => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Top Selling Products</CardTitle>
          </div>
          <Badge variant="neutral" className="ml-auto">
            {period}
          </Badge>
        </div>
        <CardDescription>Products with highest sales volume</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow px-0">
        <ScrollArea className="h-[320px] px-6">
          <div className="space-y-4">
            {products.length > 0 ? (
              products.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 font-semibold text-primary">
                    {index + 1}
                  </div>

                  <div className="relative h-14 w-14 overflow-hidden rounded-md border">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name || "Product image"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                    {product.name || "Unnamed Product"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.totalSold} sold
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <Package className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No products data</p>
                <p className="text-xs text-muted-foreground">
                  No sales recorded for this period
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href="/products" className="w-full">
          <Button variant="default" size="sm" className="w-full">
            View All Products
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TopProductsList;
