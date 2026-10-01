import mongoose from 'mongoose';

import { requireAuth } from 'src/lib/require-auth';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Food } from 'src/models/food';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FAVORITES = 200;

export function OPTIONS() {
  return optionsResponse();
}

function isObjectId(value) {
  return mongoose.isValidObjectId(value) && /^[a-f\d]{24}$/i.test(String(value));
}

/** Stored ids as strings, tolerating any legacy `{ foodId }` entries. */
function storedIds(user) {
  return (user.favorites || [])
    .map((f) => String(f?.foodId || f?._id || f || ''))
    .filter(isObjectId);
}

/**
 * Only food ids are stored on the user. Details are always read fresh from `foods`,
 * so admin edits (name, calories, photo) show up in every user's favourites.
 * Foods that were deleted or are no longer Approved are left out.
 */
async function favoritesPayload(user) {
  const ids = storedIds(user);
  if (!ids.length) return [];

  const foods = await Food.find({ _id: { $in: ids }, status: 'Approved' });
  const byId = new Map(foods.map((f) => [String(f._id), f]));

  return ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((food) => ({ ...food.toAppJSON(), foodId: String(food._id) }));
}

/** GET /api/favorites — the signed-in user's favourite foods, newest first. */
export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;
    return json({ favorites: await favoritesPayload(auth.user) });
  } catch (error) {
    console.error('Favorites list error:', error);
    return errorResponse('Unable to load favorites', 500);
  }
}

/** POST /api/favorites — body { foodId }. Adds one catalog food to favourites. */
export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const foodId = String(body.foodId || body.food?.id || body.food?.foodId || '').trim();

    if (!isObjectId(foodId)) {
      return errorResponse('Only foods from the HealthLine food list can be added to favorites', 400);
    }

    const food = await Food.findOne({ _id: foodId, status: 'Approved' }).select('_id');
    if (!food) return errorResponse('Food not found', 404);

    const { user } = auth;
    const rest = storedIds(user).filter((id) => id !== foodId);
    user.favorites = [foodId, ...rest].slice(0, MAX_FAVORITES);
    await user.save();

    return json({ favorites: await favoritesPayload(user) }, 201);
  } catch (error) {
    console.error('Favorite add error:', error);
    return errorResponse('Unable to save favorite', 500);
  }
}

/** DELETE /api/favorites?foodId=… — removes one favourite. */
export async function DELETE(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const foodId = String(new URL(request.url).searchParams.get('foodId') || '').trim();
    if (!foodId) return errorResponse('foodId is required', 400);

    const { user } = auth;
    user.favorites = storedIds(user).filter((id) => id !== foodId);
    await user.save();

    return json({ favorites: await favoritesPayload(user) });
  } catch (error) {
    console.error('Favorite remove error:', error);
    return errorResponse('Unable to remove favorite', 500);
  }
}
