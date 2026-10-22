<?php
/**
 * Importa el catálogo original de la app (data/productos-iniciales.json) a WooCommerce.
 */
if (!defined('ABSPATH')) {
    exit;
}

/** Busca un producto de WooCommerce por el ID que usa la app. */
function horeca_find_product_by_app_id($app_id) {
    $ids = get_posts([
        'post_type'      => 'product',
        'post_status'    => ['publish', 'draft', 'pending', 'private'],
        'meta_key'       => '_horeca_id',
        'meta_value'     => $app_id,
        'fields'         => 'ids',
        'posts_per_page' => 1,
        'no_found_rows'  => true,
    ]);
    return $ids ? (int) $ids[0] : 0;
}

/** Devuelve (y crea si hace falta) la categoría de WooCommerce para un tipo de equipo. */
function horeca_get_wc_category_id($category) {
    $name = horeca_categories()[$category] ?? '';
    if ($name === '') {
        return 0;
    }
    $term = get_term_by('name', $name, 'product_cat');
    if ($term) {
        return (int) $term->term_id;
    }
    $created = wp_insert_term($name, 'product_cat');
    return is_wp_error($created) ? 0 : (int) $created['term_id'];
}

/** Descarga una imagen externa a la biblioteca de medios. Devuelve el ID o 0. */
function horeca_sideload_image($url, $post_id, $title) {
    if (!$url) {
        return 0;
    }
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $id = media_sideload_image($url, $post_id, $title, 'id');
    return is_wp_error($id) ? 0 : (int) $id;
}

/**
 * Ejecuta la importación.
 *
 * @param bool $overwrite     Sobrescribir productos que ya existen (pierde los cambios hechos en WooCommerce).
 * @param bool $download_imgs Descargar la imagen principal a la biblioteca de medios.
 * @return array{created:int,updated:int,skipped:int,images:int,errors:string[]}
 */
function horeca_run_import($overwrite = false, $download_imgs = true) {
    $result = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'images' => 0, 'errors' => []];

    $file = HORECA_PATH . 'data/productos-iniciales.json';
    if (!file_exists($file)) {
        $result['errors'][] = 'No se encontró el archivo data/productos-iniciales.json dentro del plugin.';
        return $result;
    }
    $items = json_decode((string) file_get_contents($file), true);
    if (!is_array($items)) {
        $result['errors'][] = 'El archivo de productos no es válido.';
        return $result;
    }

    if (function_exists('set_time_limit')) {
        @set_time_limit(600); // phpcs:ignore WordPress.PHP.NoSilencedErrors
    }
    wp_raise_memory_limit('admin');

    foreach ($items as $index => $item) {
        $app_id = isset($item['id']) ? sanitize_key($item['id']) : '';
        if ($app_id === '' || empty($item['name'])) {
            continue;
        }

        $existing_id = horeca_find_product_by_app_id($app_id);
        if ($existing_id && !$overwrite) {
            $result['skipped']++;
            continue;
        }

        try {
            $product = $existing_id ? wc_get_product($existing_id) : new WC_Product_Simple();
            if (!$product) {
                $product = new WC_Product_Simple();
            }

            $product->set_name(sanitize_text_field($item['name']));
            $product->set_description(wp_kses_post($item['description'] ?? ''));
            $product->set_regular_price((string) (float) ($item['price'] ?? 0));
            $product->set_status('publish');
            $product->set_catalog_visibility('visible');
            $product->set_menu_order((int) $index);

            $cat_id = horeca_get_wc_category_id($item['category'] ?? '');
            if ($cat_id) {
                $product->set_category_ids([$cat_id]);
            }

            // SKU a partir de "Referencia: XXX" en la ficha técnica.
            if (!$product->get_sku()) {
                foreach ((array) ($item['specs'] ?? []) as $spec) {
                    if (preg_match('/Referencia:\s*([A-Za-z0-9\-_.]+)/u', (string) $spec, $m)) {
                        try {
                            $product->set_sku($m[1]);
                        } catch (Exception $e) {
                            // SKU repetido: se deja sin SKU.
                        }
                        break;
                    }
                }
            }

            $post_id = $product->save();

            update_post_meta($post_id, '_horeca_id', $app_id);
            update_post_meta($post_id, '_horeca_brand', sanitize_key($item['brand'] ?? ''));
            update_post_meta($post_id, '_horeca_category', sanitize_key($item['category'] ?? ''));
            update_post_meta($post_id, '_horeca_rating', (float) ($item['rating'] ?? 4.5));
            update_post_meta($post_id, '_horeca_rental_price', isset($item['rentalPrice']) ? (float) $item['rentalPrice'] : '');
            update_post_meta($post_id, '_horeca_specs', array_map('sanitize_text_field', (array) ($item['specs'] ?? [])));
            update_post_meta($post_id, '_horeca_features', horeca_clean_features($item['features'] ?? []));
            $cap = isset($item['dailyCapacity']) && is_array($item['dailyCapacity']) ? $item['dailyCapacity'] : [];
            update_post_meta($post_id, '_horeca_cap_comfort_min', isset($cap['comfortMin']) ? (int) $cap['comfortMin'] : '');
            update_post_meta($post_id, '_horeca_cap_comfort_max', isset($cap['comfortMax']) ? (int) $cap['comfortMax'] : '');
            update_post_meta($post_id, '_horeca_cap_max', isset($cap['max']) ? (int) $cap['max'] : '');
            update_post_meta($post_id, '_horeca_cap_ideal', sanitize_text_field($cap['idealFor'] ?? ''));
            update_post_meta($post_id, '_horeca_image_url', esc_url_raw($item['image'] ?? ''));
            update_post_meta($post_id, '_horeca_gallery_urls', array_values(array_filter(array_map('esc_url_raw', (array) ($item['gallery'] ?? [])))));

            if ($download_imgs && !$product->get_image_id() && !empty($item['image'])) {
                $img_id = horeca_sideload_image(esc_url_raw($item['image']), $post_id, $item['name']);
                if ($img_id) {
                    $product->set_image_id($img_id);
                    $product->save();
                    $result['images']++;
                }
            }

            $existing_id ? $result['updated']++ : $result['created']++;
        } catch (Exception $e) {
            $result['errors'][] = sprintf('%s: %s', $item['name'], $e->getMessage());
        }
    }

    update_option('horeca_imported_at', time());
    return $result;
}
