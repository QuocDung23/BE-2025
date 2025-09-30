import { Schema, z } from "zod";

export interface HttpResponseBodySuccessDto<T> {
    data: T,
    totalPage?: number
}

export const HttpResponseBodySuccessDtoSchema = <T extends z.ZodTypeAny>(dataSchema: T | null) => z.object({
    data: dataSchema ? dataSchema.optional() : z.null(),
    totalPage: z.number()
})