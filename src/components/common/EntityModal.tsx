import React from 'react';
import Button from './Button';

export interface EntityModalField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date';
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface EntityModalProps<T> {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: T) => void;
  fields: EntityModalField[];
  initialData?: Partial<T>;
  title: string;
  submitLabel?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

function EntityModal<T extends Record<string, any>>({
  open,
  onClose,
  onSubmit,
  fields,
  initialData = {},
  title,
  submitLabel = 'Save',
  loading = false,
  children,
}: EntityModalProps<T>) {
  const [form, setForm] = React.useState<Partial<T>>(initialData);

  React.useEffect(() => {
    setForm(initialData);
  }, [initialData, open]);

  const handleChange = (name: string, value: any) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form as T);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form className="bg-white rounded shadow-lg p-6 w-full max-w-md" onSubmit={handleSubmit}>
        <div className="font-bold text-lg mb-4">{title}</div>
        {children ? (
          <div>{children}</div>
        ) : (
          fields.map((field) => (
            <div className="mb-3" key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
                {field.required && ' *'}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className="w-full border rounded px-2 py-1"
                  value={form[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              ) : field.type === 'select' ? (
                <select
                  className="w-full border rounded px-2 py-1"
                  value={form[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'date' ? (
                <input
                  className="w-full border rounded px-2 py-1"
                  type="date"
                  value={form[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              ) : (
                <input
                  className="w-full border rounded px-2 py-1"
                  type={field.type}
                  value={form[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))
        )}
        <div className="flex gap-2 mt-6">
          <Button
            type="button"
            color="secondary"
            className="px-4 py-2"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" color="primary" className="px-4 py-2" disabled={loading}>
            {loading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EntityModal;
