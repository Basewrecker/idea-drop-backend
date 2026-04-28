import express from 'express';
const router = express.Router();
import Idea from '../models/idea.js';



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
    const { title, summary, description, tags } = req.body;

    if (!title || !summary || !description) {
        return res.status(400).json({ message: 'title, summary and description are required' });
    }

    try {
        const idea = await Idea.create({
            title,
            summary,
            description,
            tags: Array.isArray(tags) ? tags : [],
        });
        res.status(201).json(idea);
    } catch (error) {
        next(error);
    }
});

export default router;