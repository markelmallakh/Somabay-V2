import { cacheLife } from "next/cache";
import Image from "next/image";
import { footerColumns, legalLinks, supportLinks } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { getWeatherForecast } from "@/lib/weather";
import { FooterWeather } from "@/components/navigation/FooterWeather";
import { LanguageMenu } from "@/components/navigation/LanguageMenu";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SomaIcon } from "@/components/ui/SomaIcon";
import { SmartLink } from "@/components/ui/SmartLink";
import { Container } from "./Container";
import { AppDownloadButton } from "./AppDownloadButton";
import { NewsletterForm } from "./NewsletterForm";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const columnTitle =
  "font-eyebrow text-body-2xs font-semibold tracking-[0.16em] text-ink/55 uppercase";
// Links glide right and turn turquoise on hover.
const linkClass =
  "inline-block w-fit text-body-md text-ink/80 transition-[color,translate] duration-500 ease-out-expo hover:translate-x-1 hover:text-turquoise";

/* Somabay folds Real Estate into its column (Careers stays last); Book Stay reads Stay. */
const [somabay, experience, hotels, realEstate, whatsUp] = footerColumns;
const isCareers = (link: { label: string }) => link.label === "Careers";
const columns = [
  {
    ...somabay,
    links: [
      ...somabay.links.filter((link) => !isCareers(link)),
      ...realEstate.links,
      ...somabay.links.filter(isCareers),
    ],
  },
  experience,
  { ...hotels, title: "Stay" },
  { ...whatsUp, links: [...whatsUp.links, ...supportLinks] },
];

/**
 * Store badge. On desktop it is a plain label beside the QR code (scan to install); on smaller
 * screens, where the QR code can't be scanned from the same device, it links to the store.
 */
function StoreBadge({
  href,
  icon,
  overline,
  label,
}: {
  href: string;
  icon: IconName;
  overline: string;
  label: string;
}) {
  // Compact, no background: the store's icon beside its name.
  const base = "items-center gap-2 whitespace-nowrap text-ink";
  const content = (
    <>
      <Icon name={icon} className="size-5" />
      <span className="leading-none">
        <span className="block text-[0.4375rem] tracking-[0.04em] uppercase opacity-70">
          {overline}
        </span>
        <span className="block text-body-xs font-semibold">{label}</span>
      </span>
    </>
  );
  return (
    <>
      <span className={`hidden lg:flex ${base}`}>{content}</span>
      <SmartLink
        href={href}
        className={`flex lg:hidden ${base} transition-colors duration-500 hover:text-turquoise`}
      >
        {content}
      </SmartLink>
    </>
  );
}

/**
 * Site footer, dark turquoise under a turquoise gradient mesh. The headline with the hotline and
 * email sits on it beside the newsletter on glass; below, one large white card with generous
 * padding holds the quick links: the link columns beside a contact card with the socials and the
 * app, then the turquoise Somabay icon and a quiet bottom bar carrying the live weather and
 * language (the header, which normally shows them, slides away while the footer is on screen).
 */
export async function SiteFooter() {
  const forecast = await getWeatherForecast();

  return (
    <footer
      data-site-footer
      // Above any sticky hero, and tucked a pixel up so no sliver of it shows at the seam.
      className="relative isolate z-10 -mt-px overflow-hidden bg-deep text-white"
      data-theme-surface="dark"
    >
      {/* The turquoise gradient mesh: a lighter turquoise glow across the top right, deeper water
          in the bottom-right corner. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_55%_at_85%_10%,rgb(47_122_126/0.85),transparent_75%),radial-gradient(45%_50%_at_10%_15%,rgb(0_178_186/0.18),transparent_72%),radial-gradient(50%_60%_at_95%_100%,rgb(8_24_26/0.75),transparent_70%),radial-gradient(40%_45%_at_40%_40%,rgb(26_139_142/0.22),transparent_70%),linear-gradient(115deg,#1d4c4f_0%,#082e30_60%,#0a2224_100%)]"
      />
      <Container className="flex flex-col gap-12 pt-14 pb-6 sm:gap-16 sm:pt-20 sm:pb-8">
        {/* The headline and how to reach us, beside the newsletter, straight on the mesh. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end lg:gap-16">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <p className="max-w-[14ch] font-serif text-heading-1 leading-[0.92]">
              Life at the edge of the Red Sea
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-start">
              <a
                href={siteConfig.contact.hotlineHref}
                className="inline-flex items-center gap-2 font-serif text-heading-4 transition-colors duration-500 hover:text-aqua"
              >
                <Icon name="phone-solid" className="size-5 text-aqua" />
                {siteConfig.contact.hotline}
              </a>
              {/* The email matches the hotline: the same large bold face, with its own icon. */}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex items-center gap-2 font-serif text-heading-4 transition-colors duration-500 hover:text-aqua"
              >
                <Icon name="mail-solid" className="size-5 text-aqua" />
                {siteConfig.contact.email}
              </a>
            </div>
          </div>
          <div className="rounded-card border border-white/15 bg-white/10 p-5 text-center backdrop-blur-xl backdrop-saturate-150 sm:p-6 lg:text-left">
            <h2 className="font-serif text-heading-5">Join our newsletter</h2>
            <p className="mt-1 text-body-sm text-white/75">
              Offers, news and events from the bay, straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* The quick links on one large white card, with generous padding. */}
        <div
          data-theme-surface="light"
          className="flex flex-col gap-12 rounded-media bg-white p-6 text-ink sm:p-10 lg:gap-14 lg:p-16"
        >
          {/* Links (the same columns as before), and the contact card. */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
            {/* Phones: each column folds into a row that opens in place, so the footer stays short. */}
            <nav aria-label="Footer" className="border-t border-ink/12 md:hidden">
              {columns.map((column) => (
                <details key={column.title} className="group/fold border-b border-ink/12">
                  <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                    <span className={columnTitle}>{column.title}</span>
                    <span
                      aria-hidden
                      className="relative grid size-6 place-items-center text-turquoise"
                    >
                      <span className="absolute h-px w-3 bg-current" />
                      <span className="absolute h-3 w-px bg-current transition-transform duration-500 ease-out-expo group-open/fold:rotate-90" />
                    </span>
                  </summary>
                  <ul className="flex flex-col gap-1 pb-4">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <SmartLink
                          href={link.href}
                          external={link.external}
                          className="flex min-h-10 items-center text-body-md text-ink/80 transition-colors active:text-turquoise"
                        >
                          {link.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </nav>
            <nav aria-label="Footer" className="hidden gap-x-8 gap-y-10 md:grid md:grid-cols-4">
              {columns.map((column) => (
                <div key={column.title} className="flex flex-col gap-5">
                  <h2 className={columnTitle}>{column.title}</h2>
                  <ul className="flex flex-col gap-3">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <SmartLink href={link.href} external={link.external} className={linkClass}>
                          {link.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Contact card: socials and the app. */}
            <div className="flex flex-col items-center gap-6 rounded-card bg-sand-100 p-6 sm:items-start">
              <div className="flex flex-col items-center gap-4 sm:items-start">
                <h2 className={columnTitle}>Follow the bay</h2>
                <ul className="-ml-2.5 flex gap-1" aria-label="Somabay on social media">
                  {siteConfig.social.map((item) => (
                    <li key={item.href}>
                      <SmartLink
                        href={item.href}
                        className="grid size-11 place-items-center text-ink transition-colors duration-500 hover:text-turquoise"
                        aria-label={item.label}
                      >
                        <Icon name={item.icon} className="size-6" />
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phones and tablets: one button that opens the right store for the device. */}
              <AppDownloadButton className="w-fit lg:hidden" />

              {/* Desktop: scan the QR code or use a store badge. */}
              <div className="hidden w-full items-center gap-4 border-t border-ink/10 pt-6 lg:flex">
                {/* The QR code only helps on a computer: phones get the store buttons alone. */}
                <Image
                  src="/images/footer/app-qr.png"
                  alt="QR code to download the Somabay app"
                  width={144}
                  height={145}
                  // Multiply: the white in the image drops out, leaving only the code on the card.
                  className="size-22 shrink-0 mix-blend-multiply"
                />
                <div className="flex flex-1 flex-col gap-2.5">
                  <p className="text-body-xs font-semibold">Get the Somabay app</p>
                  {/* The two stores, one under the other. */}
                  <div className="flex flex-col gap-2.5">
                    <StoreBadge
                      href={siteConfig.apps.ios}
                      icon="apple"
                      overline="Download on the"
                      label="App Store"
                    />
                    <StoreBadge
                      href={siteConfig.apps.android}
                      icon="google-play"
                      overline="Get it on"
                      label="Google Play"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Foot: the turquoise Somabay icon in the bottom-left corner, the bottom bar beside it. */}
          <div className="flex flex-col items-center gap-6 border-t border-ink/12 pt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <SomaIcon className="w-16 text-aqua sm:w-20 lg:w-24" />

            <div className="flex flex-col items-center gap-4 text-center lg:items-end lg:text-right">
              {/* Weather and language as one light grey-blue pill, a grey hairline between them. */}
              <div className="inline-flex items-center rounded-full bg-sand-100 px-2">
                {forecast ? (
                  <>
                    <div className="px-3">
                      <FooterWeather forecast={forecast} bare />
                    </div>
                    <span aria-hidden className="h-5 w-px bg-ink/15" />
                  </>
                ) : null}
                <div className="px-3">
                  <LanguageMenu variant="pill" placement="above" bare />
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-body-xs text-ink/60 md:flex-row md:gap-6">
                <p>
                  © <CurrentYear /> {siteConfig.name}. All rights reserved.
                </p>
                <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                  {legalLinks.map((link) => (
                    <li key={link.href}>
                      <SmartLink
                        href={link.href}
                        className="link-underline transition-colors hover:text-ink"
                      >
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
                <p className="text-body-2xs tracking-wide text-ink/45 uppercase">
                  Web design &amp; development by {siteConfig.credit}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
