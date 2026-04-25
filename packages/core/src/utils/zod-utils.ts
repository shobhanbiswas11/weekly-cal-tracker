import { z } from "zod";

/**
 * Extracts field metadata from a Zod object schema in a compact format.
 * Useful for generating documentation or prompts with schema information.
 *
 * Format: `fieldName(type,opt?):description`
 * Types: num = number, str = string, dt = datetime, ? = unknown
 *
 * @example
 * const schema = z.object({ name: z.string(), age: z.number().optional() });
 * describeSchema(schema);
 * // Returns: "name(str); age(num,opt)"
 */
export function describeSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): string {
  return Object.entries(schema.shape)
    .map(([key, fieldSchema]) => {
      const zodSchema = fieldSchema as z.ZodTypeAny;
      const isOptional = zodSchema.safeParse(undefined).success;
      const innerSchema = isOptional
        ? (zodSchema as z.ZodOptional<z.ZodTypeAny>).unwrap()
        : zodSchema;

      const type = getZodTypeShortName(innerSchema);
      const desc = innerSchema.description ?? "";

      // Format: key(type,opt?):desc
      return `${key}(${type}${isOptional ? ",opt" : ""})${desc ? ":" + desc : ""}`;
    })
    .join("; ");
}

/**
 * Returns a short type name for a Zod schema.
 */
function getZodTypeShortName(schema: z.ZodTypeAny): string {
  if (schema instanceof z.ZodNumber) return "num";
  if (schema instanceof z.ZodString) return "str";
  if (schema instanceof z.ZodBoolean) return "bool";
  if (schema instanceof z.ZodArray) return "arr";
  if (schema instanceof z.ZodObject) return "obj";
  if (schema instanceof z.ZodEnum) return "enum";
  // For branded/refined types, check the base type
  if (schema.def && "typeName" in schema.def) {
    const typeName = (schema.def as { typeName?: string }).typeName;
    if (typeName === "ZodString") return "dt";
  }
  return "?";
}

/**
 * Extracts field names from a Zod object schema.
 */
export function getSchemaFieldNames<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): string[] {
  return Object.keys(schema.shape);
}

/**
 * Checks if a field is optional in a Zod schema.
 */
export function isFieldOptional(schema: z.ZodTypeAny): boolean {
  return schema.safeParse(undefined).success;
}
