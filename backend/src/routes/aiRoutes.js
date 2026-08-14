const express = require("express");
const { testAiServiceConnection } = require("../controllers/aiController");

const router = express.Router();

router.get("/test", testAiServiceConnection);

module.exports = router;
