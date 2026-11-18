import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/* Temporary review board for the button + arrow tweaks. Delete before launch. */
export const metadata: Metadata = { title: "Design tweaks", robots: { index: false } };

const freeze = `
.demo-mid::before { transform: translateY(42%) !important; animation: wave-swell 1.6s linear infinite; }
.demo-mid::after { transform: translateY(24%) !important; animation: wave-swell 2.2s linear infinite reverse; }
.demo-full::before, .demo-full::after { transform: translateY(-12px) !important; animation: wave-swell 1.6s linear infinite; }
`;

const states = [
  { label: "Rest", className: "" },
  { label: "Wave rising", className: "demo-mid" },
  { label: "Hover", className: "demo-full" },
];

function Arrow({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span
      className={`wave grid size-13 place-items-center rounded-md border ${
        dark ? "border-white/40 text-white [--wave:#fff]" : "border-ink/15 text-ink"
      } ${className ?? ""}`}
    >
      <Icon name="chevron-right" className="size-5" />
    </span>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 border-t border-line py-10 lg:grid-cols-[14rem_1fr] lg:items-center">
      <p className="text-body-sm font-semibold tracking-label text-slate uppercase">{title}</p>
      <div className="grid grid-cols-3 items-center gap-6">{children}</div>
    </div>
  );
}

export default function DesignTweaksPage() {
  return (
    <main className="bg-white pt-40 pb-24">
      <style>{freeze}</style>
      <Container>
        <h1 className="text-heading-3">Buttons &amp; arrows</h1>
        <p className="mt-3 max-w-2xl text-body-md text-slate">
          One 4px corner for every CTA and every arrow. On hover a swell rises through the button
          and drains on leave. Hover the live buttons at the bottom.
        </p>

        <div className="mt-12 grid grid-cols-[14rem_1fr] gap-6 max-lg:hidden">
          <span />
          <div className="grid grid-cols-3 gap-6 text-body-sm text-slate">
            {states.map((state) => (
              <span key={state.label}>{state.label}</span>
            ))}
          </div>
        </div>

        <Row title="Before (old radius)">
          <span className="inline-flex min-h-[2.625rem] w-fit items-center gap-2.5 rounded-md border border-deep bg-deep px-8 text-cta-md font-medium text-white uppercase">
            Explore <Icon name="arrow-up-right" className="size-4" />
          </span>
          <span className="inline-flex min-h-[2.625rem] w-fit items-center gap-2.5 rounded-md border border-navy px-8 text-cta-md font-medium text-ink uppercase">
            Explore <Icon name="arrow-up-right" className="size-4" />
          </span>
          <span className="grid size-13 place-items-center rounded-full border border-ink/15">
            <Icon name="chevron-right" className="size-5" />
          </span>
        </Row>

        <Row title="Primary">
          {states.map((state) => (
            <div key={state.label}>
              <Button variant="primary" icon="arrow-up-right" className={state.className}>
                Explore our story
              </Button>
            </div>
          ))}
        </Row>
        <Row title="Outline">
          {states.map((state) => (
            <div key={state.label}>
              <Button
                variant="outline"
                icon="arrow-up-right"
                className={`${state.className} ${state.className === "demo-full" ? "border-deep! text-white!" : ""}`}
              >
                Explore units
              </Button>
            </div>
          ))}
        </Row>
        <Row title="Carousel arrows">
          {states.map((state) => (
            <div key={state.label}>
              <Arrow
                className={`${state.className} ${state.className === "demo-full" ? "border-deep text-white" : ""}`}
              />
            </div>
          ))}
        </Row>
      </Container>

      <section className="mt-16 bg-abyss py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:items-center">
            <p className="text-body-sm font-semibold tracking-label text-white/60 uppercase">
              On photos / dark
            </p>
            <div className="grid grid-cols-3 items-center gap-6">
              {states.map((state) => (
                <div key={state.label} className="flex items-center gap-4">
                  <Button
                    variant="outline-light"
                    className={`${state.className} ${state.className === "demo-full" ? "text-ink!" : ""}`}
                  >
                    View
                  </Button>
                  <Arrow
                    dark
                    className={`${state.className} ${state.className === "demo-full" ? "text-ink!" : ""}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="mt-16">
        <p className="text-body-sm font-semibold tracking-label text-slate uppercase">
          Live — hover these
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button variant="primary" icon="arrow-up-right">
            Explore our story
          </Button>
          <Button variant="outline" icon="arrow-up-right">
            Explore units
          </Button>
          <Button variant="dark">Book now</Button>
          <button
            type="button"
            className="grid size-13 place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-500 hover:border-aqua hover:bg-aqua hover:text-white"
          >
            <Icon name="chevron-left" className="size-5" />
          </button>
          <button
            type="button"
            className="grid size-13 place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-500 hover:border-aqua hover:bg-aqua hover:text-white"
          >
            <Icon name="chevron-right" className="size-5" />
          </button>
        </div>
      </Container>
    </main>
  );
}
