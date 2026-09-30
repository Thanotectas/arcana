import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ texto }: { texto: string }) {
  return (
    <div className="prosa">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{texto}</ReactMarkdown>
    </div>
  );
}
