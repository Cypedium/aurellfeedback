// Delade Tailwind-klasser för board och kortformulär

// Board: datum, edit- och delete-knappen syns bara när man hovrar över kortet
export const CARD_HOVER_CLASS =
  "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100";
export const CARD_ACTION_CLASS = `no-drag rounded-[3px] px-1.5 py-1 text-jira-secondary hover:bg-jira-neutral ${CARD_HOVER_CLASS}`;

// Formulär: gemensam stil för fälten
export const FIELD_CLASS =
  "w-full rounded-[3px] border border-jira-border bg-white text-jira-text transition-[border-color,box-shadow] duration-150 hover:bg-jira-hover";
export const FIELD_FOCUS_CLASS =
  "focus:border-jira-focus focus:bg-white focus:shadow-[inset_0_0_0_1px_var(--color-jira-focus)] focus:outline-none";
export const LABEL_CLASS = "mt-4 mb-1 block text-xs font-semibold text-jira-secondary";
export const SECTION_PADDING = "px-6 max-[480px]:px-4";
