import { Request, Response } from "express";
import z from "zod";
import { NurseriesQueryDto } from "../dtos/nursery.dto";
import { NurseryService } from "../services/nursery.service";

const nurseryService = new NurseryService();

export class NurseryController {
  async getNurseries(req: Request, res: Response) {
    try {
      const parsedQuery = NurseriesQueryDto.safeParse(req.query);

      if (!parsedQuery.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedQuery.error),
        });
      }

      const response = await nurseryService.getNurseries(parsedQuery.data);
      return res.status(200).json({
        success: true,
        message: "Nurseries fetched successfully",
        data: response.nurseries,
        pagination: response.pagination,
        fallback: response.fallback,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
