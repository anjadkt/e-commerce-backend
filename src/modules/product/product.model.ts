import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'out_of_stock';

export interface IProduct {
  name: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  category: Types.ObjectId;
  status: ProductStatus;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price must be greater than or equal to 0'],
      validate: {
        validator: function (this: IProductDocument, value?: number) {
          if (value === undefined || value === null) return true;
          return value <= this.price;
        },
        message: 'Sale price cannot exceed regular price',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft', 'out_of_stock'],
      default: 'active',
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for high-performance searching and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1, price: 1 });

export const Product: Model<IProductDocument> = mongoose.model<IProductDocument>(
  'Product',
  productSchema
);
