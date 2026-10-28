<?php
/**
 * Plugin Name:       Universo Horeca – App
 * Description:       Integra la app Universo Horeca (creada en Google AI Studio) en WordPress y la sincroniza con los productos de WooCommerce. Usa el shortcode [horeca_app].
 * Version:           1.5.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Requires Plugins:  woocommerce
 * Author:            Horeca Profesional
 * Text Domain:       horeca-profesional
 */

if (!defined('ABSPATH')) {
    exit;
}

define('HORECA_VERSION', '1.5.0');
define('HORECA_FILE', __FILE__);
define('HORECA_PATH', plugin_dir_path(__FILE__));
define('HORECA_URL', plugin_dir_url(__FILE__));
define('HORECA_TEMPLATE', 'horeca-pantalla-completa');

/** Marcas y categorías que entiende la app. */
function horeca_brands() {
    return [
        'artiq'     => 'Artiq',
        'baristico' => 'Barístico',
        'carimali'  => 'Carimali',
        'bellezza'  => 'Bellezza',
        'eureka'    => 'Eureka',
    ];
}

function horeca_categories() {
    return [
        'granizadora' => 'Granizadoras',
        'hielo'       => 'Máquinas de hielo',
        'dispensador' => 'Dispensadores de bebidas',
        'cafe'        => 'Cafeteras espresso',
        'molino'      => 'Molinos de café',
    ];
}

require_once HORECA_PATH . 'includes/productos.php';
require_once HORECA_PATH . 'includes/importar.php';
require_once HORECA_PATH . 'includes/admin.php';
require_once HORECA_PATH . 'includes/solicitudes.php';
require_once HORECA_PATH . 'includes/sincronizar.php';
require_once HORECA_PATH . 'includes/visitas.php';

/* -------------------------------------------------------------------------
 * Compatibilidad con WooCommerce (HPOS)
 * ---------------------------------------------------------------------- */
add_action('before_woocommerce_init', function () {
    if (class_exists('\Automattic\WooCommerce\Utilities\FeaturesUtil')) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', HORECA_FILE, true);
    }
});

/* -------------------------------------------------------------------------
 * Carga de la app (JS + CSS)
 * ---------------------------------------------------------------------- */
function horeca_enqueue_app() {
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;

    $js  = HORECA_PATH . 'build/app.js';
    $css = HORECA_PATH . 'build/app.css';

    if (file_exists($css)) {
        wp_enqueue_style('horeca-app', HORECA_URL . 'build/app.css', [], (string) filemtime($css));
    }
    if (file_exists($js)) {
        wp_enqueue_script('horeca-app', HORECA_URL . 'build/app.js', [], (string) filemtime($js), true);
        wp_add_inline_script(
            'horeca-app',
            'window.HORECA_WP = ' . wp_json_encode([
                'restUrl' => esc_url_raw(rest_url('horeca/v1/')),
                'siteUrl' => esc_url_raw(home_url('/')),
            ]) . ';',
            'before'
        );
    }
}

/** Si la página tiene el shortcode, carga los archivos desde el <head> (evita parpadeos). */
add_action('wp_enqueue_scripts', function () {
    if (horeca_is_fullscreen_page()) {
        horeca_enqueue_app();
        return;
    }
    if (is_singular()) {
        $post = get_post();
        if ($post && has_shortcode($post->post_content, 'horeca_app')) {
            horeca_enqueue_app();
        }
    }
});

/* -------------------------------------------------------------------------
 * Shortcode [horeca_app]
 * ---------------------------------------------------------------------- */
add_shortcode('horeca_app', function () {
    static $rendered = false;
    if ($rendered) {
        return '<!-- [horeca_app] solo puede usarse una vez por página -->';
    }
    $rendered = true;

    if (!file_exists(HORECA_PATH . 'build/app.js')) {
        return current_user_can('manage_options')
            ? '<p><strong>Universo Horeca:</strong> falta la carpeta <code>build</code> del plugin. Vuelve a subir el plugin completo.</p>'
            : '';
    }

    horeca_enqueue_app();

    return '<div id="horeca-root"><p style="font-family:sans-serif;text-align:center;padding:4rem 1rem;color:#6b7280">Cargando catálogo…</p></div>';
});

/* -------------------------------------------------------------------------
 * Plantilla de página "Horeca – Pantalla completa"
 * Muestra solo la app, sin cabecera, pie ni estilos del tema.
 * ---------------------------------------------------------------------- */
add_filter('theme_page_templates', function ($templates) {
    $templates[HORECA_TEMPLATE] = 'Horeca – Pantalla completa';
    return $templates;
});

function horeca_is_fullscreen_page() {
    if (!is_page()) {
        return false;
    }
    $id = (int) get_queried_object_id();
    // La página creada con el botón del plugin, o cualquier página con la plantilla elegida a mano.
    return ($id && $id === (int) get_option('horeca_app_page_id'))
        || get_page_template_slug($id) === HORECA_TEMPLATE;
}

add_filter('template_include', function ($template) {
    if (horeca_is_fullscreen_page()) {
        return HORECA_PATH . 'templates/pantalla-completa.php';
    }
    return $template;
}, 99);

/**
 * En la plantilla de pantalla completa se quitan los estilos del tema y de WordPress
 * (estilos globales, bloques, etc.). Esos estilos tienen prioridad sobre los de la app
 * y cambiaban colores, por ejemplo el texto del botón "Barístico" en celular.
 */
function horeca_dequeue_foreign_styles() {
    if (!horeca_is_fullscreen_page()) {
        return;
    }
    $keep   = apply_filters('horeca_keep_styles', ['horeca-app', 'admin-bar', 'dashicons']);
    $styles = wp_styles();
    foreach ((array) $styles->queue as $handle) {
        if (!in_array($handle, $keep, true)) {
            wp_dequeue_style($handle);
        }
    }
}
add_action('wp_print_styles', 'horeca_dequeue_foreign_styles', 100);
add_action('wp_print_footer_scripts', 'horeca_dequeue_foreign_styles', 1);

/* Estilos de bloques que WordPress imprime por separado en temas de bloques. */
add_action('wp', function () {
    if (horeca_is_fullscreen_page()) {
        remove_action('wp_head', 'wp_enqueue_stored_styles');
        remove_action('wp_footer', 'wp_enqueue_stored_styles', 1);
        remove_action('wp_head', 'wp_print_auto_sizes_contain_css_fix', 1);
        add_filter('should_load_separate_core_block_assets', '__return_false');
    }
});

/* -------------------------------------------------------------------------
 * Enlace "Configurar" en la lista de plugins
 * ---------------------------------------------------------------------- */
add_filter('plugin_action_links_' . plugin_basename(HORECA_FILE), function ($links) {
    array_unshift($links, '<a href="' . esc_url(admin_url('admin.php?page=horeca-app')) . '">Configurar</a>');
    return $links;
});

register_activation_hook(HORECA_FILE, function () {
    update_option('horeca_show_welcome', 1);
});
