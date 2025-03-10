"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
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
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { Dispatch, JSX, SetStateAction, useState } from "react";

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

const RowActions = ({
  id,
  renderEditComponent,
  deleteFunction,
}: RowActionProps) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteAction] = useAction(deleteFunction);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground sm:text-sm">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsEditDialogOpen(true);
              }}
              className="text-xs sm:text-sm"
            >
              <Edit2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] w-[95%] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Brand</DialogTitle>
            </DialogHeader>
            {renderEditComponent({ setDialogOpen: setIsEditDialogOpen })}
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={isDeleteAlertOpen}
          onOpenChange={setIsDeleteAlertOpen}
        >
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsDeleteAlertOpen(true);
              }}
              className="text-xs text-red-600 sm:text-sm"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[95%] sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base sm:text-lg">
                Are you sure?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await deleteAction(id);
                  setIsDeleteAlertOpen(false);
                }}
                className="h-8 bg-red-600 px-3 text-xs hover:bg-red-700 sm:h-9 sm:px-4 sm:text-sm"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RowActions;
