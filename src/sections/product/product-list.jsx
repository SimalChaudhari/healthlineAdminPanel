'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { ProductItem } from './product-item';
import { ProductItemSkeleton } from './product-skeleton';

// ----------------------------------------------------------------------

const PRODUCTS_PER_PAGE = 8;

// ----------------------------------------------------------------------

export function ProductList({ products, loading, ...other }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [products]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = (page - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const renderLoading = <ProductItemSkeleton />;

  const renderList = paginatedProducts.map((product) => (
    <ProductItem key={product.id} product={product} />
  ));

  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        {...other}
      >
        {loading ? renderLoading : renderList}
      </Box>

      {products.length > PRODUCTS_PER_PAGE && (
        <Pagination
          page={page}
          count={totalPages}
          onChange={(event, newPage) => setPage(newPage)}
          sx={{
            mt: { xs: 5, md: 8 },
            [`& .${paginationClasses.ul}`]: { justifyContent: 'center' },
          }}
        />
      )}
    </>
  );
}
