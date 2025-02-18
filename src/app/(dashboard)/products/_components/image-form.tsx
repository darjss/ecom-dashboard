"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldArray, type UseFormReturn, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { XIcon, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";


interface Image {
  url: string;
  id?: number;
}

export const AddImageForm = ({
  form,
  isEdit,
}: {
  form: UseFormReturn<any>;
  isEdit: boolean;
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });
  const watchedImages: Image[] = useWatch({
    control: form.control,
    name: "images",
  });

  useEffect(() => {
    const nonEmptyImages = watchedImages.filter((img) => img.url);
    if (fields.length <= nonEmptyImages.length) {
      append({ url: "" });
    }
  }, [watchedImages, append, fields.length]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id}>
            <FormField
              control={form.control}
              name={`images.${index}.url`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Image URL"
                        {...field}
                        className="flex-grow"
                      />
                      {index !== fields.length - 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="transition-colors duration-300 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEdit && (
              <FormField
                control={form.control}
                name={`images.${index}.id`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} className="hidden" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {watchedImages.map((image, index) => {
          if (!image || !image.url || index === fields.length - 1) {
            return null;
          }
          return (
            <Card
              key={`image-${index}-${image.url}`}
              className="group relative overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-0">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-10 w-10 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                    onClick={() => remove(index)}
                  >
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {fields.length === 1 && !watchedImages[0]?.url && (
          <Card
            className="flex h-40 cursor-pointer items-center justify-center bg-muted transition-colors duration-300 hover:bg-muted/80"
            onClick={() => form.setFocus("images.0.url")}
          >
            <CardContent>
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Add an image</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Add your new image upload implementation here */}
      <Button
        type="button"
        className="bnt-playful"
        onClick={() => {
          // Implement your new image upload logic here
        }}
      >
        Upload Image
      </Button>
    </div>
  );
};
