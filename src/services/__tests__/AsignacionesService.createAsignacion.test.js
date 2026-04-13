import { describe, it, expect, vi, beforeEach } from 'vitest';

const createSupabaseMock = (queue = []) => {
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

  return {
    auth: {
      getUser: vi.fn(async () => next()),
    },
    from: vi.fn(() => makeBuilder()),
    functions: {
      invoke: vi.fn(async () => next()),
    },
  };
};

let supabase;

vi.mock('../../Supabase/Conection', () => ({
  get supabase() {
    return supabase;
  },
}));

import { createAsignacion } from '../AsignacionesService';

describe('AsignacionesService - createAsignacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lanza error si el usuario no es admin', async () => {
    supabase = createSupabaseMock([
      // isUserAdmin: getUser
      { data: { user: { id: 'u1' } }, error: null },
      // isUserAdmin: admin maybeSingle
      { data: null, error: null },
    ]);

    await expect(
      createAsignacion({
        chofer_id: 1,
        vehiculo_id: 'v1',
        ruta_id: 10,
        dias_semana: [],
      })
    ).rejects.toThrow('Solo los administradores pueden crear asignaciones');
  });

  it('lanza error si hay conflicto de horario (verificación frontend)', async () => {
    supabase = createSupabaseMock([
      // isUserAdmin: getUser
      { data: { user: { id: 'u1' } }, error: null },
      // isUserAdmin: admin maybeSingle
      { data: { id: 99, activo: true }, error: null },
      // verificarConflictoHorarioRuta: await query
      {
        data: [
          {
            id: 'a1',
            dias_semana: [1],
            hora_inicio: '09:00',
            hora_fin: '12:00',
            chofer: { nombre: 'Ana', apellido: 'Paz' },
          },
        ],
        error: null,
      },
    ]);

    await expect(
      createAsignacion({
        chofer_id: 1,
        vehiculo_id: 'v1',
        ruta_id: 10,
        dias_semana: [1],
        hora_inicio: '10:00',
        hora_fin: '11:00',
        estado: 'activa',
      })
    ).rejects.toThrow(/Conflicto de horario/);
  });

  it('transforma error CONFLICTO_HORARIO del trigger en mensaje amigable', async () => {
    supabase = createSupabaseMock([
      // isUserAdmin: getUser
      { data: { user: { id: 'u1' } }, error: null },
      // isUserAdmin: admin maybeSingle
      { data: { id: 99, activo: true }, error: null },
      // Insert asignación: single
      { data: null, error: { message: 'CONFLICTO_HORARIO: overlap' } },
    ]);

    await expect(
      createAsignacion({
        chofer_id: 1,
        vehiculo_id: 'v1',
        ruta_id: 10,
        dias_semana: [],
        estado: 'activa',
      })
    ).rejects.toThrow('Ya existe una asignación activa para esta ruta con horarios que se solapan');
  });

  it('en happy path inserta, marca vehículo no disponible y recarga la asignación', async () => {
    supabase = createSupabaseMock([
      // isUserAdmin: getUser
      { data: { user: { id: 'u1' } }, error: null },
      // isUserAdmin: admin maybeSingle
      { data: { id: 99, activo: true }, error: null },
      // Insert asignación: single
      { data: { id: 'asig-1' }, error: null },
      // Update vehiculo (await query)
      { data: null, error: null },
      // Reload asignación: single
      { data: { id: 'asig-1', estado: 'activa' }, error: null },
    ]);

    const res = await createAsignacion({
      chofer_id: 1,
      vehiculo_id: 'veh-1',
      ruta_id: 10,
      dias_semana: [],
      estado: 'activa',
    });

    expect(res?.id).toBe('asig-1');

    // Debe llamar a la tabla vehiculos para marcar disponible=false cuando estado=activa
    const fromCalls = supabase.from.mock.calls.map((c) => c[0]);
    expect(fromCalls).toContain('vehiculos');
  });
});
