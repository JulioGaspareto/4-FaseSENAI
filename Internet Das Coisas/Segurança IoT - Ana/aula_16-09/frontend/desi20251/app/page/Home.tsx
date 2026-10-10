"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "../services/api";
import type { Session } from "../services/login";


type Material = {
id: number;
name: string;
category: string;
};

type Comment = {
id: number;
material_id: number;
comment: string;
created_at: string;
};

type Props = {
session: Session;
onLogout: () => void;
};

export default function Home({ session, onLogout }: Props) {
const [materials, setMaterials] = useState<Material[]>([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [notice, setNotice] = useState("");
const [deleting, setDeleting] = useState<number | null>(null);
const [revision, setRevision] = useState(0);

const [comments, setComments] = useState<Record<number, Comment[]>>({});
const [newComments, setNewComments] = useState<Record<number, string>>({});
const [loadingComments, setLoadingComments] = useState<number | null>(null);
const [sendingComment, setSendingComment] = useState<number | null>(null);
const [openedComments, setOpenedComments] = useState<number[]>([]);
const [commentErrors, setCommentErrors] = useState<Record<number, string>>({});
const [commentNotices, setCommentNotices] = useState<Record<number, string>>({});

const isAdmin = session.user.role === "admin";

const filteredMaterials = materials.filter((material) => {
  const name = material.name.toLowerCase();
  const category = material.category.toLowerCase();
  const searchText = search.toLowerCase().trim();

  return name.includes(searchText) || category.includes(searchText);
});

useEffect(() => {
let active = true;

async function loadMaterials() {
  try {
    const response = await api.get<Material[]>("/materials", {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (active) {
      setMaterials(response.data);
      setError("");
    }
  } catch (error) {
    if (active) {
      setError(errorMessage(error));
    }
  } finally {
    if (active) {
      setLoading(false);
    }
  }
}

loadMaterials();

return () => {
  active = false;
};


}, [session.token, revision]);

function refresh() {
setLoading(true);
setError("");
setNotice("");
setRevision((current) => current + 1);
}

async function remove(material: Material) {
if (!window.confirm(`Excluir ${material.name} do banco de dados?`)) {
return;
}


setDeleting(material.id);
setError("");
setNotice("");

try {
  await api.delete(`/materials/${material.id}`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  setMaterials((current) =>
    current.filter((item) => item.id !== material.id)
  );

  setComments((current) => {
    const updated = { ...current };
    delete updated[material.id];
    return updated;
  });

  setNotice(`${material.name} excluído.`);
} catch (error) {
  setError(errorMessage(error));
} finally {
  setDeleting(null);
}


}

async function loadComments(materialId: number) {
setLoadingComments(materialId);
setCommentErrors((current) => ({
...current,
[materialId]: "",
}));


try {
  const response = await api.get<Comment[]>(
    `/materials/${materialId}/comments`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    }
  );

  setComments((current) => ({
    ...current,
    [materialId]: response.data,
  }));
} catch (error) {
  setCommentErrors((current) => ({
    ...current,
    [materialId]: errorMessage(error),
  }));
} finally {
  setLoadingComments(null);
}


}

async function toggleComments(materialId: number) {
const isOpen = openedComments.includes(materialId);


if (isOpen) {
  setOpenedComments((current) =>
    current.filter((id) => id !== materialId)
  );
  return;
}

setOpenedComments((current) => [...current, materialId]);

if (!comments[materialId]) {
  await loadComments(materialId);
}


}

async function sendComment(materialId: number) {
const comment = newComments[materialId] ?? "";


if (comment.trim().length === 0) {
  setCommentErrors((current) => ({
    ...current,
    [materialId]: "Digite um comentário antes de enviar.",
  }));
  return;
}

if (comment.length > 500) {
  setCommentErrors((current) => ({
    ...current,
    [materialId]: "O comentário deve ter no máximo 500 caracteres.",
  }));
  return;
}

setSendingComment(materialId);
setCommentErrors((current) => ({
  ...current,
  [materialId]: "",
}));
setCommentNotices((current) => ({
  ...current,
  [materialId]: "",
}));

try {
  const response = await api.post<{ message: string; comment: Comment }>(
    `/materials/${materialId}/comments`,
    { comment },
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    }
  );

  setComments((current) => ({
    ...current,
    [materialId]: [
      response.data.comment,
      ...(current[materialId] ?? []),
    ],
  }));

  setNewComments((current) => ({
    ...current,
    [materialId]: "",
  }));

  setCommentNotices((current) => ({
    ...current,
    [materialId]: "Comentário enviado com sucesso!",
  }));
} catch (error) {
  setCommentErrors((current) => ({
    ...current,
    [materialId]: errorMessage(error),
  }));
} finally {
  setSendingComment(null);
}


}

return ( <section className="panel" aria-labelledby="materials-title"> <div className="actions"> <p> <strong>{session.user.name}</strong> · {session.user.email} </p>

 

    <button className="secondary" onClick={onLogout}>
      Sair
    </button>
  </div>

  <h1 id="materials-title">Materiais</h1>
<div className="search">
  <label htmlFor="search-materials">Pesquisar materiais</label>

<input
id="search-materials"
type="text"
placeholder="Digite o nome ou a categoria..."
value={search}
onChange={(event) => setSearch(event.target.value)}
/>

</div>
  <p>
    Perfil:{" "}
    <strong>
      {isAdmin ? "Administrador (admin)" : "Usuário comum (user)"}
    </strong>
  </p>

  <p>
    {isAdmin
      ? "Você pode consultar, comentar e excluir materiais."
      : "Você pode consultar materiais e enviar comentários."}
  </p>

  <p className="muted">
    Para comparar os perfis, saia e entre com a outra conta.
  </p>

  <button
    className="secondary"
    disabled={loading || deleting !== null}
    onClick={refresh}
  >
    Atualizar materiais
  </button>

  {error && (
    <p className="error" role="alert">
      {error}
    </p>
  )}

  {notice && (
    <p className="success" role="status">
      {notice}
    </p>
  )}

  {loading ? (
    <p role="status">Carregando materiais...</p>
  ) : (
    <ul className="materials">
      {filteredMaterials.map((material) => (
        <li key={material.id}>
          <div>
            <span>
              <strong>{material.name}</strong> · {material.category}
            </span>

            <div className="actions">
              <button
                className="secondary"
                onClick={() => toggleComments(material.id)}
              >
                {openedComments.includes(material.id)
                  ? "Ocultar comentários"
                  : "Ver comentários"}
              </button>

              {isAdmin && (
                <button
                  className="danger"
                  disabled={deleting !== null}
                  onClick={() => remove(material)}
                >
                  {deleting === material.id ? "Excluindo..." : "Excluir"}
                </button>
              )}
            </div>
          </div>

          {openedComments.includes(material.id) && (
            <section aria-label={`Comentários de ${material.name}`}>
              <h3>Comentários</h3>

              {loadingComments === material.id && (
                <p role="status">Carregando comentários...</p>
              )}

              {commentErrors[material.id] && (
                <p className="error" role="alert">
                  {commentErrors[material.id]}
                </p>
              )}

              {!loadingComments &&
                !commentErrors[material.id] &&
                (comments[material.id] ?? []).length === 0 && (
                  <p className="muted">
                    Nenhum comentário cadastrado. Seja o primeiro!
                  </p>
                )}

              <ul>
                {(comments[material.id] ?? []).map((item) => (
                  <li key={item.id}>
                    <p>{item.comment}</p>
                    <small className="muted">
                      {new Date(item.created_at).toLocaleString("pt-BR")}
                    </small>
                  </li>
                ))}
              </ul>

              <label htmlFor={`comment-${material.id}`}>
                Escreva seu comentário
              </label>

              <textarea
                id={`comment-${material.id}`}
                value={newComments[material.id] ?? ""}
                onChange={(event) =>
                  setNewComments((current) => ({
                    ...current,
                    [material.id]: event.target.value,
                  }))
                }
                maxLength={500}
                rows={3}
                placeholder="Digite seu comentário..."
              />

              <p className="muted">
                {(newComments[material.id] ?? "").length}/500 caracteres
              </p>

              {commentNotices[material.id] && (
                <p className="success" role="status">
                  {commentNotices[material.id]}
                </p>
              )}

              <button
                onClick={() => sendComment(material.id)}
                disabled={sendingComment === material.id}
              >
                {sendingComment === material.id
                  ? "Enviando..."
                  : "Enviar comentário"}
              </button>
            </section>
          )}
        </li>
      ))}
    </ul>
  )}
{!loading && !error && materials.length === 0 && (
  <p>Nenhum material cadastrado.</p>
)}

{!loading && !error && materials.length > 0 && filteredMaterials.length === 0 && (
  <p>Nenhum material encontrado para essa pesquisa.</p>
)}
</section>


);
}
