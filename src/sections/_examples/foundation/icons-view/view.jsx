'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { countries } from 'src/assets/data';
import {
  SentIcon,
  PasswordIcon,
  PlanFreeIcon,
  EmailInboxIcon,
  PlanStarterIcon,
  PlanPremiumIcon,
  NewPasswordIcon,
} from 'src/assets/icons';
import {
  // AvatarShape,
  SeoIllustration,
  UploadIllustration,
  BookingIllustration,
  CheckInIllustration,
  CheckoutIllustration,
  ForbiddenIllustration,
  MotivationIllustration,
  ComingSoonIllustration,
  MaintenanceIllustration,
  ServerErrorIllustration,
  PageNotFoundIllustration,
  OrderCompleteIllustration,
} from 'src/assets/illustrations';

import { Logo } from 'src/components/logo';
import { SvgColor } from 'src/components/svg-color';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify, FlagIcon, SocialIcon } from 'src/components/iconify';

import { ComponentHero } from '../../component-hero';
import { ComponentBlock } from '../../component-block';
import { ScrollToViewTemplate } from '../../component-template';

// ----------------------------------------------------------------------

const assetIcons = [
  { name: 'Email inbox', component: <EmailInboxIcon /> },
  { name: 'Password', component: <PasswordIcon /> },
  { name: 'New password', component: <NewPasswordIcon /> },
  { name: 'Plan free', component: <PlanFreeIcon /> },
  { name: 'Plan starter', component: <PlanStarterIcon /> },
  { name: 'Plan premium', component: <PlanPremiumIcon /> },
  { name: 'Sent', component: <SentIcon /> },
];

const emptyIcons = [
  'ic-cart',
  'ic-chat-active',
  'ic-content',
  'ic-email-disabled',
  'ic-email-selected',
  'ic-folder-empty',
  'ic-mail',
];

const fileIcons = [
  'ic-ai',
  'ic-audio',
  'ic-document',
  'ic-excel',
  'ic-file',
  'ic-folder',
  'ic-img',
  'ic-js',
  'ic-pdf',
  'ic-power_point',
  'ic-pts',
  'ic-txt',
  'ic-video',
  'ic-word',
  'ic-zip',
];

const assetIllustrations = [
  // { name: 'Avatar shape', component: <AvatarShape sx={{ color: 'text.disabled', width: 144 }} />, compact: true },
  { name: 'Check in', component: <CheckInIllustration sx={{ width: 110 }} />, compact: true },
  { name: 'Check out', component: <CheckoutIllustration sx={{ width: 110 }} />, compact: true },
  { name: 'Booking', component: <BookingIllustration sx={{ width: 110 }} />, compact: true },
  { name: 'Upload', component: <UploadIllustration /> },
  { name: 'Page not found', component: <PageNotFoundIllustration /> },
  { name: 'Forbidden', component: <ForbiddenIllustration /> },
  { name: 'Motivation', component: <MotivationIllustration /> },
  { name: 'Maintenance', component: <MaintenanceIllustration /> },
  { name: 'Server error', component: <ServerErrorIllustration /> },
  { name: 'Seo', component: <SeoIllustration /> },
  { name: 'Coming soon', component: <ComingSoonIllustration /> },
  { name: 'Order complete', component: <OrderCompleteIllustration /> },
];

// ----------------------------------------------------------------------

export function IconsView() {
  const DEMO = [
    {
      name: 'Logo',
      component: (
        <ComponentBlock sx={{ gap: 3 }}>
          <Logo />
          <Logo sx={{ width: 64, height: 64 }} />
          <Logo sx={{ width: 80, height: 80 }} />
        </ComponentBlock>
      ),
    },
    {
      name: 'Material icons',
      component: (
        <ComponentBlock>
          <Link
            href="https://mui.com/components/icons/#main-content"
            target="_blank"
            rel="noopener"
          >
            https://mui.com/components/icons/#main-content
          </Link>
        </ComponentBlock>
      ),
    },
    {
      name: 'Iconify icons',
      component: (
        <ComponentBlock>
          <Tooltip title="Iconify">
            <Iconify icon="eva:color-palette-fill" width={32} />
          </Tooltip>
          <Iconify icon="eva:color-palette-fill" width={32} sx={{ color: 'action.active' }} />
          <Iconify icon="eva:color-palette-fill" width={32} sx={{ color: 'action.disabled' }} />
          <Iconify icon="eva:color-palette-fill" width={32} sx={{ color: 'primary.main' }} />
          <Iconify icon="eva:color-palette-fill" width={32} sx={{ color: 'secondary.main' }} />
          <Iconify icon="eva:color-palette-fill" width={32} sx={{ color: 'info.main' }} />
          <Iconify icon="eva:color-palette-fill" width={32} sx={{ color: 'success.main' }} />
          <Iconify icon="eva:color-palette-fill" width={32} sx={{ color: 'warning.main' }} />
          <Iconify icon="eva:color-palette-fill" width={32} sx={{ color: 'error.main' }} />
        </ComponentBlock>
      ),
    },
    {
      name: 'Local icons',
      component: (
        <ComponentBlock>
          <Tooltip title="SvgColor">
            <SvgColor
              src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-dashboard.svg`}
              sx={{ width: 32, height: 32 }}
            />
          </Tooltip>
          <SvgColor
            src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-dashboard.svg`}
            sx={{ color: 'action.active', width: 32, height: 32 }}
          />
          <SvgColor
            src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-dashboard.svg`}
            sx={{ color: 'action.disabled', width: 32, height: 32 }}
          />
          <SvgColor
            src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-dashboard.svg`}
            sx={{ color: 'primary.main', width: 32, height: 32 }}
          />
          <SvgColor
            src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-dashboard.svg`}
            sx={{ color: 'secondary.main', width: 32, height: 32 }}
          />
          <SvgColor
            src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-dashboard.svg`}
            sx={{ color: 'info.main', width: 32, height: 32 }}
          />
          <SvgColor
            src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-dashboard.svg`}
            sx={{ color: 'success.main', width: 32, height: 32 }}
          />
          <SvgColor
            src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-dashboard.svg`}
            sx={{ color: 'warning.main', width: 32, height: 32 }}
          />
          <SvgColor
            src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-dashboard.svg`}
            sx={{ color: 'error.main', width: 32, height: 32 }}
          />
        </ComponentBlock>
      ),
    },
    {
      name: 'Social icons',
      component: (
        <ComponentBlock>
          <Tooltip title="Google">
            <SocialIcon width={32} icon="google" />
          </Tooltip>
          <SocialIcon width={32} icon="facebook" />
          <SocialIcon width={32} icon="linkedin" />
          <SocialIcon width={32} icon="twitter" />
          <SocialIcon width={32} icon="instagram" />
          <SocialIcon width={32} icon="github" />
        </ComponentBlock>
      ),
    },
    {
      name: 'File icons',
      component: (
        <ComponentBlock sx={{ gap: 2.5 }}>
          {fileIcons.map((icon) => (
            <Tooltip key={icon} title={icon}>
              <Box
                component="img"
                alt={icon}
                src={`${CONFIG.site.basePath}/assets/icons/files/${icon}.svg`}
                sx={{ width: 36, height: 36 }}
              />
            </Tooltip>
          ))}
        </ComponentBlock>
      ),
    },
    {
      name: 'Flag icons',
      component: (
        <ComponentBlock>
          {countries.map((country) =>
            country.label ? (
              <Tooltip key={country.code} title={`${country.label} - ${country.code}`}>
                <FlagIcon code={country.code} />
              </Tooltip>
            ) : null
          )}
        </ComponentBlock>
      ),
    },
    {
      name: 'Assets icons',
      component: (
        <ComponentBlock
          sx={{
            rowGap: 3,
            columnGap: 2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {assetIcons.map((item) => (
            <Tooltip key={item.name} title={item.name}>
              <Box
                sx={{
                  display: 'flex',
                  flex: '0 0 auto',
                  width: { xs: 64, sm: 72, md: 84, xl: 96 },
                  minHeight: { xs: 64, sm: 72, md: 84, xl: 96 },
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& svg': {
                    width: 1,
                    maxWidth: '100%',
                    height: 'auto',
                  },
                }}
              >
                {item.component}
              </Box>
            </Tooltip>
          ))}

          {emptyIcons.map((icon) => (
            <Tooltip key={icon} title={icon}>
              <Box
                component="img"
                alt={icon}
                src={`${CONFIG.site.basePath}/assets/icons/empty/${icon}.svg`}
                sx={{
                  flex: '0 0 auto',
                  width: { xs: 64, sm: 72, md: 84, xl: 96 },
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </Tooltip>
          ))}
        </ComponentBlock>
      ),
    },
    {
      name: 'Assets illustrations',
      component: (
        <ComponentBlock
          sx={{
            rowGap: 3,
            columnGap: 2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {assetIllustrations.map((item) => (
            <Tooltip key={item.name} title={item.name}>
              <Box
                sx={{
                  display: 'flex',
                  flex: '0 0 auto',
                  width: item.compact
                    ? { xs: 96, sm: 110, md: 120 }
                    : { xs: 220, sm: 250, md: 280 },
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& > *': {
                    width: 1,
                    maxWidth: item.compact ? 120 : 280,
                  },
                }}
              >
                {item.component}
              </Box>
            </Tooltip>
          ))}
        </ComponentBlock>
      ),
    },
  ];

  return (
    <>
      <ComponentHero>
        <CustomBreadcrumbs
          heading="Icons"
          links={[{ name: 'Components', href: paths.components }, { name: 'Icons' }]}
          moreLink={[
            'https://mui.com/components/material-icons',
            'https://iconify.design/icon-sets',
          ]}
        />
      </ComponentHero>

      <ScrollToViewTemplate data={DEMO} />
    </>
  );
}
