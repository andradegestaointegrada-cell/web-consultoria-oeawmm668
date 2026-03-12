import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  return new Response(
    JSON.stringify({ status: 'ok', message: 'Fallback entrypoint for functions folder' }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
})
