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

const getRecordByPagination = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const total = await Record.countDocuments(); // Get total count for frontend
  const records = await Record.find()
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);

  if (records.length === 0) {
    throw new ApiError(404, "No records found for the given page");
  }

  return res.json(
    new ApiResponse(200, "Records retrieved successfully", {
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }),
  );
});

const getRecordsCount = asyncHandler(async (req, res) => {
  const count = await Record.countDocuments({ isDeleted: false });

  return res.status(200).json(
    new ApiResponse(200, "Total records count retrieved successfully", {
      count,
    }),
  );
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

const searchRecords = asyncHandler(async (req, res) => {
  const { title, type, category, note } = req.query;

  const filters = {
    isDeleted: false,
    $or: [],
  };

  if (title) {
    filters.$or.push({ title: { $regex: title, $options: "i" } });
  }

  if (type) {
    filters.$or.push({ type: { $regex: type, $options: "i" } });
  }

  if (category) {
    filters.$or.push({ category: { $regex: category, $options: "i" } });
  }

  if (note) {
    filters.$or.push({ note: { $regex: note, $options: "i" } });
  }

  // If no search query provided → return all records
  if (filters.$or.length === 0) {
    delete filters.$or;
  }

  const records = await Record.find(filters).sort({ date: -1 });

  return res
    .status(200)
    .json(new ApiResponse(true, "Records retrieved successfully", records));
});

export {
  createRecord,
  getRecordByPagination,
  getRecordsCount,
  getRecordById,
  getUserRecords,
  updateUserRecordById,
  UpdateRecordById,
  deleteRecordById,
  permanentlyDeleteRecordById,
  searchRecords,
};
