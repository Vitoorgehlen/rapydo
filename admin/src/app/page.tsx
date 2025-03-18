"use client";

import { useEffect, useState } from "react";
import { getPosts, deletePost } from "@/app/utils/api";
import Link from "next/link";
import styles from './page.module.css';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faEraser } from "@fortawesome/free-solid-svg-icons";

type Post = {
  id: number;
  title: string;
  content: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        const sortedPosts = data.sort((a: Post, b: Post) => b.id - a.id);
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (postToDelete !== null) {
      try {
        console.log(`Excluindo o post com ID: ${postToDelete}`);
        await deletePost(postToDelete.toString());
        setPosts(posts.filter(post => post.id !== postToDelete)); // Atualiza a lista de posts após excluir
      } catch (error) {
        console.error("Erro ao excluir post:", error);
      } finally {
        setPostToDelete(null); 
      }
    }
  };

  return (
    <div className="">
      <div className={styles.crud}>
        <div className={styles.buttons}>
          <Link href="/add" target="_blank" rel="noopener noreferrer">
            <button className={styles.addBtn}>
              <h1 className={styles.addBtnTxt}>Add</h1>
              <h1 className={styles.addBtnTxt}>Posts</h1>
              </button>
          </Link>
          <div className={styles.btnTagCat}>
            <Link href="/tags" target="_blank" rel="noopener noreferrer">
              <button className={styles.btnTag}>Tags</button>
            </Link>
            <Link href="/categories" target="_blank" rel="noopener noreferrer">
              <button className={styles.btnCat}>Categorias</button>
            </Link>
          </div>

          {/* Modal de confirmação */}
          {postToDelete !== null && (
            <div className={styles.modal}>
              <p>Tem certeza que deseja excluir?</p>
              <div className={styles.buttonsModal}>
                <button className={styles.confirm} onClick={handleDelete}>Sim, excluir</button>
                <button className={styles.cancel} onClick={() => setPostToDelete(null)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        <div className="title-panel">
          <Link href={"/"} className="title center">
            ra<span className="py">PY</span>do
          </Link>
          <h1 className="title-adm">Painel administrativo</h1>
        </div>
      </div>

      <div className={styles.listPosts}>
        {loading ? (
          <p>Carregando...</p>
        ) : posts.length === 0 ? (
          <p>Nenhum post encontrado</p>  // Exibe uma mensagem se não houver posts
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <div className={styles.postsLink}>
                  <h2 className={styles.postsTitle}>
                    {post.id}: {post.title}
                  </h2>
                  <div className={styles.icons}>
                    <Link href={`/edit/${post.id}`} target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon className={styles.pencil} icon={faPencil} />
                    </Link>
                    <button className={styles.eraserBt} onClick={() => setPostToDelete(post.id)}>
                      <FontAwesomeIcon className={styles.eraser} icon={faEraser} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}