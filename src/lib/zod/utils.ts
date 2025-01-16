import {
  z,
  ZodSchema,
  ZodObject,
  ZodTypeAny,
  ZodArray,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodOptional,
} from "zod";

export const generateDefaultValues = (schema: ZodSchema) => {
  if (!(schema instanceof ZodObject)) {
    throw new Error("Schema must be a ZodObject");
  }

  const shape = schema.shape;
  const defaultValues: Record<string, any> = {};

  Object.keys(shape).forEach((key) => {
    const fieldSchema = shape[key] as ZodTypeAny;

    if (fieldSchema instanceof ZodString) {
      defaultValues[key] = "";
    } else if (fieldSchema instanceof ZodNumber) {
      defaultValues[key] = 0;
    } else if (fieldSchema instanceof ZodBoolean) {
      defaultValues[key] = false;
    } else if (fieldSchema instanceof ZodOptional) {
      defaultValues[key] = undefined;
    } else if (fieldSchema instanceof ZodArray) {
      const elementSchema = fieldSchema.element;

      if (elementSchema instanceof ZodObject) {
        // Handle arrays of objects
        const objectShape = elementSchema.shape;
        const defaultObject: Record<string, any> = {};

        Object.keys(objectShape).forEach((objectKey) => {
          const objectFieldSchema = objectShape[objectKey] as ZodTypeAny;

          if (objectFieldSchema instanceof ZodString) {
            defaultObject[objectKey] = "";
          } else if (objectFieldSchema instanceof ZodNumber) {
            defaultObject[objectKey] = 0;
          } else if (objectFieldSchema instanceof ZodBoolean) {
            defaultObject[objectKey] = false;
          } else {
            defaultObject[objectKey] = undefined;
          }
        });

        defaultValues[key] = [defaultObject];
      } else {
        defaultValues[key] = [];
      }
    } else if (fieldSchema instanceof ZodObject) {
      // Recursively handle nested objects
      defaultValues[key] = generateDefaultValues(fieldSchema);
    } else {
      defaultValues[key] = undefined;
    }
  });

  return defaultValues;
};
