"use client";

import styles from './page.module.css';
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getPostById, updatePost, getCategories, getTags, extractCategories } from "@/app/utils/api";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { Toolbar } from "@/app/components/Toolbar";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import Link from 'next/link';

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

export default function PageEdit() {
  const { id } = useParams();
  const postId = Array.isArray(id) ? id[0] : id;
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<{ id: number, name: string }[]>([]);
  const [message, setMessage] = useState("");
  const [messageClass, setMessageClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagOptions, setSelectedTagOptions] = useState<{ [tagId: number]: number }>({});

  // Monitorar tags e selectedTagOptions para definir mensagem de erro
  useEffect(() => {
    for (const tag of tags) {
      if (tag.is_mandatory && !selectedTagOptions[tag.id]) {
        setMessage(`Por favor, selecione uma opção para a tag "${tag.name}".`);
        setMessageClass("errorMessage");
        return;
      }
    }
    // Se todas as tags obrigatórias estão selecionadas, limpa a mensagem
    setMessage("");
    setMessageClass("");
  }, [tags, selectedTagOptions]);

  useEffect(() => {
    getCategories()
      .then(data => setCategoryOptions(extractCategories(data)))
      .catch(err => console.error("Erro ao buscar categorias:", err));

    getTags()
      .then((data: Tag[]) => setTags(data))
      .catch((err: Error) => console.error("Erro ao buscar tags:", err));
  }, []);

  useEffect(() => {
    if (!postId) return;
    getPostById(postId)
      .then(post => {
        setTitle(post.title);
        setCategoryId(post.category_id);
        // Se post.content já é uma string, use-a; caso contrário, converte para string JSON
        const contentString =
          typeof post.content === "string" ? post.content : JSON.stringify(post.content || {});
        setInitialContent(contentString);
  
        // Configura as tags selecionadas, usando a propriedade "tag_options"
        if (post.tag_options) {
          const mapping: { [tagId: number]: number } = {};
          post.tag_options.forEach((tagOption: { tag_type_id: number, id: number }) => {
            mapping[tagOption.tag_type_id] = tagOption.id;
          });
          setSelectedTagOptions(mapping);
        }
      })
      .catch(error => console.error("Erro ao buscar post", error))
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    if (categoryId !== null) {
      const category = categoryOptions.find(cat => cat.id === categoryId);
      setCategoryName(category ? category.name : "");
    }
  }, [categoryId, categoryOptions]);

  const editorConfig = useMemo(() => ({
    namespace: "Editor",
    theme: {},
    onError: (error: unknown) => console.error("Editor error:", error),
  }), []);

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
    if (!postId || !categoryId) {
      setMessage("Erro: ID do post ou categoria inválida.");
      setMessageClass("errorMessage");
      return;
    }
    
    try {
      await updatePost(Number(postId), { 
        title, 
        content: initialContent || "{}", 
        category_id: categoryId,
        tag_option_ids: Object.values(selectedTagOptions)  // Inclua esse campo!
      });
      setMessage("Post atualizado com sucesso!");
      setMessageClass("successMessage");
      // Opcional: se desejar, mantenha ou não as tags selecionadas no estado
      // setSelectedTagOptions({});
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      setMessage("Erro ao atualizar o post.");
      setMessageClass("errorMessage");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className={styles.pageEdit}>
      <form className={styles.formulario} onSubmit={handleSubmit}>
        <div className={styles.left}>
          <Link href={"/"} className="no-underline">
            <h1 className="title">ra<span className="py">PY</span>do</h1>
          </Link>
          <h1>ID: {postId}</h1>
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

          {tags.length > 0 && (
            <div className={styles.tagsDiv}>
              <h1 className={styles.tagsTitle}>Tags:</h1>
              {tags.map(tag => (
                <div key={tag.id} className={styles.tagGroup}>
                  <label htmlFor={`tag-${tag.id}`}>{tag.name}:</label>
                  <select 
                    id={`tag-${tag.id}`}
                    value={selectedTagOptions[tag.id] ? selectedTagOptions[tag.id].toString() : ""}
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

          <button className={styles.button} type="submit">Editar Post</button>
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

          {initialContent && (
            <LexicalComposer initialConfig={editorConfig}>
              <div className={styles.editorContainer}>
                <EditorInitializer content={initialContent} />
                <Toolbar />
                <RichTextPlugin 
                  contentEditable={<ContentEditable className={styles.descricao} />} 
                  placeholder={<p>Comece a escrever...</p>}
                  ErrorBoundary={() => <p>Erro ao carregar editor</p>}
                />
                <HistoryPlugin />
                <OnChangePlugin 
                  onChange={(editorState) => {
                    setInitialContent(JSON.stringify(editorState.toJSON()));
                  }} 
                />
              </div>
            </LexicalComposer>
          )}
        </div>
      </form>
    </div>
  );
}

function EditorInitializer({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    try {
      const contentJson = JSON.parse(content);
      editor.update(() => {
        const editorState = editor.parseEditorState(contentJson);
        editor.setEditorState(editorState);
      });
      setIsInitialized(true);
    } catch (error) {
      console.error("Erro ao restaurar conteúdo:", error);
    }
  }, [editor, content, isInitialized]);

  return null;
}
