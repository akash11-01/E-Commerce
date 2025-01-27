import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter product name"],
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Please Enter the price of the product"],
      maxLength: [8, "Price can not be greater than 8 characters"],
    },
    stock: {
      type: Number,
      required: [true, "Please Enter Product stock"],
      maxLength: [4, "Stock can not be greater than 4"],
    },
    description: {
      type: String,
      required: [true, "Please Enter the Product Description"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    image: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    reviews: [
      {
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
