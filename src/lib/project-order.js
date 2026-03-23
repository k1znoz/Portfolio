export const PROJECT_DISPLAY_ORDER = [
  'Coutellerie-svelte-laravel',
  'MariageLV',
  'GrainesDeJardin',
  'LivingSoils',
  'Reflex Shot',
  'Lane Defender',
]

export function getProjectOrderIndex(projectName) {
  const index = PROJECT_DISPLAY_ORDER.indexOf(projectName)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

export function sortProjectsByDisplayOrder(items = []) {
  return [...items].sort((a, b) => {
    const rankA = getProjectOrderIndex(a?.name)
    const rankB = getProjectOrderIndex(b?.name)

    if (rankA !== rankB) {
      return rankA - rankB
    }

    return String(a?.name ?? '').localeCompare(String(b?.name ?? ''))
  })
}
