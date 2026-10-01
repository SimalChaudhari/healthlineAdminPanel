// ----------------------------------------------------------------------

export function rowInPage(data, page, rowsPerPage) {
  return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

// ----------------------------------------------------------------------

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  const aValue = a?.[orderBy];
  const bValue = b?.[orderBy];

  if (aValue == null) {
    return 1;
  }
  if (bValue == null) {
    return -1;
  }

  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return bValue - aValue;
  }

  const aStr = String(aValue).toLowerCase();
  const bStr = String(bValue).toLowerCase();

  if (bStr < aStr) {
    return -1;
  }
  if (bStr > aStr) {
    return 1;
  }
  return 0;
}

// ----------------------------------------------------------------------

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
