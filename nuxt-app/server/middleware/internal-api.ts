export default defineEventHandler((event) => {
  // Add header to mark as internal API call
  event.node.req.headers['x-internal-api'] = 'true'
})
