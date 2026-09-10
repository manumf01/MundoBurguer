import { Seo } from '@/lib/seo';
import { LegalPageLayout, LegalSection } from '@/components/common';
import { Button } from '@/components/ui';
import { useCookieConsent } from '@/lib/cookieConsentContext';
import { site } from '@/config/site';

interface CookieRow {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
}

const necessaryCookies: CookieRow[] = [
  {
    name: 'mb-cookie-consent',
    provider: site.name + ' (propia, almacenamiento local)',
    purpose: 'Recuerda tu elección sobre el uso de cookies.',
    duration: 'Hasta que la borres o cambies tu elección',
  },
];

const analyticsCookies: CookieRow[] = [
  {
    name: '_ga',
    provider: 'Google Ireland Ltd. (Google Analytics)',
    purpose: 'Distingue usuarios únicos para las estadísticas de visitas.',
    duration: '2 años',
  },
  {
    name: '_ga_<container-id>',
    provider: 'Google Ireland Ltd. (Google Analytics)',
    purpose: 'Mantiene el estado de la sesión de análisis (GA4).',
    duration: '2 años',
  },
];

const mapCookies: CookieRow[] = [
  {
    name: 'NID, 1P_JAR y otras',
    provider: 'Google Ireland Ltd. (Google Maps)',
    purpose:
      'Preferencias del mapa embebido y medición propia de Google al mostrar el mapa.',
    duration: 'Variable (hasta 6 meses según la cookie)',
  },
];

function CookieTable({ rows }: { rows: CookieRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-hair">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-hair text-cream">
            <th className="px-4 py-3 font-semibold">Cookie</th>
            <th className="px-4 py-3 font-semibold">Proveedor</th>
            <th className="px-4 py-3 font-semibold">Finalidad</th>
            <th className="px-4 py-3 font-semibold">Duración</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-hair last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-cream-dim">
                {row.name}
              </td>
              <td className="px-4 py-3 text-cream-dim">{row.provider}</td>
              <td className="px-4 py-3 text-cream-dim">{row.purpose}</td>
              <td className="px-4 py-3 text-cream-dim">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CookiePolicyPage() {
  const { openPanel } = useCookieConsent();

  return (
    <>
      <Seo
        title="Política de cookies"
        description="Qué cookies usa Mundo Burguer, para qué sirven y cómo puedes aceptarlas, rechazarlas o configurarlas."
        path="/politica-cookies"
      />

      <LegalPageLayout
        eyebrow="Cookies"
        title="Política de cookies"
        updated="5 de septiembre de 2026"
      >
        <LegalSection title="1. ¿Qué son las cookies?">
          <p>
            Las cookies son pequeños archivos de texto (o tecnologías
            equivalentes, como el almacenamiento local del navegador) que un
            sitio web guarda en tu dispositivo cuando lo visitas. Sirven, por
            ejemplo, para recordar tus preferencias o para elaborar estadísticas
            de uso.
          </p>
        </LegalSection>

        <LegalSection title="2. ¿Quién utiliza estas cookies?">
          <p>
            Esta Política de cookies es aplicable al sitio web {site.url},
            titularidad de {site.legal.companyName}. Algunas de las cookies
            descritas las instalan proveedores externos (Google) cuando activas
            voluntariamente las categorías correspondientes.
          </p>
        </LegalSection>

        <LegalSection title="3. Gestiona tus preferencias">
          <p>
            Puedes cambiar tu decisión sobre cookies en cualquier momento, de
            forma tan sencilla como la primera vez:
          </p>
          <Button type="button" variant="outline" size="sm" onClick={openPanel}>
            Abrir preferencias de cookies
          </Button>
          <p className="text-xs text-cream-mute">
            Este mismo acceso está disponible en todo momento en el enlace
            "Preferencias de cookies" del pie de página.
          </p>
        </LegalSection>

        <LegalSection title="4. Cookies necesarias (siempre activas)">
          <p>
            No requieren tu consentimiento porque son imprescindibles para el
            funcionamiento básico del Sitio: sin ellas no podríamos recordar tu
            elección sobre cookies.
          </p>
          <CookieTable rows={necessaryCookies} />
        </LegalSection>

        <LegalSection title="5. Cookies de análisis (requieren tu consentimiento)">
          <p>
            Usamos Google Analytics 4 para conocer, de forma agregada, cuántas
            personas visitan la web y qué páginas les interesan más. Estas
            cookies solo se instalan si activas la categoría "Análisis" en el
            banner o panel de cookies; hasta entonces, el script de Google
            Analytics ni siquiera se carga en tu navegador.
          </p>
          <CookieTable rows={analyticsCookies} />
        </LegalSection>

        <LegalSection title="6. Cookies del mapa (requieren tu consentimiento)">
          <p>
            En la página de Contacto mostramos un mapa interactivo de Google
            Maps con nuestra ubicación. Si no activas la categoría "Mapa", en su
            lugar verás un aviso con un enlace directo para abrir nuestra
            ubicación en Google Maps sin que se instale ninguna cookie de
            terceros.
          </p>
          <CookieTable rows={mapCookies} />
        </LegalSection>

        <LegalSection title="7. Base legal">
          <p>
            El uso de cookies de análisis y de mapa se basa en tu consentimiento
            expreso (art. 22.2 LSSI-CE y art. 6.1.a RGPD), que solicitamos
            mediante un banner en el que aceptar y rechazar tienen la misma
            visibilidad, sin casillas premarcadas, y que puedes retirar en
            cualquier momento con el mismo nivel de facilidad con el que lo
            diste.
          </p>
        </LegalSection>

        <LegalSection title="8. Cómo bloquear o eliminar cookies desde tu navegador">
          <p>
            Además de nuestro panel de preferencias, puedes eliminar o bloquear
            las cookies ya instaladas desde la configuración de privacidad o de
            cookies de tu propio navegador (Chrome, Firefox, Safari, Edge u
            otro). Ten en cuenta que bloquear todas las cookies puede afectar al
            funcionamiento de otras páginas web que visites, aunque no impide el
            uso básico de este Sitio.
          </p>
        </LegalSection>

        <LegalSection title="9. Más información">
          <p>
            Para conocer cómo tratamos tus datos personales en general, consulta
            nuestra <a href="/politica-privacidad">Política de privacidad</a>.
            Para los datos identificativos del titular de este Sitio, consulta
            el <a href="/aviso-legal">Aviso legal</a>.
          </p>
        </LegalSection>
      </LegalPageLayout>
    </>
  );
}
