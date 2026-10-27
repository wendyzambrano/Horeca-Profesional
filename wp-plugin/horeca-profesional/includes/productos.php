<?php
/**
 * Productos: endpoint REST que lee WooCommerce y caja "Datos para la app Horeca"
 * en la edición de cada producto.
 */
if (!defined('ABSPATH')) {
    exit;
}

/* -------------------------------------------------------------------------
 * Endpoint público: GET /wp-json/horeca/v1/productos
 * ---------------------------------------------------------------------- */
add_action('rest_api_init', function () {
    if (!function_exists('wc_get_products')) {
        return;
    }
    register_rest_route('horeca/v1', '/productos', [
        'methods'             => 'GET',
        'callback'            => 'horeca_rest_productos',
        'permission_callback' => '__return_true',
    ]);
});

function horeca_rest_productos() {
    // Evita que plugins de caché (LiteSpeed en Hostinger) guarden precios viejos.
    do_action('litespeed_control_set_nocache', 'Horeca: catálogo en vivo');

    $products = wc_get_products([
        'status'  => 'publish',
        'limit'   => -1,
        'orderby' => 'menu_order',
        'order'   => 'ASC',
    ]);

    $out = [];
    foreach ($products as $product) {
        $item = horeca_product_to_app($product);
        if ($item) {
            $out[] = $item;
        }
    }

    $response = rest_ensure_response($out);
    $response->header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
    return $response;
}

/** Convierte un producto de WooCommerce al formato que usa la app. Devuelve null si no está asignado a la app. */
function horeca_product_to_app($product) {
    $id       = $product->get_id();
    $brand    = (string) get_post_meta($id, '_horeca_brand', true);
    $category = (string) get_post_meta($id, '_horeca_category', true);

    if (!isset(horeca_brands()[$brand]) || !isset(horeca_categories()[$category])) {
        return null; // Producto sin marca/categoría Horeca: no se muestra en la app.
    }
    if ($product->get_catalog_visibility() === 'hidden') {
        return null;
    }

    $app_id = (string) get_post_meta($id, '_horeca_id', true);
    if ($app_id === '') {
        $app_id = 'wc-' . $id;
    }

    $description = $product->get_description();
    if (trim($description) === '') {
        $description = $product->get_short_description();
    }
    $description = trim(preg_replace('/\s+/', ' ', wp_strip_all_tags($description)));

    // Imagen principal: la de WooCommerce; si no hay, la URL guardada.
    $image = '';
    if ($product->get_image_id()) {
        $image = (string) wp_get_attachment_image_url($product->get_image_id(), 'large');
    }
    if ($image === '') {
        $image = (string) get_post_meta($id, '_horeca_image_url', true);
    }

    // Galería: la de WooCommerce; si no hay, las URLs guardadas.
    $gallery = [];
    foreach ($product->get_gallery_image_ids() as $img_id) {
        $url = wp_get_attachment_image_url($img_id, 'large');
        if ($url) {
            $gallery[] = $url;
        }
    }
    if (!$gallery) {
        $gallery = array_values(array_filter((array) get_post_meta($id, '_horeca_gallery_urls', true)));
    }
    if ($image !== '' && !in_array($image, $gallery, true)) {
        array_unshift($gallery, $image);
    }

    $rating = get_post_meta($id, '_horeca_rating', true);
    $rental = get_post_meta($id, '_horeca_rental_price', true);

    $item = [
        'id'          => $app_id,
        'wcId'        => $id,
        'brand'       => $brand,
        'category'    => $category,
        'name'        => $product->get_name(),
        'description' => $description,
        'price'       => (float) ($product->get_price() !== '' ? $product->get_price() : 0),
        'regularPrice' => ($product->is_on_sale() && (float) $product->get_regular_price() > (float) $product->get_price())
            ? (float) $product->get_regular_price()
            : null,
        'specs'       => array_values(array_filter(array_map('strval', (array) get_post_meta($id, '_horeca_specs', true)))),
        'features'    => horeca_clean_features(get_post_meta($id, '_horeca_features', true)),
        'rating'      => $rating !== '' ? (float) $rating : 4.5,
        'image'       => $image,
        'gallery'     => array_values($gallery),
        'permalink'   => get_permalink($id),
        'inStock'     => $product->is_in_stock(),
    ];
    if ($item['regularPrice'] === null) {
        unset($item['regularPrice']);
    }
    if ($rental !== '' && (float) $rental > 0) {
        $item['rentalPrice'] = (float) $rental;
    }

    $cap_max = (int) get_post_meta($id, '_horeca_cap_max', true);
    if ($cap_max > 0) {
        $item['dailyCapacity'] = [
            'comfortMin' => (int) get_post_meta($id, '_horeca_cap_comfort_min', true),
            'comfortMax' => (int) get_post_meta($id, '_horeca_cap_comfort_max', true),
            'max'        => $cap_max,
            'idealFor'   => (string) get_post_meta($id, '_horeca_cap_ideal', true),
        ];
    }

    return apply_filters('horeca_product_to_app', $item, $product);
}

function horeca_clean_features($features) {
    $out = [];
    foreach ((array) $features as $f) {
        if (is_array($f) && isset($f['label'], $f['value']) && $f['label'] !== '') {
            $out[] = ['label' => (string) $f['label'], 'value' => (string) $f['value']];
        }
    }
    return $out;
}

/* -------------------------------------------------------------------------
 * Caja "Datos para la app Horeca" en la edición del producto
 * ---------------------------------------------------------------------- */
add_action('add_meta_boxes_product', function () {
    add_meta_box('horeca_datos', 'Datos para la app Horeca', 'horeca_render_metabox', 'product', 'normal', 'high');
});

function horeca_render_metabox($post) {
    wp_nonce_field('horeca_guardar_datos', 'horeca_nonce');

    $brand    = get_post_meta($post->ID, '_horeca_brand', true);
    $category = get_post_meta($post->ID, '_horeca_category', true);
    $rating   = get_post_meta($post->ID, '_horeca_rating', true);
    $rental   = get_post_meta($post->ID, '_horeca_rental_price', true);
    $specs    = implode("\n", (array) get_post_meta($post->ID, '_horeca_specs', true));
    $features = implode("\n", array_map(function ($f) {
        return $f['label'] . ' | ' . $f['value'];
    }, horeca_clean_features(get_post_meta($post->ID, '_horeca_features', true))));
    $image    = get_post_meta($post->ID, '_horeca_image_url', true);
    $gallery  = implode("\n", (array) get_post_meta($post->ID, '_horeca_gallery_urls', true));
    $app_id   = get_post_meta($post->ID, '_horeca_id', true);
    $cap_min  = get_post_meta($post->ID, '_horeca_cap_comfort_min', true);
    $cap_cmax = get_post_meta($post->ID, '_horeca_cap_comfort_max', true);
    $cap_max  = get_post_meta($post->ID, '_horeca_cap_max', true);
    $cap_idea = get_post_meta($post->ID, '_horeca_cap_ideal', true);
    $src      = function_exists('horeca_product_source') ? horeca_product_source($post->ID) : null;
    $src_store_meta = get_post_meta($post->ID, '_horeca_source_store', true);
    $src_store = $src_store_meta !== '' ? $src_store_meta : ($src['store'] ?? '');
    $src_sku   = get_post_meta($post->ID, '_horeca_source_sku', true) ?: ($src['sku'] ?? '');
    $manual    = get_post_meta($post->ID, '_horeca_price_manual', true) === '1';
    ?>
    <p style="margin-top:0">El producto aparece en la app solo si tiene <strong>Marca</strong> y <strong>Tipo de equipo</strong>. El nombre, el precio, la descripción y las imágenes se toman de los campos normales de WooCommerce.</p>
    <table class="form-table" role="presentation">
        <tr>
            <th><label for="horeca_brand">Marca</label></th>
            <td>
                <select name="horeca_brand" id="horeca_brand">
                    <option value="">— No mostrar en la app —</option>
                    <?php foreach (horeca_brands() as $key => $label) : ?>
                        <option value="<?php echo esc_attr($key); ?>" <?php selected($brand, $key); ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
                <p class="description">Artiq aparece en el mundo de frío; las demás marcas en el mundo café (Barístico).</p>
            </td>
        </tr>
        <tr>
            <th><label for="horeca_category">Tipo de equipo</label></th>
            <td>
                <select name="horeca_category" id="horeca_category">
                    <option value="">— Elegir —</option>
                    <?php foreach (horeca_categories() as $key => $label) : ?>
                        <option value="<?php echo esc_attr($key); ?>" <?php selected($category, $key); ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
            </td>
        </tr>
        <tr>
            <th><label for="horeca_rating">Calificación (1 a 5)</label></th>
            <td><input type="number" step="0.1" min="1" max="5" name="horeca_rating" id="horeca_rating" value="<?php echo esc_attr($rating !== '' ? $rating : '4.5'); ?>" class="small-text"></td>
        </tr>
        <tr>
            <th><label for="horeca_rental_price">Precio de renta (opcional)</label></th>
            <td><input type="number" step="1" min="0" name="horeca_rental_price" id="horeca_rental_price" value="<?php echo esc_attr($rental); ?>" class="regular-text"></td>
        </tr>
        <tr>
            <th><label for="horeca_specs">Ficha técnica</label></th>
            <td>
                <textarea name="horeca_specs" id="horeca_specs" rows="8" class="large-text"><?php echo esc_textarea($specs); ?></textarea>
                <p class="description">Una especificación por línea. Ejemplo: <code>Voltaje: 110 V / 60 Hz</code></p>
            </td>
        </tr>
        <tr>
            <th><label for="horeca_features">Características destacadas</label></th>
            <td>
                <textarea name="horeca_features" id="horeca_features" rows="6" class="large-text"><?php echo esc_textarea($features); ?></textarea>
                <p class="description">Una por línea, con el formato <code>Título | Descripción</code></p>
            </td>
        </tr>
        <tr>
            <th><label for="horeca_image_url">URL de imagen (respaldo)</label></th>
            <td>
                <input type="url" name="horeca_image_url" id="horeca_image_url" value="<?php echo esc_attr($image); ?>" class="large-text">
                <p class="description">Solo se usa si el producto no tiene "Imagen del producto" en WooCommerce.</p>
            </td>
        </tr>
        <tr>
            <th><label for="horeca_gallery_urls">URLs de galería (respaldo)</label></th>
            <td>
                <textarea name="horeca_gallery_urls" id="horeca_gallery_urls" rows="4" class="large-text"><?php echo esc_textarea($gallery); ?></textarea>
                <p class="description">Una URL por línea. Solo se usa si el producto no tiene "Galería del producto" en WooCommerce.</p>
            </td>
        </tr>
        <tr>
            <th>Capacidad diaria (cafeteras)</th>
            <td>
                Uso cómodo de
                <input type="number" min="0" step="1" name="horeca_cap_comfort_min" value="<?php echo esc_attr($cap_min); ?>" class="small-text">
                a
                <input type="number" min="0" step="1" name="horeca_cap_comfort_max" value="<?php echo esc_attr($cap_cmax); ?>" class="small-text">
                cafés/día · Máximo
                <input type="number" min="0" step="1" name="horeca_cap_max" value="<?php echo esc_attr($cap_max); ?>" class="small-text">
                <p><input type="text" name="horeca_cap_ideal" value="<?php echo esc_attr($cap_idea); ?>" class="large-text" placeholder="Ideal para… (ej. Cafetería mediana o de alto flujo)"></p>
                <p class="description">Solo para cafeteras. El simulador de rentabilidad no deja pasar del máximo. Déjalo vacío si no aplica.</p>
            </td>
        </tr>
        <tr>
            <th>Sincronización de precio</th>
            <td>
                <select name="horeca_source_store">
                    <option value="none" <?php selected($src_store === 'none' || $src_store === ''); ?>>— No sincronizar —</option>
                    <?php foreach (horeca_price_sources() as $key => $s) : ?>
                        <option value="<?php echo esc_attr($key); ?>" <?php selected($src_store, $key); ?>><?php echo esc_html($s['label']); ?></option>
                    <?php endforeach; ?>
                </select>
                SKU en la tienda
                <input type="text" name="horeca_source_sku" value="<?php echo esc_attr($src_sku); ?>" class="regular-text" placeholder="Ej. MAQ0089">
                <p><label><input type="checkbox" name="horeca_price_manual" value="1" <?php checked($manual); ?>> <strong>Precio manual</strong>: no actualizar este precio con la tienda</label></p>
                <p class="description">Cada día se copian el precio full y el precio con descuento de la tienda elegida, buscando por SKU.</p>
            </td>
        </tr>
        <?php if ($app_id) : ?>
        <tr>
            <th>ID en la app</th>
            <td><code><?php echo esc_html($app_id); ?></code></td>
        </tr>
        <?php endif; ?>
    </table>
    <?php
}

add_action('save_post_product', function ($post_id) {
    if (!isset($_POST['horeca_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['horeca_nonce'])), 'horeca_guardar_datos')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $brand    = sanitize_key(wp_unslash($_POST['horeca_brand'] ?? ''));
    $category = sanitize_key(wp_unslash($_POST['horeca_category'] ?? ''));
    update_post_meta($post_id, '_horeca_brand', isset(horeca_brands()[$brand]) ? $brand : '');
    update_post_meta($post_id, '_horeca_category', isset(horeca_categories()[$category]) ? $category : '');

    $rating = (float) ($_POST['horeca_rating'] ?? 4.5);
    update_post_meta($post_id, '_horeca_rating', max(1, min(5, $rating)));

    $rental = sanitize_text_field(wp_unslash($_POST['horeca_rental_price'] ?? ''));
    update_post_meta($post_id, '_horeca_rental_price', $rental === '' ? '' : (float) $rental);

    $lines = function ($key) {
        $raw = (string) wp_unslash($_POST[$key] ?? '');
        return array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $raw))));
    };

    update_post_meta($post_id, '_horeca_specs', array_map('sanitize_text_field', $lines('horeca_specs')));

    $features = [];
    foreach ($lines('horeca_features') as $line) {
        $parts = array_map('trim', explode('|', $line, 2));
        if ($parts[0] !== '') {
            $features[] = [
                'label' => sanitize_text_field($parts[0]),
                'value' => sanitize_text_field($parts[1] ?? ''),
            ];
        }
    }
    update_post_meta($post_id, '_horeca_features', $features);

    foreach (['comfort_min', 'comfort_max', 'max'] as $k) {
        $v = sanitize_text_field(wp_unslash($_POST['horeca_cap_' . $k] ?? ''));
        update_post_meta($post_id, '_horeca_cap_' . $k, $v === '' ? '' : max(0, (int) $v));
    }
    update_post_meta($post_id, '_horeca_cap_ideal', sanitize_text_field(wp_unslash($_POST['horeca_cap_ideal'] ?? '')));

    $store = sanitize_key(wp_unslash($_POST['horeca_source_store'] ?? 'none'));
    update_post_meta($post_id, '_horeca_source_store', (function_exists('horeca_price_sources') && isset(horeca_price_sources()[$store])) ? $store : 'none');
    update_post_meta($post_id, '_horeca_source_sku', sanitize_text_field(wp_unslash($_POST['horeca_source_sku'] ?? '')));
    update_post_meta($post_id, '_horeca_price_manual', !empty($_POST['horeca_price_manual']) ? '1' : '');

    update_post_meta($post_id, '_horeca_image_url', esc_url_raw(wp_unslash($_POST['horeca_image_url'] ?? '')));
    update_post_meta($post_id, '_horeca_gallery_urls', array_values(array_filter(array_map('esc_url_raw', $lines('horeca_gallery_urls')))));
});
