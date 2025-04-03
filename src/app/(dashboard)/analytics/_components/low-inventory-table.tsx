import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface LowInventoryItem {
  productId: number;
  name: string;
  stock: number;
  status: string;
  imageUrl: string;
  price: number;
}

interface LowInventoryTableProps {
  data: LowInventoryItem[];
}

export function LowInventoryTable({ data }: LowInventoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.productId}>
            <TableCell className="flex items-center gap-3">
              <div className="relative h-12 w-12">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <span className="font-medium">{item.name}</span>
            </TableCell>
            <TableCell>{item.stock}</TableCell>
            <TableCell>
              <Badge
                variant={
                  item.status === "Out of Stock"
                    ? "default"
                    : item.status === "Low Stock"
                    ? "neutral"
                    : "default"
                }
              >
                {item.status}
              </Badge>
            </TableCell>
            <TableCell>₹{item.price}</TableCell>
          </TableRow>
          ))}
        </TableBody>
    </Table>
  );
}