import { Request, Response } from "express";
import { pool } from "@/config/database";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import { ApiResponse } from "@/types";

export const getStockCard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(req.params.id);
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (isNaN(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    // Default dates if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(end.getDate() - 30));

    // Get product details
    const productResult = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [productId]
    );
    if (productResult.rows.length === 0) {
      throw new AppError("Product not found", 404);
    }
    const product = productResult.rows[0];

    // Get transactions (Combine StockIn & StockOut)
    const query = `
      SELECT 
        'in' as type,
        si.date as date,
        si.description,
        sid.quantity,
        u.username as operator
      FROM stock_in_details sid
      JOIN stock_ins si ON si.id = sid.stock_in_id
      LEFT JOIN users u ON si.user_id = u.id
      WHERE sid.product_id = $1 AND si.date BETWEEN $2 AND $3
      
      UNION ALL
      
      SELECT 
        'out' as type,
        so.date as date,
        so.description,
        sod.quantity,
        u.username as operator
      FROM stock_out_details sod
      JOIN stock_outs so ON so.id = sod.stock_out_id
      LEFT JOIN users u ON so.user_id = u.id
      WHERE sod.product_id = $1 AND so.date BETWEEN $2 AND $3
      
      ORDER BY date ASC
    `;

    const result = await pool.query(query, [productId, start, end]);

    res.json({
      success: true,
      data: {
        product,
        period: { start, end },
        movements: result.rows,
      },
    });
  }
);

export const getAllTransactions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate, month, year } = req.query;
    let start: Date, end: Date;

    if (month && year) {
      // Month is 1-indexed (1=January)
      const m = parseInt(month as string) - 1;
      const y = parseInt(year as string);
      start = new Date(y, m, 1);
      end = new Date(y, m + 1, 0); // Last day of month
    } else if (year) {
      const y = parseInt(year as string);
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31);
    } else {
      // Default to provided dates or last 30 days
      end = endDate ? new Date(endDate as string) : new Date();
      start = startDate
        ? new Date(startDate as string)
        : new Date(new Date().setDate(end.getDate() - 30));
    }

    const query = `
      SELECT 
        'in' as type,
        si.date as date,
        si.description,
        sid.quantity,
        sid.unit_price,
        p.name as product_name,
        p.unit,
        s.name as source_destination,
        u.username as operator,
        si.id as id
      FROM stock_in_details sid
      JOIN stock_ins si ON si.id = sid.stock_in_id
      JOIN products p ON sid.product_id = p.id
      LEFT JOIN suppliers s ON si.supplier_id = s.id
      LEFT JOIN users u ON si.user_id = u.id
      WHERE si.date BETWEEN $1 AND $2
      
      UNION ALL
      
      SELECT 
        'out' as type,
        so.date as date,
        so.description,
        sod.quantity,
        0 as unit_price,
        p.name as product_name,
        p.unit,
        so.destination as source_destination,
        u.username as operator,
        so.id as id
      FROM stock_out_details sod
      JOIN stock_outs so ON so.id = sod.stock_out_id
      JOIN products p ON sod.product_id = p.id
      LEFT JOIN users u ON so.user_id = u.id
      WHERE so.date BETWEEN $1 AND $2
      
      ORDER BY date DESC, id DESC
    `;

    const result = await pool.query(query, [start, end]);

    res.json({
      success: true,
      data: {
        period: { start, end },
        transactions: result.rows,
      },
    });
  }
);
