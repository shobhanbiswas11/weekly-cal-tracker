import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const client = new SSMClient({});
const cache = new Map<string, string>();

/**
 * Fetches a SecureString parameter from SSM Parameter Store.
 * Results are cached for the lifetime of the Lambda execution environment (across warm invocations).
 */
export async function getSecret(name: string): Promise<string> {
  const cached = cache.get(name);
  if (cached) return cached;

  const result = await client.send(
    new GetParameterCommand({ Name: name, WithDecryption: true }),
  );

  const value = result.Parameter?.Value;
  if (!value) {
    throw new Error(`SSM parameter "${name}" not found or empty`);
  }

  cache.set(name, value);
  return value;
}
