import { describe, it, expect, vi, Mocked } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
  },
}));

const mockedAxios = axios as Mocked<typeof axios>;

describe('api', () => {
  it('should be created with the correct base URL', async () => {
    const create = vi.fn();
    mockedAxios.create = create;

    await import('@/adapters/infrastructure/api');

    expect(create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:4000/api',
    });
  });
});
