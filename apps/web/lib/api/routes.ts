export const NEST_ROUTES = {
  health: '/health',

  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },

  users: {
    list:   '/users',
    create: '/users',
    findOne: (id: string) => `/users/${id}`,
    update:  (id: string) => `/users/${id}`,
    remove:  (id: string) => `/users/${id}`,
  },
} as const;
