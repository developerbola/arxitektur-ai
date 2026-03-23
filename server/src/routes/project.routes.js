import { Hono } from 'hono';
import { getProjects, createProject, getProjectById } from '../controllers/project.controller.js';

const projectRoutes = new Hono();

projectRoutes.get('/', getProjects);
projectRoutes.post('/', createProject);
projectRoutes.get('/:id', getProjectById);

export default projectRoutes;
