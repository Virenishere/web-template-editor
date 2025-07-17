const express = require("express");
const router = express.Router();
const {
  createTemplate,
  getAllTemplate,
  getTemplateById,
  updateTemplate,
  deteleTemplate,
} = require("../controllers/templateController");

// Route to create a new template
router.post("/", createTemplate);

// Route to get all templates
router.get("/", getAllTemplate);

// Route to get a template by ID
router.get("/:id", getTemplateById);

// Route to update a template by ID
router.put("/:id", updateTemplate);

// Route to delete a template by ID
router.delete("/:id", deteleTemplate);

module.exports = router;
