import mongoose from 'mongoose';

import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Food, normalizeTags, parseMacro } from 'src/models/food';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/** Public Approved food by id (APK detail); admin can load any. */
export async function GET(request, { params }) {
  try {
    if (!isValidId(params.id)) return errorResponse('Food not found', 404);

    await connectDB();
    const food = await Food.findById(params.id);
    if (!food) return errorResponse('Food not found', 404);

    const { searchParams } = new URL(request.url);
    const wantAdmin = searchParams.get('admin') === '1';

    if (wantAdmin) {
      const auth = await requireAdmin(request);
      if (auth.error) return auth.error;
      return json({ food: food.toPublicJSON() });
    }

    if (food.status !== 'Approved') return errorResponse('Food not found', 404);
    return json({ food: food.toAppJSON() });
  } catch (error) {
    console.error('Get food error:', error);
    return errorResponse('Unable to load food', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) return errorResponse('Food not found', 404);

    const body = await request.json();
    await connectDB();

    const food = await Food.findById(params.id);
    if (!food) return errorResponse('Food not found', 404);

    if (body.name !== undefined) {
      const name = String(body.name || '').trim();
      if (!name) return errorResponse('Food name is required', 400);
      food.name = name;
    }

    if (body.brand !== undefined) food.brand = String(body.brand || '').trim();
    if (body.serving !== undefined) food.serving = String(body.serving || '1 serving').trim();
    if (body.calories !== undefined) food.calories = parseMacro(body.calories);
    if (body.protein !== undefined) food.protein = parseMacro(body.protein);
    if (body.carbs !== undefined) food.carbs = parseMacro(body.carbs);
    if (body.fat !== undefined) food.fat = parseMacro(body.fat);
    if (body.fiber !== undefined) food.fiber = parseMacro(body.fiber);
    if (body.sugar !== undefined) food.sugar = parseMacro(body.sugar);
    if (body.sodium !== undefined) food.sodium = parseMacro(body.sodium);
    if (body.cuisine !== undefined) food.cuisine = String(body.cuisine || '').trim();
    if (body.category !== undefined) food.category = String(body.category || '').trim();
    if (body.tags !== undefined || body.tagsText !== undefined) {
      food.tags = normalizeTags(body.tags ?? body.tagsText);
    }
    if (body.barcode !== undefined) food.barcode = String(body.barcode || '').trim();
    if (body.imageUrl !== undefined) food.imageUrl = String(body.imageUrl || '').trim();
    if (body.imagePublicId !== undefined) food.imagePublicId = String(body.imagePublicId || '').trim();
    if (['Approved', 'Pending', 'Rejected', 'Archived'].includes(body.status)) {
      food.status = body.status;
    }
    if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
      food.sortOrder = Number(body.sortOrder);
    }

    await food.save();
    return json({ food: food.toPublicJSON() });
  } catch (error) {
    console.error('Update food error:', error);
    return errorResponse('Unable to update food', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) return errorResponse('Food not found', 404);

    await connectDB();
    const food = await Food.findByIdAndDelete(params.id);
    if (!food) return errorResponse('Food not found', 404);

    return json({ message: 'Food deleted', id: params.id });
  } catch (error) {
    console.error('Delete food error:', error);
    return errorResponse('Unable to delete food', 500);
  }
}
