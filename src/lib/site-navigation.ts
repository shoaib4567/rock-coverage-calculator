import { CONTENT_PAGES, TOPICS, getContentPage, getNextPages } from './content-map.mjs';
export interface ToolLink { title: string; slug: string; desc?: string; badge?: string; }
export const groups = Object.entries(TOPICS).map(([id, topic]) => ({
  id, title: topic.title, intro: topic.description,
  tools: CONTENT_PAGES.filter(page => page.cluster === id && page.indexable && !['/', '/calculators'].includes(page.route))
    .map(page => ({title: page.title, slug: page.route, desc: page.summary.split('. ')[0].replace(/\.$/, '') + '.'}))
}));
export const allTools: ToolLink[] = CONTENT_PAGES.filter(page => page.indexable).map(page => ({title:page.title,slug:page.route,desc:page.summary}));
export function relatedTools(route: string): ToolLink[] {
  const page = getContentPage(route);
  const parent = page?.parent ? getContentPage(page.parent) : undefined;
  return [...(parent ? [parent] : []), ...getNextPages(route)].map(page => ({title:page.title,slug:page.route,desc:page.summary}));
}
