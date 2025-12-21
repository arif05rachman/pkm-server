import { Request, Response } from "express";
import { pool } from "@/config/database";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import { ApiResponse } from "@/types";

export const getStockCard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_barang = parseInt(req.params.id);
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (isNaN(id_barang)) {
      throw new AppError("ID barang tidak valid", 400);
    }

    // Default dates if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(end.getDate() - 30));

    // Get barang details
    const barangResult = await pool.query(
      "SELECT * FROM barang WHERE id_barang = $1",
      [id_barang]
    );
    if (barangResult.rows.length === 0) {
      throw new AppError("Barang tidak ditemukan", 404);
    }
    const barang = barangResult.rows[0];

    // Get transactions
    // Combine Masuk & Keluar
    // Note: detailed logic would extract from detail_transaksi_masuk and detail_transaksi_keluar
    // joined with parent transaction tables.

    // Simplification for now: Fetch all movements
    const query = `
      SELECT 
        'masuk' as type,
        tm.tanggal_masuk as date,
        tm.keterangan,
        dtm.jumlah,
        u.username as operator
      FROM detail_transaksi_masuk dtm
      JOIN transaksi_masuk tm ON tm.id_transaksi_masuk = dtm.id_transaksi_masuk
      LEFT JOIN users u ON tm.id_user = u.id
      WHERE dtm.id_barang = $1 AND tm.tanggal_masuk BETWEEN $2 AND $3
      
      UNION ALL
      
      SELECT 
        'keluar' as type,
        tk.tanggal_keluar as date,
        tk.keterangan,
        dtk.jumlah,
        u.username as operator
      FROM detail_transaksi_keluar dtk
      JOIN transaksi_keluar tk ON tk.id_transaksi_keluar = dtk.id_transaksi_keluar
      LEFT JOIN users u ON tk.id_user = u.id
      WHERE dtk.id_barang = $1 AND tk.tanggal_keluar BETWEEN $2 AND $3
      
      ORDER BY date ASC
    `;

    const result = await pool.query(query, [id_barang, start, end]);

    // Calculate running balance if needed, but for now just return the list
    // Ideally we need starting balance, but that's complex without daily snapshots.
    // We will just return the movements.

    res.json({
      success: true,
      data: {
        barang,
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
        'masuk' as type,
        tm.tanggal_masuk as date,
        tm.keterangan,
        dtm.jumlah,
        dtm.harga_satuan,
        b.nama_barang,
        b.satuan,
        s.nama_supplier as source_destination,
        u.username as operator,
        tm.id_transaksi_masuk as id
      FROM detail_transaksi_masuk dtm
      JOIN transaksi_masuk tm ON tm.id_transaksi_masuk = dtm.id_transaksi_masuk
      JOIN barang b ON dtm.id_barang = b.id_barang
      LEFT JOIN supplier s ON tm.id_supplier = s.id_supplier
      LEFT JOIN users u ON tm.id_user = u.id
      WHERE tm.tanggal_masuk BETWEEN $1 AND $2
      
      UNION ALL
      
      SELECT 
        'keluar' as type,
        tk.tanggal_keluar as date,
        tk.keterangan,
        dtk.jumlah,
        0 as harga_satuan,
        b.nama_barang,
        b.satuan,
        tk.tujuan as source_destination,
        u.username as operator,
        tk.id_transaksi_keluar as id
      FROM detail_transaksi_keluar dtk
      JOIN transaksi_keluar tk ON tk.id_transaksi_keluar = dtk.id_transaksi_keluar
      JOIN barang b ON dtk.id_barang = b.id_barang
      LEFT JOIN users u ON tk.id_user = u.id
      WHERE tk.tanggal_keluar BETWEEN $1 AND $2
      
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
