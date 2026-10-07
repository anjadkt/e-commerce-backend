import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string = 'Success',
    data?: T,
    statusCode: number = 200,
    pagination?: PaginationMeta
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(pagination && { pagination }),
    });
  }

  static created<T>(res: Response, message: string = 'Created successfully', data?: T) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }
}
