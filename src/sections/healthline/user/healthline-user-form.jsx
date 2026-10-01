'use client';

import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { fData } from 'src/utils/format-number';
import { PASSWORD_MAX, validatePassword } from 'src/utils/password-rules';
import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { PasswordStrengthMeter } from './password-strength-meter';

// ----------------------------------------------------------------------
// Same options as Healthline APK onboarding (Step 1 focus + Step 3 avoid)

const FOCUS_GOAL_OPTIONS = [
  { value: 'lose', label: 'Lose weight steadily' },
  { value: 'protein', label: 'Build muscle' },
  { value: 'sugar', label: 'Manage blood sugar' },
  { value: 'family', label: 'Feed my family well' },
  { value: 'energy', label: 'Just eat better' },
];

const DIET_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Mediterranean',
  'Low-carb',
  'High-protein',
  'Halal',
  'Kosher',
  'No preference',
].map((v) => ({ value: v, label: v }));

const ALLERGY_OPTIONS = [
  'Fish',
  'Peanuts',
  'Dairy',
  'Gluten',
  'Shellfish',
  'Eggs',
  'Soy',
  'Tree nuts',
].map((v) => ({ value: v, label: v }));

const CONDITION_OPTIONS = [
  'Pre-diabetic',
  'Hypertension',
  'IBS',
  'High cholesterol',
  'None',
].map((v) => ({ value: v, label: v }));

function asStringArray(value) {
  if (Array.isArray(value)) return value.map((v) => String(v || '').trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Match APK: exclusive option cannot sit with other values in the same group. */
function withExclusive(value, exclusiveKey) {
  const list = [...new Set(asStringArray(value))];
  if (!exclusiveKey || !list.includes(exclusiveKey)) return list;
  if (list.length === 1) return list;
  return list.filter((v) => v !== exclusiveKey);
}

export const UserFormSchema = zod.object({
  photoURL: zod.any().optional(),
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: zod
    .string()
    .nullable()
    .optional()
    .transform((value) => value || '')
    .refine((value) => !value || isValidPhoneNumber(value), {
      message: 'Invalid phone number!',
    }),
  role: zod.enum(['admin', 'user']),
  plan: zod.enum(['Free', 'Plus', 'Family']),
  status: zod.enum(['Active', 'Trial', 'Blocked']),
  password: zod.string().optional(),
  // Onboarding / health profile
  profileSex: zod.string().optional(),
  profileAge: zod.coerce.number().min(0).optional(),
  profileHeightCm: zod.coerce.number().min(0).optional(),
  profileActivity: zod.string().optional(),
  profileGoal: zod.enum(['lose', 'maintain', 'gain']).optional(),
  profileCalories: zod.coerce.number().min(0).optional(),
  profileProtein: zod.coerce.number().min(0).optional(),
  profileCarbs: zod.coerce.number().min(0).optional(),
  profileFat: zod.coerce.number().min(0).optional(),
  profileWaterGoal: zod.coerce.number().min(0).optional(),
  profileWeight: zod.coerce.number().min(0).optional(),
  profileGoalWeight: zod.coerce.number().min(0).optional(),
  profileDiet: zod.array(zod.string()).optional(),
  profileAllergies: zod.array(zod.string()).optional(),
  profileConditions: zod.array(zod.string()).optional(),
  profileFocusGoals: zod.array(zod.string()).optional(),
  reminderBreakfast: zod.boolean().optional(),
  reminderLunch: zod.boolean().optional(),
  reminderDinner: zod.boolean().optional(),
  reminderWater: zod.boolean().optional(),
  reminderWeighIn: zod.boolean().optional(),
});

async function resolvePhotoUpload(photoURL, { replacePublicId = '', replaceUrl = '', userId = '' } = {}) {
  if (!photoURL) return { photoURL: '', photoPublicId: '' };
  if (typeof photoURL === 'string') {
    return {
      photoURL,
      photoPublicId: publicIdFromCloudinaryHint(photoURL),
    };
  }

  const form = new FormData();
  form.append('file', photoURL);
  form.append('folder', 'healthline/users');
  if (replacePublicId) form.append('replacePublicId', replacePublicId);
  if (replaceUrl) form.append('replaceUrl', replaceUrl);
  if (userId) form.append('userId', userId);

  const { data } = await axios.post(endpoints.upload.image, form);

  return {
    photoURL: data?.url || '',
    photoPublicId: data?.publicId || '',
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

export function HealthlineUserForm({ currentUser }) {
  const router = useRouter();
  const isEdit = !!currentUser;
  const showPassword = useBoolean();
  const defaultValues = useMemo(() => {
    const profile = currentUser?.profile || {};
    return {
      photoURL: currentUser?.photoURL || null,
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      role: currentUser?.role || 'user',
      plan: currentUser?.plan || 'Free',
      status: currentUser?.status || 'Active',
      password: '',
      profileSex: profile.sex || '',
      profileAge: profile.age ?? 30,
      profileHeightCm: profile.heightCm ?? 168,
      profileActivity: profile.activity || 'Moderate',
      profileGoal: ['lose', 'maintain', 'gain'].includes(profile.goal) ? profile.goal : 'lose',
      profileCalories: profile.calories ?? 2200,
      profileProtein: profile.protein ?? 140,
      profileCarbs: profile.carbs ?? 220,
      profileFat: profile.fat ?? 73,
      profileWaterGoal: profile.waterGoal ?? 8,
      profileWeight: profile.weight ?? 72,
      profileGoalWeight: profile.goalWeight ?? 68,
      profileDiet: withExclusive(profile.diet, 'No preference'),
      profileAllergies: asStringArray(profile.allergies),
      profileConditions: withExclusive(profile.conditions, 'None'),
      profileFocusGoals: asStringArray(profile.focusGoals),
      reminderBreakfast: profile.reminders?.breakfast ?? true,
      reminderLunch: profile.reminders?.lunch ?? true,
      reminderDinner: profile.reminders?.dinner ?? true,
      reminderWater: profile.reminders?.water ?? true,
      reminderWeighIn: profile.reminders?.weighIn ?? false,
    };
  }, [currentUser]);

  const methods = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: zodResolver(
      UserFormSchema.extend({
        // Create: required. Edit: optional, but a new password must pass the APK rules.
        password: zod
          .string()
          .max(PASSWORD_MAX, { message: `Password must be at most ${PASSWORD_MAX} characters.` })
          .superRefine((value, ctx) => {
            if (isEdit && !value) return;
            const message = validatePassword(value);
            if (message) ctx.addIssue({ code: zod.ZodIssueCode.custom, message });
          }),
      })
    ),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const roleValue = watch('role');
  const passwordValue = watch('password');
  const showUserProfile = roleValue === 'user';

  const onSubmit = handleSubmit(async (data) => {
    try {
      const photo = await resolvePhotoUpload(data.photoURL, {
        replacePublicId: currentUser?.photoPublicId || '',
        replaceUrl: currentUser?.photoURL || '',
        userId: currentUser?.id || '',
      });

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || '',
        role: data.role,
        plan: data.plan,
        status: data.status,
        displayName: `${data.firstName} ${data.lastName}`.trim(),
        photoURL: photo.photoURL,
        photoPublicId: photo.photoPublicId,
      };

      // Onboarding profile — app users only (never required for admin)
      if (data.role === 'user') {
        payload.profile = {
          sex: data.profileSex || '',
          age: Number(data.profileAge) || 0,
          heightCm: Number(data.profileHeightCm) || 0,
          activity: data.profileActivity || 'Moderate',
          goal: data.profileGoal || 'lose',
          calories: Number(data.profileCalories) || 0,
          protein: Number(data.profileProtein) || 0,
          carbs: Number(data.profileCarbs) || 0,
          fat: Number(data.profileFat) || 0,
          waterGoal: Number(data.profileWaterGoal) || 0,
          weight: Number(data.profileWeight) || 0,
          goalWeight: Number(data.profileGoalWeight) || 0,
          diet: withExclusive(data.profileDiet, 'No preference'),
          allergies: asStringArray(data.profileAllergies),
          conditions: withExclusive(data.profileConditions, 'None'),
          focusGoals: asStringArray(data.profileFocusGoals),
          reminders: {
            breakfast: !!data.reminderBreakfast,
            lunch: !!data.reminderLunch,
            dinner: !!data.reminderDinner,
            water: !!data.reminderWater,
            weighIn: !!data.reminderWeighIn,
          },
        };
      }

      if (data.password) {
        payload.password = data.password;
      }

      if (isEdit) {
        await axios.put(endpoints.users.details(currentUser.id), payload);
        toast.success('Update success!');
      } else {
        await axios.post(endpoints.users.list, payload);
        toast.success('Create success!');
      }

      reset();
      router.push(paths.dashboard.users);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save user');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              <Field.UploadAvatar
                name="photoURL"
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
                    Allowed *.jpeg, *.jpg, *.png, *.webp
                    <br /> max size of {fData(3145728)}
                    <br /> Uploads to Cloudinary
                  </Typography>
                }
              />
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Account
            </Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            >
              <Field.Text name="firstName" label="First name" />
              <Field.Text name="lastName" label="Last name" />
              <Field.Text name="email" label="Email address" />
              <Field.Phone name="phoneNumber" label="Phone number" country="IN" />
              <Box>
                <Field.Text
                  name="password"
                  label={isEdit ? 'Password (optional)' : 'Password'}
                  type={showPassword.value ? 'text' : 'password'}
                  inputProps={{ autoComplete: 'new-password', maxLength: PASSWORD_MAX }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={showPassword.onToggle} edge="end">
                          <Iconify
                            icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    isEdit && !passwordValue ? 'Leave blank to keep current password' : undefined
                  }
                />
                {(!isEdit || passwordValue) && <PasswordStrengthMeter value={passwordValue} />}
              </Box>
              <Field.Select name="role" label="Role">
                <MenuItem value="user">User</MenuItem>
                {/* <MenuItem value="admin">Admin</MenuItem> */}
              </Field.Select>
              <Field.Select name="plan" label="Plan">
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Plus">Plus</MenuItem>
                <MenuItem value="Family">Family</MenuItem>
              </Field.Select>
              <Field.Select name="status" label="Status">
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Trial">Trial</MenuItem>
                <MenuItem value="Blocked">Blocked</MenuItem>
              </Field.Select>
            </Box>

            {showUserProfile ? (
              <>
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Onboarding profile
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Preferences from APK setup steps (goals, body, diet, reminders). App users only.
                </Typography>

                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
                >
                  <Field.Select name="profileGoal" label="Primary goal">
                    <MenuItem value="lose">Lose weight</MenuItem>
                    <MenuItem value="maintain">Maintain</MenuItem>
                    <MenuItem value="gain">Gain muscle</MenuItem>
                  </Field.Select>
                  {/* Same options as APK onboarding (SEX_OPTS). */}
                  <Field.Select name="profileSex" label="Sex">
                    <MenuItem value="">Not set</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </Field.Select>
                  <Field.Text name="profileAge" label="Age" type="number" />
                  <Field.Text name="profileHeightCm" label="Height (cm)" type="number" />
                  <Field.Text name="profileWeight" label="Current weight (kg)" type="number" />
                  <Field.Text name="profileGoalWeight" label="Goal weight (kg)" type="number" />
                  <Field.Select name="profileActivity" label="Activity">
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Light">Light</MenuItem>
                    <MenuItem value="Moderate">Moderate</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Field.Select>
                  <Field.Text name="profileWaterGoal" label="Water goal (glasses)" type="number" />
                  <Field.Text name="profileCalories" label="Calories / day" type="number" />
                  <Field.Text name="profileProtein" label="Protein (g)" type="number" />
                  <Field.Text name="profileCarbs" label="Carbs (g)" type="number" />
                  <Field.Text name="profileFat" label="Fat (g)" type="number" />
                  <Field.MultiSelect
                    checkbox
                    chip
                    name="profileFocusGoals"
                    label="Focus goals (Step 1)"
                    options={FOCUS_GOAL_OPTIONS}
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                  />
                  <Field.MultiSelect
                    checkbox
                    chip
                    name="profileDiet"
                    label="Diet (Step 3)"
                    options={DIET_OPTIONS}
                    exclusiveValue="No preference"
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                  />
                  <Field.MultiSelect
                    checkbox
                    chip
                    name="profileAllergies"
                    label="Allergies (Step 3)"
                    options={ALLERGY_OPTIONS}
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                  />
                  <Field.MultiSelect
                    checkbox
                    chip
                    name="profileConditions"
                    label="Conditions (Step 3)"
                    options={CONDITION_OPTIONS}
                    exclusiveValue="None"
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>
                  Reminders
                </Typography>
                <Box
                  rowGap={1}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
                >
                  <Field.Switch name="reminderBreakfast" label="Morning brief / breakfast" />
                  <Field.Switch name="reminderLunch" label="Lunch / gap nudges" />
                  <Field.Switch name="reminderDinner" label="Dinner" />
                  <Field.Switch name="reminderWater" label="Water" />
                  <Field.Switch name="reminderWeighIn" label="Weekly weigh-in" />
                </Box>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 3 }}>
                Onboarding profile applies to app <strong>user</strong> accounts only — not admins.
              </Typography>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.push(paths.dashboard.users)}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? 'Create user' : 'Save changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
