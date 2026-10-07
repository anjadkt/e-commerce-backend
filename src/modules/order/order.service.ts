import { Types } from 'mongoose';
import { Order, IOrderDocument, IOrderItem, OrderStatus } from './order.model';
import { Product } from '../product/product.model';
import { User, IUserAddress } from '../user/user.model';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/app-error';
import { CreateOrderInput, OrderQueryParams } from './order.validation';
import { PaginationMeta } from '../../utils/api-response';

export class OrderService {
  static async createOrder(userId: string, input: CreateOrderInput): Promise<IOrderDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Determine shipping address
    let shippingAddress: IUserAddress | undefined = input.shippingAddress;
    if (!shippingAddress) {
      if (
        user.address?.street &&
        user.address?.city &&
        user.address?.state &&
        user.address?.postalCode &&
        user.address?.country
      ) {
        shippingAddress = user.address;
      } else {
        throw new BadRequestError(
          'Shipping address is required. Please provide it in the order or update your profile address.'
        );
      }
    }

    // Group items by product ID to avoid duplicates
    const itemMap = new Map<string, number>();
    for (const item of input.items) {
      const currentQty = itemMap.get(item.productId) || 0;
      itemMap.set(item.productId, currentQty + item.quantity);
    }

    const productIds = Array.from(itemMap.keys());
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      throw new BadRequestError('One or more products in your order do not exist');
    }

    // Validate availability and stock
    for (const product of products) {
      const requestedQty = itemMap.get(product._id.toString())!;

      if (product.status !== 'active') {
        throw new BadRequestError(`Product '${product.name}' is currently unavailable`);
      }

      if (product.stock < requestedQty) {
        throw new BadRequestError(
          `Insufficient stock for '${product.name}'. Requested: ${requestedQty}, Available: ${product.stock}`
        );
      }
    }

    // Atomically decrement stock and keep rollback list in case of race condition
    const decrementedProducts: { productId: Types.ObjectId; quantity: number }[] = [];
    try {
      for (const product of products) {
        const requestedQty = itemMap.get(product._id.toString())!;

        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: requestedQty } },
          { $inc: { stock: -requestedQty } },
          { new: true }
        );

        if (!updated) {
          throw new BadRequestError(
            `Stock became insufficient for '${product.name}' during checkout`
          );
        }

        decrementedProducts.push({
          productId: product._id as Types.ObjectId,
          quantity: requestedQty,
        });

        // Mark as out_of_stock if remaining stock is 0
        if (updated.stock === 0) {
          await Product.findByIdAndUpdate(product._id, { status: 'out_of_stock' });
        }
      }
    } catch (error) {
      // Rollback already decremented stock
      for (const item of decrementedProducts) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
          $set: { status: 'active' },
        });
      }
      throw error;
    }

    // Build order items with backend prices
    let totalAmount = 0;
    const orderItems: IOrderItem[] = products.map((product) => {
      const qty = itemMap.get(product._id.toString())!;
      const unitPrice =
        product.salePrice !== undefined && product.salePrice !== null
          ? product.salePrice
          : product.price;
      const subtotal = Math.round(unitPrice * qty * 100) / 100;
      totalAmount += subtotal;

      return {
        product: product._id as Types.ObjectId,
        name: product.name,
        sku: product.sku,
        price: unitPrice,
        quantity: qty,
        subtotal,
      };
    });

    totalAmount = Math.round(totalAmount * 100) / 100;

    const order = new Order({
      user: new Types.ObjectId(userId),
      items: orderItems,
      totalAmount,
      status: 'Pending',
      shippingAddress,
      paymentMethod: input.paymentMethod || 'credit_card',
      paymentStatus: 'pending',
      notes: input.notes,
    });

    await order.save();
    return order.populate('user', 'name email');
  }

  static async getCustomerOrders(
    userId: string,
    queryParams: OrderQueryParams
  ): Promise<{ orders: IOrderDocument[]; pagination: PaginationMeta }> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { user: new Types.ObjectId(userId) };
    if (queryParams.status) {
      filter.status = queryParams.status;
    }

    const [orders, totalItems] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const pagination: PaginationMeta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return { orders, pagination };
  }

  static async getAllOrders(
    queryParams: OrderQueryParams
  ): Promise<{ orders: IOrderDocument[]; pagination: PaginationMeta }> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (queryParams.status) {
      filter.status = queryParams.status;
    }

    const [orders, totalItems] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const pagination: PaginationMeta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return { orders, pagination };
  }

  static async getOrderById(orderId: string, userId: string, isAdmin: boolean): Promise<IOrderDocument> {
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!isAdmin && order.user._id.toString() !== userId) {
      throw new ForbiddenError('You are not authorized to view this order');
    }

    return order;
  }

  static async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<IOrderDocument> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'Cancelled' && newStatus !== 'Cancelled') {
      throw new BadRequestError('Cancelled orders cannot be reopened');
    }

    if (order.status === 'Delivered' && newStatus !== 'Delivered') {
      throw new BadRequestError('Delivered orders cannot change status');
    }

    // If transitioning to Cancelled from another status, restore stock
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
          $set: { status: 'active' },
        });
      }
    }

    order.status = newStatus;
    if (newStatus === 'Delivered') {
      order.paymentStatus = 'paid';
    }

    await order.save();
    return order.populate('user', 'name email');
  }
}
