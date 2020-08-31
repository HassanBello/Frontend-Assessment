import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();

router.post("/create", async (req, res) => {
	const prisma: PrismaClient = req.app.locals.prisma;
	const { description, title, author_id } = req.body;
	try {
		const result = await prisma.notes.create({
			data: {
				description,
				title,
				...(author_id && { author_id: Number(author_id) }),
			},
		});
		const foundPost = await prisma.notes.findMany();
		res.status(200).json(foundPost);
	} catch (err) {
		return res.status(401).json({
			error: err.message || "Something went wrong",
		});
	}
});

router.get("/", async (req, res) => {
	const prisma: PrismaClient = req.app.locals.prisma;
	const notes = await prisma.notes.findMany({
		where: { author_id: null },
	});
	return res.status(200).json(notes);
});
router.put("/:noteId", async (req, res) => {
	const prisma: PrismaClient = req.app.locals.prisma;
	const noteId = Number(req.params.noteId);
	const { title, description } = req.body;
	let foundNotes = await prisma.notes.findOne({ where: { id: noteId } });
	try {
		if (foundNotes) {
			foundNotes = await prisma.notes.update({
				where: { id: noteId },
				data: {
					title: title ? title : foundNotes.title,
					description: description ? description : foundNotes.description,
					author_id: foundNotes.author_id,
				},
			});
			res.status(200).json(foundNotes);
		}
	} catch (err) {
		return res.status(401).json({
			error: err.message || "Something went wrong",
		});
	}
});
router.delete("/:noteId", async (req, res) => {
	const noteId = Number(req.params.noteId);
	try {
		const prisma: PrismaClient = req.app.locals.prisma;
		const deletedNote = await prisma.notes.delete({
			where: { id: noteId },
		});
		res.status(200).json(deletedNote);
	} catch (err) {
		return res.status(401).json({
			error: err.message || "Something went wrong",
		});
	}
});

export default router;
