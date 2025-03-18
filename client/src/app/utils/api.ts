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

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL

export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const response = await fetch(`${serverUrl}/posts/${postId}`);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return null;
  }
}