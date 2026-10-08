import { Types } from 'mongoose';
import { Category, ICategoryDocument } from './category.model';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/app-error';
import { CreateCategoryInput, UpdateCategoryInput } from './category.validation';
import {
  slugify,
  getAllDescendantIds,
  buildCategoryTree,
  CategoryTreeNode,
} from './category.utils';

export { CategoryTreeNode };

export class CategoryService {
  static getAllDescendantIds = getAllDescendantIds;

  static async createCategory(input: CreateCategoryInput): Promise<ICategoryDocument> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);

    const existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
      throw new ConflictError(`A category with slug '${slug}' already exists`);
    }

    if (input.parent) {
      const parentCategory = await Category.findById(input.parent);
      if (!parentCategory) {
        throw new NotFoundError('Parent category not found');
      }
    }

    const category = new Category({
      name: input.name,
      slug,
      description: input.description,
      parent: input.parent ? new Types.ObjectId(input.parent) : null,
      isActive: input.isActive !== undefined ? input.isActive : true,
    });

    await category.save();
    return category;
  }

  static async updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<ICategoryDocument> {
    
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (input.name && !input.slug) {
      const newSlug = slugify(input.name);
      const existingSlug = await Category.findOne({ slug: newSlug, _id: { $ne: category._id } });
      if (existingSlug) {
        throw new ConflictError(`A category with slug '${newSlug}' already exists`);
      }
      category.slug = newSlug;
      category.name = input.name;

    } else if (input.slug) {

      const newSlug = slugify(input.slug);
      const existingSlug = await Category.findOne({ slug: newSlug, _id: { $ne: category._id } });

      if (existingSlug) {
        throw new ConflictError(`A category with slug '${newSlug}' already exists`);
      }
      category.slug = newSlug;
      if (input.name) category.name = input.name;
    } else if (input.name) {
      category.name = input.name;
    }

    if (input.description !== undefined) {
      category.description = input.description;
    }

    if (input.isActive !== undefined) {
      category.isActive = input.isActive;
    }

    if (input.parent !== undefined) {
      
      if (input.parent === null || input.parent === '') {
        category.parent = null;
      } else {
        if (input.parent === categoryId) {
          throw new BadRequestError('Category cannot be its own parent');
        }

        const parentCategory = await Category.findById(input.parent);
        if (!parentCategory) {
          throw new NotFoundError('Parent category not found');
        }

        // Check if the intended parent is a descendant of this category
        const descendantIds = await getAllDescendantIds(categoryId);
        const isDescendant = descendantIds.some((id) => id.toString() === input.parent);
        if (isDescendant) {
          throw new BadRequestError(
            'Circular dependency detected: Cannot set a descendant category as a parent'
          );
        }

        category.parent = new Types.ObjectId(input.parent);
      }
    }

    await category.save();
    return category;
  }

  static async getAllCategories(filter: { parent?: string; isActive?: boolean }): Promise<ICategoryDocument[]> {

    const query: any = {};
    
    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }
    if (filter.parent !== undefined) {
      query.parent = filter.parent === 'null' ? null : new Types.ObjectId(filter.parent);
    }

    return Category.find(query).populate('parent', 'name slug').sort({ name: 1 });
  }

  static async getCategoryTree(onlyActive: boolean = false): Promise<CategoryTreeNode[]> {
    const query: any = onlyActive ? { isActive: true } : {};
    const allCategories = await Category.find(query).sort({ name: 1 }).lean();
    return buildCategoryTree(allCategories);
  }

  static async getCategoryById(categoryId: string): Promise<ICategoryDocument> {
    
    const category = await Category.findById(categoryId).populate('parent', 'name slug');
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check if category has children
    const childCount = await Category.countDocuments({ parent: category._id });
    if (childCount > 0) {
      throw new BadRequestError(
        `Cannot delete category '${category.name}' because it has ${childCount} subcategories. Please reassign or delete subcategories first.`
      );
    }

    await Category.findByIdAndDelete(categoryId);
  }
}
