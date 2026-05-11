const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.name = new RegExp(search, "i");
    const Plant = mongoose.connection.collection("trefleeplants");
    const plants = await Plant.find(query).skip((page-1)*Number(limit)).limit(Number(limit)).toArray();
    const total = await Plant.countDocuments(query);
    res.json({ plants, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const Plant = mongoose.connection.collection("trefleeplants");
    const plant = await Plant.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    if (!plant) return res.status(404).json({ error: "Not found" });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;