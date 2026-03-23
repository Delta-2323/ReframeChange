import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { projectsTable } from "@workspace/db";
import { CreateProjectBody, GetProjectParams, UpdateProjectBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

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
    const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
    res.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse({ id: Number(req.params.id) });
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
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

router.patch("/:id/document", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse({ id: Number(req.params.id) });
    const { documentPath, documentName } = req.body as { documentPath: string; documentName: string };
    if (!documentPath || !documentName) {
      res.status(400).json({ error: "documentPath and documentName are required" });
      return;
    }
    const [project] = await db.update(projectsTable)
      .set({ documentPath, documentName, updatedAt: new Date() })
      .where(eq(projectsTable.id, id))
      .returning();
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error updating project document:", error);
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
