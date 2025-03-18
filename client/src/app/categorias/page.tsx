"use client";

import { useEffect, useState } from "react";
import styles from './page.module.css';
import Link from "next/link";
import { Post, Category } from "../utils/api";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL

const CategoryTree = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [selectAllText, setSelectAllText] = useState("Selecionar todas");
  const [currentPage, setCurrentPage] = useState(1); 
  const postsPerPage = 9; 

  useEffect(() => {
    fetch(`${serverUrl}/categories`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Categorias recebidas:", data);
        setCategories(data);
      })
      .catch((err) => console.error("Erro ao buscar as categorias:", err));
  }, []);

  useEffect(() => {
    if (selectedCategories.size > 0) {
      const categoryIds = Array.from(selectedCategories).join("&categories=");
      fetch(`${serverUrl}/posts?categories=${categoryIds}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Posts recebidos:", data);
          setPosts(data.reverse());
        })
        .catch((err) => console.error("Erro ao buscar posts:", err));
    } else {
      setPosts([]);
    }
  }, [selectedCategories]);

  const toggleCategorySelection = (id: number) => {
    setSelectedCategories((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const selectAllCategories = (e: React.ChangeEvent<HTMLInputElement>) => {
    const getAllCategoryIds = (categories: Category[]): number[] =>
      categories.flatMap(cat => [cat.id, ...getAllCategoryIds(cat.subcategories)]);
  
    if (e.target.checked) {
      setSelectedCategories(new Set(getAllCategoryIds(categories)));
      setSelectAllText("Desmarcar todas");
    } else {
      setSelectedCategories(new Set());
      setSelectAllText("Marcar todas");
    }
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(posts.length / postsPerPage);

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
          console.log("retorno da category", category.image_url)
          return category.image_url?.startsWith('/img') ? category.image_url : `/img/${category.image_url}` || null;
        }
        const subcategoryImage = findCategoryImage(category.subcategories, categoryId);
        if (subcategoryImage) {
          console.log("retorno da subcategory", subcategoryImage)
          return subcategoryImage;
        }
      }
      return null;
    };
    return findCategoryImage(categories, categoryId) || "/img/default.jpg";
  };
  

  return (
    <main className={styles.main}>
      <div className={styles.boxPageTitle}>
        <h1 className={styles.pageTitle}>Categorias</h1>
      </div>

      <div className={styles.boxBody}>
        <div className={styles.boxBodyLeft}>
          <h1 className={styles.selectCategories}>Selecione as categorias desejadas!</h1>
          <label className={styles.selectAllOrNot}>
            <input
              type="checkbox"
              id="all-categories"
              onChange={selectAllCategories}
              className={styles.categoryCheckbox}
            />
            <span
              className={`${styles.selectAllText} ${selectAllText === 'Desmarcar todas' ? styles.checked : ''}`}
            >
              {selectAllText}
            </span>
          </label>

          <ul>
            {categories.map((cat) => (
              <CategoryItem
                key={cat.id}
                category={cat}
                toggleCategorySelection={toggleCategorySelection}
                selectedCategories={selectedCategories}
                level={0}
              />
            ))}
          </ul>
        </div>

        <div className={styles.boxBodyRight}>
          {selectedCategories.size > 0 ? (
            posts.length > 0 ? (
              <div className={styles.cards}>
                {currentPosts.map((post) => (
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
            ) : (
              <p className={styles.textFound}>Nenhum post encontrado para essas categorias.</p>
            )
          ) : (
            <p className={styles.textFound}>Selecione categorias para ver os posts.</p>
          )}
        </div>
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
};

const CategoryItem = ({
  category,
  toggleCategorySelection,
  selectedCategories,
  level,
}: {
  category: Category;
  toggleCategorySelection: (id: number) => void;
  selectedCategories: Set<number>;
  level: number;
}) => {
  return (
    <li
  className={`${styles.folders} ${styles.categoryItem} ${selectedCategories.has(category.id) ? styles.selected : ""}`}
  style={{ "--level": level } as React.CSSProperties}
>
  <label className={styles.categoryLabel} onClick={() => toggleCategorySelection(category.id)}>
    <input
      type="checkbox"
      checked={selectedCategories.has(category.id)}
      onChange={(e) => {
        e.preventDefault();
        toggleCategorySelection(category.id)
      }}
      className={styles.categoryCheckbox}
      id={`category-${category.id}`}
    />

    <span className={`${styles.categoryToggle} ${selectedCategories.has(category.id) ? styles.selectedIcon : ""}`}>
      ▶
    </span>
    <h1 className={styles.categoryTitle}>{category.name}</h1>
  </label>

  {category.subcategories.length > 0 && (
    <ul>
      {category.subcategories.map((sub) => (
        <CategoryItem
          key={sub.id}
          category={sub}
          toggleCategorySelection={toggleCategorySelection}
          selectedCategories={selectedCategories}
          level={level + 1}
        />
      ))}
    </ul>
  )}
    </li>

  );
};

export default CategoryTree;