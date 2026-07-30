export function resolveAssetUrl(
  assetPath: string,
  baseUrl = import.meta.env.BASE_URL,
): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(assetPath) || assetPath.startsWith('//')) {
    return assetPath
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedPath = assetPath.replace(/^\.?\//, '')

  return `${normalizedBase}${normalizedPath}`
}
