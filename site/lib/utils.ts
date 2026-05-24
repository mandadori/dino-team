/**
 * cn — concatena classes condicionais sem dependência externa.
 * Suficiente para os componentes desta fase (sem conflito de classes Tailwind
 * que exija merge). Se o projeto crescer, trocar por clsx + tailwind-merge.
 */
export function cn(
  ...classes: Array<string | number | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
