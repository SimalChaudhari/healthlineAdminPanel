'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

// ----------------------------------------------------------------------

export function RHFSelect({
  name,
  native,
  children,
  slotProps,
  helperText,
  inputProps,
  InputLabelProps,
  ...other
}) {
  const { control } = useFormContext();

  const labelId = `${name}-select-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          fullWidth
          SelectProps={{
            native,
            MenuProps: { PaperProps: { sx: { maxHeight: 220, ...slotProps?.paper } } },
            sx: { textTransform: 'capitalize' },
          }}
          InputLabelProps={{ htmlFor: labelId, ...InputLabelProps }}
          inputProps={{ id: labelId, ...inputProps }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        >
          {children}
        </TextField>
      )}
    />
  );
}

// ----------------------------------------------------------------------

/** If exclusive is newly selected → keep only it; if any other option is selected → drop exclusive. */
function applyExclusiveMultiSelect(next, prev, exclusiveValue) {
  if (!exclusiveValue) return next;
  const nextArr = Array.isArray(next) ? next : [];
  const prevArr = Array.isArray(prev) ? prev : [];
  const exclusiveAdded = nextArr.includes(exclusiveValue) && !prevArr.includes(exclusiveValue);
  if (exclusiveAdded) return [exclusiveValue];
  if (nextArr.includes(exclusiveValue) && nextArr.length > 1) {
    return nextArr.filter((v) => v !== exclusiveValue);
  }
  return nextArr;
}

export function RHFMultiSelect({
  name,
  chip,
  label,
  options,
  checkbox,
  placeholder,
  exclusiveValue,
  slotProps,
  helperText,
  ...other
}) {
  const { control } = useFormContext();

  const labelId = `${name}-select-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const value = Array.isArray(field.value) ? field.value : [];

        return (
          <FormControl error={!!error} {...other}>
            {label && (
              <InputLabel htmlFor={labelId} {...slotProps?.inputLabel}>
                {label}
              </InputLabel>
            )}

            <Select
              {...field}
              value={value}
              multiple
              displayEmpty={!!placeholder}
              label={label}
              renderValue={(selected) => {
                const selectedItems = options.filter((item) => selected.includes(item.value));

                if (!selectedItems.length && placeholder) {
                  return <Box sx={{ color: 'text.disabled' }}>{placeholder}</Box>;
                }

                if (chip) {
                  return (
                    <Box sx={{ gap: 0.5, display: 'flex', flexWrap: 'wrap' }}>
                      {selectedItems.map((item) => (
                        <Chip
                          key={item.value}
                          size="small"
                          variant="soft"
                          label={item.label}
                          {...slotProps?.chip}
                          onDelete={() => {
                            field.onChange(value.filter((v) => v !== item.value));
                          }}
                          onMouseDown={(event) => {
                            // Keep Select closed while removing a chip (Minimals-style tags).
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                        />
                      ))}
                    </Box>
                  );
                }

                return selectedItems.map((item) => item.label).join(', ');
              }}
              {...slotProps?.select}
              onChange={(event) => {
                const next = applyExclusiveMultiSelect(event.target.value, value, exclusiveValue);
                field.onChange(next);
              }}
              inputProps={{ id: labelId, ...slotProps?.select?.inputProps }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {checkbox && (
                    <Checkbox
                      size="small"
                      disableRipple
                      checked={value.includes(option.value)}
                      {...slotProps?.checkbox}
                    />
                  )}

                  {option.label}
                </MenuItem>
              ))}
            </Select>

            {(!!error || helperText) && (
              <FormHelperText error={!!error} {...slotProps?.formHelperText}>
                {error ? error?.message : helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
}
