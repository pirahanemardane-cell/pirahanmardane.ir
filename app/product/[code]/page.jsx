import { productMetadata } from '@/lib/catalog-seed';
import ProductClient from './ProductClient';

export async function generateMetadata({ params }) {
  const code = params?.code ? decodeURIComponent(params.code) : '';
  return productMetadata(code);
}

export default function ProductPage({ params }) {
  const code = params?.code ? decodeURIComponent(params.code) : '';
  return <ProductClient code={code} />;
}
