"use client";

import { useEffect, useState } from "react";
import styles from './page.module.css';
import Image from "next/image";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  imageUrl: string | null;
  subcategories: Category[];
};

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL 
const serverToken = process.env.NEXT_PUBLIC_AUTH_TOKEN


const CategoryTree = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openCategories, setOpenCategories] = useState<{ [key: number]: boolean }>({});
  const [showModal, setShowModal] = useState(false); // Controlar a visibilidade do modal
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${serverUrl}/categories`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Dados recebidos:", data);
        setCategories(data);
      })
      .catch((err) => console.error("Erro ao buscar as categorias:", err));
  }, []);

  const toggleCategory = (id: number) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addCategory = (parentId: number | null) => {
    setParentId(parentId);  
    setShowModal(true); 
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryName || !newCategoryImage) return;

    if (!serverToken) {
      console.error("Token de autenticação não encontrado.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newCategoryName);
    if (parentId !== null) {
      formData.append("parent_id", parentId.toString());
    }
    formData.append("image", newCategoryImage);

    const response = await fetch(`${serverUrl}/categories/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serverToken}`
      },
      body: formData,
    });

    if (response.ok) {
      const newCategory = await response.json();
      setCategories((prev) => addSubcategory(prev, parentId, newCategory));
      setShowModal(false);
    } else {
      const errorText = await response.text();
      console.error("Erro ao adicionar a categoria", errorText);
    }
  };

  const addSubcategory = (categories: Category[], parentId: number | null, newCategory: Category): Category[] => {
    if (parentId === null) return [...categories, newCategory];
    return categories.map((cat) =>
      cat.id === parentId
        ? { ...cat, subcategories: [...cat.subcategories, newCategory] }
        : { ...cat, subcategories: addSubcategory(cat.subcategories, parentId, newCategory) }
    );
  };

  const removeCategory = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover essa categoria?")) return;

      if (!serverToken) {
        console.error("Token de autenticação não encontrado.");
        return;
      }
    
    const response = await fetch(`${serverUrl}/categories/${id}`, { 
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${serverToken}`
      }
     });
    if (response.ok) {
      setCategories((prev) => removeCategoryById(prev, id));
    } else {
      const errorText = await response.text();
      console.error("Erro ao remover a categoria", errorText);
    }
  };

  const removeCategoryById = (categories: Category[], id: number): Category[] => {
    return categories
      .filter((cat) => cat.id !== id)
      .map((cat) => ({
        ...cat,
        subcategories: removeCategoryById(cat.subcategories, id),
      }));
  };

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <button className={styles.buttonPrincipal} onClick={() => addCategory(null)}>
          + Add Categoria Principal
        </button>
        <Link href={"/"} className="title">ra<span className="py">PY</span>do</Link>
      </div>
      
      <div className={styles.body}>
        <ul>
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              toggleCategory={toggleCategory}
              openCategories={openCategories}
              addCategory={addCategory}
              removeCategory={removeCategory}
              className={`${styles.folders} ${openCategories[cat.id] ? styles.open : ""}`}
              level={0}
            />
          ))}
        </ul>

        {/* Modal de Adicionar Categoria */}
        {showModal && (
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Adicionar Categoria</h2>
              <form className={styles.modalContent} onSubmit={handleCategorySubmit}>
                <label>
                  Nome:
                  <input
                    className={styles.inputName}
                    type="text"
                    placeholder=" Categoria"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Imagem:
                  <input
                    type="text"
                    onChange={(e) => setNewCategoryImage(e.target.value)}
                    required
                  />
                </label>
                <div className={styles.buttons}>
                  <button type="submit">Criar Categoria</button>
                  <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                </div>
              </form>
            </div>
        )}
      </div>
    </div>
  );
};

const CategoryItem = ({
  category,
  toggleCategory,
  openCategories,
  addCategory,
  removeCategory,
  level,
}: {
  category: Category;
  toggleCategory: (id: number) => void;
  openCategories: { [key: number]: boolean };
  addCategory: (parentId: number) => void;
  removeCategory: (id: number) => void;
  className?: string;
  level: number;
}) => {
  return (
    <li className={`${styles.folders} ${styles.categoryItem} ${openCategories[category.id] ? styles.open : ""}`}>
      <div>
        <button
          onClick={() => toggleCategory(category.id)}
          className={openCategories[category.id] ? styles.openButton : styles.closedButton}>
          {openCategories[category.id] ? "▼" : "▶"}
        </button>

        {/* Exibindo a imagem, se houver */}
        {category.imageUrl && (
          <Image 
            src={category.imageUrl} 
            alt={category.name} 
            className={styles.categoryImage} 
            width={500}  // Defina a largura desejada
            height={500} // Defina a altura desejada
          />
        )}
        {category.name}

        <button onClick={() => addCategory(category.id)}>➕</button>
        <button onClick={() => removeCategory(category.id)}>🗑️</button>
      </div>
      {openCategories[category.id] && category.subcategories.length > 0 && (
        <ul>
          {category.subcategories.map((sub) => (
            <CategoryItem
              key={sub.id}
              category={sub}
              toggleCategory={toggleCategory}
              openCategories={openCategories}
              addCategory={addCategory}
              removeCategory={removeCategory}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CategoryTree;
