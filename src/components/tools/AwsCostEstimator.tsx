"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Field, NativeSelect, type ToolProps } from "@/components/tools/shared";

/**
 * Small hardcoded price table — rough on-demand us-east-1 rates, 2024/2025.
 * This is a learning aid, not a quote. Real AWS bills depend on tiers,
 * commitments, free-tier, and region.
 */
const EC2_RATES: Record<string, number> = {
  "t3.micro": 0.0104,
  "t3.small": 0.0208,
  "t3.medium": 0.0416,
};
const S3_PER_GB = 0.023; // S3 Standard, per GB-month
const LAMBDA_PER_MILLION_REQ = 0.2; // $0.20 per 1M requests
const LAMBDA_PER_GB_SECOND = 0.0000166667;
const DATA_OUT_PER_GB = 0.09; // outbound to internet, past free tier

const LAMBDA_MEMORY = [128, 256, 512, 1024, 2048] as const;

function usd(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Coerce a numeric input, clamping negatives to zero. */
function num(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

type Line = { label: string; detail: string; cost: number };

export function AwsCostEstimator({ accent }: ToolProps) {
  const [instance, setInstance] = React.useState<string>("t3.micro");
  const [hours, setHours] = React.useState("730");
  const [s3Gb, setS3Gb] = React.useState("50");
  const [lambdaM, setLambdaM] = React.useState("1");
  const [lambdaMs, setLambdaMs] = React.useState("200");
  const [lambdaMem, setLambdaMem] = React.useState<number>(128);
  const [dataGb, setDataGb] = React.useState("100");

  const { lines, total } = React.useMemo(() => {
    const rate = EC2_RATES[instance] ?? 0;
    const h = num(hours);
    const ec2 = rate * h;

    const s3 = num(s3Gb) * S3_PER_GB;

    const millions = num(lambdaM);
    const lambdaReq = millions * LAMBDA_PER_MILLION_REQ;
    const gbSeconds =
      millions * 1_000_000 * (num(lambdaMs) / 1000) * (lambdaMem / 1024);
    const lambdaCompute = gbSeconds * LAMBDA_PER_GB_SECOND;

    const dataOut = num(dataGb) * DATA_OUT_PER_GB;

    const rows: Line[] = [
      {
        label: `EC2 ${instance}`,
        detail: `${h.toLocaleString()} hrs × ${usd(rate)}/hr`,
        cost: ec2,
      },
      {
        label: "S3 Standard",
        detail: `${num(s3Gb).toLocaleString()} GB × ${usd(S3_PER_GB)}/GB-mo`,
        cost: s3,
      },
      {
        label: "Lambda requests",
        detail: `${millions.toLocaleString()}M × ${usd(LAMBDA_PER_MILLION_REQ)}/M`,
        cost: lambdaReq,
      },
      {
        label: "Lambda compute",
        detail: `${gbSeconds.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })} GB-s @ ${lambdaMem} MB`,
        cost: lambdaCompute,
      },
      {
        label: "Data transfer out",
        detail: `${num(dataGb).toLocaleString()} GB × ${usd(DATA_OUT_PER_GB)}/GB`,
        cost: dataOut,
      },
    ];

    return { lines: rows, total: rows.reduce((sum, r) => sum + r.cost, 0) };
  }, [instance, hours, s3Gb, lambdaM, lambdaMs, lambdaMem, dataGb]);

  return (
    <div className="space-y-6">
      <p className="ring-border/60 bg-muted/30 rounded-md px-4 py-3 font-mono text-xs leading-relaxed ring-1">
        <span style={{ color: accent }}>
          Rough estimate for learning — not a quote.
        </span>{" "}
        <span className="text-muted-foreground">
          Prices approximate, us-east-1, on-demand, and change often. Ignores
          the free tier, reserved/spot discounts, and per-request tiering.
        </span>
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="EC2 instance" htmlFor="aws-ec2">
              <NativeSelect
                id="aws-ec2"
                value={instance}
                onChange={(e) => setInstance(e.target.value)}
              >
                {Object.entries(EC2_RATES).map(([type, r]) => (
                  <option key={type} value={type}>
                    {type} ({usd(r)}/hr)
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field
              label="Hours / month"
              htmlFor="aws-hours"
              hint="730 = always on"
            >
              <Input
                id="aws-hours"
                type="number"
                min={0}
                inputMode="numeric"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </Field>
          </div>

          <Field label="S3 storage (GB)" htmlFor="aws-s3">
            <Input
              id="aws-s3"
              type="number"
              min={0}
              inputMode="numeric"
              value={s3Gb}
              onChange={(e) => setS3Gb(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Lambda calls (M)"
              htmlFor="aws-lm"
              hint="Millions / month"
            >
              <Input
                id="aws-lm"
                type="number"
                min={0}
                inputMode="decimal"
                value={lambdaM}
                onChange={(e) => setLambdaM(e.target.value)}
              />
            </Field>
            <Field label="Avg duration (ms)" htmlFor="aws-ms">
              <Input
                id="aws-ms"
                type="number"
                min={0}
                inputMode="numeric"
                value={lambdaMs}
                onChange={(e) => setLambdaMs(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Lambda memory" htmlFor="aws-mem">
              <NativeSelect
                id="aws-mem"
                value={String(lambdaMem)}
                onChange={(e) => setLambdaMem(Number(e.target.value))}
              >
                {LAMBDA_MEMORY.map((m) => (
                  <option key={m} value={m}>
                    {m} MB
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Data out (GB)" htmlFor="aws-data">
              <Input
                id="aws-data"
                type="number"
                min={0}
                inputMode="numeric"
                value={dataGb}
                onChange={(e) => setDataGb(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="ring-border/60 flex flex-col rounded-md ring-1">
          <p className="border-border/60 text-muted-foreground border-b px-5 py-3 font-mono text-xs tracking-[0.14em] uppercase">
            Monthly breakdown
          </p>
          <ul className="divide-border/50 flex-1 divide-y">
            {lines.map((line) => (
              <li
                key={line.label}
                className="flex items-baseline justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="text-foreground text-sm">{line.label}</p>
                  <p className="text-muted-foreground truncate font-mono text-xs">
                    {line.detail}
                  </p>
                </div>
                <p className="text-foreground shrink-0 font-mono text-sm tabular-nums">
                  {usd(line.cost)}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-border/60 flex items-baseline justify-between border-t px-5 py-4">
            <p className="font-display text-sm font-semibold tracking-[0.06em] uppercase">
              Est. total / month
            </p>
            <p
              className="font-display text-2xl font-bold tabular-nums"
              style={{ color: accent }}
            >
              {usd(total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
