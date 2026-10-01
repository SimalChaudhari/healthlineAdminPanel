import { _mock } from 'src/_mock';

import { useAuthContext } from './use-auth-context';

// Template demo profile. Real projects: prefer useAuthContext() user only.

export const MOCK_USER = {
  id: '8864c717-587d-472a-929a-8e5f298024da-0',
  displayName: 'Jaydon Frankie',
  email: 'info@sr.io',
  photoURL: _mock.image.avatar(24),
  phoneNumber: _mock.phoneNumber(1),
  country: _mock.countryNames(1),
  address: '90210 Broadway Blvd',
  state: 'California',
  city: 'San Francisco',
  zipCode: '94116',
  about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
  role: 'admin',
  isPublic: true,
};

export function useMockedUser() {
  const { user } = useAuthContext();

  if (!user) {
    return { user: MOCK_USER };
  }

  return {
    user: {
      ...MOCK_USER,
      ...user,
    },
  };
}
