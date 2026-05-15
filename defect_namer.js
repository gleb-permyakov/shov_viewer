function process_defects(arr_abbr, arr_defects) {
    pora = {}

    treshina = {}
    treshina_vdol_shva = {}
    treshina_poperek_shva = {}
    treshina_razvetvl = {}

    neprovar = {}
    neprovar_v_korne = {}
    neprovar_mezh_valikami = {}
    neprovar_po_razdelke = {}

    shlak = {}
    volfram = {}
    okis = {}
    vogn_koren = {}
    vipukl_koren = {}
    podrez = {}
    kromki = {}

    arr_defects.forEach(defect => {
        sizes = defect[1]
        name = defect[3]
        // поры
        if (name == "Пора") {
            d = Math.max(sizes[0], sizes[1])
            d = normalize_mm(d)
            abbr = "" + d
            if (!pora[abbr]) {
                pora[abbr] = 1
            } else {
                pora[abbr] += 1
            }
        }
        // трещины
        if (name == "Трещина") {
            d = Math.max(sizes[0], sizes[1])
            d = normalize_mm(d)
            abbr = "" + d
            if (!pora[abbr]) {
                pora[abbr] = 1
            } else {
                pora[abbr] += 1
            }
        }
        if (name == "Шлаковые включения") {
            d_len = normalize_mm(sizes[0])
            d_width = normalize_mm(sizes[1])
            abbr = "" + Math.max(d_len, d_width) + " × " + Math.min(d_len, d_width)
            if (!shlak[abbr]) {
                shlak[abbr] = 1
            } else {
                shlak[abbr] += 1
            }
        }
    });
    // фильтруем записи по порам
    for (let key of Object.keys(pora)) {
        arr_defects_add.push((pora[key] + "П" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по шлаковым включениям
    for (let key of Object.keys(shlak)) {
        arr_defects_add.push((shlak[key] + "Ш" + key).replaceAll(".", ",").replace("1", ""))
    }
}