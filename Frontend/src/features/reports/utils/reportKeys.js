export const reportKeys = {
  all: ['reports'],
  lists: () => [...reportKeys.all, 'list'],
  list: (params) => [...reportKeys.lists(), params],
  detail: (slug) => [...reportKeys.all, 'detail', slug],
  styleOptions: () => [...reportKeys.all, 'style-options'],
};
