"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPostById, Post, Category } from "../../utils/api";
import LexicalEditor from "../../components/LexicalEditor";
import styles from "./page.module.css";
import Image from "next/image";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL

export default function ViewPost() {
  const params = useParams();
  const postId = params?.postId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState<string | object>(""); 
  const [title, setTitle] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  // Novo estado para as tags do post
  const [postTags, setPostTags] = useState<{ id: number; name: string }[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${serverUrl}/categories`);
      if (!response.ok) {
        throw new Error("Erro ao buscar categorias");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const getCategoryName = (categoryId: number | null): string => {
    if (categoryId === null) return "Sem Categoria";
    
    const findCategoryName = (categories: Category[], categoryId: number): string | null => {
      for (const category of categories) {
        if (category.id === categoryId) {
          return category.name;
        }
        const subcategoryName = findCategoryName(category.subcategories, categoryId);
        if (subcategoryName) {
          return subcategoryName;
        }
      }
      return null;
    };
    return findCategoryName(categories, categoryId) || "Categoria Desconhecida";
  };

  const getCategoryImage = (categoryId: number): string => {
    const findCategoryImage = (categories: Category[], categoryId: number): string | null => {
      for (const category of categories) {
        if (category.id === categoryId) {
          return category.image_url?.startsWith('/img')
            ? category.image_url
            : `/img/${category.image_url}` || null;
        }
        const subcategoryImage = findCategoryImage(category.subcategories, categoryId);
        if (subcategoryImage) {
          return subcategoryImage;
        }
      }
      return null;
    };
    return findCategoryImage(categories, categoryId) || "/img/default.png";
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!postId) return;

    getPostById(postId)
      .then((data: Post | null) => {
        if (data) {
          console.log("Post encontrado:", data);
          setTitle(data.title);
          setCategoryId(data.category_id);
          // Se a API retornar as tags associadas ao post, atualize o estado:
          setPostTags(data.tag_options || []);
          
          try {
            let parsedContent = data.content;
            if (typeof parsedContent === "string") {
              console.log("Conteúdo antes do parse:", parsedContent);
              parsedContent = JSON.parse(parsedContent);              
              console.log("Conteúdo depois do parse:", parsedContent);
            }
            setContent(parsedContent);
          } catch (error) {
            console.error("Erro ao converter JSON para estado do editor:", error);
            setContent("");
          }
        }
      })
      .catch((err) => console.error("Erro ao buscar post:", err));
  }, [postId]);

  return (
    <main className={styles.main}>
      <div className={styles.titleBox}>
        <div className={styles.imageWrapper}>
          <Image 
            src={categoryId ? getCategoryImage(categoryId) : "/img/default.png"} 
            alt="Background" 
            fill
            style={{ objectFit: "cover" }}
            className={styles.backgroundImage} 
          />
        </div>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.postInfo}>
        <h2 className={styles.infosPost}>{getCategoryName(categoryId)}</h2>
        {/* Renderizando as tags dinamicamente */}
        {postTags.length > 0 && (
          <div className={styles.tagsContainer}>
            {postTags.map((tag) => (
              <span key={tag.id} className={styles.tag}>
                <h2 className={styles.infosPost}> | {tag.name}</h2>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.contentBox}>
        <LexicalEditor 
          className={styles.content}
          content={typeof content === "string" ? content : JSON.stringify(content)}
          readOnly={true} 
        />
      </div>
    </main>
  );
}
