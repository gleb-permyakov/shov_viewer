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
    kromki = {}

    function process_defect(defect_arr, single=true, sizes) {
        if (single) {
            d = Math.max(sizes[0], sizes[1])
            d = normalize_mm(d)
            abbr = "" + d
            if (!defect_arr[abbr]) {
                defect_arr[abbr] = 1
            } else {
                defect_arr[abbr] += 1
            }
        } else {
            d_len = normalize_mm(sizes[0])
            d_width = normalize_mm(sizes[1])
            abbr = "" + Math.max(d_len, d_width) + " × " + Math.min(d_len, d_width)
            if (!defect_arr[abbr]) {
                defect_arr[abbr] = 1
            } else {
                defect_arr[abbr] += 1
            }
        }
    }

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
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!treshina[abbr]) {
                treshina[abbr] = 1
            } else {
                treshina[abbr] += 1
            }
        }
        // трещины вдоль шва
        if (name == "Трещина вдоль шва") {
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!treshina_vdol_shva[abbr]) {
                treshina_vdol_shva[abbr] = 1
            } else {
                treshina_vdol_shva[abbr] += 1
            }
        }
        // трещины поперек шва
        if (name == "Трещина поперек шва") {
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!treshina_poperek_shva[abbr]) {
                treshina_poperek_shva[abbr] = 1
            } else {
                treshina_poperek_shva[abbr] += 1
            }
        }
        // трещины разветвленная
        if (name == "Трещина разветвленная") {
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!treshina_razvetvl[abbr]) {
                treshina_razvetvl[abbr] = 1
            } else {
                treshina_razvetvl[abbr] += 1
            }
        }
        // непровары
        if (name == "Непровар") {
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!neprovar[abbr]) {
                neprovar[abbr] = 1
            } else {
                neprovar[abbr] += 1
            }
        }
        // непровары в корне 
        if (name == "Непровар в корне") {
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!neprovar_v_korne[abbr]) {
                neprovar_v_korne[abbr] = 1
            } else {
                neprovar_v_korne[abbr] += 1
            }
        }
        // непровары между валиками
        if (name == "Непровар между валиками") {
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!neprovar_mezh_valikami[abbr]) {
                neprovar_mezh_valikami[abbr] = 1
            } else {
                neprovar_mezh_valikami[abbr] += 1
            }
        }
        // непровары по разделке
        if (name == "Непровар по разделке") {
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!neprovar_po_razdelke[abbr]) {
                neprovar_po_razdelke[abbr] = 1
            } else {
                neprovar_po_razdelke[abbr] += 1
            }
        }
        // шлаковые включения
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
        // вольфрамовые включения
        if (name == "Вольфрамовые включения") {
            d_len = normalize_mm(sizes[0])
            d_width = normalize_mm(sizes[1])
            abbr = "" + Math.max(d_len, d_width) + " × " + Math.min(d_len, d_width)
            if (!volfram[abbr]) {
                volfram[abbr] = 1
            } else {
                volfram[abbr] += 1
            }
        }
        // окисные включения
        if (name == "Окисные включения") {
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!okis[abbr]) {
                okis[abbr] = 1
            } else {
                okis[abbr] += 1
            }
        }
        // смещение кромок
        if (name == "Смещение кромок") {
            len = Math.max(sizes[0], sizes[1])
            len = normalize_mm(d)
            abbr = "" + len
            if (!kromki[abbr]) {
                kromki[abbr] = 1
            } else {
                kromki[abbr] += 1
            }
        }
    });
    // фильтруем записи по порам
    for (let key of Object.keys(pora)) {
        arr_defects_add.push((pora[key] + "П" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по трещинам
    for (let key of Object.keys(treshina)) {
        arr_defects_add.push((treshina[key] + "Т" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по трещинам вдоль шва
    for (let key of Object.keys(treshina_vdol_shva)) {
        arr_defects_add.push((treshina_vdol_shva[key] + "Тв" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по трещинам поперек шва
    for (let key of Object.keys(treshina_poperek_shva)) {
        arr_defects_add.push((treshina_poperek_shva[key] + "Тп" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по трещинам разветвленным
    for (let key of Object.keys(treshina_razvetvl)) {
        arr_defects_add.push((treshina_razvetvl[key] + "Тр" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по непроварам
    for (let key of Object.keys(neprovar)) {
        arr_defects_add.push((neprovar[key] + "Н" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по непроварам в корне
    for (let key of Object.keys(neprovar_v_korne)) {
        arr_defects_add.push((neprovar_v_korne[key] + "Нк" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по непроварам между валиками
    for (let key of Object.keys(neprovar_mezh_valikami)) {
        arr_defects_add.push((neprovar_mezh_valikami[key] + "Нв" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по непроварам по раздлелке
    for (let key of Object.keys(neprovar_po_razdelke)) {
        arr_defects_add.push((neprovar_po_razdelke[key] + "Нр" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по шлаковым включениям
    for (let key of Object.keys(shlak)) {
        arr_defects_add.push((shlak[key] + "Ш" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по вольфрамовым включениям
    for (let key of Object.keys(volfram)) {
        arr_defects_add.push((volfram[key] + "В" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по окисным включениям
    for (let key of Object.keys(okis)) {
        arr_defects_add.push((okis[key] + "О" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по смещениям кромок
    for (let key of Object.keys(kromki)) {
        arr_defects_add.push((kromki[key] + "Скр" + key).replaceAll(".", ",").replace("1", ""))
    }
}