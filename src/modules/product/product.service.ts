import { Types } from 'mongoose';
import { Product, IProductDocument } from './product.model';
import { Category } from '../category/category.model';
import { CategoryService } from '../category/category.service';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/app-error';
import { CreateProductInput, UpdateProductInput, ProductQueryParams } from './product.validation';
import { PaginationMeta } from '../../utils/api-response';

export class ProductService {
  static async createProduct(input: CreateProductInput): Promise<IProductDocument> {
    const existingSku = await Product.findOne({ sku: input.sku.toUpperCase() });
    if (existingSku) {
      throw new ConflictError(`Product with SKU '${input.sku}' already exists`);
    }

    const category = await Category.findById(input.category);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    let status = input.status || 'active';
    if (input.stock === 0 && status === 'active') {
      status = 'out_of_stock';
    }

    const product = new Product({
      name: input.name,
      sku: input.sku.toUpperCase(),
      description: input.description,
      price: input.price,
      salePrice: input.salePrice,
      stock: input.stock,
      category: new Types.ObjectId(input.category),
      status,
      images: input.images || [],
    });

    await product.save();
    return product.populate('category', 'name slug');
  }

  static async updateProduct(id: string, input: UpdateProductInput): Promise<IProductDocument> {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (input.sku && input.sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({
        sku: input.sku.toUpperCase(),
        _id: { $ne: product._id },
      });
      if (existingSku) {
        throw new ConflictError(`Product with SKU '${input.sku}' already exists`);
      }
      product.sku = input.sku.toUpperCase();
    }

    if (input.category) {
      const category = await Category.findById(input.category);
      if (!category) {
        throw new NotFoundError('Category not found');
      }
      product.category = new Types.ObjectId(input.category);
    }

    if (input.name) product.name = input.name;
    if (input.description) product.description = input.description;
    if (input.price !== undefined) product.price = input.price;
    if (input.salePrice !== undefined) product.salePrice = input.salePrice;
    if (input.stock !== undefined) {
      product.stock = input.stock;
      if (product.stock === 0 && product.status === 'active') {
        product.status = 'out_of_stock';
      }
    }
    if (input.status) product.status = input.status;
    if (input.images) product.images = input.images;

    await product.save();
    return product.populate('category', 'name slug');
  }

  static async getProducts(
    queryParams: ProductQueryParams,
    isAdmin: boolean = false
  ): Promise<{ products: IProductDocument[]; pagination: PaginationMeta }> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // For customers, only show active or out_of_stock products by default (hide drafts/inactive)
    if (!isAdmin) {
      filter.status = queryParams.status || { $in: ['active', 'out_of_stock'] };
    } else if (queryParams.status) {
      filter.status = queryParams.status;
    }

    // Search by name, description, or SKU
    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { sku: searchRegex },
      ];
    }

    // Category filter: Includes parent category AND all of its descendant categories
    if (queryParams.category) {
      const descendantIds = await CategoryService.getAllDescendantIds(queryParams.category);
      const categoryIds = [new Types.ObjectId(queryParams.category), ...descendantIds];
      filter.category = { $in: categoryIds };
    }

    // Price filter
    if (queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) {
      filter.price = {};
      if (queryParams.minPrice !== undefined) {
        filter.price.$gte = queryParams.minPrice;
      }
      if (queryParams.maxPrice !== undefined) {
        filter.price.$lte = queryParams.maxPrice;
      }
    }

    // Sorting
    const sortBy = queryParams.sortBy || 'createdAt';
    const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug parent')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
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

    return { products, pagination };
  }

  static async getProductById(id: string): Promise<IProductDocument> {
    const product = await Product.findById(id).populate('category', 'name slug parent');
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  static async deleteProduct(id: string): Promise<void> {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    await Product.findByIdAndDelete(id);
  }
}
