'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

interface Field {
  id: string;
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  displayOrder: number;
  options?: string;
}

const fieldTypeLabels: Record<string, string> = {
  text: 'Texto corto',
  email: 'Email',
  phone: 'Telefono',
  number: 'Numero',
  select: 'Lista desplegable',
  checkbox: 'Casilla (Si/No)',
  textarea: 'Texto largo',
};

const fieldTypeIcons: Record<string, string> = {
  text: 'Aa',
  email: '@',
  phone: '#',
  number: '123',
  select: '▼',
  checkbox: '☑',
  textarea: '¶',
};

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [isRequired, setIsRequired] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [options, setOptions] = useState('');

  const { data: fields, isLoading } = useQuery({
    queryKey: ['fields'],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/fields`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await api.post(`/api/v1/tenants/${user?.tenantId}/fields`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/tenants/${user?.tenantId}/fields/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
  });

  const resetForm = () => {
    setFieldName('');
    setFieldType('text');
    setIsRequired(false);
    setDisplayOrder(0);
    setOptions('');
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    const payload: any = {
      fieldName: fieldName.trim(),
      fieldType,
      isRequired,
      displayOrder,
    };

    if (fieldType === 'select' && options.trim()) {
      payload.options = options.split(',').map((o) => o.trim()).filter(Boolean);
    }

    createMutation.mutate(payload);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campos del Formulario</h1>
          <p className="text-gray-500 text-sm mt-1">
            Estas preguntas aparecen cuando alguien se registra en tu evento
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span className="text-lg">+</span> Agregar Campo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200">
          <h2 className="text-lg font-semibold mb-4">Nuevo Campo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del campo
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Empresa, Talla de playera, Restricciones alimentarias..."
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de campo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(fieldTypeLabels).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFieldType(value)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      fieldType === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl block mb-1">{fieldTypeIcons[value]}</span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {fieldType === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opciones
                </label>
                <input
                  type="text"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opcion 1, Opcion 2, Opcion 3"
                />
                <p className="text-xs text-gray-500 mt-1">Separa cada opcion con una coma</p>
              </div>
            )}

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Obligatorio</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Orden:</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || !fieldName.trim()}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar Campo'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <p className="p-6 text-gray-500">Cargando campos...</p>
        ) : fields?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">No hay campos personalizados</p>
            <p className="text-gray-400 text-sm mt-1">
              Haz clic en "Agregar Campo" para crear preguntas para tu formulario
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {fields?.map((field: Field) => (
              <div key={field.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-medium">
                    {fieldTypeIcons[field.fieldType] || '?'}
                  </span>
                  <div>
                    <p className="font-medium">{field.fieldName}</p>
                    <p className="text-sm text-gray-500">
                      {fieldTypeLabels[field.fieldType] || field.fieldType}
                      {field.isRequired && ' · Obligatorio'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Eliminar "${field.fieldName}"?`)) {
                      deleteMutation.mutate(field.id);
                    }
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
