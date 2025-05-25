const href = location.href

console.log({ href })

console.log({ search: (new URL(location)).searchParams.get('id') })