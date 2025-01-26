import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { verifyToken } from "../middleware/authToken.js";

const router = express.Router();

router
  .route("/product/:id")
  .get(getSingleProduct)
  .put(verifyToken, updateProduct)
  .delete(verifyToken, deleteProduct);

router.post("/new", verifyToken, createProduct);
router.get("/products", verifyToken, getAllProducts);

export default router;
