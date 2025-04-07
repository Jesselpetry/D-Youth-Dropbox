'use client';

import { useState, useEffect } from 'react';
import PostForm from '@/components/PostForm';
import Post from '@/components/Post';

// This would normally come from a database/API
type PostData = {
  id: string;
  name: string;
  dyouthYear: string;
  province: string;
  isAnonymous: boolean;
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export default function Home() {
  const [posts, setPosts] = useState<PostData[]>([]);

  // In a real app, you would fetch posts from an API/database
  useEffect(() => {
    // Example - in a real implementation, this would be API call
    const samplePosts = [
      {
        id: '1',
        name: 'Jean Pierre',
        dyouthYear: '2022',
        province: 'Kinshasa',
        isAnonymous: false,
        text: 'Great event yesterday! Looking forward to the next one.',
        timestamp: new Date().toLocaleString()
      },
      {
        id: '2',
        name: '',
        dyouthYear: '2023',
        province: 'Nord-Kivu',
        isAnonymous: true,
        text: 'The youth program changed my perspective on community involvement.',
        imageUrl: 'https://via.placeholder.com/500x300',
        timestamp: new Date(Date.now() - 86400000).toLocaleString()
      }
    ];
    
    setPosts(samplePosts);
  }, []);

  const handleSubmitPost = (postData: any) => {
    // In a real app, you would send this to an API
    const newPost: PostData = {
      id: Date.now().toString(),
      name: postData.name,
      dyouthYear: postData.dyouthYear,
      province: postData.province,
      isAnonymous: postData.isAnonymous,
      text: postData.text,
      timestamp: new Date().toLocaleString()
    };

    // If there's an image, in a real app you would upload it to storage
    // and get back a URL to store
    if (postData.imagePreview) {
      newPost.imageUrl = postData.imagePreview;
    }

    // Add new post to the top of the list
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">D-Youth Community</h1>
        <p className="text-center text-gray-600">Share your experiences with the community</p>
      </header>

      <PostForm onSubmitPost={handleSubmitPost} />

      <div className="posts-container">
        {posts.length > 0 ? (
          posts.map(post => (
            <Post
              key={post.id}
              id={post.id}
              name={post.name}
              dyouthYear={post.dyouthYear}
              province={post.province}
              isAnonymous={post.isAnonymous}
              text={post.text}
              imageUrl={post.imageUrl}
              timestamp={post.timestamp}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No posts yet. Be the first to share!</p>
        )}
      </div>
    </div>
  );
}
