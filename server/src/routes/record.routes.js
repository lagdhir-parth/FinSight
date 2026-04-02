import { Router } from "express";
import {
  createRecord,
  getAllRecords,
  getUserRecords,
  UpdateRecordById,
  getRecordById,
  deleteRecordById,
  permanentlyDeleteRecordById,
  updateUserRecordById,
} from "../controllers/record.controller.js";
import {
  createRecordValidation,
  recordIdValidation,
  updateRecordValidation,
} from "../validations/recordRequest.js";
import verifyRole from "../middlewares/verifyRole.middleware.js";
import verifyUser from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.use(verifyUser);

router.post(
  "/create",
  verifyRole(["analyst", "admin"]),
  createRecordValidation,
  createRecord,
);
router.get("/", getAllRecords);
router.get("/my-records", getUserRecords);
router.get("/:id", recordIdValidation, getRecordById);
router.patch(
  "/update-my-record/:id",
  updateRecordValidation,
  updateUserRecordById,
);
router.patch(
  "/:id",
  verifyRole(["admin"]),
  updateRecordValidation,
  UpdateRecordById,
);
router.delete(
  "/:id",
  verifyRole(["admin"]),
  recordIdValidation,
  deleteRecordById,
);
router.delete(
  "/permanent/:id",
  verifyRole(["admin"]),
  recordIdValidation,
  permanentlyDeleteRecordById,
);

export default router;
