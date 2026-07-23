export const proxyImageUrl = (url, width = 800) => {
  if (!url || typeof url !== 'string' || url.startsWith('data:') || url.includes('placehold.co') || url.includes('supabase.co/storage')) return url
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp`
}

export const imageFallback = (title = '图片加载失败') => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect fill="#1e293b" width="800" height="450"/><text fill="#94a3b8" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle" x="400" y="225">${String(title).replace(/[<>&]/g, '')}</text></svg>`)}`

export const sanitizeHtml = (value) => {
  const html = String(value || '')
  if (typeof DOMParser === 'undefined') return html.replace(/<\/?(?:script|style)[^>]*>/gi, '')
  const documentNode = new DOMParser().parseFromString(html, 'text/html')
  documentNode.querySelectorAll('script, style').forEach(node => node.remove())
  documentNode.querySelectorAll('*').forEach(node => {
    Array.from(node.attributes).forEach(attribute => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim().toLowerCase()
      if (name.startsWith('on') || (['href', 'src', 'xlink:href'].includes(name) && value.startsWith('javascript:'))) node.removeAttribute(attribute.name)
    })
  })
  return documentNode.body.innerHTML
}
