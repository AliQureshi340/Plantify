const express = require("express");
const router  = express.Router();
const Plant   = require("../models/Plant");

router.get("/", async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.name = new RegExp(search, "i");
    if (category && category !== "All") query.category = category;
    const plants = await Plant.find(query).skip((page-1)*limit).limit(Number(limit));
    const total = await Plant.countDocuments(query);
    res.json({ plants, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ error: "Not found" });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;