import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { ServiceResponseSchema } from '../common';
import { HttpResponseBodySuccessDtoSchema } from '../common/dtos/http.ResponseBodySuccess.dto';


/**
 * Build an OpenAPI response entry for a given HTTP status containing a JSON media type whose schema is wrapped by ServiceResponseSchema.
 *
 * @param schema - A Zod schema for the response body, or `null` to indicate no specific body schema.
 * @param description - Human-readable description of the response.
 * @param statusCode - HTTP status code to key the response under (defaults to 200).
 * @returns An object mapping the provided `statusCode` to an OpenAPI response object with `description` and `application/json` content using the wrapped schema.
 */
export function createApiResponse(schema: z.ZodTypeAny | null, description: string, statusCode = StatusCodes.OK) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: ServiceResponseSchema(schema),
        },
      },
    },
  };
}