import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class OrderController {
  static createOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderService.createOrder(req.user!._id.toString(), req.body);
    return ApiResponse.created(res, 'Order placed successfully', order);
  });

  static getCustomerOrders = asyncHandler(async (req: Request, res: Response) => {
    const { orders, pagination } = await OrderService.getCustomerOrders(
      req.user!._id.toString(),
      req.query as any
    );
    return ApiResponse.success(res, 'My orders retrieved successfully', orders, 200, pagination);
  });

  static getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const { orders, pagination } = await OrderService.getAllOrders(req.query as any);
    return ApiResponse.success(res, 'All orders retrieved successfully', orders, 200, pagination);
  });

  static getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const isAdmin = req.user!.role === 'admin';
    const order = await OrderService.getOrderById(
      id,
      req.user!._id.toString(),
      isAdmin
    );
    return ApiResponse.success(res, 'Order retrieved successfully', order);
  });

  static updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const order = await OrderService.updateOrderStatus(id, req.body.status);
    return ApiResponse.success(res, `Order status updated to '${req.body.status}'`, order);
  });
}
