<?php
/**
 * Agenda de visitas al Centro de Experiencia.
 *
 * - Página pública para agendar: /?horeca_visita=<token de la solicitud>  (o /?horeca_visita=nueva)
 * - Reglas: lunes a sábado, desde el día siguiente.
 *   Lunes a viernes: 9:00 a 12:00 y 14:00 a 17:00 · Sábados: 8:30 a 11:30. Turnos de 1 hora, una visita por turno.
 * - Las visitas quedan en WordPress → "Agenda de visitas" para hacerles seguimiento.
 */
if (!defined('ABSPATH')) {
    exit;
}

define('HORECA_CPT_VISITA', 'horeca_visita');
define('HORECA_VISIT_TZ', 'America/Bogota');
define('HORECA_VISIT_DAYS_AHEAD', 60);

function horeca_visit_tz() {
    return new DateTimeZone(HORECA_VISIT_TZ);
}

/* -------------------------------------------------------------------------
 * Festivos de Colombia (Ley 51 de 1983 / Ley Emiliani)
 * ---------------------------------------------------------------------- */
function horeca_easter_ymd($year) {
    // Algoritmo de Butcher (calendario gregoriano).
    $a = $year % 19; $b = intdiv($year, 100); $c = $year % 100;
    $d = intdiv($b, 4); $e = $b % 4; $f = intdiv($b + 8, 25); $g = intdiv($b - $f + 1, 3);
    $h = (19 * $a + $b - $d - $g + 15) % 30; $i = intdiv($c, 4); $k = $c % 4;
    $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7; $m = intdiv($a + 11 * $h + 22 * $l, 451);
    $month = intdiv($h + $l - 7 * $m + 114, 31); $day = (($h + $l - 7 * $m + 114) % 31) + 1;
    return sprintf('%04d-%02d-%02d', $year, $month, $day);
}

/** Lista de festivos del año en formato Y-m-d. */
function horeca_co_holidays($year) {
    static $cache = [];
    if (isset($cache[$year])) {
        return $cache[$year];
    }
    $tz = horeca_visit_tz();
    $next_monday = function ($ymd) use ($tz) {
        $d = new DateTime($ymd, $tz);
        $w = (int) $d->format('w');
        if ($w !== 1) {
            $d->modify('next monday');
        }
        return $d->format('Y-m-d');
    };
    $easter = new DateTime(horeca_easter_ymd($year), $tz);
    $rel = function ($days) use ($easter) {
        return (clone $easter)->modify(($days >= 0 ? '+' : '') . $days . ' days')->format('Y-m-d');
    };
    $list = [
        "$year-01-01", "$year-05-01", "$year-07-20", "$year-08-07", "$year-12-08", "$year-12-25", // fijos
        $next_monday("$year-01-06"), $next_monday("$year-03-19"), $next_monday("$year-06-29"),
        $next_monday("$year-08-15"), $next_monday("$year-10-12"), $next_monday("$year-11-01"), $next_monday("$year-11-11"),
        $rel(-3), $rel(-2),               // Jueves y Viernes Santo
        $rel(43), $rel(64), $rel(71),     // Ascensión, Corpus Christi y Sagrado Corazón (trasladados a lunes)
    ];
    $list = array_values(array_unique(apply_filters('horeca_co_holidays', $list, $year)));
    sort($list);
    return $cache[$year] = $list;
}

function horeca_is_holiday($ymd) {
    return in_array($ymd, horeca_co_holidays((int) substr($ymd, 0, 4)), true);
}

/** Visitas por turno: 0 = sin límite. */
function horeca_visit_capacity() {
    return (int) apply_filters('horeca_visit_capacity', 0);
}

/** Turnos de un día (0 = domingo … 6 = sábado). */
function horeca_visit_slots_for_weekday($w) {
    if ($w >= 1 && $w <= 5) {
        return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    }
    if ($w === 6) {
        return ['08:30', '09:30', '10:30'];
    }
    return [];
}

function horeca_visit_slot_label($hhmm) {
    $d = DateTime::createFromFormat('H:i', $hhmm, horeca_visit_tz());
    $end = (clone $d)->modify('+1 hour');
    $suf = function ($x) {
        $h = (int) $x->format('G');
        return $h < 12 ? 'a. m.' : ($h === 12 && (int) $x->format('i') === 0 ? 'm.' : 'p. m.');
    };
    $hm = function ($x) {
        $h = (int) $x->format('G');
        return ($h > 12 ? $h - 12 : $h) . ':' . $x->format('i');
    };
    // "9:00 – 10:00 a. m." cuando las dos horas son de la mañana o de la tarde.
    if ($suf($d) === $suf($end)) {
        return $hm($d) . ' – ' . $hm($end) . ' ' . $suf($end);
    }
    return $hm($d) . ' ' . $suf($d) . ' – ' . $hm($end) . ' ' . $suf($end);
}

function horeca_visit_date_label($ymd) {
    $d = DateTime::createFromFormat('Y-m-d', $ymd, horeca_visit_tz());
    $dias  = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    $meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return $dias[(int) $d->format('w')] . ' ' . (int) $d->format('j') . ' de ' . $meses[(int) $d->format('n') - 1] . ' de ' . $d->format('Y');
}

/** ¿Es válido el turno? (regla de días y horarios, sin revisar si está ocupado). */
function horeca_visit_slot_is_valid($ymd, $hhmm) {
    $d = DateTime::createFromFormat('!Y-m-d', $ymd, horeca_visit_tz());
    if (!$d || $d->format('Y-m-d') !== $ymd) {
        return false;
    }
    $today    = new DateTime('today', horeca_visit_tz());
    $tomorrow = (clone $today)->modify('+1 day');
    $last     = (clone $today)->modify('+' . HORECA_VISIT_DAYS_AHEAD . ' days');
    if ($d < $tomorrow || $d > $last) {
        return false;
    }
    if (horeca_is_holiday($ymd)) {
        return false;
    }
    return in_array($hhmm, horeca_visit_slots_for_weekday((int) $d->format('w')), true);
}

/** Turnos llenos entre dos fechas: ['Y-m-d H:i' => true]. Sin límite de cupo, no hay turnos llenos. */
function horeca_visit_taken_slots($from_ymd, $to_ymd) {
    $cap = horeca_visit_capacity();
    if ($cap <= 0) {
        return [];
    }
    $q = new WP_Query([
        'post_type'      => HORECA_CPT_VISITA,
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
        'meta_query'     => [
            ['key' => '_v_inicio', 'value' => [$from_ymd . ' 00:00', $to_ymd . ' 23:59'], 'compare' => 'BETWEEN'],
            ['key' => '_v_estado', 'value' => ['cancelada'], 'compare' => 'NOT IN'],
        ],
    ]);
    $count = [];
    foreach ($q->posts as $id) {
        $k = (string) get_post_meta($id, '_v_inicio', true);
        $count[$k] = ($count[$k] ?? 0) + 1;
    }
    $full = [];
    foreach ($count as $k => $n) {
        if ($n >= $cap) {
            $full[$k] = true;
        }
    }
    return $full;
}

function horeca_visit_estados() {
    return [
        'pendiente'  => 'Pendiente',
        'confirmada' => 'Confirmada',
        'realizada'  => 'Realizada',
        'no_asistio' => 'No asistió',
        'cancelada'  => 'Cancelada',
    ];
}

/* -------------------------------------------------------------------------
 * Tipo de contenido "Agenda de visitas"
 * ---------------------------------------------------------------------- */
add_action('init', function () {
    register_post_type(HORECA_CPT_VISITA, [
        'labels' => [
            'name'          => 'Agenda de visitas',
            'singular_name' => 'Visita',
            'menu_name'     => 'Agenda de visitas',
            'all_items'     => 'Todas las visitas',
            'edit_item'     => 'Ver visita',
            'search_items'  => 'Buscar visitas',
            'not_found'     => 'No hay visitas agendadas',
        ],
        'public'          => false,
        'show_ui'         => true,
        'show_in_menu'    => true,
        'menu_position'   => 57,
        'menu_icon'       => 'dashicons-calendar-alt',
        'supports'        => ['title'],
        'capability_type' => 'post',
        'capabilities'    => ['create_posts' => 'do_not_allow'],
        'map_meta_cap'    => true,
    ]);
});

/* Columnas */
add_filter('manage_' . HORECA_CPT_VISITA . '_posts_columns', function () {
    return [
        'cb'         => '<input type="checkbox" />',
        'v_fecha'    => 'Fecha de la visita',
        'v_hora'     => 'Hora',
        'title'      => 'Cliente',
        'v_whatsapp' => 'WhatsApp',
        'v_prod'     => 'Productos',
        'v_estado'   => 'Estado',
    ];
});

add_action('manage_' . HORECA_CPT_VISITA . '_posts_custom_column', function ($col, $id) {
    $inicio = (string) get_post_meta($id, '_v_inicio', true);
    switch ($col) {
        case 'v_fecha':
            echo $inicio ? esc_html(ucfirst(horeca_visit_date_label(substr($inicio, 0, 10)))) : '—';
            break;
        case 'v_hora':
            echo $inicio ? esc_html(horeca_visit_slot_label(substr($inicio, 11, 5))) : '—';
            break;
        case 'v_whatsapp':
            $w = (string) get_post_meta($id, '_v_whatsapp', true);
            $digits = preg_replace('/\D+/', '', $w);
            if (strlen($digits) === 10) {
                $digits = '57' . $digits;
            }
            echo '<a href="' . esc_url('https://wa.me/' . $digits) . '" target="_blank" rel="noopener">' . esc_html($w) . '</a>';
            break;
        case 'v_prod':
            echo esc_html(implode(', ', (array) get_post_meta($id, '_v_productos', true)));
            break;
        case 'v_estado':
            $e = (string) get_post_meta($id, '_v_estado', true) ?: 'pendiente';
            $colors = ['pendiente' => '#b45309', 'confirmada' => '#0369a1', 'realizada' => '#15803d', 'no_asistio' => '#6b7280', 'cancelada' => '#b91c1c'];
            echo '<span style="font-weight:600;color:' . esc_attr($colors[$e] ?? '#374151') . '">' . esc_html(horeca_visit_estados()[$e] ?? $e) . '</span>';
            break;
    }
}, 10, 2);

/* Orden por fecha de visita y vista "Próximas" por defecto */
add_filter('views_edit-' . HORECA_CPT_VISITA, function ($views) {
    $base = admin_url('edit.php?post_type=' . HORECA_CPT_VISITA);
    $cur  = isset($_GET['h_vista']) ? sanitize_key($_GET['h_vista']) : 'proximas';
    return [
        'proximas' => '<a href="' . esc_url(add_query_arg('h_vista', 'proximas', $base)) . '"' . ($cur === 'proximas' ? ' class="current"' : '') . '>Próximas</a>',
        'pasadas'  => '<a href="' . esc_url(add_query_arg('h_vista', 'pasadas', $base)) . '"' . ($cur === 'pasadas' ? ' class="current"' : '') . '>Pasadas</a>',
        'todas'    => '<a href="' . esc_url(add_query_arg('h_vista', 'todas', $base)) . '"' . ($cur === 'todas' ? ' class="current"' : '') . '>Todas</a>',
    ];
});

add_action('pre_get_posts', function ($q) {
    if (!is_admin() || !$q->is_main_query() || $q->get('post_type') !== HORECA_CPT_VISITA) {
        return;
    }
    $vista = isset($_GET['h_vista']) ? sanitize_key($_GET['h_vista']) : 'proximas';
    $now   = (new DateTime('today', horeca_visit_tz()))->format('Y-m-d 00:00');
    $q->set('meta_key', '_v_inicio');
    $q->set('orderby', 'meta_value');
    if ($vista === 'proximas') {
        $q->set('order', 'ASC');
        $q->set('meta_query', [['key' => '_v_inicio', 'value' => $now, 'compare' => '>=']]);
    } elseif ($vista === 'pasadas') {
        $q->set('order', 'DESC');
        $q->set('meta_query', [['key' => '_v_inicio', 'value' => $now, 'compare' => '<']]);
    } else {
        $q->set('order', 'DESC');
    }
});

/* Detalle y cambio de estado */
add_action('add_meta_boxes_' . HORECA_CPT_VISITA, function () {
    add_meta_box('horeca_visita_detalle', 'Detalle de la visita', function ($post) {
        wp_nonce_field('horeca_visita_estado', 'horeca_visita_nonce');
        $inicio = (string) get_post_meta($post->ID, '_v_inicio', true);
        $estado = (string) get_post_meta($post->ID, '_v_estado', true) ?: 'pendiente';
        $sol    = (int) get_post_meta($post->ID, '_v_solicitud', true);
        echo '<p><strong>Fecha:</strong> ' . esc_html($inicio ? ucfirst(horeca_visit_date_label(substr($inicio, 0, 10))) : '—') . '<br>';
        echo '<strong>Hora:</strong> ' . esc_html($inicio ? horeca_visit_slot_label(substr($inicio, 11, 5)) : '—') . '<br>';
        echo '<strong>Nombre:</strong> ' . esc_html(get_post_meta($post->ID, '_v_nombre', true)) . '<br>';
        echo '<strong>WhatsApp:</strong> ' . esc_html(get_post_meta($post->ID, '_v_whatsapp', true)) . '<br>';
        echo '<strong>Correo:</strong> ' . esc_html(get_post_meta($post->ID, '_v_correo', true) ?: '—') . '<br>';
        echo '<strong>Productos:</strong> ' . esc_html(implode(', ', (array) get_post_meta($post->ID, '_v_productos', true))) . '</p>';
        if ($sol) {
            echo '<p><a href="' . esc_url(admin_url('post.php?post=' . $sol . '&action=edit')) . '">Ver la solicitud de cotización</a></p>';
        }
        echo '<p><label for="horeca_v_estado"><strong>Estado:</strong></label> <select name="horeca_v_estado" id="horeca_v_estado">';
        foreach (horeca_visit_estados() as $k => $l) {
            echo '<option value="' . esc_attr($k) . '"' . selected($estado, $k, false) . '>' . esc_html($l) . '</option>';
        }
        echo '</select></p>';
        echo '<p><label for="horeca_v_notas"><strong>Notas de seguimiento:</strong></label><br><textarea name="horeca_v_notas" id="horeca_v_notas" rows="4" class="large-text">' . esc_textarea((string) get_post_meta($post->ID, '_v_notas', true)) . '</textarea></p>';
        echo '<p class="description">Haz clic en <strong>Actualizar</strong> para guardar el estado y las notas.</p>';
    }, HORECA_CPT_VISITA, 'normal', 'high');
});

add_action('save_post_' . HORECA_CPT_VISITA, function ($post_id) {
    if (!isset($_POST['horeca_visita_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['horeca_visita_nonce'])), 'horeca_visita_estado')) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    $e = sanitize_key(wp_unslash($_POST['horeca_v_estado'] ?? 'pendiente'));
    update_post_meta($post_id, '_v_estado', isset(horeca_visit_estados()[$e]) ? $e : 'pendiente');
    update_post_meta($post_id, '_v_notas', sanitize_textarea_field(wp_unslash($_POST['horeca_v_notas'] ?? '')));
});

/* -------------------------------------------------------------------------
 * Datos de la solicitud desde el enlace del correo
 * ---------------------------------------------------------------------- */
function horeca_visit_url($token = '') {
    return add_query_arg('horeca_visita', $token !== '' ? $token : 'nueva', home_url('/'));
}

function horeca_find_solicitud_by_token($token) {
    if (!$token || $token === 'nueva' || !preg_match('/^[A-Za-z0-9]{12,40}$/', $token)) {
        return 0;
    }
    $ids = get_posts([
        'post_type'      => defined('HORECA_CPT_SOLICITUD') ? HORECA_CPT_SOLICITUD : 'horeca_solicitud',
        'post_status'    => 'publish',
        'meta_key'       => '_h_token',
        'meta_value'     => $token,
        'fields'         => 'ids',
        'posts_per_page' => 1,
        'no_found_rows'  => true,
    ]);
    return $ids ? (int) $ids[0] : 0;
}

/* -------------------------------------------------------------------------
 * REST: turnos ocupados y crear visita
 * ---------------------------------------------------------------------- */
add_action('rest_api_init', function () {
    register_rest_route('horeca/v1', '/visitas/ocupados', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function () {
            $today = new DateTime('today', horeca_visit_tz());
            $from  = (clone $today)->modify('+1 day')->format('Y-m-d');
            $to    = (clone $today)->modify('+' . HORECA_VISIT_DAYS_AHEAD . ' days')->format('Y-m-d');
            $res = rest_ensure_response(['desde' => $from, 'hasta' => $to, 'ocupados' => array_keys(horeca_visit_taken_slots($from, $to))]);
            $res->header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
            return $res;
        },
    ]);
    register_rest_route('horeca/v1', '/visitas', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'horeca_rest_crear_visita',
    ]);
});

function horeca_rest_crear_visita(WP_REST_Request $req) {
    $p = (array) $req->get_json_params();
    if (!empty($p['empresa_web'])) {
        return ['ok' => true];
    }
    $ip   = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '';
    $key  = 'horeca_rlv_' . md5($ip);
    $hits = (int) get_transient($key);
    if ($hits >= 6) {
        return new WP_Error('horeca_limite', 'Has intentado agendar varias veces seguidas. Intenta de nuevo en unos minutos.', ['status' => 429]);
    }
    set_transient($key, $hits + 1, 10 * MINUTE_IN_SECONDS);

    $fecha    = sanitize_text_field($p['fecha'] ?? '');
    $hora     = sanitize_text_field($p['hora'] ?? '');
    $nombre   = sanitize_text_field($p['nombre'] ?? '');
    $whatsapp = sanitize_text_field($p['whatsapp'] ?? '');
    $token    = sanitize_text_field($p['token'] ?? '');

    if ($nombre === '' || mb_strlen($nombre) > 120) {
        return new WP_Error('horeca_nombre', 'Escribe tu nombre.', ['status' => 400]);
    }
    if (strlen(preg_replace('/\D+/', '', $whatsapp)) < 7) {
        return new WP_Error('horeca_whatsapp', 'Escribe un número de WhatsApp válido.', ['status' => 400]);
    }
    if (!horeca_visit_slot_is_valid($fecha, $hora)) {
        return new WP_Error('horeca_turno', 'Ese horario no está disponible. Elige otro día u hora.', ['status' => 400]);
    }

    // Productos: los de la solicitud del correo o el elegido en la página.
    $sol_id    = horeca_find_solicitud_by_token($token);
    $productos = [];
    $correo    = '';
    if ($sol_id) {
        foreach ((array) get_post_meta($sol_id, '_h_items', true) as $it) {
            $productos[] = (string) $it['name'] . ((int) ($it['qty'] ?? 1) > 1 ? ' x' . (int) $it['qty'] : '');
        }
        $correo = (string) get_post_meta($sol_id, '_h_correo', true);
    }
    if (!$productos && !empty($p['producto'])) {
        $pid = horeca_find_product_by_app_id(sanitize_key($p['producto']));
        if ($pid) {
            $productos[] = get_the_title($pid);
        }
    }
    if (!$productos) {
        return new WP_Error('horeca_producto', 'Elige el producto que te interesa.', ['status' => 400]);
    }

    $inicio = $fecha . ' ' . $hora;
    $lock   = 'horeca_vlock_' . md5($inicio);
    if (horeca_visit_capacity() > 0 && (get_transient($lock) || isset(horeca_visit_taken_slots($fecha, $fecha)[$inicio]))) {
        return new WP_Error('horeca_ocupado', 'Alguien acaba de tomar ese horario. Elige otro, por favor.', ['status' => 409]);
    }
    set_transient($lock, 1, 30);

    // Si la misma solicitud ya tenía una visita pendiente, se reemplaza (reagendar).
    if ($sol_id) {
        $prev = get_posts([
            'post_type' => HORECA_CPT_VISITA, 'post_status' => 'publish', 'fields' => 'ids', 'posts_per_page' => -1,
            'meta_query' => [['key' => '_v_solicitud', 'value' => $sol_id], ['key' => '_v_estado', 'value' => 'pendiente']],
        ]);
        foreach ($prev as $old) {
            update_post_meta($old, '_v_estado', 'cancelada');
            update_post_meta($old, '_v_notas', trim(get_post_meta($old, '_v_notas', true) . "\nReagendada por el cliente."));
        }
    }

    $visit_id = wp_insert_post([
        'post_type'   => HORECA_CPT_VISITA,
        'post_status' => 'publish',
        'post_title'  => $nombre,
    ], true);
    delete_transient($lock);
    if (is_wp_error($visit_id)) {
        return new WP_Error('horeca_guardar', 'No pudimos guardar tu visita. Intenta de nuevo.', ['status' => 500]);
    }
    update_post_meta($visit_id, '_v_inicio', $inicio);
    update_post_meta($visit_id, '_v_nombre', $nombre);
    update_post_meta($visit_id, '_v_whatsapp', $whatsapp);
    update_post_meta($visit_id, '_v_correo', $correo);
    update_post_meta($visit_id, '_v_productos', $productos);
    update_post_meta($visit_id, '_v_estado', 'pendiente');
    if ($sol_id) {
        update_post_meta($visit_id, '_v_solicitud', $sol_id);
    }

    $fecha_txt = ucfirst(horeca_visit_date_label($fecha));
    $hora_txt  = horeca_visit_slot_label($hora);
    $s         = function_exists('horeca_email_settings') ? horeca_email_settings() : [];
    $address   = trim((string) ($s['visit_address'] ?? ''));
    $maps      = trim((string) ($s['visit_maps_url'] ?? ''));

    // Aviso al equipo
    $recipients = array_filter(array_map('trim', explode(',', (string) ($s['admin_recipients'] ?? ''))), 'is_email');
    if ($recipients && function_exists('horeca_send_mail')) {
        $digits = preg_replace('/\D+/', '', $whatsapp);
        if (strlen($digits) === 10) {
            $digits = '57' . $digits;
        }
        $body = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;max-width:600px">'
            . '<h2 style="margin:0 0 12px">Nueva visita al Centro de Experiencia</h2>'
            . '<p style="font-size:14px;line-height:1.7">'
            . '<strong>Fecha:</strong> ' . esc_html($fecha_txt) . '<br>'
            . '<strong>Hora:</strong> ' . esc_html($hora_txt) . '<br>'
            . '<strong>Nombre:</strong> ' . esc_html($nombre) . '<br>'
            . '<strong>WhatsApp:</strong> <a href="' . esc_url('https://wa.me/' . $digits) . '">' . esc_html($whatsapp) . '</a><br>'
            . '<strong>Productos:</strong> ' . esc_html(implode(', ', $productos)) . '</p>'
            . '<p style="font-size:13px"><a href="' . esc_url(admin_url('edit.php?post_type=' . HORECA_CPT_VISITA)) . '">Ver la agenda de visitas</a></p>'
            . '</div>';
        horeca_send_mail($recipients, 'Visita agendada: ' . $fecha_txt . ' ' . $hora_txt . ' · ' . $nombre, $body, $correo);
    }

    // Confirmación al cliente (si tenemos su correo por la solicitud)
    if ($correo && function_exists('horeca_send_mail')) {
        $body = '<div style="background:#f4f4f5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1f2937">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">'
            . '<tr><td style="background:#111e2f;padding:24px 32px;color:#ffffff"><div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.7">Horeca Profesional</div>'
            . '<div style="font-size:22px;font-weight:bold;margin-top:6px">Tu visita quedó agendada</div></td></tr>'
            . '<tr><td style="padding:24px 32px;font-size:14px;line-height:1.7">'
            . '<p style="margin:0 0 12px">Hola ' . esc_html($nombre) . ', te esperamos en nuestro Centro de Experiencia:</p>'
            . '<p style="margin:0 0 12px;font-size:16px"><strong>' . esc_html($fecha_txt) . '</strong><br>' . esc_html($hora_txt) . '</p>'
            . ($address !== '' ? '<p style="margin:0 0 12px"><strong>Dirección:</strong> ' . ($maps !== '' ? '<a href="' . esc_url($maps) . '" style="color:#006074">' . esc_html($address) . '</a>' : esc_html($address)) . '</p>' : '')
            . '<p style="margin:0 0 12px"><strong>Equipos de interés:</strong> ' . esc_html(implode(', ', $productos)) . '</p>'
            . '<p style="margin:0 0 12px"><strong>Un asesor se comunicará contigo para confirmar la cita.</strong></p>'
            . '<p style="margin:0">Si necesitas cambiar la hora, vuelve a abrir el enlace de tu correo de cotización y elige otro horario.</p>'
            . '</td></tr></table></div>';
        horeca_send_mail($correo, 'Visita agendada · ' . $fecha_txt . ' ' . $hora_txt, $body);
    }

    return ['ok' => true, 'fecha' => $fecha_txt, 'hora' => $hora_txt, 'direccion' => $address, 'mapa' => $maps];
}

/* -------------------------------------------------------------------------
 * Página pública para agendar
 * ---------------------------------------------------------------------- */
add_filter('query_vars', function ($vars) {
    $vars[] = 'horeca_visita';
    return $vars;
});

add_action('template_redirect', function () {
    $token = get_query_var('horeca_visita');
    if ($token === '' || $token === null) {
        return;
    }
    do_action('litespeed_control_set_nocache', 'Horeca: agenda de visitas');
    nocache_headers();
    horeca_render_visit_page(sanitize_text_field($token));
    exit;
});

function horeca_render_visit_page($token) {
    $sol_id    = horeca_find_solicitud_by_token($token);
    $nombre    = $sol_id ? (string) get_post_meta($sol_id, '_h_nombre', true) : '';
    $whatsapp  = $sol_id ? (string) get_post_meta($sol_id, '_h_whatsapp', true) : '';
    $productos = [];
    if ($sol_id) {
        foreach ((array) get_post_meta($sol_id, '_h_items', true) as $it) {
            $productos[] = (string) $it['name'];
        }
    }
    $catalogo = [];
    if (!$productos && function_exists('wc_get_products')) {
        foreach (wc_get_products(['status' => 'publish', 'limit' => -1]) as $prod) {
            $aid = (string) get_post_meta($prod->get_id(), '_horeca_id', true);
            if ($aid !== '' && get_post_meta($prod->get_id(), '_horeca_brand', true) !== '') {
                $catalogo[] = ['id' => $aid, 'name' => $prod->get_name()];
            }
        }
    }
    $s       = function_exists('horeca_email_settings') ? horeca_email_settings() : [];
    $address = trim((string) ($s['visit_address'] ?? ''));
    $maps    = trim((string) ($s['visit_maps_url'] ?? ''));
    $config  = [
        'rest'      => esc_url_raw(rest_url('horeca/v1/')),
        'token'     => $sol_id ? $token : '',
        'catalogo'  => $catalogo,
        'diasMax'   => HORECA_VISIT_DAYS_AHEAD,
        'hoy'       => (new DateTime('today', horeca_visit_tz()))->format('Y-m-d'),
        'festivos'  => array_values(array_unique(array_merge(
            horeca_co_holidays((int) wp_date('Y')),
            horeca_co_holidays((int) wp_date('Y') + 1)
        ))),
        'turnos'    => [
            '1' => horeca_visit_slots_for_weekday(1), '2' => horeca_visit_slots_for_weekday(2), '3' => horeca_visit_slots_for_weekday(3),
            '4' => horeca_visit_slots_for_weekday(4), '5' => horeca_visit_slots_for_weekday(5), '6' => horeca_visit_slots_for_weekday(6),
        ],
        'etiquetas' => array_combine(
            array_merge(horeca_visit_slots_for_weekday(1), horeca_visit_slots_for_weekday(6)),
            array_map('horeca_visit_slot_label', array_merge(horeca_visit_slots_for_weekday(1), horeca_visit_slots_for_weekday(6)))
        ),
    ];
    header('Content-Type: text/html; charset=UTF-8');
    include HORECA_PATH . 'templates/agendar-visita.php';
}
