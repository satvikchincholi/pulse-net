import * as React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={`block text-sm font-medium text-slate-200 ${className ?? ''}`}
      {...props}
    >
      {children}
    </label>
  )
);

Label.displayName = 'Label';
