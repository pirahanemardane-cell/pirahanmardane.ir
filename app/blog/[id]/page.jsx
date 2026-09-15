import { blogMetadata } from '@/lib/catalog-seed';
import BlogClient from './BlogClient';

export async function generateMetadata({ params }) {
  const id = params?.id ? decodeURIComponent(params.id) : '';
  return blogMetadata(id);
}

export default function BlogPage({ params }) {
  const id = params?.id ? decodeURIComponent(params.id) : '';
  return <BlogClient id={id} />;
}
