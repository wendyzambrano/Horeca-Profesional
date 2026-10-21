<?php
/**
 * Plantilla "Horeca – Pantalla completa": solo la app, sin cabecera ni pie del tema.
 */
if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
    <style>
        body.horeca-pantalla-completa { margin: 0; padding: 0; }
        body.horeca-pantalla-completa .entry-content > *:not(#horeca-root) { max-width: none; }
    </style>
</head>
<body <?php body_class('horeca-pantalla-completa'); ?>>
<?php
if (function_exists('wp_body_open')) {
    wp_body_open();
}

while (have_posts()) {
    the_post();
    $content = get_the_content();
    // Si la página no tiene el shortcode, la app se muestra igual.
    if (!has_shortcode($content, 'horeca_app')) {
        echo do_shortcode('[horeca_app]'); // phpcs:ignore WordPress.Security.EscapeOutput
    } else {
        the_content();
    }
}

wp_footer();
?>
</body>
</html>
