import { Router } from "express";
import {
  getHello,
  getAllFerns,
  getFernByName,
  getRegions,
} from "../controllers/controller.js";

const router = Router();

router.get("/", getHello);
router.get("/ferns", getAllFerns);
router.get("/ferns/:name", getFernByName);
router.get("/regions", getRegions);

export default router;
