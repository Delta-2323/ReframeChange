import { Router, type IRouter } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { projectsTable } from "@workspace/db";
import { CreateProjectBody, GetProjectParams, UpdateProjectBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/", async (req, res) => {
  try {
    const body = CreateProjectBody.parse(req.body);
    const [project] = await db.insert(projectsTable).values({
      name: body.name,
      bcipCanvas: body.bcipCanvas ?? null,
      changeLogic: body.changeLogic ?? null,
      changeStrategy: body.changeStrategy ?? null,
      managerName: body.managerName ?? null,
    }).returning();
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(400).json({ error: "Invalid project data" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const projects = await db.select({
      id: projectsTable.id,
      name: projectsTable.name,
      bcipCanvas: projectsTable.bcipCanvas,
      changeLogic: projectsTable.changeLogic,
      changeStrategy: projectsTable.changeStrategy,
      managerName: projectsTable.managerName,
      documentName: projectsTable.documentName,
      documentMimeType: projectsTable.documentMimeType,
      createdAt: projectsTable.createdAt,
      updatedAt: projectsTable.updatedAt,
    }).from(projectsTable).orderBy(projectsTable.createdAt);
    res.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse({ id: Number(req.params.id) });
    const [project] = await db.select({
      id: projectsTable.id,
      name: projectsTable.name,
      bcipCanvas: projectsTable.bcipCanvas,
      changeLogic: projectsTable.changeLogic,
      changeStrategy: projectsTable.changeStrategy,
      managerName: projectsTable.managerName,
      documentName: projectsTable.documentName,
      documentMimeType: projectsTable.documentMimeType,
      createdAt: projectsTable.createdAt,
      updatedAt: projectsTable.updatedAt,
    }).from(projectsTable).where(eq(projectsTable.id, id));
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse({ id: Number(req.params.id) });
    const body = UpdateProjectBody.parse(req.body);
    const [project] = await db.update(projectsTable)
      .set({
        name: body.name,
        bcipCanvas: body.bcipCanvas ?? null,
        changeLogic: body.changeLogic ?? null,
        changeStrategy: body.changeStrategy ?? null,
        managerName: body.managerName ?? null,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, id))
      .returning();
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(400).json({ error: "Invalid project data" });
  }
});

router.delete("/:id/document", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse({ id: Number(req.params.id) });
    const [project] = await db.update(projectsTable)
      .set({ documentName: null, documentMimeType: null, documentData: null, updatedAt: new Date() })
      .where(eq(projectsTable.id, id))
      .returning({ id: projectsTable.id, name: projectsTable.name, documentName: projectsTable.documentName, updatedAt: projectsTable.updatedAt });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error removing document:", error);
    res.status(500).json({ error: "Failed to remove document" });
  }
});

router.post("/:id/document", upload.single("file"), async (req, res) => {
  try {
    const { id } = GetProjectParams.parse({ id: Number(req.params.id) });
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const documentData = req.file.buffer.toString("base64");
    const [project] = await db.update(projectsTable)
      .set({
        documentName: req.file.originalname,
        documentMimeType: req.file.mimetype,
        documentData,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, id))
      .returning({
        id: projectsTable.id,
        name: projectsTable.name,
        documentName: projectsTable.documentName,
        documentMimeType: projectsTable.documentMimeType,
        updatedAt: projectsTable.updatedAt,
      });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

router.get("/:id/document", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse({ id: Number(req.params.id) });
    const [project] = await db.select({
      documentName: projectsTable.documentName,
      documentMimeType: projectsTable.documentMimeType,
      documentData: projectsTable.documentData,
    }).from(projectsTable).where(eq(projectsTable.id, id));

    if (!project || !project.documentData || !project.documentName) {
      res.status(404).json({ error: "No document attached to this project" });
      return;
    }

    const buffer = Buffer.from(project.documentData, "base64");
    res.setHeader("Content-Type", project.documentMimeType ?? "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(project.documentName)}"`);
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ error: "Failed to download document" });
  }
});

export default router;
