"use client";

import { useEffect, useState } from "react";
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Post, Category } from "../app/utils/api";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // Guarda a pesquisa
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Busca as categorias
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8000/categories");
      if (!response.ok) {
        throw new Error("Erro ao buscar categorias");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  // Busca os posts sem filtrar (apenas os últimos posts)
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/posts");
      if (!response.ok) {
        throw new Error("Erro ao buscar posts");
      }
      const data = await response.json();
      // Ordena os posts por ID de forma decrescente
      const sortedPosts = data.sort((a: Post, b: Post) => b.id - a.id);
      // Exibe os últimos 4 posts (ou quantos desejar)
      setPosts(sortedPosts.slice(0, 4));
    } catch (error) {
      console.error("Erro ao carregar os posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funções para obter informações da categoria (sem alteração)
  const getCategoryName = (categoryId: number): string => {
    const findCategoryName = (categories: Category[], categoryId: number): string => {
      for (const category of categories) {
        if (category.id === categoryId) {
          return category.name;
        }
        const subcategoryName = findCategoryName(category.subcategories, categoryId);
        if (subcategoryName) {
          return subcategoryName;
        }
      }
      return '';
    };
    return findCategoryName(categories, categoryId);
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
    return findCategoryImage(categories, categoryId) || "/img/default.jpg";
  };

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  // Ao pesquisar, redireciona para a página de posts
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/posts?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <main>
      <h1 className={styles.descricaoOla}>Bem-vindo ao raPYdo!</h1>
      <h1 className={styles.descricao}>Seu blog de referência para não 
        esquecer nenhum detalhe na hora de codificar. Aqui, você encontrará 
        conteúdos que vão além do Python – abordamos diversas linguagens de 
        programação e técnicas que auxiliam no seu dia a dia como 
        desenvolvedor. Nosso objetivo é ser um guia prático, um manual 
        conciso e um resumo de conceitos, com códigos claros e de fácil 
        consulta para você pesquisar e relembrar os assuntos mais 
        importantes.</h1>
      <h1 className={styles.descricao}>Navegue pelas nossas categorias e 
        tags para encontrar rapidamente o conteúdo que precisa e descubra 
        dicas, tutoriais e resumos que vão acelerar seu aprendizado e melhorar 
        sua prática de programação.</h1>
      <h1 className={styles.descricaoMobile}>Esse blog tem como ideia um 
        lugar raPYdo para você encontrar algum detalhe que estava esquecendo 
        na hora de fazer o seu código.</h1>

      <div className={styles.searchTab}>
        <div className={styles.searchContent}>
          <input
            className={styles.searchBar}
            type="text"
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className={styles.searchBtn} onClick={handleSearch}>
            <FontAwesomeIcon className={styles.faSearch} icon={faSearch} />
          </button>
        </div>
      </div>

      <div className={styles.boxPosts}>
        <h1 className={styles.pageTitle}>Últimos Posts!</h1>

        <div className={styles.boxCards}>
          {loading && <div>Carregando posts...</div>}

          <div className={styles.cards}>
            {posts.map((post) => (
              <Link href={`/posts/${post.id}`} key={post.id} className={styles.postCard}>
                <div 
                  className={styles.cardInfo}
                  style={{ backgroundImage: `url(${getCategoryImage(post.category_id)})`}}>
                  <h3 className={styles.categoryText}>
                    {getCategoryName(post.category_id)}
                  </h3>
                  <h1 className={styles.titleText}>{post.title}</h1>
                </div>
                <div className={styles.readMore}>
                  <h2 className={styles.readMoreText}>Ver conteúdo!</h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
