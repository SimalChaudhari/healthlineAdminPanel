import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Recipe, ensureDefaultRecipes, recipeFieldsFromBody } from 'src/models/recipe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

/** Public Active recipes (APK Discover); `?all=1` admin full list; `?q=` search. */
export async function GET(request) {
  try {
    await connectDB();
    await ensureDefaultRecipes();

    const { searchParams } = new URL(request.url);
    const wantAll = searchParams.get('all') === '1';
    const q = String(searchParams.get('q') || '').trim();
    const status = String(searchParams.get('status') || '').trim();

    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    if (wantAll) {
      const auth = await requireAdmin(request);
      if (auth.error) return auth.error;
      if (status) filter.status = status;
      const recipes = await Recipe.find(filter).sort({ createdAt: 1, _id: 1 });
      return json({ recipes: recipes.map((r) => r.toPublicJSON()) });
    }

    filter.status = 'Active';
    const recipes = await Recipe.find(filter).sort({ featured: -1, createdAt: 1, _id: 1 });
    return json({ recipes: recipes.map((r) => r.toAppJSON()) });
  } catch (error) {
    console.error('List recipes error:', error);
    return errorResponse('Unable to load recipes', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const fields = recipeFieldsFromBody(body);
    if (!fields.title) return errorResponse('Recipe title is required', 400);

    await connectDB();

    // Only one Chef's pick at a time.
    if (fields.featured) await Recipe.updateMany({ featured: true }, { $set: { featured: false } });

    const recipe = await Recipe.create(fields);
    return json({ recipe: recipe.toPublicJSON() }, 201);
  } catch (error) {
    console.error('Create recipe error:', error);
    return errorResponse('Unable to create recipe', 500);
  }
}
