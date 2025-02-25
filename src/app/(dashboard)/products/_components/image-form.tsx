"use client"

import { useEffect, useCallback } from "react"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFieldArray, type UseFormReturn, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { XIcon, ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { UploadButton } from "@/components/upload-button"
import { type imageType, imageSchema } from "@/lib/zod/schema"
import { debounce } from "lodash"

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const AddImageForm = ({
  form,
  isEdit,
}: {
  form: UseFormReturn<{ images: imageType[] }>
  isEdit: boolean
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  })

  const watchedImages = useWatch({
    control: form.control,
    name: "images",
  })

  // Initialize with one empty field if no fields exist
  useEffect(() => {
    if (fields.length === 0) {
      append({ url: "" })
    }
  }, [fields.length, append])

  const debouncedAppend = useCallback(
    debounce(() => {
      append({ url: "" })
    }, 100),
    [],
  )

  // Handle URL validation and new field appending
  useEffect(() => {
    const lastImage = watchedImages[watchedImages.length - 1]

    if (lastImage?.url && isValidUrl(lastImage.url)) {
      const validationResult = imageSchema.safeParse(lastImage)

      if (validationResult.success) {
        const allPreviousFieldsHaveValidUrls = watchedImages
          .slice(0, -1)
          .every((img) => img?.url && isValidUrl(img.url) && imageSchema.safeParse(img).success)

        if (allPreviousFieldsHaveValidUrls) {
          debouncedAppend()
        }
      }
    }
  }, [watchedImages, debouncedAppend])

  const handleRemove = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    } else {
      // If it's the last field, clear the URL instead of removing
      form.setValue(`images.${index}.url`, "")
    }
  }

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
                      <Input placeholder="Image URL" {...field} className="flex-grow" />
                      {(index !== fields.length - 1 || fields.length > 1) && (
                        <Button
                          type="button"
                          variant="neutral"
                          size="icon"
                          onClick={() => handleRemove(index)}
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
            return null
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
                    onClick={() => handleRemove(index)}
                  >
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
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
      <UploadButton append={append} />
    </div>
  )
}

