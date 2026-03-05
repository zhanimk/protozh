'use client';

const FormSection = ({ title, children, className = '' }) => (
  <div className={`bg-navy-800 rounded-xl p-6 border border-navy-600 ${className}`}>
    {title && <h3 className="font-semibold text-gold mb-4">{title}</h3>}
    <div className="space-y-4">{children}</div>
  </div>
);

export default FormSection;
