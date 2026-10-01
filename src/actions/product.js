'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import { CONFIG } from 'src/config-global';
import { fetcher, endpoints } from 'src/utils/axios';

import productsList from 'src/_mock/_products-list.json';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
};

const PRODUCT_LIST_URL = `${CONFIG.site.serverUrl}${endpoints.product.list}`;

const FALLBACK_PRODUCTS = productsList?.products || [];

// ----------------------------------------------------------------------

export function useGetProducts() {
  const { data, isLoading, error, isValidating } = useSWR(PRODUCT_LIST_URL, fetcher, swrOptions);

  const products = data?.products?.length ? data.products : FALLBACK_PRODUCTS;

  const memoizedValue = useMemo(
    () => ({
      products: isLoading ? [] : products,
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty: !isLoading && !products.length,
    }),
    [products, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetProduct(productId) {
  const url = productId
    ? [`${CONFIG.site.serverUrl}${endpoints.product.details}`, { params: { productId } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const product =
    data?.product || FALLBACK_PRODUCTS.find((item) => item.id === productId) || undefined;

  const memoizedValue = useMemo(
    () => ({
      product,
      productLoading: isLoading && !product,
      productError: error && !product ? error : undefined,
      productValidating: isValidating,
    }),
    [product, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchProducts(query) {
  const url = query
    ? [`${CONFIG.site.serverUrl}${endpoints.product.search}`, { params: { query } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const searchResults = data?.results?.length
    ? data.results
    : query
      ? FALLBACK_PRODUCTS.filter((item) =>
          item.name.toLowerCase().includes(String(query).toLowerCase())
        )
      : [];

  const memoizedValue = useMemo(
    () => ({
      searchResults,
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !searchResults.length,
    }),
    [searchResults, error, isLoading, isValidating]
  );

  return memoizedValue;
}
