
import { ZodObject, ZodSchema, ZodTypeAny } from "zod";

export const generateDefaultValues = (schema: ZodSchema) => {
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