import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { authorizedRole, verifyToken } from "../middleware/authToken.js";

const router = express.Router();

router.get("/products", getAllProducts);
router.post("/new", verifyToken, authorizedRole("admin"), createProduct);
router
  .route("/product/:id")
  .get(getSingleProduct)
  .put(verifyToken, authorizedRole("admin"), updateProduct)
  .delete(verifyToken, authorizedRole("admin"), deleteProduct);

export default router;
