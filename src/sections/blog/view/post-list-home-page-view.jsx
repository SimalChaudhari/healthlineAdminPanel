'use client';

import { useGetPosts } from 'src/actions/blog';

import { PostListHomeView } from './post-list-home-view';

// ----------------------------------------------------------------------

export function PostListHomePageView() {
  const { posts, postsLoading } = useGetPosts();

  return <PostListHomeView posts={posts} loading={postsLoading} />;
}
