import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class CategoryController {
  static createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.createCategory(req.body);
    return ApiResponse.created(res, 'Category created successfully', category);
  });

  static updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await CategoryService.updateCategory(id, req.body);
    return ApiResponse.success(res, 'Category updated successfully', category);
  });

  static getCategoryTree = asyncHandler(async (req: Request, res: Response) => {
    const onlyActive = req.query.onlyActive === 'true';
    const tree = await CategoryService.getCategoryTree(onlyActive);
    return ApiResponse.success(res, 'Category tree retrieved successfully', tree);
  });

  static getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoryService.getAllCategories(req.query as any);
    return ApiResponse.success(res, 'Categories retrieved successfully', categories);
  });

  static getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await CategoryService.getCategoryById(id);
    return ApiResponse.success(res, 'Category retrieved successfully', category);
  });

  static deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await CategoryService.deleteCategory(id);
    return ApiResponse.success(res, 'Category deleted successfully', null);
  });
}
