import { Router } from "express";
import {
  createRecord,
  getRecordByPagination,
  getRecordsCount,
  getUserRecords,
  UpdateRecordById,
  getRecordById,
  deleteRecordById,
  permanentlyDeleteRecordById,
  updateUserRecordById,
  searchRecords,
  getSoftDeletedRecords,
  restoreRecordById,
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
router.get("/", getRecordByPagination);
router.get("/total-record-count", getRecordsCount);
router.get("/my-records", getUserRecords);
router.get("/search", searchRecords);
router.get("/soft-deleted", verifyRole(["admin"]), getSoftDeletedRecords);
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
router.patch(
  "/restore/:id",
  verifyRole(["admin"]),
  recordIdValidation,
  restoreRecordById,
);

export default router;
