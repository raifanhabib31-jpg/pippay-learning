import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  children: string;
}

function normalizeMathDelimiters(markdown: string): string {
  return markdown
    .replace(/\\+\$/g, '$')
    .replace(/\\\(([^\n]+?)\\\)/g, (_, formula: string) => `$${formula.trim()}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, formula: string) => `$$\n${formula.trim()}\n$$`)
    .replace(/\$\$([^\n]+?)\$\$/g, (_, formula: string) => `$$\n${formula.trim()}\n$$`);
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
      rehypePlugins={[rehypeKatex]}
    >
      {normalizeMathDelimiters(children)}
    </ReactMarkdown>
  );
}
