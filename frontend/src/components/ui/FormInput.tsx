import React from "react";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  className?: string;
};

const FormInput: React.FC<FormInputProps> = ({ label, className = "", ...rest }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm text-gray-700">{label}</label>}
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        {...rest}
      />
    </div>
  );
};

export default FormInput;