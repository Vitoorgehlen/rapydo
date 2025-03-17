import axios from "axios";

export interface TagOption {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  category_id: number;
  tag_options: TagOption[];
}

export interface Category {
  id: number;
  name: string;
  image_url: string;
  subcategories: Category[];
}

const api = axios.create({
    baseURL: "http://127.0.0.1:8000" 
});

export const getPosts = async () => {
    try {
        const response = await api.get("/posts"); 
        console.log("Dados recebidos:", response.data); 
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        return [];
    }
};

export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/posts/${postId}`);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return null;
  }
}