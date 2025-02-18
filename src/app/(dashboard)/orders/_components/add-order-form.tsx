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
import { orderStatus, paymentStatus, status } from "@/lib/constants";
import { addOrder } from "@/server/actions/order";

const AddOrderForm = () => {
  const [action] = useAction(addOrder);

  return (
    <div className="mx-auto w-full max-w-6xl bg-background p-4 sm:p-6 lg:p-8">
      <FormWrapper
        formAction={action}
        schema={addOrderSchema}
        className="space-y-8"
      >
        {(form) => (
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
                <h3 className="mb-4 text-xl font-semibold">Pricing & Stock</h3>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.01}
                          placeholder="Enter price"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter stock quantity"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="potency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Potency</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 100mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 30 capsules" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dailyIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Intake</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter daily intake"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end lg:col-span-2">
              <SubmitButton
                isPending={form.formState.isSubmitting}
                className="w-full px-8 py-3 text-lg font-semibold transition-colors duration-300 hover:bg-primary/90 sm:w-auto"
              >
                Add Product
              </SubmitButton>
            </div>
          </div>
        )}
      </FormWrapper>
    </div>
  );
};

export default AddOrderForm;
