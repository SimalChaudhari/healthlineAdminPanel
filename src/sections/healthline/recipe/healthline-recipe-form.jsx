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

import { resolveImageUpload } from '../food/healthline-food-form';

// ----------------------------------------------------------------------
// Same tags the APK Discover filters / colours use (src/models/recipe.js RECIPE_TAGS).

const TAG_OPTIONS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Quick',
  'High protein',
  'Low carb',
  'Plant-based',
].map((v) => ({ value: v, label: v }));

export const RecipeFormSchema = zod.object({
  imageUrl: zod.any().optional(),
  title: zod.string().min(1, { message: 'Title is required!' }),
  description: zod.string().optional(),
  timeMinutes: zod.coerce.number().min(0),
  calories: zod.coerce.number().min(0),
  protein: zod.coerce.number().min(0),
  carbs: zod.coerce.number().min(0),
  fat: zod.coerce.number().min(0),
  tags: zod.array(zod.string()).optional(),
  ingredientsText: zod.string().optional(),
  stepsText: zod.string().optional(),
  featured: zod.boolean().optional(),
  status: zod.enum(['Active', 'Inactive']),
});

function linesToText(lines) {
  return Array.isArray(lines) ? lines.join('\n') : '';
}

function textToLines(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

// ----------------------------------------------------------------------

export function HealthlineRecipeForm({ currentRecipe }) {
  const router = useRouter();
  const isEdit = !!currentRecipe;

  const defaultValues = useMemo(
    () => ({
      imageUrl: currentRecipe?.imageUrl || null,
      title: currentRecipe?.title || '',
      description: currentRecipe?.description || '',
      timeMinutes: currentRecipe?.timeMinutes ?? 10,
      calories: currentRecipe?.calories ?? 0,
      protein: currentRecipe?.protein ?? 0,
      carbs: currentRecipe?.carbs ?? 0,
      fat: currentRecipe?.fat ?? 0,
      tags: currentRecipe?.tags || [],
      ingredientsText: linesToText(currentRecipe?.ingredients),
      stepsText: linesToText(currentRecipe?.steps),
      featured: Boolean(currentRecipe?.featured),
      status: currentRecipe?.status || 'Active',
    }),
    [currentRecipe]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(RecipeFormSchema),
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
        replacePublicId: currentRecipe?.imagePublicId || '',
        replaceUrl: currentRecipe?.imageUrl || '',
        folder: 'healthline/recipes',
      });

      const payload = {
        title: data.title.trim(),
        description: data.description || '',
        timeMinutes: Number(data.timeMinutes) || 0,
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
        tags: data.tags || [],
        ingredients: textToLines(data.ingredientsText),
        steps: textToLines(data.stepsText),
        imageUrl: image.imageUrl,
        imagePublicId: image.imagePublicId,
        featured: Boolean(data.featured),
        status: data.status,
      };

      if (isEdit) {
        await axios.put(endpoints.recipes.details(currentRecipe.id), payload);
        toast.success('Recipe updated');
      } else {
        await axios.post(endpoints.recipes.list, payload);
        toast.success('Recipe created');
      }

      reset();
      router.push(paths.dashboard.recipes);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save recipe');
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
                    Recipe photo
                    <br />
                    Allowed *.jpeg, *.jpg, *.png, *.webp
                    <br /> max size of {fData(3145728)}
                    <br /> Stored on Cloudinary (healthline/recipes)
                  </Typography>
                }
              />
            </Box>

            <Field.Switch
              name="featured"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Chef&apos;s pick
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Big featured card on top of Discover (only one recipe at a time)
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Active recipes appear in the Healthline APK Discover tab. Inactive stay admin-only.
            </Typography>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            >
              <Field.Text name="title" label="Recipe title" sx={{ gridColumn: { sm: '1 / -1' } }} />
              <Field.Text
                name="description"
                label="Description"
                multiline
                minRows={2}
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <Field.Text name="timeMinutes" label="Time (minutes)" type="number" />
              <Field.Text name="calories" label="Calories (kcal)" type="number" />
              <Field.Text name="protein" label="Protein (g)" type="number" />
              <Field.Text name="carbs" label="Carbs (g)" type="number" />
              <Field.Text name="fat" label="Fat (g)" type="number" />
              <Field.Select name="status" label="Status">
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Field.Select>
              <Field.MultiSelect
                checkbox
                chip
                name="tags"
                label="Tags"
                options={TAG_OPTIONS}
                helperText="Used for Discover filters (Breakfast, Lunch, Quick…)"
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <Field.Text
                name="ingredientsText"
                label="Ingredients"
                multiline
                minRows={4}
                helperText="One ingredient per line"
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <Field.Text
                name="stepsText"
                label="Steps"
                multiline
                minRows={4}
                helperText="One step per line"
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.push(paths.dashboard.recipes)}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {isEdit ? 'Save changes' : 'Create recipe'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
