import mongoose from 'mongoose';

import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Recipe, recipeFieldsFromBody } from 'src/models/recipe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/** Public Active recipe by id (APK detail); `?admin=1` loads any status. */
export async function GET(request, { params }) {
  try {
    if (!isValidId(params.id)) return errorResponse('Recipe not found', 404);

    await connectDB();
    const recipe = await Recipe.findById(params.id);
    if (!recipe) return errorResponse('Recipe not found', 404);

    const { searchParams } = new URL(request.url);
    if (searchParams.get('admin') === '1') {
      const auth = await requireAdmin(request);
      if (auth.error) return auth.error;
      return json({ recipe: recipe.toPublicJSON() });
    }

    if (recipe.status !== 'Active') return errorResponse('Recipe not found', 404);
    return json({ recipe: recipe.toAppJSON() });
  } catch (error) {
    console.error('Get recipe error:', error);
    return errorResponse('Unable to load recipe', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) return errorResponse('Recipe not found', 404);

    const body = await request.json();
    const fields = recipeFieldsFromBody(body);
    if (fields.title !== undefined && !fields.title) {
      return errorResponse('Recipe title is required', 400);
    }

    await connectDB();
    const recipe = await Recipe.findById(params.id);
    if (!recipe) return errorResponse('Recipe not found', 404);

    if (fields.featured) {
      await Recipe.updateMany(
        { _id: { $ne: recipe._id }, featured: true },
        { $set: { featured: false } }
      );
    }

    recipe.set(fields);
    await recipe.save();
    return json({ recipe: recipe.toPublicJSON() });
  } catch (error) {
    console.error('Update recipe error:', error);
    return errorResponse('Unable to update recipe', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) return errorResponse('Recipe not found', 404);

    await connectDB();
    const recipe = await Recipe.findByIdAndDelete(params.id);
    if (!recipe) return errorResponse('Recipe not found', 404);

    return json({ message: 'Recipe deleted', id: params.id });
  } catch (error) {
    console.error('Delete recipe error:', error);
    return errorResponse('Unable to delete recipe', 500);
  }
}
