import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  children: string;
}

function convertMathToPlainText(formula: string): string {
  return formula
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1) / ($2)')
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, 'sqrt($1)')
    .replace(/\\text\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\(?:mathrm|mathbf|mathit|mathcal)\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\times|\\cdot/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\pm/g, '+/-')
    .replace(/\\leq?\b/g, '<=')
    .replace(/\\geq?\b/g, '>=')
    .replace(/\\neq/g, '!=')
    .replace(/\\infty/g, 'infinity')
    .replace(/\\log/g, 'log')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/\^\{([^{}]*)\}/g, '^$1')
    .replace(/_\{([^{}]*)\}/g, '_$1')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMathToPlainText(markdown: string): string {
  return markdown
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, formula: string) => convertMathToPlainText(formula))
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, formula: string) => convertMathToPlainText(formula))
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, formula: string) => convertMathToPlainText(formula))
    .replace(/\$([^\n$]+?)\$/g, (_, formula: string) => convertMathToPlainText(formula))
    .replace(/\\\$/g, '$')
    .replace(/\$/g, '');
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
    >
      {normalizeMathToPlainText(children)}
    </ReactMarkdown>
  );
}
