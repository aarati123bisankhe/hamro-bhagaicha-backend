import { Request, Response } from "express";
import z from "zod";
import { CreateProductDto, InventoryQueryDto } from "../dtos/product.dto";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export class ProductController {
  async addProduct(req: Request, res: Response) {
    try {
      const parsedBody = CreateProductDto.safeParse(req.body);

      if (!parsedBody.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedBody.error),
        });
      }

      const product = await productService.addProduct(parsedBody.data);
      return res.status(201).json({
        success: true,
        message: "Product added successfully",
        data: product,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getInventory(req: Request, res: Response) {
    try {
      const parsedQuery = InventoryQueryDto.safeParse(req.query);

      if (!parsedQuery.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedQuery.error),
        });
      }

      const products = await productService.getInventory(parsedQuery.data);
      return res.status(200).json({
        success: true,
        message: "Inventory fetched successfully",
        data: products,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const productId = req.params.productId;
      const deleted = await productService.deleteProduct(productId);

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      return res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
