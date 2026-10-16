export function scoreRouteRecall(expectedRoute, recalledRoute) {
  if (!expectedRoute.length || !recalledRoute.length) {
    return { accuracy: 0, bonus: 0 };
  }
  const correctPositions = recalledRoute.reduce(
    (count, room, index) => count + Number(expectedRoute[index] === room),
    0
  );
  const accuracy = correctPositions / Math.max(expectedRoute.length, recalledRoute.length);
  return { accuracy, bonus: Math.round(500 * accuracy) };
}
