import { Router } from "express";
import {
  getHello,
  getAllFerns,
  getFernByName,
} from "../controllers/controller.js";

const router = Router();

router.get("/", getHello);
router.get("/ferns", getAllFerns);
router.get("/ferns/:name", getFernByName);

export default router;
