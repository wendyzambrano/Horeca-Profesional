<?php
/**
 * Solicitudes de cotización:
 * - Se guardan en WordPress (menú "Solicitudes Horeca").
 * - Se envía un aviso al equipo comercial.
 * - Se envía al cliente el correo de cotización (plantilla editable en WooCommerce → Horeca App).
 */
if (!defined('ABSPATH')) {
    exit;
}

define('HORECA_CPT_SOLICITUD', 'horeca_solicitud');

/* -------------------------------------------------------------------------
 * Ajustes (con valores por defecto)
 * ---------------------------------------------------------------------- */
function horeca_email_settings() {
    $defaults = [
        'admin_recipients' => 'marketing@artiq.com.co',
        'from_name'        => 'Horeca Profesional',
        'customer_subject' => 'Tu cotización Horeca Profesional {referencia}',
        'customer_body'    => horeca_default_customer_template(),
        'shop_url'         => 'https://artiq.com.co/',
        'visit_text'       => 'Te esperamos en nuestro showroom para que conozcas los equipos en funcionamiento.',
        'send_customer'    => 1,
    ];
    $saved = get_option('horeca_email_settings', []);
    return array_merge($defaults, is_array($saved) ? $saved : []);
}

function horeca_default_customer_template() {
    return <<<'HTML'
<div style="background:#f4f4f5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr>
      <td style="background:#111e2f;padding:28px 32px;color:#ffffff">
        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.7">Horeca Profesional</div>
        <div style="font-size:24px;font-weight:bold;margin-top:6px">Tu cotización está lista</div>
        <div style="font-size:13px;opacity:.7;margin-top:6px">Referencia {referencia} · {fecha}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px">
        <p style="font-size:16px;margin:0 0 12px">Hola {nombre},</p>
        <p style="font-size:14px;line-height:1.6;margin:0 0 20px">Gracias por cotizar con nosotros. Estos son los equipos que seleccionaste:</p>
        {productos}
        <p style="font-size:14px;line-height:1.6;margin:20px 0 0">Un asesor te escribirá al WhatsApp <strong>{whatsapp}</strong> para resolver tus dudas y acompañarte en la compra.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 28px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#f4f1e4;border-radius:12px;padding:18px 20px">
              <div style="font-size:15px;font-weight:bold;margin-bottom:6px">Visítanos</div>
              <div style="font-size:13px;line-height:1.6">{visita}</div>
            </td>
          </tr>
        </table>
        <div style="text-align:center;margin-top:24px">
          <a href="{tienda}" style="display:inline-block;background:#0da6d8;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:14px 28px;border-radius:10px">Comprar en la tienda en línea</a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background:#f9fafb;padding:16px 32px;font-size:11px;color:#6b7280;text-align:center;line-height:1.5">
        Precios en pesos colombianos (COP), sujetos a disponibilidad. Esta cotización es informativa.
      </td>
    </tr>
  </table>
</div>
HTML;
}

/* -------------------------------------------------------------------------
 * Tipo de contenido "Solicitudes Horeca"
 * ---------------------------------------------------------------------- */
add_action('init', function () {
    register_post_type(HORECA_CPT_SOLICITUD, [
        'labels' => [
            'name'          => 'Solicitudes Horeca',
            'singular_name' => 'Solicitud',
            'menu_name'     => 'Solicitudes Horeca',
            'all_items'     => 'Todas las solicitudes',
            'edit_item'     => 'Ver solicitud',
            'search_items'  => 'Buscar solicitudes',
            'not_found'     => 'Todavía no hay solicitudes',
        ],
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'menu_position'      => 56,
        'menu_icon'          => 'dashicons-email-alt',
        'supports'           => ['title'],
        'capability_type'    => 'post',
        'capabilities'       => ['create_posts' => 'do_not_allow'],
        'map_meta_cap'       => true,
        'show_in_rest'       => false,
    ]);
});

/* Columnas en la lista */
add_filter('manage_' . HORECA_CPT_SOLICITUD . '_posts_columns', function () {
    return [
        'cb'        => '<input type="checkbox" />',
        'title'     => 'Referencia',
        'h_nombre'  => 'Nombre',
        'h_whats'   => 'WhatsApp',
        'h_correo'  => 'Correo',
        'h_total'   => 'Total',
        'h_correos' => 'Correo al cliente',
        'date'      => 'Fecha',
    ];
});

add_action('manage_' . HORECA_CPT_SOLICITUD . '_posts_custom_column', function ($col, $post_id) {
    switch ($col) {
        case 'h_nombre':
            echo esc_html(get_post_meta($post_id, '_h_nombre', true));
            break;
        case 'h_whats':
            $w = (string) get_post_meta($post_id, '_h_whatsapp', true);
            $digits = preg_replace('/\D+/', '', $w);
            if (strlen($digits) === 10) {
                $digits = '57' . $digits;
            }
            echo '<a href="' . esc_url('https://wa.me/' . $digits) . '" target="_blank" rel="noopener">' . esc_html($w) . '</a>';
            break;
        case 'h_correo':
            $c = (string) get_post_meta($post_id, '_h_correo', true);
            echo '<a href="mailto:' . esc_attr($c) . '">' . esc_html($c) . '</a>';
            break;
        case 'h_total':
            echo esc_html(horeca_money((float) get_post_meta($post_id, '_h_total', true)));
            break;
        case 'h_correos':
            $ok = get_post_meta($post_id, '_h_mail_customer', true);
            echo $ok === 'sent' ? '✅ Enviado' : ($ok === 'off' ? '— Desactivado' : '⚠️ No se pudo enviar');
            break;
    }
}, 10, 2);

/* Detalle de la solicitud */
add_action('add_meta_boxes_' . HORECA_CPT_SOLICITUD, function () {
    add_meta_box('horeca_solicitud_detalle', 'Detalle de la solicitud', function ($post) {
        $items = (array) get_post_meta($post->ID, '_h_items', true);
        echo '<p><strong>Nombre:</strong> ' . esc_html(get_post_meta($post->ID, '_h_nombre', true)) . '<br>';
        echo '<strong>WhatsApp:</strong> ' . esc_html(get_post_meta($post->ID, '_h_whatsapp', true)) . '<br>';
        echo '<strong>Correo:</strong> ' . esc_html(get_post_meta($post->ID, '_h_correo', true)) . '</p>';
        echo horeca_items_table_html($items, (float) get_post_meta($post->ID, '_h_total', true)); // phpcs:ignore
    }, HORECA_CPT_SOLICITUD, 'normal', 'high');
});

/* -------------------------------------------------------------------------
 * Utilidades
 * ---------------------------------------------------------------------- */
/** Fecha en español sin depender del idioma de WordPress, ej. "22 de octubre de 2026". */
function horeca_fecha_es() {
    $meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return wp_date('j') . ' de ' . $meses[(int) wp_date('n') - 1] . ' de ' . wp_date('Y');
}

function horeca_money($value) {
    return '$' . number_format((float) $value, 0, ',', '.') . ' COP';
}

function horeca_items_table_html($items, $total) {
    $rows = '';
    foreach ($items as $it) {
        $rows .= '<tr>'
            . '<td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:14px">' . esc_html($it['name']) . '</td>'
            . '<td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:center">' . (int) $it['qty'] . '</td>'
            . '<td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:right;white-space:nowrap">' . esc_html(horeca_money($it['subtotal'])) . '</td>'
            . '</tr>';
    }
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">'
        . '<tr>'
        . '<th align="left" style="padding:8px;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb">Equipo</th>'
        . '<th style="padding:8px;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb">Cant.</th>'
        . '<th align="right" style="padding:8px;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb">Subtotal</th>'
        . '</tr>'
        . $rows
        . '<tr><td colspan="2" style="padding:12px 8px;font-size:15px;font-weight:bold">Total</td>'
        . '<td style="padding:12px 8px;font-size:15px;font-weight:bold;text-align:right;white-space:nowrap">' . esc_html(horeca_money($total)) . '</td></tr>'
        . '</table>';
}

function horeca_fill_template($template, $data) {
    $map = [
        '{nombre}'     => esc_html($data['nombre']),
        '{whatsapp}'   => esc_html($data['whatsapp']),
        '{correo}'     => esc_html($data['correo']),
        '{referencia}' => esc_html($data['referencia']),
        '{fecha}'      => esc_html($data['fecha']),
        '{total}'      => esc_html(horeca_money($data['total'])),
        '{productos}'  => horeca_items_table_html($data['items'], $data['total']),
        '{tienda}'     => esc_url($data['tienda']),
        '{visita}'     => wp_kses_post(nl2br($data['visita'])),
    ];
    return strtr($template, $map);
}

function horeca_mail_headers($reply_to = '') {
    $headers = ['Content-Type: text/html; charset=UTF-8'];
    if ($reply_to && is_email($reply_to)) {
        $headers[] = 'Reply-To: ' . $reply_to;
    }
    return $headers;
}

/**
 * Envía un correo con el nombre de remitente configurado.
 * La dirección de envío la decide WordPress o el plugin SMTP, para no caer en spam.
 */
function horeca_send_mail($to, $subject, $body, $reply_to = '') {
    $name = trim((string) horeca_email_settings()['from_name']);
    $set_name = function () use ($name) {
        return $name;
    };
    if ($name !== '') {
        add_filter('wp_mail_from_name', $set_name, 99);
    }
    $ok = wp_mail($to, $subject, $body, horeca_mail_headers($reply_to));
    if ($name !== '') {
        remove_filter('wp_mail_from_name', $set_name, 99);
    }
    return $ok;
}

/* -------------------------------------------------------------------------
 * Endpoint público: POST /wp-json/horeca/v1/solicitudes
 * ---------------------------------------------------------------------- */
add_action('rest_api_init', function () {
    register_rest_route('horeca/v1', '/solicitudes', [
        'methods'             => 'POST',
        'callback'            => 'horeca_rest_crear_solicitud',
        'permission_callback' => '__return_true',
    ]);
});

function horeca_rest_crear_solicitud(WP_REST_Request $req) {
    $p = $req->get_json_params();
    if (!is_array($p)) {
        return new WP_Error('horeca_datos', 'Datos no válidos.', ['status' => 400]);
    }

    // Campo trampa para bots: los humanos no lo ven.
    if (!empty($p['empresa_web'])) {
        return ['ok' => true, 'referencia' => 'SOL-' . wp_rand(1000, 9999)];
    }

    // Límite simple: máximo 5 solicitudes por IP cada 10 minutos.
    $ip  = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '';
    $key = 'horeca_rl_' . md5($ip);
    $hits = (int) get_transient($key);
    if ($hits >= 5) {
        return new WP_Error('horeca_limite', 'Has enviado varias solicitudes seguidas. Intenta de nuevo en unos minutos.', ['status' => 429]);
    }
    set_transient($key, $hits + 1, 10 * MINUTE_IN_SECONDS);

    $nombre   = sanitize_text_field($p['nombre'] ?? '');
    $whatsapp = sanitize_text_field($p['whatsapp'] ?? '');
    $correo   = sanitize_email($p['correo'] ?? '');

    if ($nombre === '' || mb_strlen($nombre) > 120) {
        return new WP_Error('horeca_nombre', 'Escribe tu nombre.', ['status' => 400]);
    }
    if (strlen(preg_replace('/\D+/', '', $whatsapp)) < 7) {
        return new WP_Error('horeca_whatsapp', 'Escribe un número de WhatsApp válido.', ['status' => 400]);
    }
    if (!is_email($correo)) {
        return new WP_Error('horeca_correo', 'Escribe un correo válido.', ['status' => 400]);
    }

    // Los precios se toman de WooCommerce, nunca del navegador.
    $items = [];
    $total = 0;
    foreach ((array) ($p['items'] ?? []) as $raw) {
        $qty = max(1, min(99, (int) ($raw['quantity'] ?? 1)));
        $product = null;
        if (!empty($raw['wcId'])) {
            $product = wc_get_product((int) $raw['wcId']);
        }
        if (!$product && !empty($raw['productId'])) {
            $pid = horeca_find_product_by_app_id(sanitize_key($raw['productId']));
            $product = $pid ? wc_get_product($pid) : null;
        }
        if (!$product || $product->get_status() !== 'publish') {
            continue;
        }
        $price    = (float) $product->get_price();
        $subtotal = $price * $qty;
        $total   += $subtotal;
        $items[]  = [
            'wcId'     => $product->get_id(),
            'name'     => $product->get_name(),
            'qty'      => $qty,
            'price'    => $price,
            'subtotal' => $subtotal,
        ];
        if (count($items) >= 30) {
            break;
        }
    }
    if (!$items) {
        return new WP_Error('horeca_items', 'Tu presupuesto está vacío.', ['status' => 400]);
    }

    $referencia = 'SOL-' . wp_date('ymd') . '-' . strtoupper(wp_generate_password(4, false, false));

    $post_id = wp_insert_post([
        'post_type'   => HORECA_CPT_SOLICITUD,
        'post_status' => 'publish',
        'post_title'  => $referencia . ' · ' . $nombre,
    ], true);
    if (is_wp_error($post_id)) {
        return new WP_Error('horeca_guardar', 'No pudimos guardar tu solicitud. Intenta de nuevo.', ['status' => 500]);
    }
    update_post_meta($post_id, '_h_referencia', $referencia);
    update_post_meta($post_id, '_h_nombre', $nombre);
    update_post_meta($post_id, '_h_whatsapp', $whatsapp);
    update_post_meta($post_id, '_h_correo', $correo);
    update_post_meta($post_id, '_h_items', $items);
    update_post_meta($post_id, '_h_total', $total);

    $s    = horeca_email_settings();
    $data = [
        'nombre'     => $nombre,
        'whatsapp'   => $whatsapp,
        'correo'     => $correo,
        'referencia' => $referencia,
        'fecha'      => horeca_fecha_es(),
        'items'      => $items,
        'total'      => $total,
        'tienda'     => $s['shop_url'],
        'visita'     => $s['visit_text'],
    ];

    // 1) Correo al cliente con su cotización.
    if (!empty($s['send_customer'])) {
        $admin_first = trim(explode(',', (string) $s['admin_recipients'])[0]);
        $sent = horeca_send_mail(
            $correo,
            wp_strip_all_tags(horeca_fill_template($s['customer_subject'], $data)),
            horeca_fill_template($s['customer_body'], $data),
            $admin_first
        );
        update_post_meta($post_id, '_h_mail_customer', $sent ? 'sent' : 'failed');
    } else {
        update_post_meta($post_id, '_h_mail_customer', 'off');
    }

    // 2) Aviso al equipo comercial.
    $recipients = array_filter(array_map('trim', explode(',', (string) $s['admin_recipients'])), 'is_email');
    if ($recipients) {
        $digits = preg_replace('/\D+/', '', $whatsapp);
        if (strlen($digits) === 10) {
            $digits = '57' . $digits;
        }
        $body = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;max-width:600px">'
            . '<h2 style="margin:0 0 12px">Nueva solicitud de cotización ' . esc_html($referencia) . '</h2>'
            . '<p style="font-size:14px;line-height:1.7;margin:0 0 16px">'
            . '<strong>Nombre:</strong> ' . esc_html($nombre) . '<br>'
            . '<strong>WhatsApp:</strong> <a href="' . esc_url('https://wa.me/' . $digits) . '">' . esc_html($whatsapp) . '</a><br>'
            . '<strong>Correo:</strong> <a href="mailto:' . esc_attr($correo) . '">' . esc_html($correo) . '</a></p>'
            . horeca_items_table_html($items, $total)
            . '<p style="font-size:13px;margin-top:16px"><a href="' . esc_url(admin_url('post.php?post=' . $post_id . '&action=edit')) . '">Ver la solicitud en WordPress</a></p>'
            . '</div>';
        $admin_sent = horeca_send_mail($recipients, 'Nueva solicitud ' . $referencia . ' · ' . $nombre, $body, $correo);
        update_post_meta($post_id, '_h_mail_admin', $admin_sent ? 'sent' : 'failed');
    }

    return ['ok' => true, 'referencia' => $referencia];
}

/* -------------------------------------------------------------------------
 * Guardar ajustes y correo de prueba (desde WooCommerce → Horeca App)
 * ---------------------------------------------------------------------- */
add_action('admin_post_horeca_guardar_correos', function () {
    if (!current_user_can('manage_woocommerce')) {
        wp_die('No tienes permiso para hacer esto.');
    }
    check_admin_referer('horeca_guardar_correos');

    $emails = array_filter(array_map('trim', explode(',', sanitize_text_field(wp_unslash($_POST['admin_recipients'] ?? '')))), 'is_email');
    $body   = (string) wp_unslash($_POST['customer_body'] ?? '');
    if (!current_user_can('unfiltered_html')) {
        $body = wp_kses_post($body);
    }

    update_option('horeca_email_settings', [
        'admin_recipients' => implode(', ', $emails),
        'from_name'        => sanitize_text_field(wp_unslash($_POST['from_name'] ?? '')),
        'customer_subject' => sanitize_text_field(wp_unslash($_POST['customer_subject'] ?? '')),
        'customer_body'    => trim($body) !== '' ? $body : horeca_default_customer_template(),
        'shop_url'         => esc_url_raw(wp_unslash($_POST['shop_url'] ?? '')),
        'visit_text'       => sanitize_textarea_field(wp_unslash($_POST['visit_text'] ?? '')),
        'send_customer'    => !empty($_POST['send_customer']) ? 1 : 0,
    ], false);

    $msg = 'guardado';
    if (!empty($_POST['send_test'])) {
        $s    = horeca_email_settings();
        $to   = sanitize_email(wp_unslash($_POST['test_to'] ?? '')) ?: wp_get_current_user()->user_email;
        $data = [
            'nombre'     => 'Cliente de prueba',
            'whatsapp'   => '315 123 4567',
            'correo'     => $to,
            'referencia' => 'SOL-PRUEBA',
            'fecha'      => horeca_fecha_es(),
            'items'      => [
                ['name' => 'Máquina de Espresso Barista Máster', 'qty' => 1, 'price' => 2799900, 'subtotal' => 2799900],
                ['name' => 'Molino Mignon Filtro 50MM Eureka', 'qty' => 2, 'price' => 1899900, 'subtotal' => 3799800],
            ],
            'total'      => 6599700,
            'tienda'     => $s['shop_url'],
            'visita'     => $s['visit_text'],
        ];
        $ok  = horeca_send_mail($to, wp_strip_all_tags(horeca_fill_template($s['customer_subject'], $data)), horeca_fill_template($s['customer_body'], $data));
        $msg = $ok ? 'prueba_ok' : 'prueba_error';
    }

    wp_safe_redirect(admin_url('admin.php?page=horeca-app&correos=' . $msg . '#correos'));
    exit;
});

function horeca_render_email_settings() {
    $s   = horeca_email_settings();
    $msg = isset($_GET['correos']) ? sanitize_key($_GET['correos']) : '';
    ?>
    <h2 id="correos">Correos de las solicitudes</h2>
    <?php if ($msg === 'guardado') : ?>
        <div class="notice notice-success inline"><p>Ajustes de correo guardados.</p></div>
    <?php elseif ($msg === 'prueba_ok') : ?>
        <div class="notice notice-success inline"><p>Ajustes guardados y correo de prueba enviado. Revisa tu bandeja (y la carpeta de spam).</p></div>
    <?php elseif ($msg === 'prueba_error') : ?>
        <div class="notice notice-error inline"><p>El servidor no pudo enviar el correo de prueba. Configura el envío SMTP (ver nota abajo).</p></div>
    <?php endif; ?>
    <p>Cada vez que un cliente envía el formulario de <strong>Mi Presupuesto</strong>: se guarda en <a href="<?php echo esc_url(admin_url('edit.php?post_type=' . HORECA_CPT_SOLICITUD)); ?>">Solicitudes Horeca</a>, te llega un aviso a los correos de abajo y el cliente recibe su cotización por correo.</p>
    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <?php wp_nonce_field('horeca_guardar_correos'); ?>
        <input type="hidden" name="action" value="horeca_guardar_correos">
        <table class="form-table" role="presentation">
            <tr>
                <th><label for="admin_recipients">Avisar al equipo en</label></th>
                <td><input type="text" id="admin_recipients" name="admin_recipients" class="large-text" value="<?php echo esc_attr($s['admin_recipients']); ?>">
                    <p class="description">Uno o varios correos separados por coma.</p></td>
            </tr>
            <tr>
                <th><label for="from_name">Nombre del remitente</label></th>
                <td><input type="text" id="from_name" name="from_name" class="regular-text" value="<?php echo esc_attr($s['from_name']); ?>"></td>
            </tr>
            <tr>
                <th>Correo al cliente</th>
                <td><label><input type="checkbox" name="send_customer" value="1" <?php checked(!empty($s['send_customer'])); ?>> Enviar la cotización al cliente apenas envía el formulario</label></td>
            </tr>
            <tr>
                <th><label for="customer_subject">Asunto</label></th>
                <td><input type="text" id="customer_subject" name="customer_subject" class="large-text" value="<?php echo esc_attr($s['customer_subject']); ?>"></td>
            </tr>
            <tr>
                <th><label for="customer_body">Diseño del correo (HTML)</label></th>
                <td>
                    <textarea id="customer_body" name="customer_body" rows="16" class="large-text code"><?php echo esc_textarea($s['customer_body']); ?></textarea>
                    <p class="description">Pega aquí el HTML de tu diseño. Puedes usar estas etiquetas y se reemplazan solas:
                        <code>{nombre}</code> <code>{whatsapp}</code> <code>{correo}</code> <code>{referencia}</code> <code>{fecha}</code>
                        <code>{productos}</code> (tabla con equipos y total) <code>{total}</code> <code>{tienda}</code> (enlace a la tienda) <code>{visita}</code> (texto de visita).
                        Si lo dejas vacío, se usa el diseño por defecto.</p>
                </td>
            </tr>
            <tr>
                <th><label for="shop_url">Enlace "Comprar en la tienda"</label></th>
                <td><input type="url" id="shop_url" name="shop_url" class="large-text" value="<?php echo esc_attr($s['shop_url']); ?>"></td>
            </tr>
            <tr>
                <th><label for="visit_text">Texto "Visítanos"</label></th>
                <td><textarea id="visit_text" name="visit_text" rows="3" class="large-text"><?php echo esc_textarea($s['visit_text']); ?></textarea>
                    <p class="description">Dirección, horario o lo que quieras que diga la sección de visita.</p></td>
            </tr>
            <tr>
                <th><label for="test_to">Probar</label></th>
                <td>
                    <input type="email" id="test_to" name="test_to" class="regular-text" placeholder="<?php echo esc_attr(wp_get_current_user()->user_email); ?>">
                    <label style="margin-left:8px"><input type="checkbox" name="send_test" value="1"> Enviarme un correo de prueba al guardar</label>
                </td>
            </tr>
        </table>
        <?php submit_button('Guardar correos'); ?>
    </form>
    <p class="description"><strong>Para que los correos no lleguen a spam:</strong> en Hostinger crea un correo de tu dominio (por ejemplo <code>cotizaciones@horecaprofesional.com.co</code>) y conéctalo con un plugin SMTP como <em>WP Mail SMTP</em>.</p>
    <?php
}
