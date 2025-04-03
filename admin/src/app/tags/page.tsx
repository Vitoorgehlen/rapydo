"use client";

import { useEffect, useState, FormEvent } from "react";
import styles from "./page.module.css";

interface Option {
  name:string;
}
interface Tag {
  id: number;
  name: string;
  is_mandatory: boolean;
  options: Option[];
}

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL 
const serverToken = process.env.NEXT_PUBLIC_AUTH_TOKEN


const TagManager = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState<string>("");
  const [isMandatory, setIsMandatory] = useState<boolean>(false);
  const [tagOptions, setTagOptions] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${serverUrl}/tags`)
      .then((res) => res.json())
      .then((data: Tag[]) => setTags(data))
      .catch((err) => console.error("Erro ao buscar as tags:", err));
  }, []);

  const openModal = (tag: Tag | null = null) => {
    console.log("Tag recebida:", tag);
    setCurrentTag(tag);
    setTagName(tag ? tag.name : "");
    setIsMandatory(tag ? tag.is_mandatory : false);
    setTagOptions(tag ? tag.options.map((option) => option.name) : []);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!serverToken) {
      console.error("Token de autenticação não encontrado.");
      return;
    }

    const method = currentTag ? "PUT" : "POST";
    const url = currentTag
      ? `${serverUrl}/tags/${currentTag.id}`
      : `${serverUrl}/tags`;

    const bodyData = {
      name: tagName,
      is_mandatory: isMandatory,
      options: tagOptions.filter((opt) => opt.trim() !== ""),
    };

    const response = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serverToken}`
      },
      body: JSON.stringify(bodyData),
    });

    if (response.ok) {
      const updatedTag: Tag = await response.json();
      setTags((prev) =>
        currentTag
          ? prev.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag))
          : [...prev, updatedTag]
      );
      setTagName("");
      setIsMandatory(false);
      setTagOptions([]);
      setShowModal(false);
    } else {
      console.error("Erro ao salvar a tag");
    }
  };

  const deleteTag = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir essa tag?")) return;

    if (!serverToken) {
      console.error("Token de autenticação não encontrado.");
      return;
    }

    const response = await fetch(`${serverUrl}/tags/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${serverToken}`
      },
    });
    if (response.ok) {
      setTags((prev) => prev.filter((tag) => tag.id !== id));
    } else {
      console.error("Erro ao excluir a tag");
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <button className={styles.buttonPrincipal} onClick={() => openModal()}>
          + Adicionar Tag
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.esquerda}>
          <ul>
            {tags.map((tag) => (
              <li key={tag.id} className={styles.tagItem}>
                {tag.name}
                <button onClick={() => openModal(tag)}>✏️</button>
                <button onClick={() => deleteTag(tag.id)}>🗑️</button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className={styles.direita}>
        {showModal && (
          <div className={styles.modal}>
            <h2>{currentTag ? "Editar Tag" : "Adicionar Tag"}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Nome:
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  required
                />
              </label>
              <label>
                Obrigatória:
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                />
              </label>
              <div>
                <h3>Opções da Tag</h3>
                {tagOptions.map((option, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...tagOptions];
                        newOptions[index] = e.target.value;
                        setTagOptions(newOptions);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setTagOptions(tagOptions.filter((_, i) => i !== index));
                      }}
                    >
                      Remover
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setTagOptions([...tagOptions, ""])}
                >
                  + Adicionar Opção
                </button>
              </div>
              <div className={styles.buttons}>
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
        </div>
      </div>

    </div>
  );
};

export default TagManager;
