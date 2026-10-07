import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class ProductController {
  static createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await ProductService.createProduct(req.body);
    return ApiResponse.created(res, 'Product created successfully', product);
  });

  static updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await ProductService.updateProduct(id, req.body);
    return ApiResponse.success(res, 'Product updated successfully', product);
  });

  static getProducts = asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user?.role === 'admin';
    const { products, pagination } = await ProductService.getProducts(req.query as any, isAdmin);
    return ApiResponse.success(res, 'Products retrieved successfully', products, 200, pagination);
  });

  static getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await ProductService.getProductById(id);
    return ApiResponse.success(res, 'Product retrieved successfully', product);
  });

  static deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await ProductService.deleteProduct(id);
    return ApiResponse.success(res, 'Product deleted successfully', null);
  });
}
