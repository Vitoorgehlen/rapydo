export interface Category {
  id: number;
  name: string;
  subcategories?: Category[];
}

export interface PostData {
  title: string;
  content: string;
  category_id: number | null;
  tag_option_ids: number[];
}

export interface TagOption {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
  is_mandatory: boolean;
  options: TagOption[];
}

export async function createPost(postData: PostData) {
  console.log("Enviando requisição para API...");
  
  const response = await fetch("http://127.0.0.1:8000/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  console.log("Resposta recebida:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao criar post:", errorText);
    throw new Error("Erro ao criar o post: " + errorText);
  }

  return await response.json();
}

export const getPosts = async () => {
  const response = await fetch("http://127.0.0.1:8000/posts");

  if (!response.ok) {
    throw new Error("Erro ao buscar posts");
  }

  return await response.json();
};

export const getPostById = async (id: string) => {
  const response = await fetch(`http://127.0.0.1:8000/posts/${id}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar post");
  }

  return await response.json();
};

export async function updatePost(postId: number, updatedData: Partial<PostData>) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao atualizar post: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na requisição PUT:", error);
    throw error;
  }
}

export async function deletePost(id: string) {
  const response = await fetch(`http://127.0.0.1:8000/posts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao excluir post:", errorText);
    throw new Error("Erro ao excluir o post: " + errorText);
  }
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch("http://127.0.0.1:8000/categories");

  if (!response.ok) {
    throw new Error("Erro ao buscar categorias");
  }

  return await response.json();
};

// Função para estruturar categorias
export const extractCategories = (categories: Category[], prefix = ""): { id: number, name: string }[] => {
  let options: { id: number, name: string }[] = [];

  categories.forEach((category) => {
    const fullName = prefix ? `${prefix} - ${category.name}` : category.name;
    options.push({ id: category.id, name: fullName });

    if (category.subcategories?.length) {
      options = options.concat(extractCategories(category.subcategories, fullName));
    }
  });

  return options;
};

export async function getTags(): Promise<Tag[]> {
  const res = await fetch("https://rapydo.onrender.com/tags");
  if (!res.ok) {
    throw new Error("Erro ao buscar tags");
  }
  return res.json();
}
