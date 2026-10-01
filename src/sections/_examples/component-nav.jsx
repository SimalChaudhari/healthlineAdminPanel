'use client';

import { useMemo } from 'react';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import ListSubheader, { listSubheaderClasses } from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';

import { RouterLink } from 'src/routes/components';
import { useRouter, usePathname } from 'src/routes/hooks';

import { orderBy } from 'src/utils/helper';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { muiNav, extraNav, foundationNav, allComponents } from './config-nav';

// ----------------------------------------------------------------------

function NavGroup({ title, items }) {
  const pathname = usePathname();

  return (
    <Box component="li" sx={{ flexDirection: 'column' }}>
      <ListSubheader disableSticky component="h6">
        {title}
      </ListSubheader>
      <Box
        component="ul"
        sx={{
          gap: 0.5,
          pl: 1.5,
          position: 'relative',
          '&::before': {
            top: 0,
            left: 3,
            bottom: 0,
            my: 'auto',
            width: '1px',
            content: '""',
            position: 'absolute',
            height: 'calc(100% - 12px)',
            bgcolor: 'divider',
          },
        }}
      >
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Box key={item.name} component="li">
              <ListItemButton
                disableGutters
                component={RouterLink}
                href={item.href}
                selected={active}
                sx={{
                  width: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  typography: 'body2',
                  color: 'text.secondary',
                  position: 'relative',
                  overflow: 'visible',
                  fontSize: (theme) => theme.typography.pxToRem(13),
                  '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
                  '&.Mui-selected': {
                    color: 'text.primary',
                    fontWeight: 'fontWeightSemiBold',
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: 'transparent' },
                    '&::before': {
                      top: '50%',
                      width: 0,
                      content: '""',
                      height: 0,
                      opacity: 0.24,
                      zIndex: 9,
                      position: 'absolute',
                      borderStyle: 'solid',
                      transform: 'translate(-50%, -50%)',
                      left: 'var(--arrow-offset-left, -8px)',
                      borderWidth:
                        'var(--arrow-size, 5px) 0 var(--arrow-size, 5px) var(--arrow-size, 5px)',
                      borderColor:
                        'transparent transparent transparent var(--palette-text-primary)',
                    },
                  },
                }}
              >
                {item.name}
              </ListItemButton>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export function ComponentNav() {
  const theme = useTheme();

  const router = useRouter();

  const pathname = usePathname();

  const options = useMemo(
    () => [
      ...foundationNav,
      ...orderBy(muiNav, ['name'], ['asc']),
      ...orderBy(extraNav, ['name'], ['asc']),
    ],
    []
  );

  const currentItem = useMemo(
    () => allComponents.find((item) => item.href === pathname) || null,
    [pathname]
  );

  return (
    <Stack
      component="nav"
      sx={{
        width: 280,
        flexShrink: 0,
        overflow: 'visible',
        position: 'sticky',
        display: { xs: 'none', md: 'flex' },
        '--arrow-size': '5px',
        '--arrow-offset-left': '-8px',
        top: 'calc(var(--layout-header-desktop-height) + 24px)',
        maxHeight: 'calc(100vh - var(--layout-header-desktop-height) * 2)',
        [`& .${listSubheaderClasses.root}`]: {
          mt: 0,
          mx: 0,
          mb: 1,
          p: 0,
          color: 'text.primary',
          typography: 'overline',
        },
        '& ul': {
          display: 'flex',
          flexDirection: 'column',
        },
        '& li': {
          display: 'flex',
        },
      }}
    >
      <Autocomplete
        autoHighlight
        openOnFocus
        selectOnFocus
        popupIcon={null}
        options={options}
        value={currentItem}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.href === value.href}
        onChange={(event, newValue) => {
          if (newValue?.href) {
            router.push(newValue.href);
          }
        }}
        filterOptions={(inputOptions, state) => {
          const input = state.inputValue.toLowerCase().trim();
          const selectedName = currentItem?.name.toLowerCase();

          if (!input || input === selectedName) {
            return inputOptions;
          }

          return inputOptions.filter((option) => option.name.toLowerCase().includes(input));
        }}
        noOptionsText={
          <Box sx={{ py: 1.5, textAlign: 'center', typography: 'body2', color: 'text.secondary' }}>
            No component found
          </Box>
        }
        slotProps={{
          paper: {
            sx: {
              width: 1,
              [` .${autocompleteClasses.option}`]: {
                typography: 'body2',
                minHeight: 36,
              },
            },
          },
          listbox: {
            sx: { maxHeight: 360, py: 0.5 },
          },
        }}
        sx={{ mb: 2, pr: 1 }}
        renderInput={(params) => (
          <TextField
            {...params}
            hiddenLabel
            size="small"
            placeholder="Search..."
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                '& fieldset': { border: 'none' },
              },
            }}
          />
        )}
        renderOption={(props, option, { inputValue }) => {
          const { key, ...otherProps } = props;
          const matches = match(option.name, inputValue, { insideWords: true });
          const parts = parse(option.name, matches);

          return (
            <li key={key} {...otherProps}>
              {parts.map((part, index) => (
                <Box
                  key={index}
                  component="span"
                  sx={{
                    color: part.highlight ? 'primary.main' : 'text.primary',
                    fontWeight: part.highlight ? 'fontWeightSemiBold' : 'fontWeightRegular',
                  }}
                >
                  {part.text}
                </Box>
              ))}
            </li>
          );
        }}
      />

      <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <Box component="ul" sx={{ gap: 2, pr: 1 }}>
          <NavGroup title="Foundation" items={foundationNav} />
          <NavGroup title="MUI" items={orderBy(muiNav, ['name'], ['asc'])} />
          <NavGroup title="Extra" items={orderBy(extraNav, ['name'], ['asc'])} />
        </Box>
      </Scrollbar>
    </Stack>
  );
}
