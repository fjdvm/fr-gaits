import { vi } from "vitest";

export function mockAuthenticatedUser(userId: string) {
  vi.doMock("@/lib/supabase/server", () => ({
    createClient: async () => ({
      auth: {
        getUser: async () => ({ data: { user: { id: userId } } }),
      },
    }),
  }));
}

export function mockUnauthenticated() {
  vi.doMock("@/lib/supabase/server", () => ({
    createClient: async () => ({
      auth: {
        getUser: async () => ({ data: { user: null } }),
      },
    }),
  }));
}
