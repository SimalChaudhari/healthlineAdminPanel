'use client';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

/**
 * Minimals-style row actions: pencil + ⋮ menu (View / Edit / Delete).
 */
export function HealthlineTableRowActions({
  onView,
  onEdit,
  onDelete,
  confirmTitle = 'Delete',
  confirmContent = 'Are you sure want to delete?',
}) {
  const popover = usePopover();
  const confirm = useBoolean();

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="flex-end">
        {onView ? (
          <Tooltip title="View" placement="top" arrow>
            <IconButton onClick={onView}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        ) : null}

        {onEdit ? (
          <Tooltip title="Edit" placement="top" arrow>
            <IconButton onClick={onEdit}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        ) : null}

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          {onView ? (
            <MenuItem
              onClick={() => {
                onView?.();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:eye-bold" />
              View
            </MenuItem>
          ) : null}

          {onEdit ? (
            <MenuItem
              onClick={() => {
                onEdit?.();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" />
              Edit
            </MenuItem>
          ) : null}

          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={confirmTitle}
        content={confirmContent}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDelete?.();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
