import express from "express";
const router = express.Router();
import Idea from "../models/idea.js";
import mongoose from "mongoose";

const normalizeTags = (tags) =>
  typeof tags === "string"
    ? tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : Array.isArray(tags)
      ? tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [];

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);
    const query = Idea.find().sort({ createdAt: -1 });

    if (!isNaN(limit)) {
      query.limit(limit);
    }
    const ideas = await query.exec();
    res.json(ideas);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    res.json(idea);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body ?? {};
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are required");
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      tags: normalizeTags(tags),
    });

    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const idea = await Idea.findByIdAndDelete(req.params.id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    res.json({ message: "Idea Deleted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    const { title, summary, description, tags } = req.body ?? {};
    const existingIdea = await Idea.findById(id);
    if (!existingIdea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    const nextTitle = normalizeText(title) || existingIdea.title;
    const nextSummary = normalizeText(summary) || existingIdea.summary;
    const nextDescription =
      normalizeText(description) || existingIdea.description;
    const nextTags =
      tags === undefined ? existingIdea.tags : normalizeTags(tags);

    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      {
        title: nextTitle,
        summary: nextSummary,
        description: nextDescription,
        tags: nextTags,
      },
      { new: true, runValidators: true },
    );

    res.json(updatedIdea);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default router;
