import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useContext } from 'react';

import { SidebarContext, SidebarItem, SidebarSection } from '@/components/layout/Sidebar';
import { useNotification } from '@/hooks/useNotification';

import { useStyleOptions } from '../hooks/useStyleOptions';
import { useUpdateReportStyle } from '../hooks/useUpdateReportStyle';

const SECTION_TITLE = 'Company branding';

function DetailRow({ label, children }) {
  return (
    <Box component="span" sx={{ display: 'contents' }}>
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {label}
      </Box>
      <Box
        component="span"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, fontWeight: 600 }}
      >
        {children}
      </Box>
    </Box>
  );
}

function BrandCard({ brand, palette, font, size, selected, onSelect }) {
  return (
    <ButtonBase
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${brand.name} branding`}
      sx={{
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 1,
        p: 1,
        borderRadius: 2,
        border: 2,
        borderColor: selected ? `#${palette.primary}` : 'divider',
        bgcolor: 'background.paper',
        textAlign: 'left',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' },
      }}
    >
      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          component="span"
          sx={{
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            width: 92,
            height: 36,
            px: 0.75,
            borderRadius: 1.5,
            bgcolor: '#F7F8FB',
          }}
        >
          <Box
            component="img"
            src={`/${brand.logo_file}`}
            alt=""
            sx={{ maxWidth: '100%', maxHeight: 26, objectFit: 'contain' }}
          />
        </Box>
        <Typography
          component="span"
          noWrap
          sx={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}
        >
          {brand.name}
        </Typography>
        {selected ? (
          <CheckCircleIcon sx={{ fontSize: 18, color: `#${palette.primary}` }} />
        ) : undefined}
      </Box>

      <Box
        component="span"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: 1.5,
          rowGap: 0.5,
          px: 0.5,
          pt: 1,
          borderTop: 1,
          borderColor: 'divider',
          fontSize: 11.5,
          lineHeight: 1.4,
        }}
      >
        <DetailRow label="Colours">
          {[palette.primary, palette.accent].map((color) => (
            <Box
              key={color}
              component="span"
              title={`#${color}`}
              sx={{
                flexShrink: 0,
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: `#${color}`,
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
              }}
            />
          ))}
          <Box component="span" sx={{ ml: 0.25 }}>
            {palette.label}
          </Box>
        </DetailRow>
        <DetailRow label="Font">
          <Box
            component="span"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: font.css_stack,
            }}
          >
            {font.label}
          </Box>
        </DetailRow>
        <DetailRow label="Text size">{size.label}</DetailRow>
      </Box>
    </ButtonBase>
  );
}

function ReportAppearanceSection({ report }) {
  const { collapsed, onExpand } = useContext(SidebarContext);
  const { data: options } = useStyleOptions();
  const updateStyle = useUpdateReportStyle(report.slug);
  const { notify } = useNotification();

  if (collapsed) {
    return (
      <SidebarSection title={SECTION_TITLE}>
        <SidebarItem
          icon={<PaletteOutlinedIcon fontSize="small" />}
          label={SECTION_TITLE}
          onClick={onExpand}
        />
      </SidebarSection>
    );
  }
  if (!options || !report.style) return null;

  const style = updateStyle.isPending ? updateStyle.variables : report.style;
  const fontsByKey = Object.fromEntries(options.fonts.map((font) => [font.key, font]));
  const palettesByKey = Object.fromEntries(
    options.palettes.map((palette) => [palette.key, palette]),
  );
  const sizesByKey = Object.fromEntries(options.sizes.map((size) => [size.key, size]));
  const applyBrand = (brand) => {
    const isApplied = Object.entries(brand.style).every(([key, value]) => style[key] === value);
    if (isApplied) return;
    updateStyle.mutate(brand.style, {
      onError: () => notify('Could not update the report branding. Please try again.', 'error'),
    });
  };

  return (
    <SidebarSection title={SECTION_TITLE}>
      <Box sx={{ display: 'grid', gap: 0.75, px: 1.5, pt: 0.5, pb: 2 }}>
        {options.brands.map((brand) => (
          <BrandCard
            key={brand.key}
            brand={brand}
            palette={palettesByKey[brand.style.palette]}
            font={fontsByKey[brand.style.font_family]}
            size={sizesByKey[brand.style.font_size]}
            selected={brand.key === style.brand}
            onSelect={() => applyBrand(brand)}
          />
        ))}
      </Box>
    </SidebarSection>
  );
}

export default ReportAppearanceSection;
