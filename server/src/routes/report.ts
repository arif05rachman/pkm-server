import { Router } from "express";
import {
  getStockCard,
  getAllTransactions,
} from "@/controllers/reportController";
import { authenticateToken, authorizeRoles } from "@/middleware/auth";

const router: Router = Router();

router.use(authenticateToken);

router.get("/stock-card/:id", getStockCard);
router.get("/transactions", getAllTransactions);

export default router;
