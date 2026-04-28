import express from 'express';
const router = express.Router();
import Idea from '../models/idea.js';
import mongoose from 'mongoose';


router.get('/', async (req,res,next) => {
    try {
        const ideas = await Idea.find();
        res.json(ideas);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/:id', async (req,res,next) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if(!idea) {
            res.status(404);
            throw new Error('Idea Not Found');
        }
        res.json(idea);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.post('/', async (req,res,next) => {
    try {
        const {title, summary, description, tags} = req.body;
        if (!title?.trim() || !summary?.trim() || !description?.trim()) {
            res.status(400);
            throw new Error('Title, summary and description are required');
        }

        const newIdea = new Idea({
            title,
            summary,
            description,
            tags: typeof tags === 'string'
              ? tags 
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
              : Array.isArray(tags)
                ? tags
              : []
        });

        const savedIdea = await newIdea.save();
        res.status(201).json(savedIdea);

    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.delete('/:id', async (req,res,next) => {
    try {
        const idea = await Idea.findByIdAndDelete(req.params.id);
        if(!idea) {
            res.status(404);
            throw new Error('Idea Not Found');
        }
        res.json({message: 'Idea Deleted successfully'});
    } catch (error) {
        console.log(error);
        next(error);
    }
});

export default router;