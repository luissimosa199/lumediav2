export const getPosts = async (key: string, page = 0) => {
  const response = await fetch(`/api/post?page=${page}`);
  const data = await response.json();
  return data;
};