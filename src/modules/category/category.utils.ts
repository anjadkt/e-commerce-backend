import { Types } from 'mongoose';
import { Category } from './category.model';

export interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: CategoryTreeNode[];
}

/**
 * Converts a text string into a URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Traverses and collects all descendant category IDs (children, grandchildren, etc.) using BFS
 */
export const getAllDescendantIds = async (
  categoryId: string | Types.ObjectId
): Promise<Types.ObjectId[]> => {
  const targetId = typeof categoryId === 'string' ? new Types.ObjectId(categoryId) : categoryId;
  const descendantIds: Types.ObjectId[] = [];
  const queue: Types.ObjectId[] = [targetId];

  while (queue.length > 0) {
    const currentParent = queue.shift()!;
    const children = await Category.find({ parent: currentParent }, { _id: 1 }).lean();
    for (const child of children) {
      const childId = child._id as Types.ObjectId;
      descendantIds.push(childId);
      queue.push(childId);
    }
  }

  return descendantIds;
};

/**
 * Builds a nested category tree from a flat list of categories
 */
export const buildCategoryTree = (allCategories: any[]): CategoryTreeNode[] => {
  const categoryMap = new Map<string, CategoryTreeNode>();

  // First pass: initialize node map
  allCategories.forEach((cat) => {
    categoryMap.set(cat._id.toString(), {
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parent: cat.parent ? cat.parent.toString() : null,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      children: [],
    });
  });

  const rootNodes: CategoryTreeNode[] = [];

  // Second pass: link parent-child relationships
  categoryMap.forEach((node) => {
    if (node.parent && categoryMap.has(node.parent)) {
      categoryMap.get(node.parent)!.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
};
