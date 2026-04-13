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
      eq: vi.fn(() => builder),
      order: vi.fn(() => builder),
      then: (resolve, reject) => Promise.resolve(next()).then(resolve, reject),
    };
    return builder;
  };

  return {
    from: vi.fn(() => makeBuilder()),
  };
};

let supabase;

vi.mock('../../Supabase/Conection', () => ({
  get supabase() {
    return supabase;
  },
}));

import { getVehiculosDisponibles } from '../AsignacionesService';

describe('AsignacionesService - getVehiculosDisponibles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna [] cuando data es null', async () => {
    supabase = createSupabaseMock([{ data: null, error: null }]);

    const res = await getVehiculosDisponibles();
    expect(res).toEqual([]);
  });

  it('agrega vehiculo_id alias y vehiculo_completo', async () => {
    supabase = createSupabaseMock([
      {
        data: [
          { id: 'v1', placa: 'ABC123', marca: 'Mazda', modelo: '2', activo: true, disponible: true },
        ],
        error: null,
      },
    ]);

    const res = await getVehiculosDisponibles();

    expect(res).toHaveLength(1);
    expect(res[0].vehiculo_id).toBe('v1');
    expect(res[0].vehiculo_completo).toBe('Mazda 2 - ABC123');
  });

  it('lanza error si Supabase retorna error', async () => {
    supabase = createSupabaseMock([{ data: null, error: { message: 'db down' } }]);

    await expect(getVehiculosDisponibles()).rejects.toBeTruthy();
  });
});
