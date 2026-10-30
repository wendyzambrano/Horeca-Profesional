<?php
/**
 * Descarga de "Solicitudes Horeca" en Excel (.xlsx).
 *
 * - Botón "Descargar Excel" en la lista de solicitudes, con rango de fechas opcional.
 * - Acción en lote "Descargar en Excel" para exportar solo las solicitudes marcadas.
 * - El archivo trae dos hojas: "Solicitudes" (una fila por solicitud) y
 *   "Productos" (una fila por cada equipo pedido).
 */

if (!defined('ABSPATH')) {
    exit;
}

/* -------------------------------------------------------------------------
 * Botón en la lista de solicitudes
 * ---------------------------------------------------------------------- */
add_action('manage_posts_extra_tablenav', function ($which) {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if ($which !== 'top' || !$screen || $screen->post_type !== HORECA_CPT_SOLICITUD || !current_user_can('edit_posts')) {
        return;
    }
    $url = wp_nonce_url(admin_url('admin-post.php?action=horeca_export_solicitudes'), 'horeca_export_solicitudes');
    ?>
    <div class="alignleft actions horeca-export">
        <label for="horeca-export-desde" class="screen-reader-text">Desde</label>
        <input type="date" id="horeca-export-desde" title="Desde (opcional)">
        <label for="horeca-export-hasta" class="screen-reader-text">Hasta</label>
        <input type="date" id="horeca-export-hasta" title="Hasta (opcional)">
        <a href="<?php echo esc_url($url); ?>" id="horeca-export-btn" class="button button-primary">
            <span class="dashicons dashicons-download" style="vertical-align:text-bottom"></span> Descargar Excel
        </a>
    </div>
    <script>
    (function () {
        var btn = document.getElementById('horeca-export-btn');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var u = new URL(btn.href, window.location.href);
            var d = document.getElementById('horeca-export-desde').value;
            var h = document.getElementById('horeca-export-hasta').value;
            u.searchParams.delete('desde'); u.searchParams.delete('hasta');
            if (d) u.searchParams.set('desde', d);
            if (h) u.searchParams.set('hasta', h);
            btn.href = u.toString();
        });
    })();
    </script>
    <?php
});

/* Acción en lote: exportar solo las marcadas */
add_filter('bulk_actions-edit-' . HORECA_CPT_SOLICITUD, function ($actions) {
    $actions['horeca_export_xlsx'] = 'Descargar en Excel';
    return $actions;
});

add_filter('handle_bulk_actions-edit-' . HORECA_CPT_SOLICITUD, function ($redirect, $action, $ids) {
    if ($action !== 'horeca_export_xlsx' || !current_user_can('edit_posts')) {
        return $redirect;
    }
    horeca_export_solicitudes_xlsx(['post__in' => array_map('intval', (array) $ids)]);
    exit;
}, 10, 3);

/* Descarga desde el botón */
add_action('admin_post_horeca_export_solicitudes', function () {
    if (!current_user_can('edit_posts')) {
        wp_die('No tienes permiso para descargar las solicitudes.');
    }
    check_admin_referer('horeca_export_solicitudes');

    $args  = [];
    $desde = isset($_GET['desde']) ? sanitize_text_field(wp_unslash($_GET['desde'])) : '';
    $hasta = isset($_GET['hasta']) ? sanitize_text_field(wp_unslash($_GET['hasta'])) : '';
    $range = [];
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $desde)) {
        $range['after'] = $desde . ' 00:00:00';
    }
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $hasta)) {
        $range['before'] = $hasta . ' 23:59:59';
    }
    if ($range) {
        $range['inclusive'] = true;
        $args['date_query'] = [$range];
    }
    horeca_export_solicitudes_xlsx($args, $desde, $hasta);
    exit;
});

/* -------------------------------------------------------------------------
 * Datos
 * ---------------------------------------------------------------------- */
function horeca_export_visitas_por_solicitud() {
    if (!defined('HORECA_CPT_VISITA')) {
        return [];
    }
    $map = [];
    $ids = get_posts([
        'post_type'      => HORECA_CPT_VISITA,
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'meta_key'       => '_v_inicio',
        'orderby'        => 'meta_value',
        'order'          => 'ASC',
    ]);
    $estados = function_exists('horeca_visit_estados') ? horeca_visit_estados() : [];
    foreach ($ids as $vid) {
        $sol = (int) get_post_meta($vid, '_v_solicitud', true);
        if (!$sol) {
            continue;
        }
        $estado = (string) get_post_meta($vid, '_v_estado', true) ?: 'pendiente';
        // Si hay varias, se queda la que no esté cancelada (la más reciente).
        if (isset($map[$sol]) && $estado === 'cancelada') {
            continue;
        }
        $inicio = (string) get_post_meta($vid, '_v_inicio', true); // 'Y-m-d H:i'
        $map[$sol] = [
            'fecha'  => substr($inicio, 0, 10),
            'hora'   => function_exists('horeca_visit_slot_label') ? horeca_visit_slot_label(substr($inicio, 11, 5)) : substr($inicio, 11, 5),
            'estado' => $estados[$estado] ?? ucfirst($estado),
        ];
    }
    return $map;
}

function horeca_export_solicitudes_xlsx($extra_args = [], $desde = '', $hasta = '') {
    $ids = get_posts(array_merge([
        'post_type'      => HORECA_CPT_SOLICITUD,
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'orderby'        => 'date',
        'order'          => 'DESC',
        'fields'         => 'ids',
    ], $extra_args));

    $visitas = horeca_export_visitas_por_solicitud();
    $mails   = ['sent' => 'Enviado', 'off' => 'Desactivado', 'failed' => 'No se pudo enviar'];

    $sol_rows = [[
        'Referencia', 'Fecha', 'Hora', 'Nombre', 'WhatsApp', 'Correo', 'Origen',
        'Productos', 'Cantidad de equipos', 'Total (COP)', 'Correo al cliente',
        'Visita agendada', 'Hora de la visita', 'Estado de la visita',
    ]];
    $prod_rows = [[
        'Referencia', 'Fecha', 'Nombre', 'WhatsApp', 'Correo', 'Marca',
        'Producto', 'Cantidad', 'Precio unitario (COP)', 'Subtotal (COP)',
    ]];

    foreach ($ids as $id) {
        $ref   = (string) get_post_meta($id, '_h_referencia', true) ?: get_the_title($id);
        $fecha = get_post_time('Y-m-d', false, $id);
        $hora  = get_post_time('H:i', false, $id);
        $nom   = (string) get_post_meta($id, '_h_nombre', true);
        $wa    = (string) get_post_meta($id, '_h_whatsapp', true);
        $mail  = (string) get_post_meta($id, '_h_correo', true);
        $items = (array) get_post_meta($id, '_h_items', true);
        $qty   = 0;
        $names = [];
        foreach ($items as $it) {
            if (!is_array($it)) {
                continue;
            }
            $q      = (int) ($it['qty'] ?? 1);
            $qty   += $q;
            $names[] = ($it['name'] ?? '') . ' x' . $q;
            $brand  = ($it['brand'] ?? '') === 'artiq' ? 'Artiq' : (($it['brand'] ?? '') ? 'Barístico' : '');
            $prod_rows[] = [
                $ref, ['date', $fecha], $nom, $wa, $mail, $brand, (string) ($it['name'] ?? ''), $q,
                ['money', (float) ($it['price'] ?? 0)], ['money', (float) ($it['subtotal'] ?? 0)],
            ];
        }
        $v  = $visitas[$id] ?? null;
        $mc = (string) get_post_meta($id, '_h_mail_customer', true);
        $sol_rows[] = [
            $ref, ['date', $fecha], $hora, $nom, $wa, $mail,
            (string) get_post_meta($id, '_h_origen', true) ?: 'Formulario de cotización',
            implode("\n", $names), $qty, ['money', (float) get_post_meta($id, '_h_total', true)],
            $mails[$mc] ?? ($mc ? $mc : ''),
            $v ? ['date', $v['fecha']] : '', $v['hora'] ?? '', $v['estado'] ?? '',
        ];
    }

    $name = 'solicitudes-horeca';
    if ($desde || $hasta) {
        $name .= '-' . ($desde ?: 'inicio') . '-a-' . ($hasta ?: 'hoy');
    } else {
        $name .= '-' . wp_date('Y-m-d');
    }

    $sheets = [
        ['name' => 'Solicitudes', 'rows' => $sol_rows, 'widths' => [22, 12, 8, 24, 16, 30, 22, 50, 12, 16, 18, 14, 22, 18]],
        ['name' => 'Productos', 'rows' => $prod_rows, 'widths' => [22, 12, 24, 16, 30, 12, 48, 10, 20, 18]],
    ];

    if (class_exists('ZipArchive')) {
        $file = horeca_xlsx_build($sheets);
        if ($file) {
            nocache_headers();
            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment; filename="' . $name . '.xlsx"');
            header('Content-Length: ' . filesize($file));
            readfile($file);
            @unlink($file);
            return;
        }
    }

    // Respaldo sin ZipArchive: CSV que Excel abre directamente.
    nocache_headers();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $name . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    foreach ($sol_rows as $row) {
        $flat = array_map(function ($c) {
            $v = is_array($c) ? (string) $c[1] : (string) $c;
            return preg_match('/^[=+\-@]/', $v) ? "'" . $v : $v; // evita fórmulas
        }, $row);
        fputcsv($out, $flat, ';');
    }
    fclose($out);
}

/* -------------------------------------------------------------------------
 * Generador mínimo de .xlsx (sin librerías externas)
 * Celdas: string | int | float | ['money', n] | ['date', 'Y-m-d']
 * ---------------------------------------------------------------------- */
function horeca_xlsx_col($i) {
    $s = '';
    for ($i++; $i > 0; $i = intdiv($i - 1, 26)) {
        $s = chr(65 + (($i - 1) % 26)) . $s;
    }
    return $s;
}

function horeca_xlsx_esc($v) {
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', (string) $v);
    return htmlspecialchars($v, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

function horeca_xlsx_sheet_xml($rows, $widths) {
    $ncols = max(1, count($rows[0] ?? []));
    $last  = horeca_xlsx_col($ncols - 1);
    $xml   = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        . '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
        . '<cols>';
    foreach ($widths as $i => $w) {
        $xml .= '<col min="' . ($i + 1) . '" max="' . ($i + 1) . '" width="' . (float) $w . '" customWidth="1"/>';
    }
    $xml .= '</cols><sheetData>';
    foreach ($rows as $r => $row) {
        $rn   = $r + 1;
        $xml .= '<row r="' . $rn . '">';
        foreach (array_values($row) as $c => $cell) {
            $ref = horeca_xlsx_col($c) . $rn;
            if ($r === 0) {
                $xml .= '<c r="' . $ref . '" t="inlineStr" s="1"><is><t>' . horeca_xlsx_esc($cell) . '</t></is></c>';
            } elseif (is_array($cell) && $cell[0] === 'money') {
                $xml .= '<c r="' . $ref . '" s="2"><v>' . (float) $cell[1] . '</v></c>';
            } elseif (is_array($cell) && $cell[0] === 'date' && preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', (string) $cell[1], $m)) {
                $serial = (int) floor((gmmktime(0, 0, 0, (int) $m[2], (int) $m[3], (int) $m[1]) / 86400) + 25569);
                $xml   .= '<c r="' . $ref . '" s="3"><v>' . $serial . '</v></c>';
            } elseif (is_int($cell) || is_float($cell)) {
                $xml .= '<c r="' . $ref . '" s="4"><v>' . $cell . '</v></c>';
            } else {
                $txt  = is_array($cell) ? (string) ($cell[1] ?? '') : (string) $cell;
                $xml .= '<c r="' . $ref . '" t="inlineStr" s="4"><is><t xml:space="preserve">' . horeca_xlsx_esc($txt) . '</t></is></c>';
            }
        }
        $xml .= '</row>';
    }
    $xml .= '</sheetData>';
    if (count($rows) > 1) {
        $xml .= '<autoFilter ref="A1:' . $last . count($rows) . '"/>';
    }
    $xml .= '</worksheet>';
    return $xml;
}

function horeca_xlsx_build($sheets) {
    $tmp = tempnam(get_temp_dir(), 'horeca');
    if (!$tmp) {
        return false;
    }
    $zip = new ZipArchive();
    if ($zip->open($tmp, ZipArchive::OVERWRITE) !== true) {
        return false;
    }

    $ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        . '<Default Extension="xml" ContentType="application/xml"/>'
        . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>';
    $wb_sheets = '';
    $wb_rels   = '';
    foreach ($sheets as $i => $sh) {
        $n   = $i + 1;
        $ct .= '<Override PartName="/xl/worksheets/sheet' . $n . '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
        $wb_sheets .= '<sheet name="' . horeca_xlsx_esc($sh['name']) . '" sheetId="' . $n . '" r:id="rId' . $n . '"/>';
        $wb_rels   .= '<Relationship Id="rId' . $n . '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' . $n . '.xml"/>';
        $zip->addFromString('xl/worksheets/sheet' . $n . '.xml', horeca_xlsx_sheet_xml($sh['rows'], $sh['widths']));
    }
    $ct .= '</Types>';
    $styles_id = count($sheets) + 1;
    $wb_rels  .= '<Relationship Id="rId' . $styles_id . '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>';

    $zip->addFromString('[Content_Types].xml', $ct);
    $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        . '</Relationships>');
    $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        . '<sheets>' . $wb_sheets . '</sheets></workbook>');
    $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . $wb_rels . '</Relationships>');
    // Estilos: 0 normal · 1 encabezado · 2 pesos · 3 fecha · 4 texto ajustado arriba
    $zip->addFromString('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        . '<numFmts count="2"><numFmt numFmtId="164" formatCode="&quot;$&quot;\ #,##0"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy"/></numFmts>'
        . '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>'
        . '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FF0DA6D8"/><bgColor indexed="64"/></patternFill></fill></fills>'
        . '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
        . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        . '<cellXfs count="5">'
        . '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        . '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>'
        . '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf>'
        . '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="left" vertical="top"/></xf>'
        . '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'
        . '</cellXfs>'
        . '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
        . '</styleSheet>');
    $zip->close();
    return $tmp;
}
