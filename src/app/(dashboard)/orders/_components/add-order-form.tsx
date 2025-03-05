"use client"

import { useEffect, useCallback } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { addOrderSchema } from "@/lib/zod/schema"
import { useAction } from "@/hooks/use-action"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormWrapper } from "@/components/form-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import SubmitButton from "@/components/submit-button"
import { orderStatus, paymentStatus } from "@/lib/constants"
import { addOrder } from "@/server/actions/order"
import type { ProductType } from "@/lib/types"
import { getCustomerByPhone } from "@/server/actions/customer"
import type { UseFormReturn } from "react-hook-form"
import SelectProductForm from "./select-product-form"

const AddOrderForm = ({ products }: { products: ProductType[] }) => {
  const [action] = useAction(addOrder)
  const [searchByPhone, isSearchByLoading] = useAction(getCustomerByPhone);

  const handlePhoneChange = useCallback(async (phone: number, form: UseFormReturn<any>) => {
    const result = await searchByPhone(phone);
    if (result.length > 0) {
      form.setValue("isNewCustomer", false)
      form.setValue("address", result[0]?.address, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    } else {
      form.setValue("isNewCustomer", true)
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl bg-background p-4 sm:p-6 md:max-w-4xl lg:max-w-5xl">
      <FormWrapper formAction={action} schema={addOrderSchema} className="space-y-6">
        {(form) => {
          const phone: string = form.watch("customerPhone")
          useEffect(() => {
            if (phone && phone.length === 8 && phone.match("^[6-9]\\d{7}$")) {
              handlePhoneChange(Number.parseInt(phone), form)
            }
          }, [phone, handlePhoneChange, form])

          return (
            <div className="space-y-6">
              <Card className="overflow-hidden shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-4 text-lg font-semibold text-primary">Customer Details</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="9999999" {...field} className="w-full" inputMode="tel" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Delivery Address</FormLabel>
                          <FormControl>
                            <Textarea disabled={isSearchByLoading} placeholder={isSearchByLoading?"Searching for delivery address ":"Enter delivery address"} {...field} className="h-20 resize-none" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-4 text-lg font-semibold text-primary">Order Details</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special instructions or notes"
                              {...field}
                              className="h-20 resize-none"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Order Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {orderStatus.map((status, index) => (
                                  <SelectItem key={index} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Payment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select payment status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {paymentStatus.map((status, index) => (
                                  <SelectItem key={index} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-4 text-lg font-semibold text-primary">Products</h3>
                  <SelectProductForm products={products} form={form} />
                </CardContent>
              </Card>

              <div className="sticky bottom-0 bg-background py-4">
                <SubmitButton
                  isPending={form.formState.isSubmitting}
                  className="w-full rounded-md px-6 py-3 text-base font-medium transition-colors duration-300 hover:bg-primary/90"
                >
                  Complete Order
                </SubmitButton>
              </div>
            </div>
          )
        }}
      </FormWrapper>
    </div>
  )
}

export default AddOrderForm

