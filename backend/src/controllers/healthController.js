const getHealth = (req, res) => {
  res.json({
    success: true,
    message: "FinNova AI Backend is running!",
  });
};

module.exports = {
  getHealth,
};