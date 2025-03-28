import { ReactNode } from "react";

interface InputQuadProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const InputQuad = ({ children, className = "", id }: InputQuadProps) => {
  return (
    <div
      id={id}
      className={`bg-secondary-green rounded-md p-4 flex flex-col justify-start m-10 shadow-md shadow-black ${className}`}
    >
      {children}
    </div>
  );
};

export default InputQuad;
