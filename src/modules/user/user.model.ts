import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'customer';

export interface IUserAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  address?: IUserAddress;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);


export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
