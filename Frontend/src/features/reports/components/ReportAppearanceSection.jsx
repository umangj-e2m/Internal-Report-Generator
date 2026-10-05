import CheckIcon from '@mui/icons-material/Check';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import { Box, ButtonBase, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useContext } from 'react';

import { SidebarContext, SidebarItem, SidebarSection } from '@/components/layout/Sidebar';
import { useNotification } from '@/hooks/useNotification';

import { useStyleOptions } from '../hooks/useStyleOptions';
import { useUpdateReportStyle } from '../hooks/useUpdateReportStyle';

const fieldLabelSx = { mb: 0.75, fontSize: 12, fontWeight: 600, color: 'text.secondary' };

const toggleSx = {
  textTransform: 'none',
  color: 'text.primary',
  borderColor: 'divider',
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'primary.main',
    bgcolor: 'rgba(27, 35, 64, 0.08)',
    fontWeight: 700,
  },
};

function Field({ label, children }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {children}
    </Box>
  );
}

function PaletteSwatch({ palette, selected, onSelect }) {
  return (
    <ButtonBase
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${palette.label} palette`}
      sx={{
        flexDirection: 'column',
        gap: 0.5,
        p: 0.5,
        borderRadius: 2,
        border: 2,
        borderColor: selected ? `#${palette.primary}` : 'transparent',
        transition: 'border-color 0.2s ease',
        '&:hover': { bgcolor: 'rgba(27, 35, 64, 0.04)' },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: 32,
          borderRadius: 1.5,
          overflow: 'hidden',
          boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Box sx={{ flex: 3, bgcolor: `#${palette.primary}` }} />
        <Box sx={{ flex: 2, bgcolor: `#${palette.accent}` }} />
        {selected ? (
          <CheckIcon
            sx={{ position: 'absolute', inset: 0, m: 'auto', fontSize: 18, color: '#FFFFFF' }}
          />
        ) : undefined}
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: selected ? 700 : 500 }}>
        {palette.label}
      </Typography>
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
      <SidebarSection title="Appearance">
        <SidebarItem
          icon={<PaletteOutlinedIcon fontSize="small" />}
          label="Appearance"
          onClick={onExpand}
        />
      </SidebarSection>
    );
  }
  if (!options || !report.style) return null;

  const style = updateStyle.isPending ? updateStyle.variables : report.style;
  const change = (patch) =>
    updateStyle.mutate(
      { ...style, ...patch },
      { onError: () => notify('Could not update the report style. Please try again.', 'error') },
    );
  const pick = (key) => (_, value) => {
    if (value) change({ [key]: value });
  };

  return (
    <SidebarSection title="Appearance">
      <Box sx={{ px: 1.5, pt: 0.5 }}>
        <Field label="Colour palette">
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
            {options.palettes.map((palette) => (
              <PaletteSwatch
                key={palette.key}
                palette={palette}
                selected={style.palette === palette.key}
                onSelect={() => change({ palette: palette.key })}
              />
            ))}
          </Box>
        </Field>

        <Field label="Font style">
          <ToggleButtonGroup
            exclusive
            fullWidth
            orientation="vertical"
            size="small"
            value={style.font_family}
            onChange={pick('font_family')}
            aria-label="Font style"
          >
            {options.fonts.map((font) => (
              <ToggleButton
                key={font.key}
                value={font.key}
                sx={{
                  ...toggleSx,
                  justifyContent: 'flex-start',
                  gap: 1.25,
                  fontFamily: font.css_stack,
                }}
              >
                <Box component="span" aria-hidden sx={{ fontSize: 18, lineHeight: 1, width: 26 }}>
                  Aa
                </Box>
                <Box component="span" sx={{ fontSize: 14 }}>
                  {font.label}
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Field>

        <Field label="Text size">
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={style.font_size}
            onChange={pick('font_size')}
            aria-label="Text size"
          >
            {options.sizes.map((size) => (
              <ToggleButton key={size.key} value={size.key} sx={{ ...toggleSx, fontSize: 13 }}>
                {size.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Field>
      </Box>
    </SidebarSection>
  );
}

export default ReportAppearanceSection;
