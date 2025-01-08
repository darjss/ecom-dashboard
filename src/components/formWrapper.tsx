"use client";

import { ReactNode, useCallback } from "react";
import {
  useForm,
  UseFormReturn,
  SubmitHandler,
  SubmitErrorHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodObject, ZodSchema, ZodTypeAny } from "zod";
import { Form } from "@/components/ui/form";
import { QueryFunction } from "@/hooks/use-action";
import { toast } from "sonner";

interface FormWrapperProps<T extends ZodSchema> {
  formAction: QueryFunction<any[], any>;
  schema: T;
  children: (methods: UseFormReturn<any>) => ReactNode;
  className?: string;
  onSubmit?: (data: any) => void;
}

const generateDefaultValues = (schema: ZodSchema) => {
  if (!(schema instanceof ZodObject)) {
    throw new Error("Schema must be a ZodObject");
  }
  const shape = schema.shape;
  const defaultValues: Record<string, any> = {};

  Object.keys(shape).forEach((key) => {
    const fieldSchema = shape[key] as ZodTypeAny;

    if (fieldSchema._def.typeName === "ZodString") {
      defaultValues[key] = "";
    } else if (fieldSchema._def.typeName === "ZodNumber") {
      defaultValues[key] = 0;
    } else if (fieldSchema._def.typeName === "ZodBoolean") {
      defaultValues[key] = false;
    } else if (fieldSchema._def.typeName === "ZodOptional") {
      defaultValues[key] = null;
    } else if (fieldSchema._def.typeName === "ZodArray") {
      defaultValues[key] = [];
    } else {
      defaultValues[key] = null;
    }
  });

  return defaultValues;
};

export function FormWrapper<T extends ZodSchema>({
  formAction,
  schema,
  children,
  className,
  onSubmit,
}: FormWrapperProps<T>) {
  const defaultValues = generateDefaultValues(schema);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const onValidSubmit: SubmitHandler<any> = useCallback(
    async (data) => {
      try {
        console.log("Form data (valid submission):", data);
        const result = await formAction(data);
        console.log("Form submission result:", result);
        if (result && typeof result === "object" && "message" in result) {
          toast.success(result.message);
        }
        if (onSubmit) {
          onSubmit(data);
        }
        form.reset();
      } catch (error) {
        console.error("Form submission error:", error);
        console.log(form.getValues)
        toast.error("An error occurred while submitting the form");
      }
    },
    [formAction, form, onSubmit],
  );

  const onInvalidSubmit: SubmitErrorHandler<any> = useCallback((errors) => {
    const formValues=form.watch();
  console.log(formValues);
    console.log("Form validation errors:", errors);
    toast.error("Please correct the errors in the form");
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)}
        className={className}
      >
        {children(form)}
      </form>
    </Form>
  );
}
