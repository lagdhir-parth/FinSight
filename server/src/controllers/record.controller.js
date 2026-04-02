import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Record from "../models/record.model.js";

const createRecord = asyncHandler(async (req, res) => {
  const { title, amount, type, category, date, note } = req.body;

  const record = await Record.create({
    title,
    createdBy: req.user._id,
    amount,
    type,
    category,
    date,
    note,
  });

  return res
    .status(201)
    .json(new ApiResponse(true, "Record created successfully", record));
});

const getAllRecords = asyncHandler(async (req, res) => {
  const records = await Record.find({
    isDeleted: false,
  })
    .sort({ date: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(true, "Records retrieved successfully", records));
});

const getRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await Record.findOne({
    _id: id,
    isDeleted: false,
  }).lean();

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(true, "Record retrieved successfully", record));
});

const getUserRecords = asyncHandler(async (req, res) => {
  const records = await Record.find({
    createdBy: req.user._id,
    isDeleted: false,
  })
    .sort({ date: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(true, "Records retrieved successfully", records));
});

const updateUserRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, amount, type, category, date, note } = req.body;

  const record = await Record.findOne({
    _id: id,
    createdBy: req.user._id,
    isDeleted: false,
  });

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  const updatedRecord = await Record.findByIdAndUpdate(
    id,
    { title, amount, type, category, date, note },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(true, "Record updated successfully", updatedRecord));
});

const UpdateRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const record = await Record.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    updateData,
    {
      new: true,
    },
  );

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(true, "Record updated successfully", record));
});

const deleteRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const record = await Record.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true },
  );

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(true, "Record deleted successfully"));
});

const permanentlyDeleteRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const record = await Record.findByIdAndDelete(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(true, "Record permanently deleted successfully"));
});

export {
  createRecord,
  getAllRecords,
  getRecordById,
  getUserRecords,
  updateUserRecordById,
  UpdateRecordById,
  deleteRecordById,
  permanentlyDeleteRecordById,
};
