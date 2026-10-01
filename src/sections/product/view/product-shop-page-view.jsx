'use client';

import { useGetProducts } from 'src/actions/product';

import { ProductShopView } from './product-shop-view';

// ----------------------------------------------------------------------

export function ProductShopPageView() {
  const { products, productsLoading } = useGetProducts();

  return <ProductShopView products={products} loading={productsLoading} />;
}
