export function pageQuery(query: { limit: number; page: number }) {
  const take = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * take;

  return { skip, take };
}
