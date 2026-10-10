
export async function listMaterials(req, res) {
  const { rows } = await req.app.locals.db.query(
    "SELECT id, name, category FROM materials ORDER BY id"
  );

  res.json(rows);
}

export async function deleteMaterial(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID inválido." });
  }

  const { rowCount } = await req.app.locals.db.query(
    "DELETE FROM materials WHERE id = $1",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "Material não encontrado." });
  }

  res.status(204).end();
}
