import { Router } from "express";

import { lista, deleta } from "../controller/materials.js";
import { authenticate, authorize } from "../middleware/auth.js";

const routerMaterials = Router();

// Todas as rotas abaixo exigem autenticação
routerMaterials.use(authenticate);

// Admin e usuário podem visualizar
routerMaterials.get("/listar", lista);

// Somente admin pode deletar
routerMaterials.delete("/:id", authorize("admin"), deleta);

export default routerMaterials;