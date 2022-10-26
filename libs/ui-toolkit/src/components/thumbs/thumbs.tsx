export interface ThumbsProps {
  up: boolean;
  text?: string;
}

export const Thumbs = ({ up, text }: ThumbsProps) => {
  return (
    <span>
      {up ? '👍' : '👎'}
      {text && <span className="ml-2">{text}</span>}
    </span>
  );
};
