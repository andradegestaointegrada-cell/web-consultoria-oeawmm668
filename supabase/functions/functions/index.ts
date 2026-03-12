import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  return new Response(JSON.stringify({ message: 'Functions entrypoint loaded successfully.' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})
