"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addOrderSchema } from "@/lib/zod/schema";
import { useAction } from "@/hooks/use-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormWrapper } from "@/components/form-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import SubmitButton from "@/components/submit-button";
import { orderStatus, paymentStatus } from "@/lib/constants";
import { addOrder } from "@/server/actions/order";
import { ProductType } from "@/lib/types";
import { SelectProductForm } from "./select-product-form";
import { useEffect } from "react";
import { getCustomerByPhone } from "@/server/actions/customer";
import { UseFormReturn } from "react-hook-form";

const AddOrderForm = ({ products }: { products: ProductType[] }) => {
  const [action] = useAction(addOrder);

  const handlePhoneChange = async (phone: number, form: UseFormReturn<any>) => {
    const result = await getCustomerByPhone(phone);
    console.log(result);
    if (result.length > 0) {
      form.setValue("isNewCustomer", false);
      form.setValue("address", result[0]?.address);
    } else {
      form.setValue("isNewCustomer", true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl bg-background p-4 sm:p-6 lg:p-8">
      <FormWrapper
        formAction={action}
        schema={addOrderSchema}
        className="space-y-8"
      >
        {(form) => {
          const phone: string = form.watch("customerPhone");
          console.log(form.watch("customerPhone"));
          useEffect(() => {
            console.log(
              "useeffect run",
              phone.length === 8 && phone.match("^[6-9]\d{7}$"),
            );
            if (phone.length === 8 ) {
              handlePhoneChange(Number.parseInt(phone), form);
            }
          }, [form.watch("customerPhone")]);
          return (
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
              <Card className="overflow-auto shadow-md transition-shadow duration-300 hover:shadow-lg">
                <CardContent className="space-y-4 p-6">
                  <h3 className="mb-4 text-xl font-semibold">
                    Add Order Details
                  </h3>
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input placeholder="9999999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Address"
                            {...field}
                            className="h-20 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Order status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {orderStatus.map((status, index) => (
                              <SelectItem key={index} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Payment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentStatus.map((status, index) => (
                              <SelectItem key={index} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
                <CardContent className="space-y-4 p-6">
                  <h3 className="mb-4 text-xl font-semibold">Products</h3>
                  <SelectProductForm products={products} form={form} />
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end lg:col-span-2">
                <SubmitButton
                  isPending={form.formState.isSubmitting}
                  className="w-full px-8 py-3 text-lg font-semibold transition-colors duration-300 hover:bg-primary/90 sm:w-auto"
                >
                  Add Order
                </SubmitButton>
              </div>
            </div>
          );
        }}
      </FormWrapper>
    </div>
  );
};

export default AddOrderForm;
