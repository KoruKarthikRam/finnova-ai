const { generateMonthlyReport } = require("../services/reportService");

const getMonthlyReport = async (req, res) => {
  const { month, year } = req.query;
  try {
    const result = await generateMonthlyReport(req.user.id, month, year);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report",
      error: error.message,
    });
  }
};

module.exports = {
  getMonthlyReport,
};
