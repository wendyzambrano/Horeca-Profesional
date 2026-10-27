<?php
/**
 * Sincronización automática de precios con artiq.com.co y distritocafetero.com.
 *
 * - Una vez al día (y con el botón "Sincronizar ahora") lee los precios públicos de las dos tiendas.
 * - Empareja cada producto por su SKU en la tienda de origen.
 * - Pone el precio full como precio normal y el precio con descuento como precio rebajado.
 * - No toca productos marcados como "Precio manual".
 */
if (!defined('ABSPATH')) {
    exit;
}

define('HORECA_SYNC_HOOK', 'horeca_sync_prices_daily');

function horeca_price_sources() {
    return apply_filters('horeca_price_sources', [
        'artiq'    => ['label' => 'artiq.com.co', 'url' => 'https://artiq.com.co'],
        'distrito' => ['label' => 'distritocafetero.com', 'url' => 'https://distritocafetero.com'],
    ]);
}

/* -------------------------------------------------------------------------
 * Programación diaria
 * ---------------------------------------------------------------------- */
add_action('init', function () {
    if (!wp_next_scheduled(HORECA_SYNC_HOOK)) {
        // Primera ejecución esta madrugada (hora de Colombia) y luego cada día.
        $tz    = wp_timezone();
        $start = new DateTime('tomorrow 03:00', $tz);
        wp_schedule_event($start->getTimestamp(), 'daily', HORECA_SYNC_HOOK);
    }
});
add_action(HORECA_SYNC_HOOK, function () {
    horeca_sync_prices('automática');
});
register_deactivation_hook(HORECA_FILE, function () {
    wp_clear_scheduled_hook(HORECA_SYNC_HOOK);
});

/* -------------------------------------------------------------------------
 * Datos de origen de cada producto (tienda + SKU)
 * ---------------------------------------------------------------------- */

/** Origen por defecto desde el catálogo de la app (para productos importados antes de esta versión). */
function horeca_default_sources() {
    static $map = null;
    if ($map !== null) {
        return $map;
    }
    $map  = [];
    $file = HORECA_PATH . 'data/productos-iniciales.json';
    $items = file_exists($file) ? json_decode((string) file_get_contents($file), true) : [];
    foreach ((array) $items as $it) {
        if (!empty($it['id']) && !empty($it['sourceStore']) && !empty($it['sourceSku'])) {
            $map[$it['id']] = ['store' => $it['sourceStore'], 'sku' => $it['sourceSku']];
        }
    }
    return $map;
}

/** Devuelve ['store' => ..., 'sku' => ...] o null si el producto no se sincroniza. */
function horeca_product_source($product_id) {
    $store = (string) get_post_meta($product_id, '_horeca_source_store', true);
    $sku   = (string) get_post_meta($product_id, '_horeca_source_sku', true);
    if ($store === '' && $sku === '') {
        $app_id = (string) get_post_meta($product_id, '_horeca_id', true);
        $def    = horeca_default_sources()[$app_id] ?? null;
        if ($def) {
            return $def;
        }
        return null;
    }
    if ($store === 'none' || $sku === '' || !isset(horeca_price_sources()[$store])) {
        return null;
    }
    return ['store' => $store, 'sku' => $sku];
}

/* -------------------------------------------------------------------------
 * Lectura de precios de una tienda (WooCommerce Store API pública)
 * ---------------------------------------------------------------------- */

/**
 * @return array{prices: array<string, array{regular: float, sale: float, name: string}>, error: string}
 */
function horeca_fetch_store_prices($store_key) {
    $src = horeca_price_sources()[$store_key] ?? null;
    if (!$src) {
        return ['prices' => [], 'error' => 'Tienda desconocida'];
    }
    $prices = [];
    for ($page = 1; $page <= 20; $page++) {
        $url = add_query_arg(['per_page' => 100, 'page' => $page], trailingslashit($src['url']) . 'wp-json/wc/store/v1/products');
        $res = wp_remote_get($url, ['timeout' => 25, 'headers' => ['Accept' => 'application/json']]);
        if (is_wp_error($res)) {
            return ['prices' => $prices, 'error' => $res->get_error_message()];
        }
        $code = (int) wp_remote_retrieve_response_code($res);
        if ($code !== 200) {
            if ($page > 1 && $code === 400) {
                break; // página fuera de rango
            }
            return ['prices' => $prices, 'error' => 'La tienda respondió con el código ' . $code];
        }
        $list = json_decode(wp_remote_retrieve_body($res), true);
        if (!is_array($list)) {
            return ['prices' => $prices, 'error' => 'Respuesta no válida de la tienda'];
        }
        foreach ($list as $p) {
            $sku = isset($p['sku']) ? trim((string) $p['sku']) : '';
            if ($sku === '' || empty($p['prices'])) {
                continue;
            }
            $div     = pow(10, (int) ($p['prices']['currency_minor_unit'] ?? 0));
            $regular = (float) ($p['prices']['regular_price'] ?? 0) / $div;
            $sale    = (float) ($p['prices']['sale_price'] ?? ($p['prices']['price'] ?? 0)) / $div;
            if ($regular <= 0 && $sale > 0) {
                $regular = $sale;
            }
            if ($regular > 0) {
                $prices[strtoupper($sku)] = [
                    'regular' => $regular,
                    'sale'    => ($sale > 0 && $sale < $regular) ? $sale : $regular,
                    'name'    => wp_strip_all_tags(html_entity_decode((string) ($p['name'] ?? ''), ENT_QUOTES)),
                ];
            }
        }
        $total_pages = (int) wp_remote_retrieve_header($res, 'x-wp-totalpages');
        if (count($list) < 100 || ($total_pages && $page >= $total_pages)) {
            break;
        }
    }
    return ['prices' => $prices, 'error' => ''];
}

/* -------------------------------------------------------------------------
 * Sincronizar
 * ---------------------------------------------------------------------- */

/**
 * @param string $how 'automática' o 'manual'
 * @return array Registro de la ejecución (también se guarda en la opción horeca_sync_log).
 */
function horeca_sync_prices($how = 'manual') {
    if (!function_exists('wc_get_products')) {
        return [];
    }
    if (get_transient('horeca_sync_running')) {
        return get_option('horeca_sync_log', []);
    }
    set_transient('horeca_sync_running', 1, 5 * MINUTE_IN_SECONDS);

    $log = [
        'time'     => time(),
        'how'      => $how,
        'changed'  => [],
        'same'     => 0,
        'manual'   => [],
        'missing'  => [],
        'nosource' => [],
        'errors'   => [],
    ];

    $catalogs = [];
    foreach (array_keys(horeca_price_sources()) as $key) {
        $catalogs[$key] = horeca_fetch_store_prices($key);
        if ($catalogs[$key]['error'] !== '') {
            $log['errors'][] = horeca_price_sources()[$key]['label'] . ': ' . $catalogs[$key]['error'];
        }
    }

    $ids = get_posts([
        'post_type'      => 'product',
        'post_status'    => ['publish', 'draft', 'pending', 'private'],
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'meta_key'       => '_horeca_brand',
        'meta_value'     => array_keys(horeca_brands()),
        'meta_compare'   => 'IN',
    ]);

    foreach ($ids as $pid) {
        $product = wc_get_product($pid);
        if (!$product) {
            continue;
        }
        $name = $product->get_name();
        if (get_post_meta($pid, '_horeca_price_manual', true) === '1') {
            $log['manual'][] = $name;
            continue;
        }
        $source = horeca_product_source($pid);
        if (!$source) {
            $log['nosource'][] = $name;
            continue;
        }
        $cat = $catalogs[$source['store']] ?? null;
        $remote = $cat ? ($cat['prices'][strtoupper($source['sku'])] ?? null) : null;
        if (!$remote) {
            // Si la tienda no respondió, no se marca como faltante: se deja el precio actual.
            if ($cat && $cat['error'] === '') {
                $log['missing'][] = $name . ' (' . $source['sku'] . ')';
            }
            continue;
        }

        $old_regular = (float) $product->get_regular_price();
        $old_sale    = $product->get_sale_price() === '' ? 0.0 : (float) $product->get_sale_price();
        $new_regular = (float) $remote['regular'];
        $new_sale    = $remote['sale'] < $remote['regular'] ? (float) $remote['sale'] : 0.0;

        if (abs($old_regular - $new_regular) < 0.5 && abs($old_sale - $new_sale) < 0.5) {
            $log['same']++;
            continue;
        }

        $product->set_regular_price((string) $new_regular);
        $product->set_sale_price($new_sale > 0 ? (string) $new_sale : '');
        $product->set_date_on_sale_from(null);
        $product->set_date_on_sale_to(null);
        $product->save();

        $log['changed'][] = [
            'name'   => $name,
            'before' => $old_sale > 0 ? $old_sale : $old_regular,
            'after'  => $new_sale > 0 ? $new_sale : $new_regular,
            'full'   => $new_regular,
        ];
    }

    if ($log['changed']) {
        do_action('litespeed_purge_all');
    }
    update_option('horeca_sync_log', $log, false);
    delete_transient('horeca_sync_running');
    return $log;
}

/* -------------------------------------------------------------------------
 * Botón "Sincronizar ahora" y panel en WooCommerce → Horeca App
 * ---------------------------------------------------------------------- */
add_action('admin_post_horeca_sync_now', function () {
    if (!current_user_can('manage_woocommerce')) {
        wp_die('No tienes permiso para hacer esto.');
    }
    check_admin_referer('horeca_sync_now');
    if (function_exists('set_time_limit')) {
        @set_time_limit(120); // phpcs:ignore WordPress.PHP.NoSilencedErrors
    }
    horeca_sync_prices('manual');
    wp_safe_redirect(admin_url('admin.php?page=horeca-app&sync=1#precios'));
    exit;
});

function horeca_render_sync_panel() {
    $log  = get_option('horeca_sync_log', []);
    $next = wp_next_scheduled(HORECA_SYNC_HOOK);
    ?>
    <h2 id="precios">Precios sincronizados con artiq.com.co y distritocafetero.com</h2>
    <?php if (!empty($_GET['sync'])) : ?>
        <div class="notice notice-<?php echo !empty($log['errors']) ? 'warning' : 'success'; ?> inline"><p>Sincronización terminada.</p></div>
    <?php endif; ?>
    <p>Cada día, de madrugada, los precios de Horeca se actualizan con los de las tiendas: el <strong>precio full</strong> como precio normal y el <strong>precio con descuento</strong> como precio rebajado. Los productos se emparejan por su SKU en la tienda de origen (caja "Datos para la app Horeca" de cada producto). Si marcas un producto como <strong>Precio manual</strong>, la sincronización no lo toca.</p>

    <table class="widefat striped" style="max-width:720px">
        <tbody>
            <tr><td>Última sincronización</td><td>
                <?php echo $log ? esc_html(wp_date('j/m/Y g:i a', (int) $log['time']) . ' (' . $log['how'] . ')') : 'Todavía no se ha ejecutado'; ?>
            </td></tr>
            <tr><td>Próxima sincronización automática</td><td><?php echo $next ? esc_html(wp_date('j/m/Y g:i a', $next)) : '—'; ?></td></tr>
            <?php if ($log) : ?>
                <tr><td>Precios que cambiaron</td><td><strong><?php echo count($log['changed']); ?></strong></td></tr>
                <tr><td>Sin cambios</td><td><?php echo (int) $log['same']; ?></td></tr>
                <?php if ($log['manual']) : ?>
                    <tr><td>Con precio manual (no se tocaron)</td><td><?php echo esc_html(implode(', ', $log['manual'])); ?></td></tr>
                <?php endif; ?>
                <?php if ($log['nosource']) : ?>
                    <tr><td>Sin tienda de origen</td><td><?php echo esc_html(implode(', ', $log['nosource'])); ?></td></tr>
                <?php endif; ?>
                <?php if ($log['missing']) : ?>
                    <tr><td>⚠️ No encontrados en la tienda (se dejó el precio actual)</td><td><?php echo esc_html(implode(', ', $log['missing'])); ?></td></tr>
                <?php endif; ?>
                <?php if ($log['errors']) : ?>
                    <tr><td>⚠️ Errores</td><td><?php echo esc_html(implode(' · ', $log['errors'])); ?></td></tr>
                <?php endif; ?>
            <?php endif; ?>
        </tbody>
    </table>

    <?php if (!empty($log['changed'])) : ?>
        <h3 style="margin-top:16px">Cambios de la última sincronización</h3>
        <table class="widefat striped" style="max-width:720px">
            <thead><tr><th>Producto</th><th>Antes</th><th>Ahora</th><th>Precio full</th></tr></thead>
            <tbody>
                <?php foreach ($log['changed'] as $c) : ?>
                    <tr>
                        <td><?php echo esc_html($c['name']); ?></td>
                        <td><?php echo esc_html('$' . number_format((float) $c['before'], 0, ',', '.')); ?></td>
                        <td><strong><?php echo esc_html('$' . number_format((float) $c['after'], 0, ',', '.')); ?></strong></td>
                        <td><?php echo esc_html('$' . number_format((float) $c['full'], 0, ',', '.')); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>

    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin-top:12px">
        <?php wp_nonce_field('horeca_sync_now'); ?>
        <input type="hidden" name="action" value="horeca_sync_now">
        <?php submit_button('Sincronizar ahora', 'primary', 'submit', false); ?>
    </form>
    <?php
}
