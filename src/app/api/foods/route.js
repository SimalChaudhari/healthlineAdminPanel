import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import {
  Food,
  ensureDefaultFoods,
  normalizeTags,
  parseMacro,
} from 'src/models/food';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

/** Public Approved catalog; `?all=1` admin full list; `?q=` search. */
export async function GET(request) {
  try {
    await connectDB();
    await ensureDefaultFoods();

    const { searchParams } = new URL(request.url);
    const wantAll = searchParams.get('all') === '1';
    const q = String(searchParams.get('q') || '').trim();
    const status = String(searchParams.get('status') || '').trim();
    const barcode = String(searchParams.get('barcode') || '').trim();

    if (wantAll) {
      const auth = await requireAdmin(request);
      if (auth.error) return auth.error;

      const filter = {};
      if (status) filter.status = status;
      if (barcode) filter.barcode = barcode;
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { cuisine: { $regex: q, $options: 'i' } },
        ];
      }

      const foods = await Food.find(filter).sort({ sortOrder: 1, name: 1 });
      return json({ foods: foods.map((f) => f.toPublicJSON()) });
    }

    const filter = { status: 'Approved' };
    if (barcode) filter.barcode = barcode;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { cuisine: { $regex: q, $options: 'i' } },
      ];
    }

    const foods = await Food.find(filter).sort({ sortOrder: 1, name: 1 }).limit(100);
    return json({ foods: foods.map((f) => f.toAppJSON()) });
  } catch (error) {
    console.error('List foods error:', error);
    return errorResponse('Unable to load foods', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name) return errorResponse('Food name is required', 400);

    await connectDB();

    const food = await Food.create({
      name,
      brand: String(body.brand || '').trim(),
      serving: String(body.serving || '1 serving').trim(),
      calories: parseMacro(body.calories),
      protein: parseMacro(body.protein),
      carbs: parseMacro(body.carbs),
      fat: parseMacro(body.fat),
      fiber: parseMacro(body.fiber),
      sugar: parseMacro(body.sugar),
      sodium: parseMacro(body.sodium),
      cuisine: String(body.cuisine || '').trim(),
      category: String(body.category || '').trim(),
      tags: normalizeTags(body.tags ?? body.tagsText),
      barcode: String(body.barcode || '').trim(),
      imageUrl: String(body.imageUrl || '').trim(),
      imagePublicId: String(body.imagePublicId || '').trim(),
      status: ['Approved', 'Pending', 'Rejected', 'Archived'].includes(body.status)
        ? body.status
        : 'Approved',
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    });

    return json({ food: food.toPublicJSON() }, 201);
  } catch (error) {
    console.error('Create food error:', error);
    return errorResponse('Unable to create food', 500);
  }
}
