"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import CategoryForm from "./category-form";
import type { CategorySelectType } from "@/server/db/schema";
import RowActions from "./row-actions";
import { deleteCategory } from "@/server/actions/category";
import { Card, CardContent } from "@/components/ui/card";

interface CategoriesClientProps {
  categories: CategorySelectType[];
}

export default function CategoriesClient({
  categories,
}: CategoriesClientProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Categories
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] w-[95%] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <CategoryForm setDialogOpen={setIsAddDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile View */}
      <div className="grid gap-4 sm:hidden">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-medium">{category.name}</h3>
                <RowActions
                  id={category.id}
                  renderEditComponent={(props) => (
                    <CategoryForm category={category} {...props} />
                  )}
                  deleteFunction={deleteCategory}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden rounded-md border sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-3 pl-4 text-left text-sm font-medium">Name</th>
              <th className="w-[100px] py-3 pl-4 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b">
                <td className="py-3 pl-4">{category.name}</td>
                <td className="py-3 pl-4">
                  <RowActions
                    id={category.id}
                    renderEditComponent={(props) => (
                      <CategoryForm category={category} {...props} />
                    )}
                    deleteFunction={deleteCategory}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
