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
import { BrandType, CategoryType, ProductType } from "@/lib/types";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { Dispatch, JSX, SetStateAction, useState } from "react";
import EditProductForm from "./edit-product-form";

interface RowActionProps {
  id: number;
  renderEditComponent: (props: {
    setDialogOpen: Dispatch<SetStateAction<boolean>>;
  }) => JSX.Element;
  deleteFunction: (id: number) => Promise<
    | {
        message: string;
        error?: undefined;
      }
    | {
        message: string;
        error: unknown;
      }
  >;
}

const rowActions = ({
  id,
  renderEditComponent,
  deleteFunction,
}: RowActionProps) => {
  const [isDeleteAlertOpen, setIsDelteAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteAction, isDelLoading] = useAction(deleteFunction);
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
            {renderEditComponent({ setDialogOpen: setIsEditDialogOpen })}
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
                <Button variant={"neutral"}>Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <SubmitButton
                  variant={"destructive"}
                  isPending={isDelLoading}
                  onClick={() => deleteAction(id)}
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
