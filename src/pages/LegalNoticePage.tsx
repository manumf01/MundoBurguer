import { Seo } from '@/lib/seo';
import { LegalPageLayout, LegalSection } from '@/components/common';
import { site } from '@/config/site';
import { telHref } from '@/lib/format';

export function LegalNoticePage() {
  return (
    <>
      <Seo
        title="Aviso legal"
        description="Aviso legal y condiciones de uso del sitio web de Mundo Burguer, conforme a la LSSI-CE."
        path="/aviso-legal"
      />

      <LegalPageLayout
        eyebrow="Información legal"
        title="Aviso legal y condiciones de uso"
        updated="5 de septiembre de 2026"
      >
        <p className="text-sm text-cream-dim">
          En cumplimiento del deber de información recogido en el artículo 10 de
          la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
          Información y de Comercio Electrónico (LSSI-CE), se exponen a
          continuación los datos identificativos del titular de este sitio web y
          las condiciones que rigen su uso.
        </p>

        <LegalSection title="1. Datos identificativos del titular">
          <ul className="flex flex-col gap-1">
            <li>
              <strong className="text-cream">Nombre comercial:</strong>{' '}
              {site.name}
            </li>
            <li>
              <strong className="text-cream">Denominación social:</strong>{' '}
              {site.legal.companyName}
            </li>
            <li>
              <strong className="text-cream">Forma jurídica:</strong>{' '}
              {site.legal.legalForm}
            </li>
            <li>
              <strong className="text-cream">NIF/CIF:</strong>{' '}
              {site.legal.taxId}
            </li>
            {site.legal.commercialRegistry ? (
              <li>
                <strong className="text-cream">Datos registrales:</strong>{' '}
                {site.legal.commercialRegistry}
              </li>
            ) : null}
            <li>
              <strong className="text-cream">Domicilio:</strong>{' '}
              {site.address.full}
            </li>
            <li>
              <strong className="text-cream">Actividad:</strong> Restauración y
              hostelería
            </li>
            <li>
              <strong className="text-cream">Teléfono:</strong>{' '}
              <a href={telHref(site.phone.e164)}>{site.phone.display}</a>
            </li>
            <li>
              <strong className="text-cream">Correo electrónico:</strong>{' '}
              <a href={`mailto:${site.legal.privacyEmail}`}>
                {site.legal.privacyEmail}
              </a>
            </li>
            <li>
              <strong className="text-cream">Sitio web:</strong> {site.url}
            </li>
          </ul>
          <p className="text-xs text-cream-mute">
            Nota interna: la denominación social y el NIF/CIF indicados están
            pendientes de confirmación por el titular del negocio y deben
            sustituirse por los datos reales antes de la publicación definitiva
            del sitio (ver{' '}
            <code className="rounded bg-white/5 px-1 py-0.5">
              src/config/site.ts
            </code>
            ).
          </p>
        </LegalSection>

        <LegalSection title="2. Objeto y aceptación">
          <p>
            El presente Aviso Legal regula el acceso y uso del sitio web{' '}
            {site.url} (en adelante, "el Sitio"), de naturaleza informativa,
            cuyo objeto es dar a conocer la carta, la ubicación, los horarios y
            los canales de contacto de {site.name}. El acceso al Sitio y su uso
            atribuyen la condición de usuario e implican la aceptación plena de
            las condiciones aquí recogidas. Si no está de acuerdo con ellas,
            debe abstenerse de utilizar el Sitio.
          </p>
          <p>
            Actualmente el Sitio no permite realizar pedidos, reservas ni
            compras online: toda la contratación de productos se realiza por
            teléfono, WhatsApp o presencialmente en el establecimiento. Si en el
            futuro se habilita el pedido o la reserva online, este Aviso Legal
            se completará con las correspondientes Condiciones Generales de
            Contratación, que deberán aceptarse expresamente antes de finalizar
            cualquier compra.
          </p>
        </LegalSection>

        <LegalSection title="3. Condiciones de acceso y uso">
          <p>
            El usuario se compromete a hacer un uso adecuado y lícito del Sitio,
            de acuerdo con la legislación aplicable, la buena fe, el orden
            público y las presentes condiciones. Queda prohibido, entre otros:
            (a) utilizar el Sitio con fines fraudulentos o lesivos para
            terceros; (b) introducir o difundir virus informáticos o cualquier
            otro sistema que pueda dañar el Sitio; (c) intentar acceder a áreas
            restringidas de los sistemas informáticos del titular o de terceros;
            (d) realizar acciones que supongan una carga desproporcionada sobre
            la infraestructura del Sitio (scraping masivo, ataques de denegación
            de servicio, etc.).
          </p>
        </LegalSection>

        <LegalSection title="4. Propiedad intelectual e industrial">
          <p>
            El diseño del Sitio, su código fuente, logotipos, marca, fotografías
            de los productos, textos, iconos y demás contenidos son propiedad de{' '}
            {site.legal.companyName} o de terceros que han autorizado su uso, y
            están protegidos por la normativa española y de la Unión Europea en
            materia de propiedad intelectual e industrial. Queda prohibida su
            reproducción, distribución, comunicación pública o transformación
            total o parcial sin la autorización expresa del titular, salvo en
            los supuestos permitidos por la ley (por ejemplo, uso privado o cita
            con fines informativos, siempre citando la fuente).
          </p>
        </LegalSection>

        <LegalSection title="5. Enlaces externos y redes sociales">
          <p>
            El Sitio incluye enlaces a servicios y perfiles gestionados por
            terceros ajenos al titular: WhatsApp e Instagram/Facebook (Meta
            Platforms Ireland Limited) para contacto y redes sociales, y Google
            Maps (Google Ireland Limited) para mostrar la ubicación del
            restaurante. El acceso a estos servicios a través de los enlaces del
            Sitio se realiza bajo la exclusiva responsabilidad del usuario, y su
            uso queda sometido a los términos, condiciones y políticas de
            privacidad de cada proveedor, que son ajenos e independientes de{' '}
            {site.name}. Puede consultar cómo tratamos las cookies asociadas a
            estos servicios en nuestra{' '}
            <a href="/politica-cookies">Política de cookies</a>.
          </p>
        </LegalSection>

        <LegalSection title="6. Exclusión de responsabilidad">
          <p>
            El titular no garantiza la disponibilidad, continuidad ni
            infalibilidad del funcionamiento del Sitio, y no se hace responsable
            de los daños o perjuicios que pudieran derivarse de interrupciones,
            virus informáticos, averías, desconexiones o, en general, de fallos
            técnicos ajenos a su control razonable. El titular se reserva el
            derecho a suspender temporalmente el acceso al Sitio para labores de
            mantenimiento, sin necesidad de previo aviso, siempre que las
            circunstancias lo permitan.
          </p>
          <p>
            La información sobre alérgenos publicada en la carta tiene carácter
            orientativo y se actualiza periódicamente; ante cualquier alergia o
            intolerancia alimentaria, se recomienda consultar directamente en el
            establecimiento antes de realizar el pedido.
          </p>
        </LegalSection>

        <LegalSection title="7. Protección de datos personales">
          <p>
            El tratamiento de los datos personales de las personas usuarias del
            Sitio se rige por nuestra{' '}
            <a href="/politica-privacidad">Política de privacidad</a>, y el uso
            de cookies y tecnologías similares por nuestra{' '}
            <a href="/politica-cookies">Política de cookies</a>.
          </p>
        </LegalSection>

        <LegalSection title="8. Modificaciones">
          <p>
            El titular podrá modificar en cualquier momento, sin previo aviso,
            la presentación, configuración y contenido del Sitio, así como las
            condiciones recogidas en este Aviso Legal. Se recomienda revisar
            este documento periódicamente.
          </p>
        </LegalSection>

        <LegalSection title="9. Legislación aplicable y jurisdicción">
          <p>
            Las presentes condiciones se rigen por la legislación española. Para
            la resolución de cualquier controversia que pudiera surgir en
            relación con el Sitio, y sin perjuicio de los derechos que, como
            persona consumidora, le correspondan y sean irrenunciables conforme
            a la normativa de protección de personas consumidoras y usuarias
            (que le permitirán, en su caso, acudir a los tribunales de su propio
            domicilio), las partes se someten a los Juzgados y Tribunales de
            Córdoba, salvo que la ley aplicable disponga otra cosa.
          </p>
        </LegalSection>

        <LegalSection title="10. Contacto">
          <p>
            Para cualquier consulta sobre este Aviso Legal puede escribirnos a{' '}
            <a href={`mailto:${site.legal.privacyEmail}`}>
              {site.legal.privacyEmail}
            </a>{' '}
            o llamarnos al{' '}
            <a href={telHref(site.phone.e164)}>{site.phone.display}</a>.
          </p>
        </LegalSection>
      </LegalPageLayout>
    </>
  );
}
