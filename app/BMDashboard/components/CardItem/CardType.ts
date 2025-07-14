export interface CardType {
  date: string;
  tag: string;
  status: string,
  tagColor?: string;
  updated: string;
  description: string;
  details: string[];
  cta?: {
    label: string;
    href: string;
  };
};