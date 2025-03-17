"use client";

import { useEffect, useState, Suspense } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Post, Category } from "../utils/api";

function PostsContent() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(""); // Para a UI
  const query = searchParams.get("q") || "";
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;
  const router = useRouter();

  // Busca as categorias (executada uma vez)
  const fetchCategories = async () => {
    try {
      const response = await fetch("https://rapydo.onrender.com/categories");
      if (!response.ok) {
        throw new Error("Erro ao buscar categorias");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  // Busca os posts (executada uma vez)
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://rapydo.onrender.com/posts");
      if (!response.ok) {
        throw new Error("Erro ao buscar posts");
      }
      const data = await response.json();
      const sortedPosts = data.sort((a: Post, b: Post) => b.id - a.id);
      setAllPosts(sortedPosts);
      setPosts(sortedPosts); // Exibe todos ou, se preferir, os últimos posts
    } catch (error) {
      console.error("Erro ao carregar os posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Executa a busca dos dados uma única vez
  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  // Efeito para filtrar os posts já buscados, sempre que a query, as categorias ou os posts mudarem
  useEffect(() => {
    if (query) {
      // Função que percorre a árvore de categorias e retorna os IDs que batem com a query
      const getMatchingCategoryIds = (
        categories: Category[],
        query: string
      ): Set<number> => {
        const matchingIds = new Set<number>();
        const checkCategory = (cat: Category, ancestorMatched: boolean) => {
          const currentMatched =
            ancestorMatched || cat.name.toLowerCase().includes(query.toLowerCase());
          if (currentMatched) {
            matchingIds.add(cat.id);
          }
          cat.subcategories.forEach((sub) => checkCategory(sub, currentMatched));
        };
        categories.forEach((cat) => checkCategory(cat, false));
        return matchingIds;
      };

      const matchingCategoryIds = getMatchingCategoryIds(categories, query);

      const filteredPosts = allPosts.filter((post: Post) => {
        const postContent = JSON.parse(post.content).root.children
          .map((child: { children?: { text: string }[] }) =>
            child.children?.map((c) => c.text).join(" ") || ""
          )
          .join(" ");

        const titleMatch = post.title.toLowerCase().includes(query.toLowerCase());
        const contentMatch = postContent.toLowerCase().includes(query.toLowerCase());
        const categoryMatch = matchingCategoryIds.has(post.category_id);

        return titleMatch || contentMatch || categoryMatch;
      });

      setPosts(filteredPosts);
      setCurrentPage(1); // Reseta para a página 1 ao filtrar
    } else {
      // Se não houver query, exibe todos os posts (ou os últimos)
      setPosts(allPosts);
    }
  }, [query, categories, allPosts]);

  // Paginação
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Função para obter o nome da categoria (percorrendo a árvore)
  const getCategoryName = (categoryId: number): string => {
    const findCategoryName = (categories: Category[], categoryId: number): string => {
      for (const category of categories) {
        if (category.id === categoryId) return category.name;
        const subcategoryName = findCategoryName(category.subcategories, categoryId);
        if (subcategoryName) return subcategoryName;
      }
      return "";
    };
    return findCategoryName(categories, categoryId);
  };

  const getCategoryImage = (categoryId: number): string => {
    const findCategoryImage = (categories: Category[], categoryId: number): string | null => {
      for (const category of categories) {
        if (category.id === categoryId) {
          return category.image_url?.startsWith("/img")
            ? category.image_url
            : `/img/${category.image_url}` || null;
        }
        const subcategoryImage = findCategoryImage(category.subcategories, categoryId);
        if (subcategoryImage) return subcategoryImage;
      }
      return null;
    };
    return findCategoryImage(categories, categoryId) || "/img/default.png";
  };

  // Ao pesquisar, redireciona para a página de posts (aqui já está nesta página, mas se preferir redirecionar, mantenha o router.push)
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/posts?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <main className={styles.main}>
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
        <h1 className={styles.pageTitle}>Posts encontrados!</h1>
      </div>

      <div className={styles.cards}>
        {loading && <div>Carregando posts...</div>}
        {currentPosts.map((post) => (
          <Link href={`/posts/${post.id}`} key={post.id} className={styles.postCard}>
            <div
              className={styles.cardInfo}
              style={{ backgroundImage: `url(${getCategoryImage(post.category_id)})` }}
            >
              <h3 className={styles.categoryText}>{getCategoryName(post.category_id)}</h3>
              <h1 className={styles.titleText}>{post.title}</h1>
            </div>
            <div className={styles.readMore}>
              <h2 className={styles.readMoreText}>Ver conteúdo!</h2>
            </div>
          </Link>
        ))}
      </div>

      <p className="sep-line center">______________________________________________________________________</p>

      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </main>
  );
}

export default function Posts() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PostsContent />
    </Suspense>
  );
}