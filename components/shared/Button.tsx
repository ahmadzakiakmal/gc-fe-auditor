import React from "react";

export default function Button({
  children,
  disabled = false,
  className,
  onClick = () => {},
  type = "button"
}: {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type={type}
      onClick={(e) => {
        e.preventDefault();
        if (disabled) return;
        onClick(e);
      }}
      className={`
        font-semibold text-white bg-green-600 hover:bg-green-700 duration-200 rounded-md py-2 px-2.5 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed 
        ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

