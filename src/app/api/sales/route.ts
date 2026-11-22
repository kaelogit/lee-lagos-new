import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/require-admin";
import { deleteSale, listSales, saveSale, SalesSetupError } from "../../../lib/sales";
import type { SaleInput } from "../../../lib/sale-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function setupBody() {
  let sql = "";
  try {
    sql = readFileSync(path.join(process.cwd(), "supabase/sales.sql"), "utf8");
  } catch {
    sql = "";
  }
  return {
    error: "Sales are not set up in the database yet.",
    setup: true,
    sql,
  };
}

function fail(error: unknown) {
  if (error instanceof SalesSetupError) {
    return NextResponse.json(setupBody(), { status: 503 });
  }
  const message = error instanceof Error ? error.message : "The sale could not be saved.";
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  try {
    const result = await listSales();
    return NextResponse.json(result);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as SaleInput | null;
  if (!body) return NextResponse.json({ error: "The sale details were missing." }, { status: 400 });

  try {
    const id = await saveSale(body);
    return NextResponse.json({ id });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as SaleInput | null;
  if (!body?.id) return NextResponse.json({ error: "Choose a sale to edit." }, { status: 400 });

  try {
    const id = await saveSale(body);
    return NextResponse.json({ id });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "Choose a sale to delete." }, { status: 400 });

  try {
    await deleteSale(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
