
export async function listComments(req, res) {
    const materialId = Number(req.params.id);

    if (!Number.isSafeInteger(materialId) || materialId <= 0) {
        return res.status(400).json({
            message: "ID do material inválido."
        });
    }

    const material = await req.app.locals.db.query(
        "SELECT id FROM materials WHERE id = $1",
        [materialId]
    );

    if (material.rowCount === 0) {
        return res.status(404).json({
            message: "Material não encontrado."
        });
    }

    const { rows } = await req.app.locals.db.query(
        `SELECT id, material_id, comment, created_at
     FROM comments
     WHERE material_id = $1
     ORDER BY created_at DESC, id DESC`,
        [materialId]
    );

    return res.json(rows);
}

export async function createComment(req, res) {
    const materialId = Number(req.params.id);
    const { comment } = req.body || {};

    if (!Number.isSafeInteger(materialId) || materialId <= 0) {
        return res.status(400).json({
            message: "ID do material inválido."
        });
    }


    if (
        typeof comment !== "string" ||
        comment.trim().length === 0 ||
        comment.length > 500
    ) {
        return res.status(400).json({
            message: "O comentário deve ser um texto entre 1 e 500 caracteres."
        });
    }


    const material = await req.app.locals.db.query(
        "SELECT id FROM materials WHERE id = $1",
        [materialId]
    );

    if (material.rowCount === 0) {
        return res.status(404).json({
            message: "Material não encontrado."
        });
    }


    const { rows } = await req.app.locals.db.query(
        `INSERT INTO comments (material_id, comment)
     VALUES ($1, $2)
     RETURNING id, material_id, comment, created_at`,
        [materialId, comment]
    );

    return res.status(201).json({
        message: "Comentário cadastrado com sucesso.",
        comment: rows[0]
    });
}
