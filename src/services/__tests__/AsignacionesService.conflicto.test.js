import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de Supabase client usado por el service
const createSupabaseMock = (queue = []) => {
  const fromCalls = [];

  const next = () => {
    if (queue.length === 0) {
      throw new Error('Supabase mock queue exhausted. Add more queued results for this test.');
    }
    return queue.shift();
  };

  const makeBuilder = () => {
    const builder = {
      select: vi.fn(() => builder),
      insert: vi.fn(() => builder),
      update: vi.fn(() => builder),
      delete: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      not: vi.fn(() => builder),
      neq: vi.fn(() => builder),
      order: vi.fn(() => builder),
      limit: vi.fn(() => builder),
      maybeSingle: vi.fn(async () => next()),
      single: vi.fn(async () => next()),
      then: (resolve, reject) => Promise.resolve(next()).then(resolve, reject),
    };
    return builder;
  };

  const supabaseClient = {
    auth: {
      getUser: vi.fn(async () => next()),
    },
    from: vi.fn((table) => {
      fromCalls.push(table);
      return makeBuilder(table);
    }),
    functions: {
      invoke: vi.fn(async () => next()),
    },
    __fromCalls: fromCalls,
  };

  return supabaseClient;
};

let supabase;

vi.mock('../../Supabase/Conection', () => ({
  get supabase() {
    return supabase;
  },
}));

import { verificarConflictoHorarioRuta } from '../AsignacionesService';

describe('AsignacionesService - verificarConflictoHorarioRuta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna hayConflicto=false cuando no hay asignaciones activas existentes', async () => {
    supabase = createSupabaseMock([{ data: [], error: null }]);

    const res = await verificarConflictoHorarioRuta(10, [1, 2], '08:00', '10:00');

    expect(res.hayConflicto).toBe(false);
    expect(res.asignacionConflicto).toBe(null);
  });

  it('detecta conflicto cuando hay días en común y solapamiento de horas', async () => {
    supabase = createSupabaseMock([
      {
        data: [
          {
            id: 'a1',
            dias_semana: [1, 3],
            hora_inicio: '09:00',
            hora_fin: '12:00',
            chofer: { nombre: 'Ana', apellido: 'Paz' },
          },
        ],
        error: null,
      },
    ]);

    const res = await verificarConflictoHorarioRuta(10, [1], '10:00', '11:00');

    expect(res.hayConflicto).toBe(true);
    expect(res.mensaje).toContain('Conflicto de horario');
    expect(res.asignacionConflicto?.id).toBe('a1');
  });

  it('no detecta conflicto si no hay días en común', async () => {
    supabase = createSupabaseMock([
      {
        data: [
          {
            id: 'a1',
            dias_semana: [2],
            hora_inicio: '09:00',
            hora_fin: '12:00',
            chofer: { nombre: 'Ana', apellido: 'Paz' },
          },
        ],
        error: null,
      },
    ]);

    const res = await verificarConflictoHorarioRuta(10, [1], '10:00', '11:00');

    expect(res.hayConflicto).toBe(false);
  });

  it('no detecta conflicto si hay días en común pero no hay solapamiento de horas', async () => {
    supabase = createSupabaseMock([
      {
        data: [
          {
            id: 'a1',
            dias_semana: [1],
            hora_inicio: '08:00',
            hora_fin: '09:00',
            chofer: { nombre: 'Ana', apellido: 'Paz' },
          },
        ],
        error: null,
      },
    ]);

    const res = await verificarConflictoHorarioRuta(10, [1], '09:00', '10:00');

    expect(res.hayConflicto).toBe(false);
  });

  it('si se pasa asignacionIdExcluir, llama a neq(id, asignacionIdExcluir)', async () => {
    supabase = createSupabaseMock([{ data: [], error: null }]);

    await verificarConflictoHorarioRuta(10, [1], '08:00', '10:00', 'exclude-1');

    const builder = supabase.from.mock.results[0].value;
    expect(builder.neq).toHaveBeenCalledWith('id', 'exclude-1');
  });

  it('maneja error de Supabase retornando hayConflicto=false', async () => {
    supabase = createSupabaseMock([{ data: null, error: { message: 'boom' } }]);

    const res = await verificarConflictoHorarioRuta(10, [1], '08:00', '10:00');

    expect(res.hayConflicto).toBe(false);
  });
});
