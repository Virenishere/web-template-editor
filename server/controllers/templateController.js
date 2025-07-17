const templateSchema = require("../models/templateSchema");

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const { name, html, css } = req.body;

    if (!name || !html) {
      return res.status(400).json({
        message: "Both 'name' and 'html' fields are required.",
      });
    }

    const newTemplate = await templateSchema.create({ name, html, css });

    res.status(201).json({
      message: "Template created successfully",
      data: newTemplate,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating template", error });
  }
};

// Get all templates
exports.getAllTemplate = async (req, res) => {
  try {
    const templates = await templateSchema.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Templates fetched successfully",
      data: templates,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates", error });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await templateSchema.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({
      message: "Template fetched successfully",
      data: template,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching template", error });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { name, html, css } = req.body;

    const updated = await templateSchema.findByIdAndUpdate(
      req.params.id,
      { name, html, css },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({
      message: "Template updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating template", error });
  }
};

// Delete template
exports.deteleTemplate = async (req, res) => {
  try {
    const deleted = await templateSchema.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({
      message: "Template deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting template", error });
  }
};
