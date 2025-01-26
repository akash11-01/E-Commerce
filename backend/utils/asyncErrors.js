export const asyncHandler = (funct) => (req, res, next) => {
  Promise.resolve(funct(req, res, next)).catch(next);
};
