import { NextResponse } from "next/server";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  } as Record<string, string>;
}

export function json(code: number, data: unknown, extraHeaders?: Record<string, string>) {
  return new NextResponse(JSON.stringify(data), {
    status: code,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
      ...(extraHeaders || {}),
    },
  });
}
