<?php
/**
 * Página de administración: WooCommerce → Horeca App
 */
if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_menu', function () {
    add_submenu_page('woocommerce', 'Universo Horeca – App', 'Horeca App', 'manage_woocommerce', 'horeca-app', 'horeca_render_admin_page');
}, 99);

/** Aviso de bienvenida tras activar el plugin. */
add_action('admin_notices', function () {
    if (!get_option('horeca_show_welcome') || !current_user_can('manage_woocommerce')) {
        return;
    }
    $screen = get_current_screen();
    if ($screen && strpos((string) $screen->id, 'horeca-app') !== false) {
        return;
    }
    echo '<div class="notice notice-info is-dismissible"><p><strong>Universo Horeca:</strong> el plugin está activo. '
        . '<a href="' . esc_url(admin_url('admin.php?page=horeca-app')) . '">Importa los productos y sigue los pasos aquí</a>.</p></div>';
});

/** Procesa el botón "Importar productos". */
add_action('admin_post_horeca_importar', function () {
    if (!current_user_can('manage_woocommerce')) {
        wp_die('No tienes permiso para hacer esto.');
    }
    check_admin_referer('horeca_importar');

    $result = horeca_run_import(!empty($_POST['overwrite']), !empty($_POST['download_images']));
    set_transient('horeca_import_result_' . get_current_user_id(), $result, 5 * MINUTE_IN_SECONDS);
    delete_option('horeca_show_welcome');

    wp_safe_redirect(admin_url('admin.php?page=horeca-app&importado=1'));
    exit;
});

/** Procesa el botón "Crear la página de la app y ponerla como inicio". */
add_action('admin_post_horeca_crear_pagina', function () {
    if (!current_user_can('manage_options')) {
        wp_die('No tienes permiso para hacer esto.');
    }
    check_admin_referer('horeca_crear_pagina');

    $page_id = (int) get_option('horeca_app_page_id');
    $page    = $page_id ? get_post($page_id) : null;

    if (!$page || $page->post_type !== 'page' || $page->post_status === 'trash') {
        $page_id = wp_insert_post([
            'post_type'    => 'page',
            'post_title'   => 'Horeca Profesional',
            'post_name'    => 'horeca-profesional',
            'post_status'  => 'publish',
            'post_content' => '<!-- wp:shortcode -->[horeca_app]<!-- /wp:shortcode -->',
        ]);
    } else {
        wp_update_post(['ID' => $page_id, 'post_status' => 'publish']);
    }

    if ($page_id && !is_wp_error($page_id)) {
        update_post_meta($page_id, '_wp_page_template', HORECA_TEMPLATE);
        update_option('horeca_app_page_id', (int) $page_id);
        if (!empty($_POST['portada'])) {
            update_option('show_on_front', 'page');
            update_option('page_on_front', (int) $page_id);
        }
        do_action('litespeed_purge_all');
    }

    wp_safe_redirect(admin_url('admin.php?page=horeca-app&pagina=1'));
    exit;
});

function horeca_count_app_products() {
    $q = new WP_Query([
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'meta_query'     => [[
            'key'     => '_horeca_brand',
            'value'   => array_keys(horeca_brands()),
            'compare' => 'IN',
        ]],
    ]);
    return (int) $q->found_posts;
}

function horeca_render_admin_page() {
    if (!current_user_can('manage_woocommerce')) {
        return;
    }

    $result = null;
    if (!empty($_GET['importado'])) {
        $result = get_transient('horeca_import_result_' . get_current_user_id());
        delete_transient('horeca_import_result_' . get_current_user_id());
    }

    $count      = horeca_count_app_products();
    $json       = HORECA_PATH . 'data/productos-iniciales.json';
    $initial    = file_exists($json) ? count((array) json_decode((string) file_get_contents($json), true)) : 0;
    $build_ok   = file_exists(HORECA_PATH . 'build/app.js');
    $pages      = get_pages(['meta_key' => '_wp_page_template', 'meta_value' => HORECA_TEMPLATE]);
    $api_url    = rest_url('horeca/v1/productos');
    ?>
    <div class="wrap">
        <h1>Universo Horeca – App</h1>

        <?php if ($result) : ?>
            <div class="notice notice-<?php echo $result['errors'] ? 'warning' : 'success'; ?>">
                <p><strong>Importación terminada:</strong>
                    <?php echo (int) $result['created']; ?> creados,
                    <?php echo (int) $result['updated']; ?> actualizados,
                    <?php echo (int) $result['skipped']; ?> ya existían (no se tocaron),
                    <?php echo (int) $result['images']; ?> imágenes descargadas.</p>
                <?php foreach ($result['errors'] as $err) : ?>
                    <p>⚠️ <?php echo esc_html($err); ?></p>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <?php if (!$build_ok) : ?>
            <div class="notice notice-error"><p>Falta la carpeta <code>build</code> del plugin. Vuelve a subir el .zip completo.</p></div>
        <?php endif; ?>

        <h2>Estado</h2>
        <table class="widefat striped" style="max-width:720px">
            <tbody>
                <tr><td>Productos de WooCommerce visibles en la app</td><td><strong><?php echo (int) $count; ?></strong></td></tr>
                <tr><td>Productos en el catálogo original de la app</td><td><?php echo (int) $initial; ?></td></tr>
                <tr><td>Páginas con la plantilla "Horeca – Pantalla completa"</td><td>
                    <?php if ($pages) : ?>
                        <?php foreach ($pages as $p) : ?>
                            <a href="<?php echo esc_url(get_permalink($p)); ?>" target="_blank"><?php echo esc_html($p->post_title); ?></a><br>
                        <?php endforeach; ?>
                    <?php else : ?>
                        Ninguna todavía (ver paso 2)
                    <?php endif; ?>
                </td></tr>
                <tr><td>Datos que lee la app</td><td><a href="<?php echo esc_url($api_url); ?>" target="_blank"><?php echo esc_html($api_url); ?></a></td></tr>
            </tbody>
        </table>

        <h2>Paso 1 · Importar los productos de la app a WooCommerce</h2>
        <p>Crea en WooCommerce los <?php echo (int) $initial; ?> productos que trae la app, con su precio, descripción, ficha técnica e imágenes.
           Solo hace falta hacerlo <strong>una vez</strong>. Después, todo se edita desde <em>Productos</em>.</p>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <?php wp_nonce_field('horeca_importar'); ?>
            <input type="hidden" name="action" value="horeca_importar">
            <p><label><input type="checkbox" name="download_images" value="1" checked> Descargar la imagen principal de cada producto a la biblioteca de medios (tarda 1–2 minutos)</label></p>
            <p><label><input type="checkbox" name="overwrite" value="1"> Sobrescribir productos que ya fueron importados <em>(se pierden los cambios hechos en WooCommerce)</em></label></p>
            <?php submit_button('Importar productos', 'primary', 'submit', false); ?>
        </form>

        <h2>Paso 2 · Mostrar la app en una página</h2>
        <?php
        $app_page_id = (int) get_option('horeca_app_page_id');
        $app_page    = $app_page_id ? get_post($app_page_id) : null;
        if (!empty($_GET['pagina']) && $app_page) : ?>
            <div class="notice notice-success inline"><p>Listo. La app está en
                <a href="<?php echo esc_url(get_permalink($app_page)); ?>" target="_blank"><strong><?php echo esc_html(get_permalink($app_page)); ?></strong></a>
                <?php if ((int) get_option('page_on_front') === $app_page_id && get_option('show_on_front') === 'page') : ?>
                    y es la página de inicio: <a href="<?php echo esc_url(home_url('/')); ?>" target="_blank"><?php echo esc_html(home_url('/')); ?></a>
                <?php endif; ?>
            </p></div>
        <?php endif; ?>
        <p><strong>Forma rápida (recomendada):</strong> un clic crea la página de la app a pantalla completa.</p>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <?php wp_nonce_field('horeca_crear_pagina'); ?>
            <input type="hidden" name="action" value="horeca_crear_pagina">
            <p><label><input type="checkbox" name="portada" value="1" checked> Ponerla como página de inicio del sitio</label></p>
            <?php submit_button($app_page ? 'Actualizar la página de la app' : 'Crear la página de la app', 'primary', 'submit', false); ?>
        </form>
        <p style="margin-top:1.5em"><strong>Forma manual</strong> (temas clásicos):</p>
        <ol>
            <li>Ve a <a href="<?php echo esc_url(admin_url('post-new.php?post_type=page')); ?>">Páginas → Añadir nueva</a>.</li>
            <li>Ponle un título (por ejemplo <em>Inicio</em>).</li>
            <li>En la barra derecha, en <strong>Plantilla</strong>, elige <strong>Horeca – Pantalla completa</strong>. Así la app ocupa toda la pantalla sin el menú del tema.</li>
            <li>Publica la página.</li>
            <li>Opcional: para que sea la página principal, ve a <a href="<?php echo esc_url(admin_url('options-reading.php')); ?>">Ajustes → Lectura</a> → <em>Una página estática</em> y elígela.</li>
        </ol>
        <p>¿Prefieres la app dentro de una página normal del tema? Escribe el shortcode <code>[horeca_app]</code> en un bloque "Shortcode".</p>

        <?php horeca_render_email_settings(); ?>

        <h2>Cómo funciona la sincronización</h2>
        <ul style="list-style:disc;padding-left:20px">
            <li>La app lee los productos de WooCommerce cada vez que alguien abre la página.</li>
            <li>Si cambias en WooCommerce el <strong>nombre, precio, descripción o fotos</strong>, se ve en la app al recargar.</li>
            <li>Para que un producto <strong>nuevo</strong> aparezca en la app, en su edición llena la caja <strong>Datos para la app Horeca</strong> (Marca y Tipo de equipo).</li>
            <li>Para quitar un producto de la app: pásalo a borrador, a la papelera, o deja la Marca en "No mostrar en la app".</li>
        </ul>
    </div>
    <?php
}
