import ApiError from "./apiError.js";

const validateDataUpdates = (updateData, allowedUpdates) => {
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(
      400,
      "Please provide data to update",
      [],
      "ValidationError",
    );
  }

  // Validate update fields
  const updates = Object.keys(updateData);
  const isValidOperation = updates.every(
    (update) => allowedUpdates.includes(update) && updateData[update] !== "",
  );

  return isValidOperation;
};

export default validateDataUpdates;
