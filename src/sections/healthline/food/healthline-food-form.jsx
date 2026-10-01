'use client';

import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';
import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const FoodFormSchema = zod.object({
  imageUrl: zod.any().optional(),
  name: zod.string().min(1, { message: 'Name is required!' }),
  brand: zod.string().optional(),
  serving: zod.string().optional(),
  calories: zod.coerce.number().min(0),
  protein: zod.coerce.number().min(0),
  carbs: zod.coerce.number().min(0),
  fat: zod.coerce.number().min(0),
  fiber: zod.coerce.number().min(0).optional(),
  sugar: zod.coerce.number().min(0).optional(),
  sodium: zod.coerce.number().min(0).optional(),
  cuisine: zod.string().optional(),
  category: zod.string().optional(),
  tagsText: zod.string().optional(),
  barcode: zod.string().optional(),
  status: zod.enum(['Approved', 'Pending', 'Rejected', 'Archived']),
  sortOrder: zod.coerce.number().optional(),
});

function tagsToText(tags) {
  if (!Array.isArray(tags)) return '';
  return tags.join(', ');
}

export async function resolveImageUpload(
  imageUrl,
  { replacePublicId = '', replaceUrl = '', folder = 'healthline/foods' } = {}
) {
  if (!imageUrl) return { imageUrl: '', imagePublicId: '' };

  // Already on Cloudinary — keep as-is
  if (typeof imageUrl === 'string' && imageUrl.includes('cloudinary.com')) {
    return {
      imageUrl,
      imagePublicId: publicIdFromCloudinaryHint(imageUrl) || replacePublicId,
    };
  }

  // Remote URL (e.g. Unsplash) — re-host on Cloudinary
  if (typeof imageUrl === 'string' && /^https?:\/\//i.test(imageUrl)) {
    const { data } = await axios.post(endpoints.upload.image, {
      remoteUrl: imageUrl,
      folder,
      replacePublicId,
      replaceUrl,
    });
    return {
      imageUrl: data?.url || '',
      imagePublicId: data?.publicId || '',
    };
  }

  // New file from picker
  const form = new FormData();
  form.append('file', imageUrl);
  form.append('folder', folder);
  if (replacePublicId) form.append('replacePublicId', replacePublicId);
  if (replaceUrl) form.append('replaceUrl', replaceUrl);

  const { data } = await axios.post(endpoints.upload.image, form);

  return {
    imageUrl: data?.url || '',
    imagePublicId: data?.publicId || '',
  };
}

function publicIdFromCloudinaryHint(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return '';
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return '';
    let rest = parts.slice(uploadIndex + 1);
    const versionIndex = rest.findIndex((part) => /^v\d+$/.test(part));
    if (versionIndex >= 0) rest = rest.slice(versionIndex + 1);
    return rest.join('/').replace(/\.[^/.]+$/, '');
  } catch {
    return '';
  }
}

// ----------------------------------------------------------------------

export function HealthlineFoodForm({ currentFood }) {
  const router = useRouter();
  const isEdit = !!currentFood;

  const defaultValues = useMemo(
    () => ({
      imageUrl: currentFood?.imageUrl || null,
      name: currentFood?.name || '',
      brand: currentFood?.brand || '',
      serving: currentFood?.serving || '1 serving',
      calories: currentFood?.calories ?? 0,
      protein: currentFood?.protein ?? 0,
      carbs: currentFood?.carbs ?? 0,
      fat: currentFood?.fat ?? 0,
      fiber: currentFood?.fiber ?? 0,
      sugar: currentFood?.sugar ?? 0,
      sodium: currentFood?.sodium ?? 0,
      cuisine: currentFood?.cuisine || '',
      category: currentFood?.category || '',
      tagsText: tagsToText(currentFood?.tags),
      barcode: currentFood?.barcode || '',
      status: currentFood?.status || 'Approved',
      sortOrder: currentFood?.sortOrder ?? 0,
    }),
    [currentFood]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(FoodFormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const image = await resolveImageUpload(data.imageUrl, {
        replacePublicId: currentFood?.imagePublicId || '',
        replaceUrl: currentFood?.imageUrl || '',
      });

      const payload = {
        name: data.name.trim(),
        brand: data.brand || '',
        serving: data.serving || '1 serving',
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
        fiber: Number(data.fiber) || 0,
        sugar: Number(data.sugar) || 0,
        sodium: Number(data.sodium) || 0,
        cuisine: data.cuisine || '',
        category: data.category || '',
        tagsText: data.tagsText || '',
        barcode: data.barcode || '',
        imageUrl: image.imageUrl,
        imagePublicId: image.imagePublicId,
        status: data.status,
        sortOrder: Number(data.sortOrder) || 0,
      };

      if (isEdit) {
        await axios.put(endpoints.foods.details(currentFood.id), payload);
        toast.success('Food updated');
      } else {
        await axios.post(endpoints.foods.list, payload);
        toast.success('Food created');
      }

      reset();
      router.push(paths.dashboard.foods);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save food');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              <Field.UploadAvatar
                name="imageUrl"
                maxSize={3145728}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Food photo (optional)
                    <br />
                    Allowed *.jpeg, *.jpg, *.png, *.webp
                    <br /> max size of {fData(3145728)}
                    <br /> Stored on Cloudinary (healthline/foods)
                  </Typography>
                }
              />
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Approved foods appear in the Healthline APK diary search. Pending / Rejected stay
              admin-only.
            </Typography>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            >
              <Field.Text name="name" label="Food name" />
              <Field.Text name="brand" label="Brand" />
              <Field.Text name="serving" label="Serving size" helperText="e.g. 100g, 1 cup, 1 bowl" />
              <Field.Text name="barcode" label="Barcode (optional)" />
              <Field.Text name="calories" label="Calories" type="number" />
              <Field.Text name="protein" label="Protein (g)" type="number" />
              <Field.Text name="carbs" label="Carbs (g)" type="number" />
              <Field.Text name="fat" label="Fat (g)" type="number" />
              <Field.Text name="fiber" label="Fiber (g)" type="number" />
              <Field.Text name="sugar" label="Sugar (g)" type="number" />
              <Field.Text name="sodium" label="Sodium (mg)" type="number" />
              <Field.Text name="sortOrder" label="Sort order" type="number" />
              <Field.Text name="cuisine" label="Cuisine" helperText="e.g. Indian, Global" />
              <Field.Text name="category" label="Category" helperText="e.g. Dairy, Protein, Meal" />
              <Field.Select name="status" label="Status">
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Field.Select>
              <Field.Text
                name="tagsText"
                label="Tags"
                helperText="Comma-separated, e.g. breakfast, high-protein"
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.push(paths.dashboard.foods)}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {isEdit ? 'Save changes' : 'Create food'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
