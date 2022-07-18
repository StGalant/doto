import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.5,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: 'prose prose-sm m-auto text-left'.split(' '),
  rules: [
    [/^text-p(-\d+)?$/, ([,d]) => ({ color: `var(--color-text${d || ''})` })],
    [/^text-s(-\d+)?$/, ([,d]) => ({ color: `var(--color-text-secondary${d || ''})` })],
    [/^text-a(-\d+)?$/, ([,d]) => ({ color: `var(--color-action${d || ''})` })],
    [/^text-a-c(-\d+)?$/, ([,d]) => ({ color: `var(--color-action-contrast${d || ''})` })],
    [/^text-bg(-\d+)?$/, ([,d]) => ({ color: `var(--color-background${d || ''})` })],
    [/^text-bg-s(-\d+)?$/, ([,d]) => ({ color: `var(--color-background-secondary${d || ''})` })],
    [/^text-br(-\d+)?$/, ([,d]) => ({ color: `var(--color-brand${d || ''})` })],
    [/^bg-p(-\d+)?$/, ([,d]) => ({ 'background-color': `var(--color-background${d || ''})` })],
    [/^bg-s(-\d+)?$/, ([,d]) => ({ 'background-color': `var(--color-background-secondary${d || ''})` })],
    [/^bg-text(-\d+)?$/, ([,d]) => ({ 'background-color': `var(--color-text${d || ''})` })],
    [/^bg-text-s(-\d+)?$/, ([,d]) => ({ 'background-color': `var(--color-text-secondary${d || ''})` })],
    [/^bg-a(-\d+)?$/, ([,d]) => ({ 'background-color': `var(--color-action${d || ''})` })],
    [/^bg-a-c(-\d+)?$/, ([,d]) => ({ 'background-color': `var(--color-action-contrast${d || ''})` })],
    [/^bg-br(-\d+)?$/, ([,d]) => ({ 'background-color': `var(--color-brand${d || ''})` })],
  ],
})
