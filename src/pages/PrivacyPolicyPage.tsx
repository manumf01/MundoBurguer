import { Seo } from '@/lib/seo';
import { LegalPageLayout, LegalSection } from '@/components/common';
import { site } from '@/config/site';

export function PrivacyPolicyPage() {
  return (
    <>
      <Seo
        title="Política de privacidad"
        description="Cómo tratamos tus datos personales en Mundo Burguer: responsable, finalidades, derechos RGPD y contacto."
        path="/politica-privacidad"
      />

      <LegalPageLayout
        eyebrow="Tus datos"
        title="Política de privacidad"
        updated="5 de septiembre de 2026"
      >
        <p className="text-sm text-cream-dim">
          Esta política explica qué datos personales tratamos a través de{' '}
          {site.url}, con qué finalidad, durante cuánto tiempo y qué derechos
          puedes ejercer, de acuerdo con el Reglamento (UE) 2016/679 (RGPD) y la
          Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de
          los derechos digitales (LOPDGDD).
        </p>

        <LegalSection title="1. Responsable del tratamiento">
          <ul className="flex flex-col gap-1">
            <li>
              <strong className="text-cream">Responsable:</strong>{' '}
              {site.legal.companyName} (NIF/CIF: {site.legal.taxId})
            </li>
            <li>
              <strong className="text-cream">Domicilio:</strong>{' '}
              {site.address.full}
            </li>
            <li>
              <strong className="text-cream">
                Contacto para protección de datos:
              </strong>{' '}
              <a href={`mailto:${site.legal.privacyEmail}`}>
                {site.legal.privacyEmail}
              </a>
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="2. ¿Qué datos tratamos y con qué finalidad?">
          <p>
            El Sitio es informativo: no dispone de formularios de contacto,
            registro de usuarios ni proceso de compra online, por lo que no
            recopilamos activamente datos que introduzcas en la web. No
            obstante, tratamos datos personales en los siguientes casos:
          </p>
          <ul className="flex flex-col gap-2">
            <li>
              <strong className="text-cream">
                Navegación y cookies técnicas:
              </strong>{' '}
              guardamos en tu navegador (almacenamiento local) la elección que
              hagas sobre cookies, para no volver a preguntarte en cada visita.
              Base legal: interés legítimo en el correcto funcionamiento del
              Sitio (art. 6.1.f RGPD); no requiere tu consentimiento.
            </li>
            <li>
              <strong className="text-cream">
                Cookies de análisis (Google Analytics):
              </strong>{' '}
              si aceptas esta categoría en el banner de cookies, tratamos datos
              de uso del Sitio (páginas visitadas, dispositivo, navegador,
              ubicación aproximada, dirección IP truncada) para elaborar
              estadísticas de visitas agregadas. Base legal: tu consentimiento
              (art. 6.1.a RGPD), que puedes retirar en cualquier momento. Más
              detalle en la <a href="/politica-cookies">Política de cookies</a>.
            </li>
            <li>
              <strong className="text-cream">
                Contacto directo (teléfono, WhatsApp, redes sociales):
              </strong>{' '}
              si nos llamas, nos escribes por WhatsApp o nos contactas por
              Instagram/Facebook, tratamos los datos que nos facilites (por
              ejemplo, tu número de teléfono o nombre de perfil) únicamente para
              responder a tu consulta o gestionar tu pedido. Base legal:
              ejecución de una relación precontractual o contractual (art. 6.1.b
              RGPD) y, en su caso, tu consentimiento al iniciar la conversación.
              Estas comunicaciones se producen sobre infraestructura de terceros
              (WhatsApp/Meta), que actúan como responsables independientes de
              sus propias plataformas.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. ¿Con quién compartimos tus datos?">
          <p>
            No vendemos ni cedemos tus datos a terceros con fines comerciales
            propios. Recurrimos a los siguientes encargados o terceros
            proveedores, estrictamente para prestar el servicio indicado:
          </p>
          <ul className="flex flex-col gap-2">
            <li>
              <strong className="text-cream">Google Ireland Limited</strong>{' '}
              (Google Analytics y Google Maps), como encargado del tratamiento
              para la analítica web y como responsable independiente del
              servicio de mapas embebido.
            </li>
            <li>
              <strong className="text-cream">
                Meta Platforms Ireland Limited
              </strong>{' '}
              (WhatsApp, Instagram, Facebook), como responsable independiente
              cuando nos contactas a través de sus plataformas.
            </li>
            <li>
              Nuestro proveedor de alojamiento (hosting), como encargado del
              tratamiento estrictamente para mantener el Sitio operativo y
              accesible.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Transferencias internacionales">
          <p>
            Google y Meta pueden procesar datos en servidores ubicados fuera del
            Espacio Económico Europeo, incluido Estados Unidos. Ambas compañías
            están adheridas al <em>EU-U.S. Data Privacy Framework</em>, el marco
            de adecuación reconocido por la Comisión Europea que garantiza un
            nivel de protección equivalente al del RGPD para este tipo de
            transferencias. Puedes consultar las políticas de privacidad de
            Google y Meta para más información sobre estas transferencias.
          </p>
        </LegalSection>

        <LegalSection title="5. Plazo de conservación">
          <p>
            Los datos de analítica se conservan durante el plazo configurado en
            Google Analytics (por defecto, 14 meses desde tu última visita),
            transcurrido el cual se eliminan o anonimizan automáticamente. Los
            datos derivados de una conversación por teléfono, WhatsApp o redes
            sociales se conservan mientras sea necesario para atender tu
            consulta o pedido, y posteriormente durante los plazos de
            prescripción legal que resulten aplicables.
          </p>
        </LegalSection>

        <LegalSection title="6. Tus derechos">
          <p>
            Puedes ejercer en cualquier momento, y de forma gratuita, tus
            derechos de acceso, rectificación, supresión, oposición, limitación
            del tratamiento y portabilidad de tus datos, así como a retirar el
            consentimiento prestado. Para ello, escríbenos a{' '}
            <a href={`mailto:${site.legal.privacyEmail}`}>
              {site.legal.privacyEmail}
            </a>{' '}
            indicando el derecho que deseas ejercer, adjuntando copia de un
            documento que acredite tu identidad.
          </p>
          <p>
            Si consideras que el tratamiento de tus datos no se ajusta a la
            normativa vigente, tienes derecho a presentar una reclamación ante
            la Agencia Española de Protección de Datos (AEPD), autoridad de
            control en materia de protección de datos en España.
          </p>
        </LegalSection>

        <LegalSection title="7. Menores de edad">
          <p>
            El Sitio no está dirigido a menores de 14 años ni recaba
            deliberadamente datos de menores de dicha edad. Si detectamos que se
            han recabado datos de un menor sin el consentimiento de sus padres,
            madres o tutores legales, procederemos a eliminarlos.
          </p>
        </LegalSection>

        <LegalSection title="8. Medidas de seguridad">
          <p>
            Adoptamos las medidas técnicas y organizativas razonables para
            proteger los datos personales frente a accesos no autorizados,
            pérdida o alteración, adecuadas al riesgo del tratamiento realizado
            (art. 32 RGPD).
          </p>
        </LegalSection>

        <LegalSection title="9. Cambios en esta política">
          <p>
            Podemos actualizar esta política para adaptarla a novedades
            legislativas o cambios en el Sitio. La fecha de "última
            actualización" indicada al inicio refleja la versión vigente.
          </p>
        </LegalSection>
      </LegalPageLayout>
    </>
  );
}
