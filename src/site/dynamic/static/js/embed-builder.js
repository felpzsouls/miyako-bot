document.addEventListener("DOMContentLoaded", function () {
    // ...existing code...
    const embedContainer = document.getElementById("embed-builder");
    const embedJson = document.getElementById("embedJson");
    const copyBtn = document.getElementById("copyJson");
    const downloadLink = document.getElementById("downloadJson");
    const clearBtn = document.getElementById("clearEmbed");
    const colorInput = document.getElementById("embedColor");

    if (!embedContainer) return;

    // estado do embed semelhante ao payload de Discord
    const state = {
        title: null,
        url: null,
        description: null,
        color: colorInput ? colorInput.value : "#4f545c",
        author: null, // { name, icon_url }
        fields: [], // [{ name, value, inline }]
        image: null, // url
        thumbnail: null, // url
        footer: null, // { text, icon_url }
        timestamp: null
    };

    // limites do Discord
    const LIMITS = {
        TITLE: 256,
        DESCRIPTION: 4096,
        FIELDS: 25,
        FIELD_NAME: 256,
        FIELD_VALUE: 1024,
        FOOTER: 2048,
        AUTHOR_NAME: 256,
        EMBED_TOTAL: 6000
    };
    
    function totalEmbedCharsWith(add = { title:0, description:0, footer:0, author:0, fields:0 }) {
        let total = 0;
        if (state.title) total += state.title.length;
        if (state.description) total += state.description.length;
        if (state.footer && state.footer.text) total += state.footer.text.length;
        if (state.author && state.author.name) total += state.author.name.length;
        if (state.fields && state.fields.length) {
            state.fields.forEach(f => {
                total += (f.name ? f.name.length : 0) + (f.value ? f.value.length : 0);
            });
        }
        // add prospective values
        total += add.title || 0;
        total += add.description || 0;
        total += add.footer || 0;
        total += add.author || 0;
        total += add.fields || 0;
        return total;
    }

    function showLimitError(msg) {
        // UI simples: alert. Pode trocar por um toast mais elegante.
        alert(msg);
    }

    const escapeHtml = (s) => {
        if (s == null) return "";
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    };

    function renderPreview() {
        const color = state.color || "#4f545c";
        const accentStyle = `background:${color};`;
        let authorHtml = "";
        if (state.author && state.author.name) {
            const icon = state.author.icon_url ? `<img src="${escapeHtml(state.author.icon_url)}" alt="icon">` : "";
            authorHtml = `<div class="embed-author">${icon}<div>${escapeHtml(state.author.name)}</div></div>`;
        }
        const titleHtml = state.title ? `<div class="embed-title">${state.url ? `<a href="${escapeHtml(state.url)}" target="_blank" rel="noopener" style="color:inherit; text-decoration:underline;">${escapeHtml(state.title)}</a>` : escapeHtml(state.title)}</div>` : "";
        const descHtml = state.description ? `<div class="embed-desc">${escapeHtml(state.description)}</div>` : "";
        let fieldsHtml = "";
        if (state.fields && state.fields.length) {
            // Agrupa campos inline em uma linha flex (com wrap). Campos não-inline ocupam 100%.
            const rows = [];
            let inlineGroup = [];
            const flushInline = () => {
                if (inlineGroup.length) {
                    const items = inlineGroup.map(f => 
                        `<div class="embed-field inline" style="flex:1 1 calc(50% - 6px); min-width:120px; margin-bottom:0;">
                            <strong>${escapeHtml(f.name)}</strong>
                            <div>${escapeHtml(f.value)}</div>
                        </div>`
                    ).join("");
                    rows.push(`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px;">${items}</div>`);
                    inlineGroup = [];
                }
            };
            state.fields.forEach(f => {
                if (f.inline) {
                    inlineGroup.push(f);
                } else {
                    flushInline();
                    rows.push(`<div class="embed-field" style="width:100%;margin-bottom:6px;"><strong>${escapeHtml(f.name)}</strong><div>${escapeHtml(f.value)}</div></div>`);
                }
            });
            flushInline();
            fieldsHtml = rows.join("");
        }
        const thumbHtml = state.thumbnail ? `<img class="embed-thumb" src="${escapeHtml(state.thumbnail)}" alt="thumb">` : "";
        const imageHtml = state.image ? `<img class="embed-image" src="${escapeHtml(state.image)}" alt="image">` : "";
        const footerHtml = state.footer && state.footer.text ? `<div class="embed-footer">${state.footer.icon_url ? `<img src="${escapeHtml(state.footer.icon_url)}" style="width:16px;height:16px;border-radius:50%;">` : ""}<div>${escapeHtml(state.footer.text)}${state.timestamp ? ` • ${new Date(state.timestamp).toLocaleString()}` : ""}</div></div>` : "";

        // layout: left accent, content, optional thumbnail
        embedContainer.innerHTML = `
            <div class="discord-embed">
                <div class="accent" style="${accentStyle}"></div>
                <div class="content">
                    ${authorHtml}
                    ${titleHtml}
                    ${descHtml}
                    ${fieldsHtml}
                    ${imageHtml}
                    ${footerHtml}
                </div>
                ${thumbHtml}
            </div>
        `;
        updateJsonArea();
    }

    function buildDiscordPayload() {
        const payload = {};
        if (state.title) payload.title = state.title;
        if (state.url) payload.url = state.url;
        if (state.description) payload.description = state.description;
        if (state.color) payload.color = parseInt(state.color.replace("#",""), 16);
        if (state.author) payload.author = state.author;
        if (state.fields && state.fields.length) payload.fields = state.fields;
        if (state.image) payload.image = { url: state.image };
        if (state.thumbnail) payload.thumbnail = { url: state.thumbnail };
        if (state.footer) payload.footer = state.footer;
        if (state.timestamp) payload.timestamp = state.timestamp;
        return { embeds: [payload] };
    }

    function updateJsonArea() {
        const payload = buildDiscordPayload();
        if (embedJson) embedJson.value = JSON.stringify(payload, null, 2);
        // update download link
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
    }

    // helper para fechar modal bootstrap
    function hideModal(modalId) {
        const el = document.getElementById(modalId);
        try {
            const modal = bootstrap.Modal.getInstance(el);
            if (modal) modal.hide();
        } catch (e) {
            // ignorar se bootstrap não presente
            el && (el.style.display = "none");
        }
    }

    // listeners para forms (existem nos modais do template)
    const authorForm = document.getElementById("authorForm");
    if (authorForm) {
        authorForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("authorName").value.trim();
            const icon = document.getElementById("authorIcon").value.trim();
            if (name && name.length > LIMITS.AUTHOR_NAME) {
                showLimitError(`Nome do autor excede o limite de ${LIMITS.AUTHOR_NAME} caracteres.`);
                return;
            }
            // verificar total
            const prospective = { author: name ? name.length : 0 };
            if (totalEmbedCharsWith(prospective) > LIMITS.EMBED_TOTAL) {
                showLimitError(`Adicionar esse autor excede o limite total de ${LIMITS.EMBED_TOTAL} caracteres do embed.`);
                return;
            }
            state.author = { name: name || undefined, icon_url: icon || undefined };
            hideModal("authorModal");
            renderPreview();
            authorForm.reset();
        });
    }

    const titleForm = document.getElementById("titleForm");
    if (titleForm) {
        titleForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const titleVal = document.getElementById("titleText").value.trim() || null;
            const urlVal = document.getElementById("titleUrl").value.trim() || null;
            if (titleVal && titleVal.length > LIMITS.TITLE) {
                showLimitError(`Título excede o limite de ${LIMITS.TITLE} caracteres.`);
                return;
            }
            if (totalEmbedCharsWith({ title: titleVal ? titleVal.length : 0 }) > LIMITS.EMBED_TOTAL) {
                showLimitError(`Adicionar esse título excede o limite total de ${LIMITS.EMBED_TOTAL} caracteres do embed.`);
                return;
            }
            state.title = titleVal;
            state.url = urlVal;
            hideModal("titleModal");
            renderPreview();
            titleForm.reset();
        });
    }

    const descriptionForm = document.getElementById("descriptionForm");
    if (descriptionForm) {
        descriptionForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const desc = document.getElementById("descriptionText").value.trim() || null;
            if (desc && desc.length > LIMITS.DESCRIPTION) {
                showLimitError(`Descrição excede o limite de ${LIMITS.DESCRIPTION} caracteres.`);
                return;
            }
            if (totalEmbedCharsWith({ description: desc ? desc.length : 0 }) > LIMITS.EMBED_TOTAL) {
                showLimitError(`Adicionar essa descrição excede o limite total de ${LIMITS.EMBED_TOTAL} caracteres do embed.`);
                return;
            }
            state.description = desc;
            hideModal("descriptionModal");
            renderPreview();
            descriptionForm.reset();
        });
    }

    const fieldForm = document.getElementById("fieldForm");
    if (fieldForm) {
        fieldForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("fieldName").value.trim();
            const value = document.getElementById("fieldValue").value.trim();
            const inline = document.getElementById("fieldInline").checked;
            if (!name || !value) {
                showLimitError("Nome e valor do campo são obrigatórios.");
                return;
            }
            if (state.fields.length >= LIMITS.FIELDS) {
                showLimitError(`Você atingiu o limite máximo de campos (${LIMITS.FIELDS}).`);
                return;
            }
            if (name.length > LIMITS.FIELD_NAME) {
                showLimitError(`Nome do campo excede o limite de ${LIMITS.FIELD_NAME} caracteres.`);
                return;
            }
            if (value.length > LIMITS.FIELD_VALUE) {
                showLimitError(`Valor do campo excede o limite de ${LIMITS.FIELD_VALUE} caracteres.`);
                return;
            }
            // total characters check
            const prospectiveFieldsLen = name.length + value.length;
            if (totalEmbedCharsWith({ fields: prospectiveFieldsLen }) > LIMITS.EMBED_TOTAL) {
                showLimitError(`Adicionar esse campo excede o limite total de ${LIMITS.EMBED_TOTAL} caracteres do embed.`);
                return;
            }
            state.fields.push({ name, value, inline });
            hideModal("fieldModal");
            renderPreview();
            fieldForm.reset();
        });
    }

    const imageForm = document.getElementById("imageForm");
    if (imageForm) {
        imageForm.addEventListener("submit", (e) => {
            e.preventDefault();
            state.image = document.getElementById("imageUrl").value.trim() || null;
            hideModal("imageModal");
            renderPreview();
            imageForm.reset();
        });
    }

    const thumbnailForm = document.getElementById("thumbnailForm");
    if (thumbnailForm) {
        thumbnailForm.addEventListener("submit", (e) => {
            e.preventDefault();
            state.thumbnail = document.getElementById("thumbnailUrl").value.trim() || null;
            hideModal("thumbnailModal");
            renderPreview();
            thumbnailForm.reset();
        });
    }

    const footerForm = document.getElementById("footerForm");
    if (footerForm) {
        footerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = document.getElementById("footerText").value.trim();
            const icon = document.getElementById("footerIcon").value.trim();
            if (text && text.length > LIMITS.FOOTER) {
                showLimitError(`Texto do rodapé excede o limite de ${LIMITS.FOOTER} caracteres.`);
                return;
            }
            if (totalEmbedCharsWith({ footer: text ? text.length : 0 }) > LIMITS.EMBED_TOTAL) {
                showLimitError(`Adicionar esse rodapé excede o limite total de ${LIMITS.EMBED_TOTAL} caracteres do embed.`);
                return;
            }
            state.footer = (text || icon) ? { text: text || undefined, icon_url: icon || undefined } : null;
            state.timestamp = Date.now();
            hideModal("footerModal");
            renderPreview();
            footerForm.reset();
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
            const payload = buildDiscordPayload();
            try {
                await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                copyBtn.textContent = "Copiado!";
                setTimeout(() => copyBtn.textContent = "Copiar JSON", 1500);
            } catch (e) {
                copyBtn.textContent = "Falha ao copiar";
                setTimeout(() => copyBtn.textContent = "Copiar JSON", 1500);
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            // reset state
            state.title = null;
            state.url = null;
            state.description = null;
            state.author = null;
            state.fields = [];
            state.image = null;
            state.thumbnail = null;
            state.footer = null;
            state.timestamp = null;
            state.color = colorInput ? colorInput.value : "#4f545c";
            renderPreview();
        });
    }

    if (colorInput) {
        colorInput.addEventListener("change", (e) => {
            state.color = e.target.value;
            renderPreview();
        });
    }

    if (downloadLink) {
        downloadLink.addEventListener("click", () => {
            // URL atualizado em updateJsonArea
            setTimeout(() => {
                // liberar objeto URL após curto período
                if (downloadLink.href && downloadLink.href.startsWith("blob:")) {
                    setTimeout(() => URL.revokeObjectURL(downloadLink.href), 2000);
                }
            }, 1000);
        });
    }

    // render inicial
    renderPreview();
    // ...existing code...
});