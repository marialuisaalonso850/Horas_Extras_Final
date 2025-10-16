const xlsx = require("xlsx");
const Funcionario = require('../models/Funcionarios');
const Cargo = require('../models/cargo');
const Extras = require('../models/HorasExtras');
const moment = require('moment');
const { validarTurnoYHoras } = require('../controllers/Extras');
const { calcularHorasExtras } = require('../helpers/CalculoHoras');
const registrosValidados = [];


const normalizarCargo = (valor) => {
    if (!valor) return "sin cargo";
    return valor.toString().trim().toLowerCase();
};
const normalizeHeader = (header) => {
    if (!header) return "";
    return header
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
};

const obtenerNombresDeHojas = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Debe subir un archivo Excel" });
        }
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetNames = workbook.SheetNames;
        console.log("📄 Nombres de las hojas:", sheetNames);
        return res.json({ success: true, sheetNames });
    } catch (error) {
        console.error("❌ Error al leer los nombres de las hojas:", error);
        return res.status(500).json({ error: "No se pudo leer el archivo Excel." });
    }
};

const formatearCelda = (valor, campo) => {
    if (valor === null || valor === undefined) {
        if (campo.toLowerCase().startsWith("es_festivo")) return false;
        return null;
    }

    if (campo.toLowerCase().startsWith("es_festivo")) {
        if (typeof valor === "boolean") return valor;
        if (typeof valor === "number") return valor === 1;
        const str = valor.toString().replace(/\s+/g, "").toLowerCase();
        if (["true", "1", "si", "sí"].includes(str)) return true;
        if (["false", "0", "no"].includes(str)) return false;
        return false;
    }
    // Resto del formateo existente...
    if (valor instanceof Date) {
        if (campo.startsWith("fecha_")) return moment(valor).format("YYYY-MM-DD");
        if (campo.startsWith("hora_")) return moment(valor).format("HH:mm");
    }

    if (typeof valor === "number" && campo.startsWith("hora_")) {
        const minutos = Math.round(valor * 24 * 60);
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }

    if (typeof valor === "string") {
        const str = valor.trim();
        if (campo.startsWith("fecha_")) {
            const fecha = moment(str, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"], true);
            return fecha.isValid() ? fecha.format("YYYY-MM-DD") : null;
        }
        if (campo.startsWith("hora_")) {
            const hora = moment(str, ["HH:mm", "H:mm", "HH:mm:ss"], true);
            return hora.isValid() ? hora.format("HH:mm") : null;
        }
    }

    return valor;
};


const importarExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Debe subir un archivo Excel" });
        }
        const { nombreHoja } = req.body;

        const workbook = xlsx.read(req.file.buffer, { type: "buffer", cellDates: true });
        let sheet;
        let sheetName;

        // Selección de hoja
        if (nombreHoja && workbook.Sheets[nombreHoja]) {
            sheet = workbook.Sheets[nombreHoja];
            sheetName = nombreHoja;
        } else {
            const palabrasClave = ['turno', 'cedula', 'nombre del funcionario'];
            for (const name of workbook.SheetNames) {
                const currentSheet = workbook.Sheets[name];
                const tempData = xlsx.utils.sheet_to_json(currentSheet, { header: 1, defval: null });
                if (tempData && tempData.length > 0 && tempData.some(row =>
                    row && Array.isArray(row) && row.some(cell => cell && palabrasClave.some(keyword => normalizeHeader(cell).includes(keyword)))
                )) {
                    sheet = currentSheet;
                    sheetName = name;
                    break;
                }
            }
        }

        console.log("📄 Hoja seleccionada:", sheetName);

        if (!sheet) {
            return res.status(400).json({ error: "No se encontró una hoja válida." });
        }

        if (sheet["!merges"]) delete sheet["!merges"];

        const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: true });
        console.log("📊 Total filas leídas del Excel:", data?.length);

        if (!data || !data.length) {
            return res.status(400).json({ error: "El archivo está vacío." });
        }

        // PASO 1: Buscar encabezado
        let headerStartIndex = -1;
        const clavesObligatorias = ["cedula", "nombre del funcionario", "fecha inicio"];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row && Array.isArray(row) && row.length > 0) {
                const normalizedRow = row.map(cell => normalizeHeader(cell));
                const matches = clavesObligatorias.filter(keyword =>
                    normalizedRow.some(cell => cell.includes(keyword))
                );
                if (matches.length >= 2) {
                    headerStartIndex = i;
                    break;
                }
            }
        }

        if (headerStartIndex === -1) {
            return res.status(400).json({ error: "No se encontró fila de encabezados." });
        }

        const headerRow1 = data[headerStartIndex] || [];
        const headerRow2 = data[headerStartIndex + 1] || [];

        let lastHeader1Value = "";
        const filledHeaderRow1 = headerRow1.map(h1 => {
            if (h1 !== null && h1 !== undefined) {
                lastHeader1Value = h1;
                return h1;
            }
            return lastHeader1Value;
        });

        const headers = headerRow2.map((h2, index) => {
            const h1 = filledHeaderRow1[index] || "";
            let headerFinal = h2 || h1 || "";
            if (normalizeHeader(h1) === "descanso" && h2) {
                headerFinal = `descanso ${h2}`;
            }
            return normalizeHeader(headerFinal);
        });

        // PASO 3: Mapeo de cabeceras
        const mapeoAvanzado = {
            identificacion: ["cedula", "identificacion"],
            nombre_completo: ["nombre del funcionario"],
            fecha_inicio_trabajo: ["fecha inicio"],
            hora_inicio_trabajo: ["hora inicio"],
            fecha_fin_trabajo: ["fecha final"],
            hora_fin_trabajo: ["hora final"],
            fecha_inicio_descanso: ["descanso fecha inicio"],
            hora_inicio_descanso: ["descanso hora inicio"],
            fecha_fin_descanso: ["descanso fecha final"],
            hora_fin_descanso: ["descanso hora final"],
            es_festivo_Inicio: ["es_festivo_inicio"],
            es_festivo_Fin: ["es_festivo_fin"],
            cargo: ["cargo"]
        };

        const columnasObligatorias = [
            "identificacion",
            "nombre_completo",
            "fecha_inicio_trabajo",
            "hora_inicio_trabajo",
            "fecha_fin_trabajo",
            "hora_fin_trabajo",
        ];

        const headerIndexMap = {};
        const columnasFaltantes = [];

        for (const campoModelo in mapeoAvanzado) {
            const aliasPermitidos = mapeoAvanzado[campoModelo];
            let indexEncontrado = -1;
            for (const alias of aliasPermitidos) {
                const index = headers.findIndex(h => h === alias);
                if (index !== -1) {
                    indexEncontrado = index;
                    break;
                }
            }
            if (indexEncontrado !== -1) {
                headerIndexMap[campoModelo] = indexEncontrado;
            } else if (columnasObligatorias.includes(campoModelo)) {
                columnasFaltantes.push(aliasPermitidos.join(" ó "));
            }
        }

        if (columnasFaltantes.length > 0) {
            return res.status(400).json({
                error: `El archivo no es válido. Faltan: ${columnasFaltantes.join(", ")}`
            });
        }

        // PASO 4: Procesar filas de datos
        const filasDeDatos = data.slice(headerStartIndex + 2);
        const resumen = { registrosGuardados: 0, registrosFallidos: 0, funcionariosCreados: 0, cargosCreados: 0, errores: [] };

        for (const [index, row] of filasDeDatos.entries()) {
            const filaActual = index + headerStartIndex + 3;
            try {
                if (!row || row.every(cell => cell === null || cell === "")) continue;

                let cedula = row[headerIndexMap.identificacion];
                let nombre = row[headerIndexMap.nombre_completo];

                let funcionario = null;


                if (cedula && cedula.toString().toLowerCase().includes("temporal")) {
                    const nombre = row[headerIndexMap.nombre_completo];
                    const cedulaTemporal = `TMP-${filaActual}`;
                    const nombreLimpio = nombre.toString().trim();
                    const valorCargo = row[headerIndexMap.cargo];
                    console.log("Cargos" + valorCargo);

                    const nombreCargo = normalizarCargo(valorCargo);

                    let cargoDoc = await Cargo.findOne({ name: nombreCargo });
                    if (!cargoDoc) {
                        cargoDoc = new Cargo({ name: nombreCargo });
                        await cargoDoc.save();
                        resumen.cargosCreados++;
                    }
                    funcionario = await Funcionario.findOne({ nombre_completo: nombreLimpio, tipoOperario: "Temporal" });
                    if (!funcionario) {
                        funcionario = new Funcionario({
                            identificacion: cedulaTemporal,
                            nombre_completo: nombreLimpio,
                            tipoOperario: "Temporal",
                            Cargo: cargoDoc._id,
                        });
                        await funcionario.save();
                        resumen.funcionariosCreados++;
                    } else {
                        if (!funcionario.Cargo || funcionario.Cargo.toString() !== cargoDoc._id.toString()) {
                            funcionario.Cargo = cargoDoc._id;
                            await funcionario.save();
                        }
                    }
                    cedula = cedulaTemporal;
                } else {
                    const cedulaNormalizada = cedula?.toString().replace(/[^\d]/g, "").trim();
                    const nombre_completo_Normalizada = nombre?.toString().replace(/[^\d]/g, "").trim();
                    if (!cedulaNormalizada) continue;
                    const nombreHojaNormalizado = normalizeHeader(sheetName);
                    let tipoOperarioDetectado = null;
                    if (nombreHojaNormalizado.includes("planta")) tipoOperarioDetectado = "Planta";
                    else if (nombreHojaNormalizado.includes("temporal")) tipoOperarioDetectado = "Temporal";

                    funcionario = await Funcionario.findOne({ identificacion: cedulaNormalizada });
                    if (funcionario && funcionario.nombre_completo !== nombre_completo_Normalizada) {
                        console.log("nombre Base" + funcionario.nombre_completo !== nombre_completo_Normalizada + "Hoja");

                        // throw new Error(`La cédula ${cedulaNormalizada} ya está registrada para otro funcionario (${funcionario.nombre_completo}).`);
                    }
                    if (!funcionario) {
                        const nombre = row[headerIndexMap.nombre_completo];
                        if (!nombre || !tipoOperarioDetectado) {
                            throw new Error(`Datos insuficientes para crear funcionario (cédula: ${cedulaNormalizada}).`);
                        }
                        const valorCargo = row[headerIndexMap.cargo];
                        const nombreCargo = normalizarCargo(valorCargo);

                        let cargoDoc = null;
                        if (nombreCargo && nombreCargo !== "sin cargo") {
                            cargoDoc = await Cargo.findOne({ name: nombreCargo });
                            if (!cargoDoc) {
                                cargoDoc = new Cargo({ name: nombreCargo });
                                await cargoDoc.save();
                                resumen.cargosCreados++;
                            }
                        }
                        const nuevoFuncionarioData = {
                            identificacion: cedulaNormalizada,
                            nombre_completo: nombre.toString().trim(),
                            tipoOperario: tipoOperarioDetectado,
                            Cargo: cargoDoc._id
                        };
                        if (tipoOperarioDetectado === "Planta") {
                            const valorCargoPlanta = row[headerIndexMap.Cargo];
                            if (valorCargoPlanta) {
                                const nombreCargoNormalizado = valorCargoPlanta.toString().trim().toLowerCase();
                                let cargoPlanta = await Cargo.findOne({ name: nombreCargoNormalizado });
                                if (!cargoPlanta) {
                                    cargoPlanta = new Cargo({ name: nombreCargoNormalizado });
                                    await cargoPlanta.save();
                                    resumen.cargosCreados++;
                                }
                                nuevoFuncionarioData.Cargo = cargoPlanta._id;
                                console.log("Cargo Planta" + nuevoFuncionarioData);

                            }
                        }
                        funcionario = new Funcionario(nuevoFuncionarioData);
                        await funcionario.save();
                        resumen.funcionariosCreados++;
                    } else {
                        const valorCargo = row[headerIndexMap.Cargo];
                        if (valorCargo) {
                            const nombreCargo = normalizarCargo(valorCargo);
                            let cargoDoc = await Cargo.findOne({ name: nombreCargo });
                            if (!cargoDoc) {
                                cargoDoc = new Cargo({ name: nombreCargo });
                                await cargoDoc.save();
                                resumen.cargosCreados++;
                            }
                            if (!funcionario.Cargo || funcionario.Cargo.toString() !== cargoDoc._id.toString()) {
                                funcionario.Cargo = cargoDoc._id;
                                await funcionario.save();
                            }
                        }
                    }
                }
                let registroLimpio = { FuncionarioAsignado: funcionario._id };

                for (const campoModelo in headerIndexMap) {
                    const index = headerIndexMap[campoModelo];
                    const valor = row[index];
                    const convertido = formatearCelda(valor, campoModelo);

                    if (campoModelo.includes("descanso") && valor && !convertido) {
                        console.warn(`⚠️ Fila ${filaActual}: El campo ${campoModelo} venía con valor en Excel pero quedó vacío al convertir. Valor original:`, valor);
                    }

                    // --- LOGS para festivos ---
                    if (campoModelo === "es_festivo_Inicio" || campoModelo === "es_festivo_Fin") {
                        console.log(`📌 Fila ${filaActual} - ${campoModelo}: valor original=`, valor, ", convertido=", convertido);
                    }

                    registroLimpio[campoModelo] = convertido;
                }

                const validacion = await validarTurnoYHoras(registroLimpio);
                if (!validacion.success) throw new Error(validacion.message);

                const calculos = await calcularHorasExtras(registroLimpio);
                if (!calculos.success) throw new Error(calculos.message || "Error en cálculo.");

                // 🔧 Ajustar hora/fecha fin si se devolvieron ajustes desde calcularHorasExtras
                if (calculos.hora_fin_trabajo_ajustada) {
                    registroLimpio.hora_fin_trabajo = calculos.hora_fin_trabajo_ajustada;
                }
                if (calculos.fecha_fin_trabajo_ajustada) {
                    registroLimpio.fecha_fin_trabajo = calculos.fecha_fin_trabajo_ajustada;
                }

                const { _id, ...resto } = { ...registroLimpio, ...calculos };
                const nuevaExtra = new Extras(resto);
                registrosValidados.push(nuevaExtra);
                resumen.registrosGuardados++;

            } catch (error) {
                console.error(`❌ Error en fila ${filaActual}:`, error.message);
                resumen.registrosFallidos++;
                resumen.errores.push(`Fila ${filaActual}: ${error.message}`);
            }
        }

        const hayRegistrosRepetidos = resumen.errores.some(e =>
            typeof e === "string"
                ? e.includes("Ya existe un registro de horas")
                : e.mensaje.includes("Ya existe un registro de horas")
        );

        if (hayRegistrosRepetidos) {
            return res.status(400).json({
                success: false,
                error: "Importación no completada",
                message: "⚠️ Ya existen registros de horas extras en este mes para este tipo de operario."
            });
        }

        if (resumen.errores.length > 0) {
            const detalleErrores = resumen.errores.map(e =>
                typeof e === "string" ? `➡️ ${e}` : `➡️ Fila ${e.fila}, columna "${e.columna}": ${e.mensaje}`
            ).join("\n");

            return res.status(400).json({
                success: false,
                error: "No se pudo importar el archivo",
                message: detalleErrores,
                detalles: resumen.errores
            });
        }

        await Promise.all(registrosValidados.map(r => r.save()));

        return res.status(200).json({
            success: true,
            message: `✅ Se importaron correctamente ${resumen.registrosGuardados} registros.`,
            registrosGuardados: resumen.registrosGuardados,
            funcionariosCreados: resumen.funcionariosCreados,
            cargosCreados: resumen.cargosCreados
        });

    } catch (error) {
        console.error("❌ Error al procesar Excel:", error);
        return res.status(500).json({ error: "Error interno al procesar el archivo", details: error.message });
    }
};

module.exports = { importarExcel, obtenerNombresDeHojas };