import {NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodSchema } from 'zod';
import { HttpResponseBodySuccessDto } from './http.ResponseBodySuccess.dto';
import { HTTPException } from '@tsed/exceptions';

export class HttpResponse {
    async success<T>(data: HttpResponseBodySuccessDto<T>, res: Response){
        return res.status(StatusCodes.OK).json(data)
    }

    async created<T>(data: HttpResponseBodySuccessDto<T>, res: Response) {
        return res.status(StatusCodes.CREATED).json(data)
    }

    async exception(exception: HTTPException, res: Response) {
        return res.status(exception.status).json({
            status: exception.status,
            messenger: exception.message
        })
    }
}

export default new HttpResponse();