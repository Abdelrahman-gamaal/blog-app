const successResponse = (res, statusCode, message = "done", data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export default successResponse;
