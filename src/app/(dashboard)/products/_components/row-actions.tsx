"use client";
import SubmitButton from "@/components/submit-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAction } from "@/hooks/use-action";
import {
  BrandType,
  CategoryType,
  deleteProduct,
  ProductType,
} from "@/server/queries";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import EditProductForm from "./edit-product-form";

interface RowActionProps {
  categories: CategoryType;
  brands: BrandType;
  product:ProductType
}

const rowActions = ({ product, categories, brands }: RowActionProps) => {
  const [isDeleteAlertOpen, setIsDelteAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteAction, isDelLoading] = useAction(deleteProduct);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsEditDialogOpen(true);
              }}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] w-[90%] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit product</DialogTitle>
            </DialogHeader>

            <EditProductForm
              product={product}
              brands={brands}
              categories={categories}
              setDialogOpen={setIsEditDialogOpen}
            />
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={isDeleteAlertOpen}
          onOpenChange={setIsDelteAlertOpen}
        >
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="hover:bg-red-500 hover:text-white"
              onSelect={(e) => {
                e.preventDefault();
                setIsDelteAlertOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this product?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-4">
              <AlertDialogCancel asChild>
                <Button variant={"outline"}>Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <SubmitButton
                  variant={"destructive"}
                  isPending={isDelLoading}
                  onClick={() => deleteAction(product.id)}
                >
                  Delete
                </SubmitButton>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default rowActions;
