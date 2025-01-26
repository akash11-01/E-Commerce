import { Product } from "../models/product.model.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { asyncHandler } from "../utils/asyncErrors.js";
import { errorHandler } from "../utils/error.js";

export const getSingleProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(errorHandler(404, "Product Not found"));
  }
  res.status(200).json({ product });
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const resultsPerPage = 9;
  const countProducts = await Product.countDocuments();
  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultsPerPage);
  const product = apiFeatures.query;
  res.status(200).json({ product, countProducts });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(200).json({ product });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(errorHandler(404, "Product not Found"));
  }
  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Product Deleted" });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(errorHandler(404, "Product Not Found"));
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(201).json({ updatedProduct, message: "Product Updated" });
});
