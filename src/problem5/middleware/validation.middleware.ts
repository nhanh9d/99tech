import { Request, Response, NextFunction } from 'express';

export const validateResource = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { name, description, category, price, quantity } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (
    !description ||
    typeof description !== 'string' ||
    description.trim().length === 0
  ) {
    errors.push('Description is required and must be a non-empty string');
  }

  if (
    !category ||
    typeof category !== 'string' ||
    category.trim().length === 0
  ) {
    errors.push('Category is required and must be a non-empty string');
  }

  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }

  if (
    quantity === undefined ||
    typeof quantity !== 'number' ||
    quantity < 0 ||
    !Number.isInteger(quantity)
  ) {
    errors.push('Quantity is required and must be a non-negative integer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

export const validateResourceUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { name, description, category, price, quantity } = req.body;
  const errors: string[] = [];

  if (
    name !== undefined &&
    (typeof name !== 'string' || name.trim().length === 0)
  ) {
    errors.push('Name must be a non-empty string');
  }

  if (
    description !== undefined &&
    (typeof description !== 'string' || description.trim().length === 0)
  ) {
    errors.push('Description must be a non-empty string');
  }

  if (
    category !== undefined &&
    (typeof category !== 'string' || category.trim().length === 0)
  ) {
    errors.push('Category must be a non-empty string');
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    errors.push('Price must be a non-negative number');
  }

  if (
    quantity !== undefined &&
    (typeof quantity !== 'number' ||
      quantity < 0 ||
      !Number.isInteger(quantity))
  ) {
    errors.push('Quantity must be a non-negative integer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  // Check if at least one field is being updated
  const updates = Object.keys(req.body).filter((key) =>
    ['name', 'description', 'category', 'price', 'quantity'].includes(key)
  );

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid fields to update',
    });
  }

  next();
};
