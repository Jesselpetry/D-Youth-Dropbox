// Simple data storage using localStorage
export type Post = {
    id: string;
    name: string;
    dyouthYear: string;
    province: string;
    isAnonymous: boolean;
    text: string;
    imageUrl?: string;
    timestamp: string;
  }
  
  export const savePost = (post: Post): void => {
    try {
      const posts = getPosts();
      posts.unshift(post);
      localStorage.setItem('dyouth_posts', JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving post:', error);
    }
  }
  
  export const getPosts = (): Post[] => {
    try {
      const postsJson = localStorage.getItem('dyouth_posts');
      return postsJson ? JSON.parse(postsJson) : [];
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }