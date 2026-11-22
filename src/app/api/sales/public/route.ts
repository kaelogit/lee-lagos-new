import { NextResponse } from "next/server";
import { getLiveSales, getSaleBySlug, SalesSetupError } from "../../../../lib/sales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") || "";

  try {
    if (slug) {
      const sale = await getSaleBySlug(slug);
      if (!sale) return NextResponse.json({ sale: null }, { status: 404 });
      return NextResponse.json({ sale });
    }

    const sales = await getLiveSales();
    return NextResponse.json({ sales });
  } catch (error) {
    if (error instanceof SalesSetupError) {
      return NextResponse.json({ sale: null, sales: [] });
    }
    console.error(error);
    return NextResponse.json({ sale: null, sales: [] });
  }
}
