"use client";

import styles from './page.module.css';
import { useEffect, useState } from "react";
import { createPost, getCategories, getTags, extractCategories } from "@/app/utils/api";
import { Category } from "@/app/utils/api"; // Importa a interface exportada
import LexicalEditor from "../components/LexicalEditor";
import Link from 'next/link';

interface CategoryOption {
  id: number;
  name: string;
}

interface TagOption {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
  is_mandatory: boolean;
  options: TagOption[];
}

export default function AddPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [messageClass, setMessageClass] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  // Estado para guardar a opção selecionada para cada tag (map: tagId => optionId)
  const [selectedTagOptions, setSelectedTagOptions] = useState<{ [tagId: number]: number }>({});

  useEffect(() => {
    // Busca as categorias com tipagem adequada
    getCategories()
      .then((data: Category[]) => setCategoryOptions(extractCategories(data)))
      .catch((err: Error) => console.error("Erro ao buscar categorias:", err));
    
    // Busca as tags (tag types com as opções embutidas)
    getTags()
      .then((data: Tag[]) => setTags(data))
      .catch((err: Error) => console.error("Erro ao buscar tags:", err));
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategoryName(value);
    const foundCategory = categoryOptions.find(cat => cat.name === value);
    setCategoryId(foundCategory ? foundCategory.id : null);
  };

  const handleTagChange = (tagId: number, optionId: number) => {
    setSelectedTagOptions(prev => ({ ...prev, [tagId]: optionId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      setMessage("Por favor, selecione uma categoria válida.");
      setMessageClass("errorMessage");
      return;
    }

    // Valida se as tags obrigatórias foram selecionadas
    for (const tag of tags) {
      if (tag.is_mandatory && !selectedTagOptions[tag.id]) {
        setMessage(`Por favor, selecione uma opção para a tag "${tag.name}".`);
        setMessageClass("errorMessage");
        return;
      }
    }

    if (title.trim() === "" || content.trim() === "") {
      setMessage("O título e o conteúdo não podem estar vazios.");
      setMessageClass("errorMessage");
      return;
    }

    try {
      await createPost({ 
        title, 
        content, 
        category_id: categoryId,
        tag_option_ids: Object.values(selectedTagOptions)
      });

      setMessage("Post criado com sucesso!");
      setMessageClass("successMessage");
      setTitle("");
      setContent("");
      setCategoryName("");
      setSelectedTagOptions({});
    } catch (error) {
      console.error("Erro ao criar post:", error);
      setMessage("Erro ao criar o post.");
      setMessageClass("errorMessage");
    }
  };

  return (
    <div className={styles.pageEdit}>
      <form className={styles.formulario} onSubmit={handleSubmit}>
        <div className={styles.left}>
          <Link href={"/"} className='no-underline'>
            <h1 className="title">ra<span className="py">PY</span>do</h1>
          </Link>
          <h1>Novo Post</h1>

          <div className={styles.categoriaDiv}>
            <label htmlFor="categoria">Categoria:</label>
            <input 
              list="categorias" 
              id="categoria" 
              name="categoria" 
              value={categoryName}
              onChange={handleCategoryChange}
            />
            <datalist id="categorias">
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.name} />
              ))}
            </datalist>
          </div>

          {/* Seção para exibir as tags e suas opções */}
          {tags.length > 0 && (
            <div className={styles.tagsDiv}>
              <h1 className={styles.tagsTitle}>Tags:</h1>
              {tags.map(tag => (
                <div key={tag.id} className={styles.tagGroup}>
                  <label htmlFor={`tag-${tag.id}`}>{tag.name}:</label>
                  <select 
                    id={`tag-${tag.id}`}
                    value={selectedTagOptions[tag.id] || ""}
                    onChange={(e) => handleTagChange(tag.id, parseInt(e.target.value))}
                  >
                    <option value=""></option>
                    {tag.options.map(option => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <button className={styles.button} type="submit">Criar Post</button>
          {message && <p className={styles[messageClass]}>{message}</p>}
        </div>

        <div className={styles.right}>
          <input 
            type="text" 
            id="titulo" 
            name="titulo" 
            placeholder="Título" 
            className={styles.titulo}
            value={title}
            onChange={(e) => {
              const newTitle = e.target.value;
              if (newTitle.length <= 85) {
                setTitle(newTitle);
              }
            }}
            required
          />
          
          <LexicalEditor 
            className={styles.descricao}
            onChange={(editorState) => {
              const jsonString = JSON.stringify(editorState || {});
              setContent(jsonString);
            }}
          />
        </div>
      </form>
    </div>
  );
}
