import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Package } from "lucide-react";


const TopProductsList = ({
  products,
  period,
}: {
  products: Array<{
    productId: number;
    name: string | null;
    imageUrl: string | null;
    totalSold: number;
  }>;
  period: string;
}) => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4 text-primary" />
          Top Products
        </CardTitle>
        <CardDescription>Best sellers {period.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow px-2">
        <ScrollArea className="h-[280px] px-2">
          <div className="space-y-3">
            {products.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div className="relative mr-3 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {product.name || "Unnamed Product"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.totalSold} sold
                  </p>
                </div>
                <Badge variant="default" className="ml-2">
                  {product.totalSold}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="default" size="sm" className="w-full">
          View All Products
        </Button>
      </CardFooter>
    </Card>
  );
};
export default TopProductsList;