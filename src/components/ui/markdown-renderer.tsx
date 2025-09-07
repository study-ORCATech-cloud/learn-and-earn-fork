// Markdown renderer component for displaying .md files with VSCode-like styling

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={cn("prose prose-invert prose-slate max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom styling for different elements
          h1: ({node, ...props}) => (
            <h1 className="text-3xl font-bold text-white mb-6 pb-2 border-b border-slate-700" {...props} />
          ),
          h2: ({node, ...props}) => (
            <h2 className="text-2xl font-semibold text-white mb-4 mt-8 pb-2 border-b border-slate-700" {...props} />
          ),
          h3: ({node, ...props}) => (
            <h3 className="text-xl font-semibold text-white mb-3 mt-6" {...props} />
          ),
          h4: ({node, ...props}) => (
            <h4 className="text-lg font-semibold text-white mb-2 mt-4" {...props} />
          ),
          h5: ({node, ...props}) => (
            <h5 className="text-base font-semibold text-white mb-2 mt-3" {...props} />
          ),
          h6: ({node, ...props}) => (
            <h6 className="text-sm font-semibold text-white mb-2 mt-3" {...props} />
          ),
          p: ({node, ...props}) => (
            <p className="text-slate-300 mb-4 leading-relaxed" {...props} />
          ),
          ul: ({node, ...props}) => (
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-1 ml-4" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="list-decimal list-inside text-slate-300 mb-4 space-y-1 ml-4" {...props} />
          ),
          li: ({node, ...props}) => (
            <li className="text-slate-300" {...props} />
          ),
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-400 bg-slate-800/50 py-2 my-4 rounded-r" {...props} />
          ),
          code: ({node, className, children, ...props}) => {
            const inline = !className?.includes('language-');
            return inline ? (
              <code className="bg-slate-800 text-blue-300 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className="block bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed border border-slate-700" {...props}>
                {children}
              </code>
            );
          },
          pre: ({node, ...props}) => (
            <div className="bg-slate-900 rounded-lg my-4 border border-slate-700">
              <pre className="p-4 overflow-x-auto text-sm leading-relaxed" {...props} />
            </div>
          ),
          a: ({node, ...props}) => (
            <a className="text-blue-400 hover:text-blue-300 underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-slate-600 rounded-lg" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => (
            <thead className="bg-slate-800" {...props} />
          ),
          tbody: ({node, ...props}) => (
            <tbody {...props} />
          ),
          tr: ({node, ...props}) => (
            <tr className="border-b border-slate-600" {...props} />
          ),
          th: ({node, ...props}) => (
            <th className="border border-slate-600 px-4 py-2 text-left font-semibold text-white" {...props} />
          ),
          td: ({node, ...props}) => (
            <td className="border border-slate-600 px-4 py-2 text-slate-300" {...props} />
          ),
          hr: ({node, ...props}) => (
            <hr className="border-slate-700 my-6" {...props} />
          ),
          strong: ({node, ...props}) => (
            <strong className="font-semibold text-white" {...props} />
          ),
          em: ({node, ...props}) => (
            <em className="italic text-slate-200" {...props} />
          ),
          del: ({node, ...props}) => (
            <del className="line-through text-slate-500" {...props} />
          ),
          img: ({node, ...props}) => (
            <img className="max-w-full h-auto rounded-lg border border-slate-700 my-4" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;