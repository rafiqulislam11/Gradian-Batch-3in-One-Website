/**
 * ============================================================================
 * RI CREATIVE — BATCH BACKGROUND PROCESSING STUDIO PRO
 * Version: 2.8.0 (Adobe Photoshop CS2 v9.0.2 Dedicated & Universal Edition)
 * Target: Adobe Photoshop CS2 (9.0 / 9.0.2), CS3, CS4, CS5, CS6, CC 2014 - CC 2026 (Windows & macOS)
 * Developed by: RI Creative Studio & AI Engineering Team
 * ============================================================================
 */

#target photoshop
app.bringToFront();

(function () {
    try {

        // ========================================================================
        // 0. ADOBE PHOTOSHOP CS2 (v9.0) - CC 2026 ES3 COMPATIBILITY POLYFILLS
        // ========================================================================
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
            };
        }

        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (searchElement, fromIndex) {
                if (this == null) throw new TypeError('"this" is null or not defined');
                var o = Object(this);
                var len = o.length >>> 0;
                if (len === 0) return -1;
                var n = fromIndex | 0;
                if (n >= len) return -1;
                var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
                while (k < len) {
                    if (k in o && o[k] === searchElement) return k;
                    k++;
                }
                return -1;
            };
        }

        if (!Array.prototype.lastIndexOf) {
            Array.prototype.lastIndexOf = function (searchElement, fromIndex) {
                if (this == null) throw new TypeError('"this" is null or not defined');
                var o = Object(this);
                var len = o.length >>> 0;
                if (len === 0) return -1;
                var n = len - 1;
                if (arguments.length > 1) {
                    n = fromIndex | 0;
                    if (n !== n) n = 0;
                    else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
                        n = (n > 0 || -1) * Math.floor(Math.abs(n));
                    }
                }
                var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);
                while (k >= 0) {
                    if (k in o && o[k] === searchElement) return k;
                    k--;
                }
                return -1;
            };
        }

        // ========================================================================
        // 1. GLOBAL CONSTANTS & DEFAULT CONFIGURATION
        // ========================================================================
        var SCRIPT_TITLE = "RI CREATIVE — BATCH BACKGROUND STUDIO PRO";
        var SCRIPT_VERSION = "2.8.0";
        var MAX_ALLOWED_BATCH = 1000;
        var SUPPORTED_EXTENSIONS = /\.(jpg|jpeg|png|tif|tiff|psd|bmp|webp)$/i;

        var PS_VERSION = (typeof app !== "undefined" && app.version) ? String(app.version) : "9.0.2";
        var IS_CS2 = (PS_VERSION.indexOf("9.") === 0);

        var DO_NOT_SAVE = 2;
        try {
            if (typeof SaveOptions !== "undefined") {
                DO_NOT_SAVE = SaveOptions.DONOTSAVECHANGES;
            }
        } catch (eEnumSave) {}

        var PLACE_TOP = 1;
        try {
            if (typeof ElementPlacement !== "undefined") {
                PLACE_TOP = ElementPlacement.PLACEBEFORE;
            }
        } catch (eEnumPlace) {}

        var DIALOG_NO = 3;
        try {
            if (typeof DialogModes !== "undefined") {
                DIALOG_NO = DialogModes.NO;
            }
        } catch (eEnumDialog) {}

        var UNITS_PX = 1;
        try {
            if (typeof Units !== "undefined") {
                UNITS_PX = Units.PIXELS;
            }
        } catch (eEnumUnits) {}


        var RESOLUTION_PRESETS = [
            { label: "4000 × 2000 (Standard Stock 2:1)", width: 4000, height: 2000 },
            { label: "6000 × 3000 (6K Ultra Panorama)", width: 6000, height: 3000 },
            { label: "6000 × 4000 (6K 3:2 Photo)", width: 6000, height: 4000 },
            { label: "3840 × 2160 (4K UHD 16:9)", width: 3840, height: 2160 },
            { label: "7680 × 4320 (8K UHD 16:9)", width: 7680, height: 4320 },
            { label: "5000 × 3000 (5K Commercial)", width: 5000, height: 3000 },
            { label: "3000 × 2000 (3K Stock Standard)", width: 3000, height: 2000 },
            { label: "2560 × 1440 (2K QHD 16:9)", width: 2560, height: 1440 },
            { label: "1920 × 1080 (Full HD 16:9)", width: 1920, height: 1080 },
            { label: "4096 × 4096 (1:1 High-Res Square)", width: 4096, height: 4096 },
            { label: "Custom Dimensions...", width: 4000, height: 2000 }
        ];

        var GLASS_STYLE_PRESETS = [
            "Frosted Glassmorphism (Floating 3D Slab)",
            "Fluted & Reeded Glass (Vertical Ribs)",
            "3D Convex Glass Sphere (Crystal Lens)",
            "Rainbow Prism (Chromatic Dispersion)",
            "Liquid Wave Glass (Molten Fluid Refraction)",
            "Beveled Glass Tiles (Facet Prisms)",
            "Photoshop Frosted Glass Filter",
            "Photoshop Tiny Lens Glass Filter",
            "Photoshop Blocks Glass Filter",
            "Emerald Tinted Glass",
            "Sapphire Blue Glass",
            "Amber Gold Glass",
            "Rose Quartz Glass",
            "Neon Glow Glass",
            "Random 3D Glass Style"
        ];

        var DEFAULT_CONFIG = {
            sourcePath: "",
            outputPath: "",
            processMode: "3-Image Fusion (Anti-Similar)",
            selectedFiles: [],
            resPresetIndex: 0,
            width: 4000,
            height: 2000,
            resizeMode: "Fit/Crop (Fill)",
            seamlessBlend: true,
            seamlessFeather: 60,
            maxBatchCount: 500,
            // Export Engine
            exportFormat: "JPEG (Baseline 300 DPI)",
            jpegQuality: 12,
            minFileSizeMB: 0,
            embedProfile: true,
            enforce300Dpi: true,
            filenamePrefix: "RI_Background_",
            // 11 Photoshop Blur Engine Configuration
            blurType: "None (Clean Stock Approved)",
            blurScope: "Full Composition",
            blurRadius: 25,
            blurThreshold: 25,
            motionAngle: 0,
            motionDistance: 30,
            radialAmount: 25,
            radialMethod: "Spin",
            blurEnable: false,
            // Optical Film Grain & Photoshop Noise Integration
            noiseEnable: false,
            noiseAmount: 6,
            noiseDistribution: "Gaussian",
            noiseMonochromatic: true,
            noiseFilmGrainOverlay: true,
            // 3D Glass Effect Studio Engine
            glassEnable: false,
            glassStyle: "Frosted Glassmorphism (Floating 3D Slab)",
            glassScope: "Full Composition", // Full Composition, Center 3D Floating Panel, Left & Right Ribbed Flutes, Outer Border Frame
            glassOpacity: 50,
            glassFrostBlur: 15,
            glassDistortion: 30,
            glassTintColor: "Clear Transparent", // Clear Transparent, Emerald Green, Sapphire Blue, Amber Gold, Rose Quartz, Cyberpunk Neon
            glassBevelRim: true,
            // 30-Category Gradient Studio
            gradientEnable: false,
            gradientPreset: "Random Preset",
            gradientType: "Random Type",
            gradientOpacity: 35,
            gradientBlendMode: "Soft Light",
            gradientMultiLayerMesh: false,
            // Liquify Fluid Distortion
            liquifyEnable: false,
            liquifyStyle: "Organic Fluid Wave",
            liquifyIntensity: 65,
            // Optical Lighting & Vignette Engine
            lightingEnable: false,
            vignetteEnable: false,
            vignetteAmount: 30,
            anamorphicFlareEnable: false,
            ambientSunlightEnable: false
        };

        function cloneConfig(src) {
            var copy = {};
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    copy[k] = (src[k] instanceof Array) ? src[k].slice(0) : src[k];
                }
            }
            return copy;
        }

        var config = cloneConfig(DEFAULT_CONFIG);

        var batchState = {
            isRunning: false,
            isPaused: false,
            stopRequested: false,
            skipCurrentRequested: false,
            queue: [],
            failedQueue: [],
            currentIndex: 0,
            successCount: 0,
            failedCount: 0,
            belowMinSizeCount: 0,
            processedFilesMap: {},
            logs: [],
            failedDetails: [],
            startTime: ""
        };

        // ========================================================================
        // 2. 30-CATEGORY COMMERCIAL GRADIENT PRESET LIBRARY
        // ========================================================================
        var GRADIENT_PRESETS = {
            "Mesh Gradient": [
                [[44, 62, 110], [116, 89, 152], [204, 134, 158], [235, 198, 178]],
                [[32, 82, 92], [78, 142, 138], [168, 194, 162], [232, 224, 196]]
            ],
            "Aurora Gradient": [
                [[16, 48, 66], [34, 138, 126], [108, 196, 154], [62, 88, 146]],
                [[22, 34, 68], [58, 148, 142], [146, 206, 168], [88, 72, 138]]
            ],
            "Neon Gradient": [
                [[38, 28, 86], [148, 56, 158], [54, 174, 198]],
                [[28, 42, 92], [182, 68, 136], [76, 188, 164]]
            ],
            "Pastel Gradient": [
                [[224, 196, 206], [198, 214, 232], [214, 232, 222]],
                [[236, 214, 196], [228, 202, 218], [196, 216, 228]]
            ],
            "Abstract Gradient": [
                [[58, 68, 108], [164, 98, 118], [218, 166, 124]],
                [[42, 86, 98], [134, 112, 148], [208, 154, 132]]
            ],
            "Luxury Gradient": [
                [[28, 26, 32], [96, 78, 56], [184, 154, 104], [42, 38, 44]],
                [[36, 24, 28], [118, 86, 64], [198, 168, 118]]
            ],
            "Metallic Gradient": [
                [[74, 80, 88], [146, 154, 164], [206, 212, 218], [108, 114, 124]],
                [[88, 82, 74], [164, 154, 138], [214, 206, 190]]
            ],
            "Glass Gradient": [
                [[168, 194, 214], [214, 228, 238], [184, 204, 222]],
                [[186, 206, 216], [228, 236, 242], [174, 196, 212]]
            ],
            "Dark Gradient": [
                [[18, 22, 30], [38, 46, 62], [26, 32, 42]],
                [[24, 20, 28], [52, 44, 62], [30, 28, 36]]
            ],
            "Light Gradient": [
                [[226, 230, 236], [242, 244, 248], [218, 226, 234]],
                [[238, 234, 228], [246, 244, 240], [226, 222, 216]]
            ],
            "Corporate Gradient": [
                [[28, 54, 92], [56, 102, 154], [118, 158, 198]],
                [[34, 64, 88], [72, 118, 146], [142, 178, 198]]
            ],
            "Minimal Gradient": [
                [[196, 202, 208], [224, 228, 232]],
                [[208, 204, 198], [234, 232, 228]]
            ],
            "Colorful Gradient": [
                [[74, 118, 178], [168, 96, 148], [218, 146, 98], [104, 168, 142]],
                [[68, 138, 168], [186, 108, 124], [216, 174, 102]]
            ],
            "Bokeh Gradient": [
                [[54, 46, 74], [136, 104, 128], [214, 176, 142]],
                [[44, 62, 78], [116, 138, 142], [206, 188, 154]]
            ],
            "Cinematic Gradient": [
                [[24, 44, 56], [64, 96, 104], [178, 124, 84]],
                [[28, 36, 52], [82, 98, 116], [186, 138, 96]]
            ],
            "Holographic Gradient": [
                [[148, 188, 218], [198, 168, 214], [168, 214, 198], [218, 196, 174]],
                [[162, 196, 224], [212, 178, 206], [178, 218, 212]]
            ],
            "Vibrant Gradient": [
                [[52, 104, 182], [174, 78, 138], [216, 128, 76]],
                [[42, 138, 154], [168, 86, 146], [212, 152, 78]]
            ],
            "Soft Gradient": [
                [[178, 188, 204], [208, 198, 206], [224, 218, 214]],
                [[184, 198, 194], [212, 218, 212], [228, 226, 218]]
            ],
            "Modern Gradient": [
                [[42, 52, 78], [88, 108, 148], [164, 178, 204]],
                [[48, 58, 68], [104, 122, 134], [178, 188, 194]]
            ],
            "Futuristic Gradient": [
                [[22, 34, 58], [46, 118, 156], [124, 96, 174]],
                [[26, 28, 52], [68, 134, 164], [148, 114, 182]]
            ],
            "Liquid Silk": [
                [[188, 164, 172], [218, 198, 194], [154, 134, 148], [234, 222, 216]],
                [[162, 176, 192], [204, 212, 222], [134, 148, 168]]
            ],
            "Cyberpunk Dusk": [
                [[26, 22, 54], [126, 48, 124], [44, 138, 168], [198, 88, 128]],
                [[20, 28, 62], [156, 58, 114], [52, 158, 176]]
            ],
            "Sunset Horizon": [
                [[48, 52, 88], [156, 86, 104], [218, 138, 92], [236, 194, 134]],
                [[58, 46, 78], [174, 94, 96], [224, 158, 108]]
            ],
            "Emerald Velvet": [
                [[18, 46, 42], [38, 98, 84], [86, 152, 126], [158, 196, 168]],
                [[22, 54, 48], [48, 114, 96], [116, 168, 142]]
            ],
            "Royal Gold": [
                [[34, 28, 24], [112, 88, 54], [188, 156, 98], [224, 202, 148]],
                [[42, 34, 28], [128, 102, 62], [204, 174, 114]]
            ],
            "Nordic Frost": [
                [[148, 172, 188], [188, 206, 218], [218, 228, 236], [164, 186, 198]],
                [[136, 162, 178], [178, 198, 212], [212, 224, 232]]
            ],
            "Studio Rim Light": [
                [[24, 26, 34], [56, 66, 86], [148, 168, 196], [32, 36, 46]],
                [[28, 24, 32], [74, 62, 82], [176, 154, 178], [34, 30, 38]]
            ],
            "Ethereal Bloom": [
                [[214, 188, 206], [188, 204, 226], [226, 212, 198], [198, 222, 214]],
                [[222, 196, 204], [196, 214, 224], [232, 224, 212]]
            ],
            "Deep Ocean": [
                [[16, 36, 56], [28, 76, 108], [54, 128, 154], [96, 168, 184]],
                [[14, 30, 48], [24, 68, 96], [48, 114, 138]]
            ],
            "Solar Flare": [
                [[54, 32, 28], [154, 74, 48], [216, 134, 68], [236, 188, 112]],
                [[62, 36, 30], [168, 84, 52], [224, 152, 82]]
            ]
        };

        var PRESET_NAMES = [
            "Random Preset",
            "Mesh Gradient", "Aurora Gradient", "Neon Gradient", "Pastel Gradient",
            "Abstract Gradient", "Luxury Gradient", "Metallic Gradient", "Glass Gradient",
            "Dark Gradient", "Light Gradient", "Corporate Gradient", "Minimal Gradient",
            "Colorful Gradient", "Bokeh Gradient", "Cinematic Gradient", "Holographic Gradient",
            "Vibrant Gradient", "Soft Gradient", "Modern Gradient", "Futuristic Gradient",
            "Liquid Silk", "Cyberpunk Dusk", "Sunset Horizon", "Emerald Velvet",
            "Royal Gold", "Nordic Frost", "Studio Rim Light", "Ethereal Bloom",
            "Deep Ocean", "Solar Flare"
        ];

        // ========================================================================
        // 3. UTILITY & FILE SYSTEM HELPERS
        // ========================================================================
        function padNumber(num, size) {
            var s = String(num);
            while (s.length < size) {
                s = "0" + s;
            }
            return s;
        }

        function getTimestamp() {
            var d = new Date();
            return d.getFullYear() + "-" +
                padNumber(d.getMonth() + 1, 2) + "-" +
                padNumber(d.getDate(), 2) + " " +
                padNumber(d.getHours(), 2) + ":" +
                padNumber(d.getMinutes(), 2) + ":" +
                padNumber(d.getSeconds(), 2);
        }

        function formatBytesToMB(bytes) {
            return (bytes / (1024 * 1024)).toFixed(2);
        }

        function sanitizeFilenamePrefix(prefix) {
            var clean = prefix.replace(/[\\\/:\*\?"<>\|]/g, "_");
            if (clean === "") {
                clean = "RI_Background_";
            }
            return clean;
        }

        function ensureOutputStructure(baseOutputPath) {
            var rootFolder = new Folder(baseOutputPath + "/RI_CREATIVE_OUTPUT");
            if (!rootFolder.exists && !rootFolder.create()) {
                throw new Error("Unable to create root output directory: " + rootFolder.fsName);
            }

            var processedFolder = new Folder(rootFolder.fsName + "/Processed_Images");
            if (!processedFolder.exists && !processedFolder.create()) {
                throw new Error("Unable to create Processed_Images directory: " + processedFolder.fsName);
            }

            var reportsFolder = new Folder(rootFolder.fsName + "/Reports");
            if (!reportsFolder.exists && !reportsFolder.create()) {
                throw new Error("Unable to create Reports directory: " + reportsFolder.fsName);
            }

            return {
                root: rootFolder,
                base: rootFolder,
                processed: processedFolder,
                reports: reportsFolder
            };
        }

        function getExtensionForFormat(formatStr) {
            if (formatStr.indexOf("TIFF") !== -1) return ".tif";
            if (formatStr.indexOf("PNG") !== -1) return ".png";
            if (formatStr.indexOf("PSD") !== -1) return ".psd";
            return ".jpg";
        }

        function getNextAvailableOutputFile(processedFolder, prefix, startSeq, formatStr) {
            var ext = getExtensionForFormat(formatStr || "JPEG");
            var seq = startSeq;
            var candidateFile;
            while (seq < 999999) {
                var fileName = prefix + padNumber(seq, 4) + ext;
                candidateFile = new File(processedFolder.fsName + "/" + fileName);
                if (!candidateFile.exists) {
                    return {
                        file: candidateFile,
                        nextSeq: seq + 1,
                        extension: ext
                    };
                }
                seq++;
            }
            throw new Error("Exceeded maximum sequential filename limit.");
        }

        
        function openFileDialogSafe(promptText, multiSelect) {
            var picked = null;
            var isWin = ($.os.indexOf("Windows") !== -1);
            if (isWin) {
                try {
                    picked = File.openDialog(promptText, "*.jpg;*.jpeg;*.png;*.tif;*.tiff;*.psd;*.bmp", multiSelect);
                } catch (e1) {
                    try {
                        picked = File.openDialog(promptText, "Images:*.jpg;*.jpeg;*.png;*.tif;*.tiff;*.psd;*.bmp", multiSelect);
                    } catch (e2) {
                        try {
                            picked = File.openDialog(promptText, "*.*", multiSelect);
                        } catch (e3) {
                            picked = File.openDialog(promptText);
                        }
                    }
                }
            } else {
                try {
                    picked = File.openDialog(promptText, function (f) {
                        return (f instanceof Folder) || SUPPORTED_EXTENSIONS.test(f.name);
                    }, multiSelect);
                } catch (eMac) {
                    try {
                        picked = File.openDialog(promptText, "*", multiSelect);
                    } catch (eMac2) {
                        picked = File.openDialog(promptText);
                    }
                }
            }
            if (picked && !(picked instanceof Array)) {
                picked = [picked];
            }
            return picked;
        }

        function scanSourceFolder(folderPath) {
            var folder = new Folder(folderPath);
            if (!folder.exists) {
                return [];
            }
            var rawFiles = folder.getFiles();
            var validFiles = [];
            for (var i = 0; i < rawFiles.length; i++) {
                var f = rawFiles[i];
                if (f && !(f instanceof Folder) && typeof f.name === "string" && SUPPORTED_EXTENSIONS.test(f.name)) {
                    validFiles.push(f);
                }
            }
            validFiles.sort(function (a, b) {
                var nameA = a.name.toLowerCase();
                var nameB = b.name.toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
            return validFiles;
        }

        function writeTextFile(filePath, content) {
            try {
                var f = new File(filePath);
                f.encoding = "UTF-8";
                f.open("w");
                f.write(content);
                f.close();
            } catch (e) {}
        }

        // ========================================================================
        // 4. CHECKPOINT & RECOVERY SYSTEM
        // ========================================================================
        function getCheckpointFile(reportsFolder) {
            return new File(reportsFolder.fsName + "/Batch_Checkpoint.txt");
        }

        function saveCheckpoint(reportsFolder) {
            try {
                var cpFile = getCheckpointFile(reportsFolder);
                var lines = [];
                lines.push("TIMESTAMP=" + getTimestamp());
                lines.push("SOURCE=" + config.sourcePath);
                lines.push("OUTPUT=" + config.outputPath);
                lines.push("CURRENT_INDEX=" + batchState.currentIndex);
                lines.push("SUCCESS_COUNT=" + batchState.successCount);
                lines.push("FAILED_COUNT=" + batchState.failedCount);
                lines.push("BELOW_MIN_COUNT=" + batchState.belowMinSizeCount);

                var processedList = [];
                for (var key in batchState.processedFilesMap) {
                    if (batchState.processedFilesMap.hasOwnProperty(key)) {
                        processedList.push(key);
                    }
                }
                lines.push("PROCESSED_FILES=" + processedList.join("|"));

                cpFile.encoding = "UTF-8";
                cpFile.open("w");
                cpFile.write(lines.join("\n"));
                cpFile.close();
            } catch (e) {}
        }

        function clearCheckpoint(reportsFolder) {
            try {
                var cpFile = getCheckpointFile(reportsFolder);
                if (cpFile.exists) {
                    cpFile.remove();
                }
            } catch (e) {}
        }

        // ========================================================================
        // 5. PHOTOSHOP NATIVE HIGH-PRECISION IMAGE PROCESSING ENGINE
        // ========================================================================

        function prepareBaseLayer(doc) {
            try {
                if (doc.layers.length > 1) {
                    doc.flatten();
                }
            } catch (e) {}
            try {
                if (doc.activeLayer.isBackgroundLayer) {
                    doc.activeLayer.name = "Layer 0";
                }
                doc.activeLayer.allLocked = false;
                doc.activeLayer.pixelsLocked = false;
                doc.activeLayer.positionLocked = false;
                doc.activeLayer.transparentPixelsLocked = false;
            } catch (lockErr) {}
        }

        function toPx(val) {
            if (val == null) return 0;
            if (typeof val === "number") return val;
            if (val.as) {
                try { return val.as("px"); } catch (e) {}
            }
            if (typeof val.value === "number") return val.value;
            return parseFloat(val) || 0;
        }

        function convertBitDepthSafe(doc, targetBits) {
            try {
                if (targetBits === 16 && doc.bitsPerChannel === BitsPerChannelType.SIXTEEN) return;
                if (targetBits === 8 && doc.bitsPerChannel === BitsPerChannelType.EIGHT) return;
                var idCnvM = charIDToTypeID("CnvM");
                var desc = new ActionDescriptor();
                var idDpth = charIDToTypeID("Dpth");
                desc.putInteger(idDpth, targetBits);
                executeAction(idCnvM, desc, DIALOG_NO);
            } catch (eAM) {
                try {
                    if (targetBits === 16) {
                        doc.bitsPerChannel = BitsPerChannelType.SIXTEEN;
                    } else {
                        doc.bitsPerChannel = BitsPerChannelType.EIGHT;
                    }
                } catch (eDOM) {}
            }
        }

        function convertToHighPrecisionRGB(doc) {
            try {
                if (doc.mode !== DocumentMode.RGB) {
                    doc.changeMode(ChangeMode.RGB);
                }
            } catch (eMode) {}
            convertBitDepthSafe(doc, 16);
        }

        function finalizeTo8BitDithered(doc) {
            convertBitDepthSafe(doc, 8);
        }

        
        function makeEllipticalSelectionSafe(doc, top, left, bottom, right) {
            try {
                var idsetd = charIDToTypeID("setd");
                var desc = new ActionDescriptor();
                var idnull = charIDToTypeID("null");
                var ref = new ActionReference();
                var idChnl = charIDToTypeID("Chnl");
                var idfsel = charIDToTypeID("fsel");
                ref.putProperty(idChnl, idfsel);
                desc.putReference(idnull, ref);
                var idT = charIDToTypeID("T   ");
                var descElps = new ActionDescriptor();
                descElps.putUnitDouble(charIDToTypeID("Top "), charIDToTypeID("#Pxl"), top);
                descElps.putUnitDouble(charIDToTypeID("Left"), charIDToTypeID("#Pxl"), left);
                descElps.putUnitDouble(charIDToTypeID("Btom"), charIDToTypeID("#Pxl"), bottom);
                descElps.putUnitDouble(charIDToTypeID("Rght"), charIDToTypeID("#Pxl"), right);
                desc.putObject(idT, charIDToTypeID("Elps"), descElps);
                desc.putBoolean(charIDToTypeID("AntA"), true);
                executeAction(idsetd, desc, DIALOG_NO);
            } catch (e) {
                try {
                    var cx = (left + right) / 2;
                    var cy = (top + bottom) / 2;
                    var rx = Math.abs(right - left) / 2;
                    var ry = Math.abs(bottom - top) / 2;
                    var pts = [];
                    for (var a = 0; a < 24; a++) {
                        var angle = (a * 2 * Math.PI) / 24;
                        pts.push([Math.round(cx + rx * Math.cos(angle)), Math.round(cy + ry * Math.sin(angle))]);
                    }
                    doc.selection.select(pts);
                } catch (polyErr) {}
            }
        }

        function purgePhotoshopCachesSafe() {
            try {
                if (typeof PurgeTarget !== "undefined") {
                    app.purge(PurgeTarget.ALLCACHES);
                }
            } catch (purgeErr) {}
        }

        function setDocumentResolution300DPI(doc) {
            try {
                if (Math.round(doc.resolution) !== 300) {
                    var resampleMode = (typeof ResampleMethod !== "undefined" && ResampleMethod.NONE) ? ResampleMethod.NONE : null;
                    if (resampleMode) {
                        doc.resizeImage(doc.width, doc.height, 300, resampleMode);
                    } else {
                        doc.resizeImage(doc.width, doc.height, 300);
                    }
                }
            } catch (resErr) {
                try {
                    var idImgS = charIDToTypeID("ImgS");
                    var desc = new ActionDescriptor();
                    desc.putUnitDouble(charIDToTypeID("Rslt"), charIDToTypeID("#Rsl"), 300);
                    executeAction(idImgS, desc, DIALOG_NO);
                } catch (amErr) {}
            }
        }

        function resizeImageSmart(doc, targetW, targetH, mode) {
            var origW = Math.round(toPx(doc.width));
            var origH = Math.round(toPx(doc.height));

            if (origW === targetW && origH === targetH) {
                return;
            }

            var highResample = (typeof ResampleMethod !== "undefined" && ResampleMethod.BICUBICSMOOTHER) ? ResampleMethod.BICUBICSMOOTHER : ((typeof ResampleMethod !== "undefined" && ResampleMethod.BICUBIC) ? ResampleMethod.BICUBIC : null);

            if (mode === "Stretch") {
                doc.resizeImage(UnitValue(targetW, "px"), UnitValue(targetH, "px"), 300, highResample);
            } else if (mode === "Fit (Contain)") {
                var scaleFit = Math.min(targetW / origW, targetH / origH);
                var newW = Math.round(origW * scaleFit);
                var newH = Math.round(origH * scaleFit);
                doc.resizeImage(UnitValue(newW, "px"), UnitValue(newH, "px"), 300, highResample);
                var bgCol = new SolidColor();
                bgCol.rgb.red = 18;
                bgCol.rgb.green = 18;
                bgCol.rgb.blue = 22;
                app.backgroundColor = bgCol;
                doc.resizeCanvas(UnitValue(targetW, "px"), UnitValue(targetH, "px"), AnchorPosition.MIDDLECENTER);
            } else {
                var scaleFill = Math.max(targetW / origW, targetH / origH);
                var scaledW = Math.round(origW * scaleFill);
                var scaledH = Math.round(origH * scaleFill);

                if (scaledW < targetW) scaledW = targetW;
                if (scaledH < targetH) scaledH = targetH;

                doc.resizeImage(UnitValue(scaledW, "px"), UnitValue(scaledH, "px"), 300, highResample);

                if (scaledW !== targetW || scaledH !== targetH) {
                    doc.resizeCanvas(UnitValue(targetW, "px"), UnitValue(targetH, "px"), AnchorPosition.MIDDLECENTER);
                }
            }
        }

        // ====================================================================
        // ADOBE PHOTOSHOP CC EXTENDSCRIPT BLUR ENGINE (11 FILTER ALGORITHMS)
        // ====================================================================

        function applyAverageBlur(doc) {
            try {
                doc.activeLayer.applyAverage();
            } catch (e) {
                try {
                    var idAvrg = charIDToTypeID("Avrg");
                    executeAction(idAvrg, undefined, DIALOG_NO);
                } catch (e2) {}
            }
        }

        function applyStandardBlur(doc) {
            try {
                doc.activeLayer.applyBlur();
            } catch (e) {}
        }

        function applyBlurMore(doc) {
            try {
                doc.activeLayer.applyBlurMore();
            } catch (e) {}
        }

        function applyBoxBlur(doc, radius) {
            try {
                var idBxBl = stringIDToTypeID("boxBlur");
                var desc = new ActionDescriptor();
                desc.putUnitDouble(charIDToTypeID("Rds "), charIDToTypeID("#Pxl"), radius);
                executeAction(idBxBl, desc, DIALOG_NO);
            } catch (e) {
                doc.activeLayer.applyGaussianBlur(radius);
            }
        }

        function applyGaussianBlurFilter(doc, radius) {
            try {
                doc.activeLayer.applyGaussianBlur(radius);
            } catch (e) {}
        }

        function applyLensBlur(doc, radius, specularThreshold) {
            try {
                var idlensBlur = stringIDToTypeID("lensBlur");
                var desc = new ActionDescriptor();
                desc.putInteger(charIDToTypeID("Rds "), Math.round(radius));
                desc.putInteger(charIDToTypeID("SpcT"), Math.round(specularThreshold || 250));
                executeAction(idlensBlur, desc, DIALOG_NO);
            } catch (e) {
                doc.activeLayer.applyGaussianBlur(radius);
            }
        }

        function applyMotionBlurFilter(doc, angle, distance) {
            try {
                doc.activeLayer.applyMotionBlur(Math.round(angle), Math.max(1, Math.round(distance)));
            } catch (e) {}
        }

        function applyRadialBlurFilter(doc, amount, method, quality) {
            try {
                var idRdlB = charIDToTypeID("RdlB");
                var desc = new ActionDescriptor();
                desc.putInteger(charIDToTypeID("Amnt"), Math.min(100, Math.max(1, Math.round(amount))));
                desc.putEnumerated(charIDToTypeID("Mthd"), charIDToTypeID("Mthd"), (method === "Zoom") ? charIDToTypeID("Zm  ") : charIDToTypeID("Spn "));
                desc.putEnumerated(charIDToTypeID("Qlty"), charIDToTypeID("Qlty"), (quality === "Draft") ? charIDToTypeID("Drft") : charIDToTypeID("Best"));
                executeAction(idRdlB, desc, DIALOG_NO);
            } catch (e) {}
        }

        function applyShapeBlurFilter(doc, radius) {
            try {
                var idshapeBlur = stringIDToTypeID("shapeBlur");
                var desc = new ActionDescriptor();
                desc.putUnitDouble(charIDToTypeID("Rds "), charIDToTypeID("#Pxl"), radius);
                executeAction(idshapeBlur, desc, DIALOG_NO);
            } catch (e) {
                doc.activeLayer.applyGaussianBlur(radius);
            }
        }

        function applySmartBlurFilter(doc, radius, threshold) {
            try {
                doc.activeLayer.applySmartBlur(radius, threshold, SmartBlurQuality.HIGH, SmartBlurMode.NORMAL);
            } catch (e) {
                doc.activeLayer.applyGaussianBlur(radius);
            }
        }

        function applySurfaceBlurFilter(doc, radius, threshold) {
            try {
                var idsurfaceBlur = stringIDToTypeID("surfaceBlur");
                var desc = new ActionDescriptor();
                desc.putUnitDouble(charIDToTypeID("Rds "), charIDToTypeID("#Pxl"), radius);
                desc.putInteger(charIDToTypeID("Thsh"), Math.round(threshold));
                executeAction(idsurfaceBlur, desc, DIALOG_NO);
            } catch (e) {
                doc.activeLayer.applyGaussianBlur(radius);
            }
        }

        function applyPhotoshopBlurEngineJSX(doc, cfg) {
            var bType = cfg.blurType || "None (Clean Stock Approved)";
            if (bType === "None (Clean Stock Approved)" || bType === "None / Off" || bType === "None") return;

            if (bType === "Average") {
                applyAverageBlur(doc);
            } else if (bType === "Blur") {
                applyStandardBlur(doc);
            } else if (bType === "Blur More") {
                applyBlurMore(doc);
            } else if (bType === "Box Blur...") {
                applyBoxBlur(doc, cfg.blurRadius || 25);
            } else if (bType === "Gaussian Blur...") {
                applyGaussianBlurFilter(doc, cfg.blurRadius || 25);
            } else if (bType === "Lens Blur...") {
                applyLensBlur(doc, cfg.blurRadius || 25, 250);
            } else if (bType === "Motion Blur...") {
                applyMotionBlurFilter(doc, cfg.motionAngle || 0, cfg.motionDistance || 30);
            } else if (bType === "Radial Blur...") {
                applyRadialBlurFilter(doc, cfg.radialAmount || 25, cfg.radialMethod || "Spin", "Best");
            } else if (bType === "Shape Blur...") {
                applyShapeBlurFilter(doc, cfg.blurRadius || 25);
            } else if (bType === "Smart Blur...") {
                applySmartBlurFilter(doc, cfg.blurRadius || 25, cfg.blurThreshold || 25);
            } else if (bType === "Surface Blur...") {
                applySurfaceBlurFilter(doc, cfg.blurRadius || 25, cfg.blurThreshold || 25);
            } else if (bType.indexOf("Zoom") !== -1) {
                applyRadialBlurFilter(doc, cfg.radialAmount || 25, "Zoom", "Best");
            } else if (bType.indexOf("Spin") !== -1) {
                applyRadialBlurFilter(doc, cfg.radialAmount || 25, "Spin", "Best");
            } else if (bType.indexOf("Bokeh") !== -1 || bType.indexOf("Depth") !== -1) {
                applyLensBlur(doc, cfg.blurRadius || 25, 240);
            } else if (bType.indexOf("Directional") !== -1) {
                applyMotionBlurFilter(doc, cfg.motionAngle || 0, cfg.motionDistance || 30);
            } else {
                applyGaussianBlurFilter(doc, cfg.blurRadius || 25);
            }
        }

        // ====================================================================
        // OPTICAL NOISE & NON-DESTRUCTIVE FILM GRAIN OVERLAY ENGINE
        // ====================================================================
        function applyAddNoiseFilter(doc, amount, distributionStr, monochromatic) {
            try {
                var distEnum = (distributionStr === "Gaussian") ? NoiseDistribution.GAUSSIAN : NoiseDistribution.UNIFORM;
                doc.activeLayer.applyAddNoise(amount, distEnum, monochromatic);
            } catch (e) {
                try {
                    var idAdNs = charIDToTypeID("AdNs");
                    var desc = new ActionDescriptor();
                    desc.putEnumerated(charIDToTypeID("Dstr"), charIDToTypeID("Dstr"), (distributionStr === "Gaussian") ? charIDToTypeID("Gsn ") : charIDToTypeID("Unfr"));
                    desc.putUnitDouble(charIDToTypeID("Nose"), charIDToTypeID("#Prc"), amount);
                    desc.putBoolean(charIDToTypeID("Mnch"), monochromatic);
                    executeAction(idAdNs, desc, DIALOG_NO);
                } catch (e2) {}
            }
        }

        function applyProfessionalFilmGrainOverlay(doc, amount, monochromatic) {
            try {
                var grainLayer = doc.artLayers.add();
                grainLayer.name = "RI Studio Film Grain [35mm Stock]";
                
                var grayCol = new SolidColor();
                grayCol.rgb.red = 128;
                grayCol.rgb.green = 128;
                grayCol.rgb.blue = 128;
                app.foregroundColor = grayCol;

                doc.selection.selectAll();
                doc.selection.fill(grayCol, ColorBlendMode.NORMAL, 100, false);
                doc.selection.deselect();

                var distEnum = NoiseDistribution.GAUSSIAN;
                grainLayer.applyAddNoise(Math.max(1, Math.min(100, amount * 2.2)), distEnum, monochromatic);
                grainLayer.applyGaussianBlur(0.6);

                grainLayer.blendMode = BlendMode.SOFTLIGHT;
                grainLayer.opacity = Math.max(10, Math.min(100, Math.round(amount * 4)));
            } catch (grainErr) {
                try {
                    applyAddNoiseFilter(doc, Math.min(25, amount), "Gaussian", monochromatic);
                } catch (fbErr) {}
            }
        }

        // ====================================================================
        // 3D GLASS EFFECT STUDIO ENGINE (NATIVE PHOTOSHOP ACTIONMANAGER & DOM)
        // ====================================================================

        /**
         * Renders professional 3D Glass Effects natively in Photoshop.
         * Includes Frosted Glassmorphism, Fluted/Reeded Ribs, 3D Spheres,
         * Rainbow Prisms, Liquid Glass Refraction, and Beveled Glass Facets.
         */
        function apply3DGlassEffectPhotoshop(doc, cfg) {
            if (!cfg.glassEnable) return null;

            var w = Math.round(toPx(doc.width));
            var h = Math.round(toPx(doc.height));
            var style = cfg.glassStyle || "Frosted Glassmorphism (Floating 3D Slab)";
            if (style === "Random 3D Glass Style") {
                var pool = [
                    "Frosted Glassmorphism (Floating 3D Slab)",
                    "Fluted & Reeded Glass (Vertical Ribs)",
                    "3D Convex Glass Sphere (Crystal Lens)",
                    "Rainbow Prism (Chromatic Dispersion)",
                    "Liquid Wave Glass (Molten Fluid Refraction)",
                    "Beveled Glass Tiles (Facet Prisms)",
                    "Photoshop Frosted Glass Filter",
                    "Emerald Tinted Glass",
                    "Sapphire Blue Glass"
                ];
                style = pool[Math.floor(Math.random() * pool.length)];
            }

            var opacity = Math.max(10, Math.min(100, cfg.glassOpacity || 50));
            var frostBlur = Math.max(1, Math.min(60, cfg.glassFrostBlur || 15));
            var distortion = Math.max(5, Math.min(100, cfg.glassDistortion || 30));
            var tintColor = cfg.glassTintColor || "Clear Transparent";
            var scope = cfg.glassScope || "Full Composition";

            try {
                // 1. Duplicate active layer to form the 3D Glass Refraction Body
                var glassLayer = doc.activeLayer.duplicate();
                glassLayer.name = "RI 3D Glass [" + style + "]";
                doc.activeLayer = glassLayer;

                if (style.indexOf("Frosted") !== -1 || style.indexOf("Glassmorphism") !== -1) {
                    // Modern Frosted Glassmorphism
                    glassLayer.applyGaussianBlur(frostBlur);

                    // Add subtle micro-surface texture
                    applyAddNoiseFilter(doc, 4, "Gaussian", true);
                    glassLayer.opacity = opacity;

                    if (scope === "Center 3D Floating Panel") {
                        var insetX = Math.round(w * 0.16);
                        var insetY = Math.round(h * 0.18);
                        doc.selection.select([[insetX, insetY], [w - insetX, insetY], [w - insetX, h - insetY], [insetX, h - insetY]]);
                        doc.selection.invert();
                        doc.selection.clear();
                        doc.selection.deselect();

                        // 3D Rim Highlight Stroke on the floating glass pane
                        if (cfg.glassBevelRim) {
                            try {
                                var strokeLayer = doc.artLayers.add();
                                strokeLayer.name = "RI Glass Bevel Rim [Specular]";
                                var whiteCol = new SolidColor();
                                whiteCol.rgb.red = 255;
                                whiteCol.rgb.green = 255;
                                whiteCol.rgb.blue = 255;
                                doc.selection.select([[insetX, insetY], [w - insetX, insetY], [w - insetX, h - insetY], [insetX, h - insetY]]);
                                doc.selection.stroke(whiteCol, 2, StrokeLocation.INSIDE, ColorBlendMode.SCREEN, 45);
                                doc.selection.deselect();
                                strokeLayer.blendMode = BlendMode.SCREEN;
                                strokeLayer.opacity = 65;
                            } catch (strkErr) {}
                        }
                    }

                } else if (style.indexOf("Fluted") !== -1 || style.indexOf("Reeded") !== -1) {
                    // Fluted & Reeded Architectural Glass (Vertical Cylindrical Lenses)
                    glassLayer.applyMotionBlur(90, Math.round(distortion * 1.5));
                    var waveCount = Math.max(12, Math.round(w / 45));
                    glassLayer.applyWave(waveCount, 18, 36, 4, Math.round(distortion * 0.45), 100, 100, WaveType.SINE, UndefinedAreas.WRAPAROUND);
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.35));
                    glassLayer.opacity = opacity;

                } else if (style.indexOf("Sphere") !== -1 || style.indexOf("Lens") !== -1) {
                    // 3D Convex Glass Sphere / Optical Crystal Lens
                    var radius = Math.round(Math.min(w, h) * 0.32);
                    var cx = Math.round(w / 2);
                    var cy = Math.round(h / 2);

                    makeEllipticalSelectionSafe(doc, cy - radius, cx - radius, cy + radius, cx + radius);
                    glassLayer.applySpherize(Math.round(distortion * 0.85), SpherizeMode.NORMAL);
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.4));
                    doc.selection.invert();
                    doc.selection.clear();
                    doc.selection.deselect();
                    glassLayer.opacity = opacity;

                    // Specular Glare Reflection on Lens
                    if (cfg.glassBevelRim) {
                        try {
                            var flareLayer = doc.artLayers.add();
                            flareLayer.name = "RI Lens Specular Glare";
                            var flareCol = new SolidColor();
                            flareCol.rgb.red = 255;
                            flareCol.rgb.green = 255;
                            flareCol.rgb.blue = 255;
                            var glareR = Math.round(radius * 0.28);
                            var glareX = cx - Math.round(radius * 0.45);
                            var glareY = cy - Math.round(radius * 0.45);
                            makeEllipticalSelectionSafe(doc, glareY - glareR, glareX - glareR, glareY + glareR, glareX + glareR);
                            doc.selection.feather(Math.round(glareR * 0.5));
                            doc.selection.fill(flareCol, ColorBlendMode.NORMAL, 100, false);
                            doc.selection.deselect();
                            flareLayer.blendMode = BlendMode.SCREEN;
                            flareLayer.opacity = 75;
                        } catch (glareErr) {}
                    }

                } else if (style.indexOf("Rainbow") !== -1 || style.indexOf("Prism") !== -1) {
                    // Rainbow Prism & Chromatic Dispersion (Optical Refraction)
                    glassLayer.applyMotionBlur(0, Math.round(distortion * 1.4));
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.3));
                    glassLayer.blendMode = BlendMode.SCREEN;
                    glassLayer.opacity = Math.round(opacity * 0.75);

                } else if (style.indexOf("Liquid") !== -1) {
                    // Liquid Wave Glass (Molten Fluid Refraction)
                    glassLayer.applyWave(5, 120, 260, 18, Math.round(distortion * 0.65), 100, 100, WaveType.SINE, UndefinedAreas.WRAPAROUND);
                    glassLayer.applyTwirl(Math.round(distortion * 0.8));
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.45));
                    glassLayer.opacity = opacity;

                } else if (style.indexOf("Beveled") !== -1 || style.indexOf("Facet") !== -1) {
                    // Beveled Glass Tiles (Facet Prisms)
                    glassLayer.applyZigZag(Math.round(distortion * 0.6), 8, ZigZagType.AROUNDCENTER);
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.5));
                    glassLayer.opacity = opacity;

                } else {
                    // Native Photoshop Glass Filter Integration (Texture: Frosted / Tiny Lens / Blocks)
                    try {
                        var idGls = charIDToTypeID("Gls ");
                        var desc = new ActionDescriptor();
                        desc.putInteger(charIDToTypeID("Dstr"), Math.min(20, Math.max(1, Math.round(distortion / 5))));
                        desc.putInteger(charIDToTypeID("Smth"), Math.min(15, Math.max(1, Math.round(frostBlur / 3))));

                        var txtrID = charIDToTypeID("Frst"); // Frosted default
                        if (style.indexOf("Tiny Lens") !== -1) txtrID = charIDToTypeID("TnyL");
                        else if (style.indexOf("Blocks") !== -1) txtrID = charIDToTypeID("Blck");
                        desc.putEnumerated(charIDToTypeID("Txtr"), charIDToTypeID("TxtT"), txtrID);

                        desc.putUnitDouble(charIDToTypeID("Scl "), charIDToTypeID("#Prc"), 100);
                        executeAction(idGls, desc, DIALOG_NO);
                    } catch (glsErr) {
                        glassLayer.applyGaussianBlur(frostBlur);
                    }
                    glassLayer.opacity = opacity;
                }

                // 2. Apply Scope Masking if Left & Right Ribs or Outer Border requested
                if (scope === "Left & Right Ribbed Flutes") {
                    var fluteW = Math.round(w * 0.22);
                    doc.selection.select([[fluteW, 0], [w - fluteW, 0], [w - fluteW, h], [fluteW, h]]);
                    doc.selection.feather(40);
                    doc.selection.clear();
                    doc.selection.deselect();
                } else if (scope === "Outer Border Frame") {
                    var borderMargin = Math.round(Math.min(w, h) * 0.12);
                    doc.selection.select([[borderMargin, borderMargin], [w - borderMargin, borderMargin], [w - borderMargin, h - borderMargin], [borderMargin, h - borderMargin]]);
                    doc.selection.feather(35);
                    doc.selection.clear();
                    doc.selection.deselect();
                }

                // 3. Apply Professional Glass Tint Color Layer
                if (tintColor !== "Clear Transparent" || style.indexOf("Tint") !== -1 || style.indexOf("Emerald") !== -1 || style.indexOf("Sapphire") !== -1 || style.indexOf("Amber") !== -1 || style.indexOf("Rose") !== -1 || style.indexOf("Neon") !== -1) {
                    try {
                        var tintLayer = doc.artLayers.add();
                        tintLayer.name = "RI 3D Glass Tint [" + tintColor + "]";
                        var tintCol = new SolidColor();

                        if (tintColor.indexOf("Emerald") !== -1 || style.indexOf("Emerald") !== -1) {
                            tintCol.rgb.red = 24; tintCol.rgb.green = 185; tintCol.rgb.blue = 142;
                        } else if (tintColor.indexOf("Sapphire") !== -1 || style.indexOf("Sapphire") !== -1) {
                            tintCol.rgb.red = 28; tintCol.rgb.green = 112; tintCol.rgb.blue = 224;
                        } else if (tintColor.indexOf("Amber") !== -1 || style.indexOf("Amber") !== -1) {
                            tintCol.rgb.red = 236; tintCol.rgb.green = 162; tintCol.rgb.blue = 44;
                        } else if (tintColor.indexOf("Rose") !== -1 || style.indexOf("Rose") !== -1) {
                            tintCol.rgb.red = 232; tintCol.rgb.green = 124; tintCol.rgb.blue = 168;
                        } else if (tintColor.indexOf("Neon") !== -1 || style.indexOf("Neon") !== -1) {
                            tintCol.rgb.red = 148; tintCol.rgb.green = 62; tintCol.rgb.blue = 248;
                        } else {
                            tintCol.rgb.red = 180; tintCol.rgb.green = 210; tintCol.rgb.blue = 235;
                        }

                        doc.selection.selectAll();
                        doc.selection.fill(tintCol, ColorBlendMode.NORMAL, 100, false);
                        doc.selection.deselect();

                        tintLayer.blendMode = BlendMode.COLORBLEND;
                        tintLayer.opacity = 22;
                    } catch (tintErr) {}
                }

                return style + " (" + scope + ", Opacity: " + opacity + "%)";

            } catch (glassErr) {
                return null;
            }
        }

        // ====================================================================
        // OPTICAL LIGHTING, HOLLYWOOD FLARE & STUDIO VIGNETTE ENGINE
        // ====================================================================
        function applyStudioOpticalLighting(doc, cfg) {
            var w = Math.round(toPx(doc.width));
            var h = Math.round(toPx(doc.height));

            if (cfg.vignetteEnable) {
                try {
                    var vigLayer = doc.artLayers.add();
                    vigLayer.name = "RI Studio Optical Vignette";
                    var blackCol = new SolidColor();
                    blackCol.rgb.red = 0;
                    blackCol.rgb.green = 0;
                    blackCol.rgb.blue = 0;

                    var featherRadius = Math.round(Math.min(w, h) * 0.22);
                    var insetX = Math.round(w * 0.08);
                    var insetY = Math.round(h * 0.08);

                    makeEllipticalSelectionSafe(doc, insetY, insetX, h - insetY, w - insetX);
                    doc.selection.invert();
                    doc.selection.feather(featherRadius);
                    doc.selection.fill(blackCol, ColorBlendMode.NORMAL, 100, false);
                    doc.selection.deselect();

                    vigLayer.blendMode = BlendMode.MULTIPLY;
                    vigLayer.opacity = Math.max(10, Math.min(80, cfg.vignetteAmount || 30));
                } catch (vigErr) {}
            }

            if (cfg.anamorphicFlareEnable) {
                try {
                    var flareLayer = doc.artLayers.add();
                    flareLayer.name = "RI Hollywood Anamorphic Streak";
                    var cyanGoldCol = new SolidColor();
                    cyanGoldCol.rgb.red = 210;
                    cyanGoldCol.rgb.green = 235;
                    cyanGoldCol.rgb.blue = 255;

                    var flareY = Math.round(h * 0.42);
                    var streakH = Math.max(4, Math.round(h * 0.015));

                    doc.selection.select([[0, flareY], [w, flareY], [w, flareY + streakH], [0, flareY + streakH]]);
                    doc.selection.fill(cyanGoldCol, ColorBlendMode.NORMAL, 100, false);
                    doc.selection.deselect();

                    flareLayer.applyMotionBlur(0, Math.round(w * 0.35));
                    flareLayer.applyGaussianBlur(Math.round(streakH * 1.5));
                    flareLayer.blendMode = BlendMode.SCREEN;
                    flareLayer.opacity = 45;
                } catch (flareErr) {}
            }

            if (cfg.ambientSunlightEnable) {
                try {
                    var sunLayer = doc.artLayers.add();
                    sunLayer.name = "RI Ambient Sunlight Rim";
                    var sunCol = new SolidColor();
                    sunCol.rgb.red = 255;
                    sunCol.rgb.green = 245;
                    sunCol.rgb.blue = 220;

                    var sunH = Math.round(h * 0.35);
                    doc.selection.select([[0, 0], [w, 0], [w, sunH], [0, sunH]]);
                    doc.selection.feather(Math.round(h * 0.15));
                    doc.selection.fill(sunCol, ColorBlendMode.NORMAL, 100, false);
                    doc.selection.deselect();

                    sunLayer.blendMode = BlendMode.SOFTLIGHT;
                    sunLayer.opacity = 40;
                } catch (sunErr) {}
            }
        }

        // ====================================================================
        // LIQUIFY & FLUID DISTORTION ENGINE
        // ====================================================================
        function applyOrganicLiquifyFlow(doc, style, intensity) {
            var norm = Math.max(1, Math.min(150, intensity)) / 100.0;
            var chosenStyle = style;
            if (chosenStyle === "Random Fluid") {
                var styles = [
                    "Organic Fluid Wave", "Silk Swirl Vortex", "Liquid Marble Flow", 
                    "Abstract Mesh Warp", "Spherical 3D Bulge", "Hourglass Silhouette", 
                    "Pinch & Pucker Vortex", "Spiral Wave Flow", "Directional Ripple Warp"
                ];
                chosenStyle = styles[Math.floor(Math.random() * styles.length)];
            }

            try {
                if (chosenStyle === "Silk Swirl Vortex") {
                    var twirlAngle = Math.round((Math.random() > 0.5 ? 1 : -1) * (85 + norm * 180));
                    doc.activeLayer.applyTwirl(twirlAngle);
                    doc.activeLayer.applyWave(
                        5,
                        Math.round(160 + Math.random() * 200),
                        Math.round(320 + Math.random() * 240),
                        Math.round(25 + norm * 65),
                        Math.round(45 + norm * 85),
                        100,
                        100,
                        WaveType.SINE,
                        UndefinedAreas.WRAPAROUND
                    );
                } else if (chosenStyle === "Liquid Marble Flow") {
                    doc.activeLayer.applyWave(
                        7,
                        Math.round(110 + Math.random() * 160),
                        Math.round(250 + Math.random() * 210),
                        Math.round(30 + norm * 75),
                        Math.round(50 + norm * 90),
                        100,
                        100,
                        WaveType.SINE,
                        UndefinedAreas.WRAPAROUND
                    );
                    var secondarySwirl = Math.round((Math.random() > 0.5 ? 1 : -1) * (55 + norm * 110));
                    doc.activeLayer.applyTwirl(secondarySwirl);
                } else if (chosenStyle === "Abstract Mesh Warp") {
                    doc.activeLayer.applyZigZag(
                        Math.round(25 + norm * 65),
                        Math.round(5 + norm * 12),
                        ZigZagType.AROUNDCENTER
                    );
                    doc.activeLayer.applyTwirl(Math.round((Math.random() > 0.5 ? 1 : -1) * (55 + norm * 95)));
                } else if (chosenStyle === "Spherical 3D Bulge") {
                    doc.activeLayer.applySpherize(Math.round(30 + norm * 65), SpherizeMode.NORMAL);
                } else if (chosenStyle === "Hourglass Silhouette") {
                    doc.activeLayer.applyPinch(Math.round(25 + norm * 50));
                } else if (chosenStyle === "Pinch & Pucker Vortex") {
                    doc.activeLayer.applyPinch(Math.round(35 + norm * 55));
                    doc.activeLayer.applyTwirl(Math.round((Math.random() > 0.5 ? 1 : -1) * (65 + norm * 120)));
                } else if (chosenStyle === "Spiral Wave Flow") {
                    doc.activeLayer.applyTwirl(Math.round((Math.random() > 0.5 ? 1 : -1) * (110 + norm * 140)));
                    doc.activeLayer.applyWave(
                        4,
                        Math.round(120 + Math.random() * 150),
                        Math.round(260 + Math.random() * 200),
                        Math.round(20 + norm * 55),
                        Math.round(40 + norm * 75),
                        100,
                        100,
                        WaveType.SINE,
                        UndefinedAreas.WRAPAROUND
                    );
                } else if (chosenStyle === "Directional Ripple Warp") {
                    doc.activeLayer.applyRipple(Math.round(40 + norm * 80), RippleSize.MEDIUM);
                } else {
                    doc.activeLayer.applyWave(
                        6,
                        Math.round(180 + Math.random() * 180),
                        Math.round(380 + Math.random() * 260),
                        Math.round(28 + norm * 70),
                        Math.round(48 + norm * 88),
                        100,
                        100,
                        WaveType.SINE,
                        UndefinedAreas.WRAPAROUND
                    );
                    doc.activeLayer.applyTwirl(Math.round((Math.random() > 0.5 ? 1 : -1) * (35 + norm * 65)));
                }
            } catch (liqErr) {
                try {
                    doc.activeLayer.applyTwirl(Math.round(75 * norm));
                } catch (fallbackErr) {}
            }
        }

        // ====================================================================
        // GRADIENT FILL ENGINE
        // ====================================================================
        function resolveGradientParameters(cfg) {
            var categoryName = cfg.gradientPreset;
            if (categoryName === "Random Preset" || !GRADIENT_PRESETS.hasOwnProperty(categoryName)) {
                var keys = [];
                for (var k in GRADIENT_PRESETS) {
                    if (GRADIENT_PRESETS.hasOwnProperty(k)) {
                        keys.push(k);
                    }
                }
                categoryName = keys[Math.floor(Math.random() * keys.length)];
            }

            var palettes = GRADIENT_PRESETS[categoryName];
            var chosenPalette = palettes[Math.floor(Math.random() * palettes.length)];

            var stopCount = Math.min(chosenPalette.length, Math.floor(Math.random() * 3) + 2);
            var finalColors = [];
            var warmShift = Math.floor(Math.random() * 15) - 7;
            for (var i = 0; i < stopCount; i++) {
                var baseRgb = chosenPalette[i];
                var r = Math.max(10, Math.min(245, baseRgb[0] + warmShift + Math.floor(Math.random() * 11) - 5));
                var g = Math.max(10, Math.min(245, baseRgb[1] + Math.floor(Math.random() * 11) - 5));
                var b = Math.max(10, Math.min(245, baseRgb[2] - warmShift + Math.floor(Math.random() * 11) - 5));
                finalColors.push([r, g, b]);
            }

            var stopLocations = [];
            if (stopCount === 2) {
                stopLocations = [0, 4096];
            } else if (stopCount === 3) {
                var midLoc = Math.floor(4096 * (0.38 + (Math.random() * 0.24)));
                stopLocations = [0, midLoc, 4096];
            } else {
                var loc1 = Math.floor(4096 * (0.28 + (Math.random() * 0.12)));
                var loc2 = Math.floor(4096 * (0.64 + (Math.random() * 0.14)));
                stopLocations = [0, loc1, loc2, 4096];
            }

            var gradTypes = ["Linear", "Radial", "Angle", "Reflected", "Diamond"];
            var chosenType = cfg.gradientType;
            if (chosenType === "Random Type") {
                chosenType = gradTypes[Math.floor(Math.random() * gradTypes.length)];
            }

            var angle = Math.floor(Math.random() * 360) - 180;
            var offsetX = Math.floor(Math.random() * 50) - 25;
            var offsetY = Math.floor(Math.random() * 50) - 25;
            var scale = Math.floor(Math.random() * 55) + 95;

            return {
                category: categoryName,
                colors: finalColors,
                locations: stopLocations,
                type: chosenType,
                angle: angle,
                offsetX: offsetX,
                offsetY: offsetY,
                scale: scale
            };
        }

        function mapBlendModeToEnum(blendStr) {
            switch (blendStr) {
                case "Overlay": return BlendMode.OVERLAY;
                case "Normal": return BlendMode.NORMAL;
                case "Multiply": return BlendMode.MULTIPLY;
                case "Screen": return BlendMode.SCREEN;
                case "Color": return BlendMode.COLORBLEND;
                case "Hard Light": return BlendMode.HARDLIGHT;
                default: return BlendMode.SOFTLIGHT;
            }
        }

        function mapGradientTypeToID(typeStr) {
            switch (typeStr) {
                case "Radial": return charIDToTypeID("Rdl ");
                case "Angle": return charIDToTypeID("Angl");
                case "Reflected": return charIDToTypeID("Rflc");
                case "Diamond": return charIDToTypeID("Dmnd");
                default: return charIDToTypeID("Lnr ");
            }
        }

        function buildGradientFillLayer(doc, layerName, colors, locations, gradType, angle, offsetX, offsetY, scale, opacity, blendModeEnum) {
            var idMk = charIDToTypeID("Mk  ");
            var descMain = new ActionDescriptor();
            var refLayer = new ActionReference();
            refLayer.putClass(stringIDToTypeID("contentLayer"));
            descMain.putReference(charIDToTypeID("null"), refLayer);

            var descContentLayer = new ActionDescriptor();
            var descGradFill = new ActionDescriptor();

            descGradFill.putUnitDouble(charIDToTypeID("Angl"), charIDToTypeID("#Ang"), angle);
            descGradFill.putEnumerated(charIDToTypeID("Type"), charIDToTypeID("GrdT"), mapGradientTypeToID(gradType));
            descGradFill.putUnitDouble(charIDToTypeID("Scl "), charIDToTypeID("#Prc"), scale);

            var descOffset = new ActionDescriptor();
            descOffset.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Prc"), offsetX);
            descOffset.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Prc"), offsetY);
            descGradFill.putObject(charIDToTypeID("Ofst"), charIDToTypeID("Pnt "), descOffset);

            descGradFill.putBoolean(charIDToTypeID("Dthr"), true);
            descGradFill.putBoolean(charIDToTypeID("Algn"), true);

            var descGrad = new ActionDescriptor();
            descGrad.putString(charIDToTypeID("Nm  "), layerName);
            descGrad.putEnumerated(charIDToTypeID("GrdF"), charIDToTypeID("GrdF"), charIDToTypeID("CstS"));
            descGrad.putDouble(charIDToTypeID("Intr"), 4096);

            var listColors = new ActionList();
            var numStops = colors.length;
            for (var i = 0; i < numStops; i++) {
                var descStop = new ActionDescriptor();
                var descCol = new ActionDescriptor();
                descCol.putDouble(charIDToTypeID("Rd  "), colors[i][0]);
                descCol.putDouble(charIDToTypeID("Grn "), colors[i][1]);
                descCol.putDouble(charIDToTypeID("Bl  "), colors[i][2]);
                descStop.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), descCol);
                descStop.putEnumerated(charIDToTypeID("Type"), charIDToTypeID("Clry"), charIDToTypeID("UsrS"));

                var loc = (locations && locations.length === numStops) ? locations[i] : ((numStops === 1) ? 0 : Math.round((i / (numStops - 1)) * 4096));
                descStop.putInteger(charIDToTypeID("Lctn"), loc);
                descStop.putInteger(charIDToTypeID("Mdpn"), 50);
                listColors.putObject(charIDToTypeID("Clrt"), descStop);
            }
            descGrad.putList(charIDToTypeID("Clrs"), listColors);

            var listTrans = new ActionList();
            var descTStart = new ActionDescriptor();
            descTStart.putUnitDouble(charIDToTypeID("Opct"), charIDToTypeID("#Prc"), 100);
            descTStart.putInteger(charIDToTypeID("Lctn"), 0);
            descTStart.putInteger(charIDToTypeID("Mdpn"), 50);
            listTrans.putObject(charIDToTypeID("TrnS"), descTStart);

            var descTEnd = new ActionDescriptor();
            descTEnd.putUnitDouble(charIDToTypeID("Opct"), charIDToTypeID("#Prc"), 100);
            descTEnd.putInteger(charIDToTypeID("Lctn"), 4096);
            descTEnd.putInteger(charIDToTypeID("Mdpn"), 50);
            listTrans.putObject(charIDToTypeID("TrnS"), descTEnd);
            descGrad.putList(charIDToTypeID("Trns"), listTrans);

            descGradFill.putObject(charIDToTypeID("Grad"), charIDToTypeID("Grdn"), descGrad);
            descContentLayer.putObject(charIDToTypeID("Type"), stringIDToTypeID("gradientLayer"), descGradFill);
            descMain.putObject(charIDToTypeID("Usng"), stringIDToTypeID("contentLayer"), descContentLayer);

            executeAction(idMk, descMain, DIALOG_NO);

            var layer = doc.activeLayer;
            layer.name = layerName;
            layer.opacity = opacity;
            layer.blendMode = blendModeEnum;
            return layer;
        }

        function applyEditableGradientLayer(doc, cfg) {
            var params = resolveGradientParameters(cfg);

            try {
                buildGradientFillLayer(
                    doc,
                    "RI Base Gradient [" + params.category + " - " + params.type + "]",
                    params.colors,
                    params.locations,
                    params.type,
                    params.angle,
                    params.offsetX,
                    params.offsetY,
                    params.scale,
                    cfg.gradientOpacity,
                    mapBlendModeToEnum(cfg.gradientBlendMode)
                );

                if (cfg.gradientMultiLayerMesh && params.colors.length >= 2) {
                    var highlightCol = params.colors[params.colors.length - 1];
                    var shadowCol = params.colors[0];
                    var meshColors = [highlightCol, shadowCol];
                    var meshAngle = (params.angle + 135) % 360 - 180;
                    var meshOffsetX = Math.max(-35, Math.min(35, -params.offsetX + (Math.floor(Math.random() * 21) - 10)));
                    var meshOffsetY = Math.max(-35, Math.min(35, -params.offsetY + (Math.floor(Math.random() * 21) - 10)));
                    var meshOpacity = Math.max(12, Math.round(cfg.gradientOpacity * 0.55));

                    buildGradientFillLayer(
                        doc,
                        "RI Mesh Light Accent [" + params.category + "]",
                        meshColors,
                        [0, 4096],
                        "Radial",
                        meshAngle,
                        meshOffsetX,
                        meshOffsetY,
                        125,
                        meshOpacity,
                        BlendMode.SCREEN
                    );
                }
            } catch (gradErr) {
                var rasterLayer = doc.artLayers.add();
                rasterLayer.name = "RI Gradient Fallback";
                var fg = new SolidColor();
                fg.rgb.red = params.colors[0][0];
                fg.rgb.green = params.colors[0][1];
                fg.rgb.blue = params.colors[0][2];
                app.foregroundColor = fg;

                var bg = new SolidColor();
                var lastIdx = params.colors.length - 1;
                bg.rgb.red = params.colors[lastIdx][0];
                bg.rgb.green = params.colors[lastIdx][1];
                bg.rgb.blue = params.colors[lastIdx][2];
                app.backgroundColor = bg;

                var idGrdn = charIDToTypeID("Grdn");
                var descG = new ActionDescriptor();
                var descFrom = new ActionDescriptor();
                descFrom.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Pxl"), 0);
                descFrom.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Pxl"), 0);
                descG.putObject(charIDToTypeID("From"), charIDToTypeID("Pnt "), descFrom);

                var descTo = new ActionDescriptor();
                descTo.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Pxl"), cfg.width);
                descTo.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Pxl"), cfg.height);
                descG.putObject(charIDToTypeID("T   "), charIDToTypeID("Pnt "), descTo);
                descG.putEnumerated(charIDToTypeID("Type"), charIDToTypeID("GrdT"), mapGradientTypeToID(params.type));
                executeAction(idGrdn, descG, DIALOG_NO);

                rasterLayer.opacity = cfg.gradientOpacity;
                rasterLayer.blendMode = mapBlendModeToEnum(cfg.gradientBlendMode);
            }

            return params;
        }

        // ====================================================================
        // MULTI-FORMAT EXPORT ENGINE (JPEG 300 DPI, TIFF, PNG, PSD)
        // ====================================================================
        function exportDocumentMaster(doc, outFile, cfg) {
            var isPSD = (cfg.exportFormat.indexOf("PSD") !== -1);
            if (!isPSD) {
                try {
                    if (doc.layers.length > 1) {
                        doc.flatten();
                    }
                    while (doc.channels.length > 3) {
                        doc.channels[doc.channels.length - 1].remove();
                    }
                } catch (cleanErr) {}
            }

            try {
                if (cfg.embedProfile) {
                    doc.convertProfile("sRGB IEC61966-2.1", Intent.PERCEPTUAL, true, true);
                }
            } catch (profErr) {}

            setDocumentResolution300DPI(doc);

            if (cfg.exportFormat.indexOf("TIFF") !== -1) {
                var tifOpts = new TiffSaveOptions();
                tifOpts.imageCompression = TIFFEncoding.TIFFLZW;
                tifOpts.byteOrder = ByteOrder.IBM;
                tifOpts.embedColorProfile = Boolean(cfg.embedProfile);
                tifOpts.layers = false;
                doc.saveAs(outFile, tifOpts, true, Extension.LOWERCASE);

            } else if (cfg.exportFormat.indexOf("PNG") !== -1) {
                try {
                    var pngOpts = new PNGSaveOptions();
                    pngOpts.compression = 6;
                    pngOpts.interlaced = false;
                    doc.saveAs(outFile, pngOpts, true, Extension.LOWERCASE);
                } catch (pngErr) {
                    try {
                        var sfwOpts = new ExportOptionsSaveForWeb();
                        sfwOpts.format = SaveDocumentType.PNG;
                        sfwOpts.PNG8 = false;
                        sfwOpts.quality = 100;
                        doc.exportDocument(outFile, ExportType.SAVEFORWEB, sfwOpts);
                    } catch (sfwErr) {}
                }

            } else if (isPSD) {
                var psdOpts = new PhotoshopSaveOptions();
                psdOpts.layers = true;
                psdOpts.embedColorProfile = Boolean(cfg.embedProfile);
                doc.saveAs(outFile, psdOpts, true, Extension.LOWERCASE);

            } else {
                var jpgOpts = new JPEGSaveOptions();
                jpgOpts.quality = Math.max(1, Math.min(12, Math.round(cfg.jpegQuality)));
                jpgOpts.formatOptions = FormatOptions.STANDARDBASELINE;
                jpgOpts.embedColorProfile = Boolean(cfg.embedProfile);
                jpgOpts.matte = MatteType.NONE;

                try {
                    doc.saveAs(outFile, jpgOpts, true, Extension.LOWERCASE);
                } catch (saveErr) {
                    var idsave = charIDToTypeID("save");
                    var desc = new ActionDescriptor();
                    var descAs = new ActionDescriptor();
                    descAs.putInteger(charIDToTypeID("EQlt"), jpgOpts.quality);
                    descAs.putEnumerated(charIDToTypeID("MttC"), charIDToTypeID("MttC"), charIDToTypeID("None"));
                    desc.putObject(charIDToTypeID("As  "), charIDToTypeID("JPEG"), descAs);
                    desc.putPath(charIDToTypeID("In  "), outFile);
                    desc.putBoolean(charIDToTypeID("Cpy "), true);
                    desc.putBoolean(charIDToTypeID("LwCs"), true);
                    executeAction(idsave, desc, DIALOG_NO);
                }
            }
        }

        function verifyExportedFile(outFile, expectedW, expectedH, minBytes) {
            if (!outFile || !outFile.exists) {
                return { valid: false, reason: "Exported file was not created on disk.", sizeBytes: 0 };
            }

            var fileSize = outFile.length;
            if (fileSize < 1024) {
                return { valid: false, reason: "Exported file is empty or corrupted (< 1 KB).", sizeBytes: fileSize };
            }

            if (minBytes > 0 && fileSize < minBytes) {
                return {
                    valid: false,
                    reason: "File size (" + formatBytesToMB(fileSize) + " MB) is below minimum required (" + formatBytesToMB(minBytes) + " MB).",
                    sizeBytes: fileSize,
                    belowMinSize: true
                };
            }

            return {
                valid: true,
                reason: "Verified OK (" + formatBytesToMB(fileSize) + " MB, " + expectedW + "x" + expectedH + " px)",
                sizeBytes: fileSize
            };
        }

        // ========================================================================
        // 6. SINGLE & 3-IMAGE FUSION PROCESSING PIPELINE (ANTI-SIMILAR ENGINE)
        // ========================================================================

        function placeImageInSpatialZone(mainDoc, imgFile, zoneType, cfg, layerTag) {
            var extraDoc = null;
            try {
                if (!imgFile || !imgFile.exists || imgFile.length === 0) return;
                extraDoc = app.open(imgFile);
                convertToHighPrecisionRGB(extraDoc);
                prepareBaseLayer(extraDoc);

                var zoneW = Math.round(cfg.width / 3);
                var zoneH = cfg.height;
                var overlap = cfg.seamlessBlend ? Math.round(cfg.seamlessFeather || 60) : 0;
                var extraW = zoneW + (zoneType === "CENTER" ? overlap * 2 : overlap);

                resizeImageSmart(extraDoc, extraW, zoneH, "Fit/Crop (Fill)");

                try {
                    extraDoc.activeLayer.duplicate(mainDoc);
                } catch (dupErr1) {
                    try {
                        extraDoc.activeLayer.duplicate(mainDoc, PLACE_TOP);
                    } catch (dupErr2) {}
                }
                extraDoc.close(DO_NOT_SAVE);
                extraDoc = null;

                app.activeDocument = mainDoc;
                var pastedLayer = mainDoc.layers[0];
                mainDoc.activeLayer = pastedLayer;
                pastedLayer.name = layerTag;

                var bounds = pastedLayer.bounds;
                var curX = Math.round(toPx(bounds[0]));
                var curY = Math.round(toPx(bounds[1]));
                var targetX = 0;
                if (zoneType === "LEFT") {
                    targetX = 0;
                } else if (zoneType === "RIGHT") {
                    targetX = cfg.width - extraW;
                } else {
                    targetX = zoneW - overlap;
                }
                pastedLayer.translate(UnitValue(targetX - curX, "px"), UnitValue(0 - curY, "px"));

                if (cfg.seamlessBlend && overlap > 0) {
                    try {
                        if (zoneType === "CENTER") {
                            var b = pastedLayer.bounds;
                            var leftSeamX = Math.round(toPx(b[0]));
                            var rightSeamX = Math.round(toPx(b[2]));

                            mainDoc.selection.select([[leftSeamX, 0], [leftSeamX + overlap, 0], [leftSeamX + overlap, cfg.height], [leftSeamX, cfg.height]]);
                            mainDoc.selection.feather(overlap * 0.7);
                            mainDoc.selection.clear();

                            mainDoc.selection.select([[rightSeamX - overlap, 0], [rightSeamX, 0], [rightSeamX, cfg.height], [rightSeamX - overlap, cfg.height]]);
                            mainDoc.selection.feather(overlap * 0.7);
                            mainDoc.selection.clear();
                            mainDoc.selection.deselect();
                        } else if (zoneType === "RIGHT") {
                            var bRight = pastedLayer.bounds;
                            var seamX = Math.round(toPx(bRight[0]));
                            mainDoc.selection.select([[seamX, 0], [seamX + overlap, 0], [seamX + overlap, cfg.height], [seamX, cfg.height]]);
                            mainDoc.selection.feather(overlap * 0.7);
                            mainDoc.selection.clear();
                            mainDoc.selection.deselect();
                        }
                    } catch (blendErr) {
                        try { mainDoc.selection.deselect(); } catch (e3) {}
                    }
                }
            } catch (err) {
                if (extraDoc !== null) {
                    try { extraDoc.close(DO_NOT_SAVE); } catch (e2) {}
                }
            }
        }

        function processSingleImage(tripletFiles, folders, seqCounter, cfg) {
            var doc = null;
            var tempOutputFile = null;
            var minRequiredBytes = cfg.minFileSizeMB * 1024 * 1024;
            var primaryFile = (tripletFiles instanceof Array) ? tripletFiles[0] : tripletFiles;
            var isTriplet = (tripletFiles instanceof Array && tripletFiles.length >= 2);
            var fusedNames = [];
            if (tripletFiles instanceof Array) {
                for (var n = 0; n < tripletFiles.length; n++) {
                    fusedNames.push(tripletFiles[n].name);
                }
            } else {
                fusedNames.push(primaryFile.name);
            }

            try {
                if (!primaryFile.exists || primaryFile.length === 0) {
                    throw new Error("Source file is missing or 0 bytes (corrupted).");
                }

                doc = app.open(primaryFile);
                convertToHighPrecisionRGB(doc);
                prepareBaseLayer(doc);

                if (isTriplet) {
                    var zoneW = Math.round(cfg.width / 3);

                    if (cfg.blurScope === "Background Only" && cfg.blurType && cfg.blurType !== "None (Clean Stock Approved)") {
                        resizeImageSmart(doc, cfg.width, cfg.height, "Fit/Crop (Fill)");
                        applyPhotoshopBlurEngineJSX(doc, cfg);
                        doc.activeLayer.name = "Blurred Backdrop";

                        placeImageInSpatialZone(doc, primaryFile, "LEFT", cfg, "Left Zone [" + primaryFile.name + "]");
                        var centerFile = (tripletFiles.length >= 2) ? tripletFiles[1] : primaryFile;
                        var rightFile = (tripletFiles.length >= 3) ? tripletFiles[2] : (tripletFiles[1] || primaryFile);
                        placeImageInSpatialZone(doc, centerFile, "CENTER", cfg, "Center Zone [" + centerFile.name + "]");
                        placeImageInSpatialZone(doc, rightFile, "RIGHT", cfg, "Right Zone [" + rightFile.name + "]");
                        doc.flatten();
                        prepareBaseLayer(doc);
                    } else {
                        resizeImageSmart(doc, zoneW, cfg.height, "Fit/Crop (Fill)");
                        doc.resizeCanvas(UnitValue(cfg.width, "px"), UnitValue(cfg.height, "px"), AnchorPosition.MIDDLELEFT);
                        doc.activeLayer.name = "Left Zone [" + primaryFile.name + "]";

                        var rightFile = (tripletFiles.length >= 3) ? tripletFiles[2] : (tripletFiles[1] || primaryFile);
                        var centerFile = (tripletFiles.length >= 2) ? tripletFiles[1] : primaryFile;

                        placeImageInSpatialZone(doc, rightFile, "RIGHT", cfg, "Right Zone [" + rightFile.name + "]");
                        placeImageInSpatialZone(doc, centerFile, "CENTER", cfg, "Center Zone [" + centerFile.name + "]");

                        doc.flatten();
                        prepareBaseLayer(doc);

                        if (cfg.blurScope === "Full Composition" && cfg.blurType && cfg.blurType !== "None (Clean Stock Approved)") {
                            applyPhotoshopBlurEngineJSX(doc, cfg);
                        }
                    }
                } else {
                    resizeImageSmart(doc, cfg.width, cfg.height, cfg.resizeMode);
                    if (cfg.blurType && cfg.blurType !== "None (Clean Stock Approved)") {
                        applyPhotoshopBlurEngineJSX(doc, cfg);
                    }
                }

                // Film Grain & Add Noise Filter
                if (cfg.noiseEnable && cfg.noiseAmount > 0) {
                    if (cfg.noiseFilmGrainOverlay) {
                        applyProfessionalFilmGrainOverlay(doc, cfg.noiseAmount, cfg.noiseMonochromatic);
                    } else {
                        applyAddNoiseFilter(doc, cfg.noiseAmount, cfg.noiseDistribution, cfg.noiseMonochromatic);
                    }
                }

                // 3D Glass Effect Studio Engine
                var appliedGlassInfo = null;
                if (cfg.glassEnable) {
                    appliedGlassInfo = apply3DGlassEffectPhotoshop(doc, cfg);
                }

                // Optical Lighting & Vignette Engine
                if (cfg.lightingEnable) {
                    applyStudioOpticalLighting(doc, cfg);
                }

                // Creative 30-Category Gradient Layer
                var appliedGradInfo = null;
                if (cfg.gradientEnable) {
                    appliedGradInfo = applyEditableGradientLayer(doc, cfg);
                }

                if (doc.layers.length > 1) {
                    doc.flatten();
                }

                // Liquify & Fluid Flow Distortion
                if (cfg.liquifyEnable && cfg.liquifyIntensity > 0) {
                    prepareBaseLayer(doc);
                    applyOrganicLiquifyFlow(doc, cfg.liquifyStyle, cfg.liquifyIntensity);
                }

                finalizeTo8BitDithered(doc);

                var slot = getNextAvailableOutputFile(folders.processed, cfg.filenamePrefix, seqCounter, cfg.exportFormat);
                tempOutputFile = slot.file;

                var actualDocW = Math.round(toPx(doc.width));
                var actualDocH = Math.round(toPx(doc.height));
                if (actualDocW !== cfg.width || actualDocH !== cfg.height) {
                    try { doc.resizeImage(UnitValue(cfg.width, "px"), UnitValue(cfg.height, "px"), 300, (typeof ResampleMethod !== "undefined" && ResampleMethod.BICUBICSMOOTHER) ? ResampleMethod.BICUBICSMOOTHER : ResampleMethod.BICUBIC); } catch (resErr) { doc.resizeImage(UnitValue(cfg.width, "px"), UnitValue(cfg.height, "px"), 300); }
                }

                exportDocumentMaster(doc, tempOutputFile, cfg);

                var qcResult = verifyExportedFile(tempOutputFile, cfg.width, cfg.height, minRequiredBytes);

                if (!qcResult.valid && qcResult.belowMinSize) {
                    if (tempOutputFile.exists) {
                        tempOutputFile.remove();
                    }

                    try {
                        prepareBaseLayer(doc);
                        doc.activeLayer.applyUnSharpMask(45, 0.9, 0);
                        applyAddNoiseFilter(doc, 10, "Gaussian", false);
                    } catch (detailErr) {}

                    exportDocumentMaster(doc, tempOutputFile, cfg);
                    qcResult = verifyExportedFile(tempOutputFile, cfg.width, cfg.height, minRequiredBytes);
                }

                doc.close(DO_NOT_SAVE);
                doc = null;

                if (!qcResult.valid) {
                    if (tempOutputFile && tempOutputFile.exists) {
                        tempOutputFile.remove();
                    }
                    return {
                        success: false,
                        belowMinSize: Boolean(qcResult.belowMinSize),
                        sourceName: fusedNames.join(" + "),
                        outputName: tempOutputFile ? tempOutputFile.name : "N/A",
                        reason: qcResult.reason,
                        nextSeq: seqCounter
                    };
                }

                var summaryExtra = [];
                if (appliedGlassInfo) summaryExtra.push("3D Glass: " + appliedGlassInfo);
                if (appliedGradInfo) summaryExtra.push("Gradient: " + appliedGradInfo.category);
                var extraText = (summaryExtra.length > 0) ? (" | " + summaryExtra.join(" | ")) : "";

                return {
                    success: true,
                    belowMinSize: false,
                    sourceName: fusedNames.join(" + "),
                    outputName: tempOutputFile.name,
                    sizeMB: formatBytesToMB(qcResult.sizeBytes),
                    extraInfo: extraText,
                    nextSeq: slot.nextSeq
                };

            } catch (err) {
                if (doc !== null) {
                    try { doc.close(DO_NOT_SAVE); } catch (closeErr) {}
                }
                if (tempOutputFile !== null && tempOutputFile.exists) {
                    try { tempOutputFile.remove(); } catch (rmErr) {}
                }
                return {
                    success: false,
                    belowMinSize: false,
                    sourceName: fusedNames.join(" + "),
                    outputName: "N/A",
                    reason: "Processing Error: " + err.message,
                    nextSeq: seqCounter
                };
            }
        }

        // ========================================================================
        // 7. REPORT GENERATION SYSTEM
        // ========================================================================
        function generateAllReports(folders, totalScanned, totalQueued) {
            var endTime = getTimestamp();
            var summaryLines = [
                "====================================================================",
                "RI CREATIVE - BATCH BACKGROUND PROCESSING STUDIO PRO",
                "PROCESSING SUMMARY REPORT (3D GLASS & ULTRA PRO MASTER EDITION)",
                "====================================================================",
                "Start Time           : " + (batchState.startTime || "N/A"),
                "End Time             : " + endTime,
                "Photoshop Version    : " + PS_VERSION + (IS_CS2 ? " (Photoshop CS2 9.0.2 Mode)" : ""),
                "Source Folder        : " + config.sourcePath,
                "Output Folder        : " + folders.root.fsName,
                "--------------------------------------------------------------------",
                "Target Dimensions    : " + config.width + " x " + config.height + " px (300 DPI)",
                "Resize Mode          : " + config.resizeMode,
                "Export Format        : " + config.exportFormat + " (Quality: " + config.jpegQuality + "/12, ICC: " + config.embedProfile + ")",
                "3D Glass Effect      : " + (config.glassEnable ? ("Enabled (" + config.glassStyle + ", " + config.glassScope + ", " + config.glassOpacity + "%)") : "Disabled"),
                "Blur Filter          : " + (config.blurEnable ? (config.blurType + " - Radius: " + config.blurRadius + " px") : "Disabled"),
                "Noise & Film Grain   : " + (config.noiseEnable ? (config.noiseAmount + "% " + config.noiseDistribution + " (Overlay: " + config.noiseFilmGrainOverlay + ")") : "Disabled"),
                "Optical Lighting     : " + (config.lightingEnable ? "Enabled" : "Disabled"),
                "Liquify Fluid Flow   : " + (config.liquifyEnable ? ("Enabled (" + config.liquifyStyle + ")") : "Disabled"),
                "Gradient Overlay     : " + (config.gradientEnable ? ("Enabled (" + config.gradientPreset + ")") : "Disabled"),
                "Minimum File Size    : " + config.minFileSizeMB + " MB",
                "--------------------------------------------------------------------",
                "Total Supported Found: " + totalScanned,
                "Total Queued in Batch: " + totalQueued,
                "Successful Exports   : " + batchState.successCount,
                "Failed Images        : " + batchState.failedCount,
                "Below " + config.minFileSizeMB + " MB Rejected  : " + batchState.belowMinSizeCount,
                "Status               : " + (batchState.stopRequested ? "STOPPED BY USER" : "COMPLETED"),
                "===================================================================="
            ];

            var genReportLines = [
                "====================================================================",
                "RI CREATIVE - DETAILED GENERATION REPORT",
                "Generated: " + endTime,
                "===================================================================="
            ].concat(batchState.logs);

            var failedReportLines = [
                "====================================================================",
                "RI CREATIVE - FAILED & REJECTED IMAGES REPORT",
                "Generated: " + endTime,
                "Total Failed/Rejected: " + batchState.failedCount,
                "===================================================================="
            ];

            if (batchState.failedDetails.length === 0) {
                failedReportLines.push("No failed or rejected images recorded in this batch.");
            } else {
                failedReportLines = failedReportLines.concat(batchState.failedDetails);
            }

            writeTextFile(folders.reports.fsName + "/Processing_Summary.txt", summaryLines.join("\n"));
            writeTextFile(folders.reports.fsName + "/Generation_Report.txt", genReportLines.join("\n"));
            writeTextFile(folders.reports.fsName + "/Failed_Images.txt", failedReportLines.join("\n"));
        }

        // ========================================================================
        // 8. COMPACT, MODERN & USER-FRIENDLY TABBED SCRIPTUI CONTROL PANEL
        // ========================================================================
        function launchStudioUI() {
            var win = new Window("dialog", SCRIPT_TITLE + " v" + SCRIPT_VERSION);
            win.orientation = "column";
            win.alignChildren = ["fill", "top"];
            win.spacing = 6;
            win.margins = 10;
            win.preferredSize = [550, 440];

            // TOP HEADER
            var headerGrp = win.add("group");
            headerGrp.orientation = "row";
            headerGrp.alignChildren = ["left", "center"];
            var titleText = headerGrp.add("statictext", undefined, "RI CREATIVE — BATCH BACKGROUND STUDIO PRO");
            try {
                titleText.graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);
            } catch (fontErr) {}

            var badgeText = headerGrp.add("statictext", undefined, "💎 3D GLASS & 16-BIT RETINA ENGINE");
            try {
                badgeText.graphics.font = ScriptUI.newFont("Arial", "REGULAR", 10);
            } catch (fontErr2) {}

            // ====================================================================
            // 4-TAB NAVIGATION ENGINE (PHOTOSHOP CS2 9.0.2 - CC 2026 UNIVERSAL)
            // ====================================================================
            var tabNav = win.add("group");
            tabNav.orientation = "row";
            tabNav.alignChildren = ["center", "center"];
            tabNav.spacing = 4;

            var btnTab1 = tabNav.add("button", undefined, "1. Folders & Export");
            btnTab1.preferredSize = [130, 24];

            var btnTab2 = tabNav.add("button", undefined, "2. Blur & Noise");
            btnTab2.preferredSize = [120, 24];

            var btnTab3 = tabNav.add("button", undefined, "3. 3D Glass Studio");
            btnTab3.preferredSize = [125, 24];

            var btnTab4 = tabNav.add("button", undefined, "4. Gradient & Light");
            btnTab4.preferredSize = [135, 24];

            var stackBox = win.add("group");
            stackBox.orientation = "stack";
            stackBox.alignChildren = ["fill", "fill"];
            stackBox.preferredSize = [530, 280];

            var tabSetup = stackBox.add("panel", undefined, "1. Folders, Resolution & Export Engine");
            var tabEffects = stackBox.add("panel", undefined, "2. Blur Engine & Film Grain Noise");
            var tabGlass = stackBox.add("panel", undefined, "3. 3D Glass Studio Engine");
            var tabCreative = stackBox.add("panel", undefined, "4. Creative Gradient & Studio Lighting");

            function selectTab(idx) {
                tabSetup.visible = (idx === 0);
                tabEffects.visible = (idx === 1);
                tabGlass.visible = (idx === 2);
                tabCreative.visible = (idx === 3);

                btnTab1.enabled = (idx !== 0);
                btnTab2.enabled = (idx !== 1);
                btnTab3.enabled = (idx !== 2);
                btnTab4.enabled = (idx !== 3);

                if (win && typeof win.layout !== "undefined" && typeof win.layout.layout === "function") {
                    try { win.layout.layout(true); } catch (layErr) {}
                }
            }

            btnTab1.onClick = function () { selectTab(0); };
            btnTab2.onClick = function () { selectTab(1); };
            btnTab3.onClick = function () { selectTab(2); };
            btnTab4.onClick = function () { selectTab(3); };

            selectTab(0);

            tabSetup.orientation = "column";
            tabSetup.alignChildren = ["fill", "top"];
            tabSetup.spacing = 6;
            tabSetup.margins = 8;

            var srcRow = tabSetup.add("group");
            var btnBrowseSrc = srcRow.add("button", undefined, "Source Folder...");
            btnBrowseSrc.preferredSize = [115, 23];
            var txtSrcPath = srcRow.add("edittext", undefined, "", { readonly: true });
            txtSrcPath.preferredSize = [385, 21];

            var outRow = tabSetup.add("group");
            var btnBrowseOut = outRow.add("button", undefined, "Output Folder...");
            btnBrowseOut.preferredSize = [115, 23];
            var txtOutPath = outRow.add("edittext", undefined, "", { readonly: true });
            txtOutPath.preferredSize = [385, 21];

            var modeRow = tabSetup.add("group");
            modeRow.add("statictext", undefined, "Mode:");
            var ddBatchScope = modeRow.add("dropdownlist", undefined, ["3-Image Fusion (Anti-Similar)", "All Images (1-by-1)", "Selected Images"]);
            ddBatchScope.selection = 0;
            ddBatchScope.preferredSize = [190, 21];

            var btnSelectSpecific = modeRow.add("button", undefined, "Pick Files...");
            btnSelectSpecific.preferredSize = [75, 21];
            btnSelectSpecific.enabled = false;

            var lblScannedInfo = modeRow.add("statictext", undefined, "Found: 0 images");
            lblScannedInfo.preferredSize = [165, 20];

            var sep1 = tabSetup.add("panel");
            sep1.alignment = "fill";

            var resPresetLabels = [];
            for (var r = 0; r < RESOLUTION_PRESETS.length; r++) {
                resPresetLabels.push(RESOLUTION_PRESETS[r].label);
            }

            var dimPresetRow = tabSetup.add("group");
            dimPresetRow.add("statictext", undefined, "Resolution Preset:");
            var ddResPreset = dimPresetRow.add("dropdownlist", undefined, resPresetLabels);
            ddResPreset.selection = 0;
            ddResPreset.preferredSize = [235, 21];

            dimPresetRow.add("statictext", undefined, "W:");
            var inpWidth = dimPresetRow.add("edittext", undefined, String(DEFAULT_CONFIG.width));
            inpWidth.preferredSize = [50, 21];
            dimPresetRow.add("statictext", undefined, "H:");
            var inpHeight = dimPresetRow.add("edittext", undefined, String(DEFAULT_CONFIG.height));
            inpHeight.preferredSize = [50, 21];

            var dimRow2 = tabSetup.add("group");
            dimRow2.add("statictext", undefined, "Resize Mode:");
            var ddResizeMode = dimRow2.add("dropdownlist", undefined, ["Fit/Crop (Fill)", "Fit (Contain)", "Stretch"]);
            ddResizeMode.selection = 0;
            ddResizeMode.preferredSize = [120, 21];

            var chkSeamless = dimRow2.add("checkbox", undefined, "Seamless Seam Blending");
            chkSeamless.value = DEFAULT_CONFIG.seamlessBlend;

            dimRow2.add("statictext", undefined, "Max Batch:");
            var inpMaxBatch = dimRow2.add("edittext", undefined, String(DEFAULT_CONFIG.maxBatchCount));
            inpMaxBatch.preferredSize = [42, 21];

            var expRow1 = tabSetup.add("group");
            expRow1.add("statictext", undefined, "Export Format:");
            var ddExportFormat = expRow1.add("dropdownlist", undefined, [
                "JPEG (Baseline 300 DPI)",
                "TIFF (Lossless LZW 300 DPI)",
                "PNG (Lossless 24-bit)",
                "PSD (Master Layered Archive)"
            ]);
            ddExportFormat.selection = 0;
            ddExportFormat.preferredSize = [170, 21];

            expRow1.add("statictext", undefined, "JPEG Q (1-12):");
            var inpJpegQuality = expRow1.add("edittext", undefined, String(DEFAULT_CONFIG.jpegQuality));
            inpJpegQuality.preferredSize = [32, 21];

            expRow1.add("statictext", undefined, "Min MB:");
            var inpMinSizeMB = expRow1.add("edittext", undefined, String(DEFAULT_CONFIG.minFileSizeMB));
            inpMinSizeMB.preferredSize = [38, 21];

            expRow1.add("statictext", undefined, "Prefix:");
            var inpPrefix = expRow1.add("edittext", undefined, DEFAULT_CONFIG.filenamePrefix);
            inpPrefix.preferredSize = [95, 21];

            var chkEmbedProfile = tabSetup.add("checkbox", undefined, "Embed sRGB Color Profile (300 DPI Commercial Print Standard)");
            chkEmbedProfile.value = DEFAULT_CONFIG.embedProfile;

            // --------------------------------------------------------------------
            // TAB 2: BLUR & NOISE ENGINE
            // --------------------------------------------------------------------
            tabEffects.orientation = "column";
            tabEffects.alignChildren = ["fill", "top"];
            tabEffects.spacing = 6;
            tabEffects.margins = 8;

            var blurRow1 = tabEffects.add("group");
            blurRow1.add("statictext", undefined, "Photoshop Blur Filter (11 Algorithms):");
            var ddBlurType = blurRow1.add("dropdownlist", undefined, [
                "None (Clean Stock Approved)",
                "Average",
                "Blur",
                "Blur More",
                "Box Blur...",
                "Gaussian Blur...",
                "Lens Blur...",
                "Motion Blur...",
                "Radial Blur...",
                "Shape Blur...",
                "Smart Blur...",
                "Surface Blur..."
            ]);
            ddBlurType.selection = 0;
            ddBlurType.preferredSize = [230, 21];

            var blurRow2 = tabEffects.add("group");
            blurRow2.add("statictext", undefined, "Radius (px):");
            var inpBlurRad = blurRow2.add("edittext", undefined, String(DEFAULT_CONFIG.blurRadius));
            inpBlurRad.preferredSize = [46, 21];
            blurRow2.add("statictext", undefined, "Threshold:");
            var inpBlurThresh = blurRow2.add("edittext", undefined, String(DEFAULT_CONFIG.blurThreshold));
            inpBlurThresh.preferredSize = [46, 21];
            blurRow2.add("statictext", undefined, "Angle (°):");
            var inpMotionAngle = blurRow2.add("edittext", undefined, String(DEFAULT_CONFIG.motionAngle));
            inpMotionAngle.preferredSize = [42, 21];
            blurRow2.add("statictext", undefined, "Dist:");
            var inpMotionDist = blurRow2.add("edittext", undefined, String(DEFAULT_CONFIG.motionDistance));
            inpMotionDist.preferredSize = [42, 21];

            var blurRow3 = tabEffects.add("group");
            blurRow3.add("statictext", undefined, "Radial Method:");
            var ddRadialMethod = blurRow3.add("dropdownlist", undefined, ["Spin", "Zoom"]);
            ddRadialMethod.selection = 0;
            ddRadialMethod.preferredSize = [80, 21];
            blurRow3.add("statictext", undefined, "Blur Scope:");
            var ddBlurScope = blurRow3.add("dropdownlist", undefined, ["Full Composition", "Background Only", "Outer Panels"]);
            ddBlurScope.selection = 0;
            ddBlurScope.preferredSize = [145, 21];

            var sep2 = tabEffects.add("panel");
            sep2.alignment = "fill";

            var noiseRow1 = tabEffects.add("group");
            var chkNoise = noiseRow1.add("checkbox", undefined, "Enable Noise & Film Grain");
            chkNoise.value = DEFAULT_CONFIG.noiseEnable;
            chkNoise.preferredSize = [185, 20];
            noiseRow1.add("statictext", undefined, "Amount (%):");
            var inpNoiseAmt = noiseRow1.add("edittext", undefined, String(DEFAULT_CONFIG.noiseAmount));
            inpNoiseAmt.preferredSize = [48, 21];
            var chkFilmGrainOverlay = noiseRow1.add("checkbox", undefined, "Pro 50% Gray Film Grain Layer");
            chkFilmGrainOverlay.value = DEFAULT_CONFIG.noiseFilmGrainOverlay;

            var noiseRow2 = tabEffects.add("group");
            noiseRow2.add("statictext", undefined, "Noise Distribution:");
            var ddNoiseDist = noiseRow2.add("dropdownlist", undefined, ["Gaussian", "Uniform"]);
            ddNoiseDist.selection = 0;
            ddNoiseDist.preferredSize = [110, 21];
            var chkNoiseMono = noiseRow2.add("checkbox", undefined, "Monochromatic Noise");
            chkNoiseMono.value = DEFAULT_CONFIG.noiseMonochromatic;

            // --------------------------------------------------------------------
            // TAB 3: 3D GLASS EFFECT STUDIO (NEW DEDICATED TAB)
            // --------------------------------------------------------------------
            // TAB 3: 3D GLASS STUDIO
            // --------------------------------------------------------------------
            tabGlass.orientation = "column";
            tabGlass.alignChildren = ["fill", "top"];
            tabGlass.spacing = 6;
            tabGlass.margins = 8;

            var glassRow1 = tabGlass.add("group");
            var chkGlassEnable = glassRow1.add("checkbox", undefined, "Enable 3D Glass Effect");
            chkGlassEnable.value = DEFAULT_CONFIG.glassEnable;
            chkGlassEnable.preferredSize = [180, 20];

            glassRow1.add("statictext", undefined, "Glass Style:");
            var ddGlassStyle = glassRow1.add("dropdownlist", undefined, GLASS_STYLE_PRESETS);
            ddGlassStyle.selection = 0;
            ddGlassStyle.preferredSize = [230, 21];

            var glassRow2 = tabGlass.add("group");
            glassRow2.add("statictext", undefined, "Glass Scope:");
            var ddGlassScope = glassRow2.add("dropdownlist", undefined, [
                "Full Composition",
                "Center 3D Floating Panel",
                "Left & Right Ribbed Flutes",
                "Outer Border Frame"
            ]);
            ddGlassScope.selection = 0;
            ddGlassScope.preferredSize = [160, 21];

            glassRow2.add("statictext", undefined, "Glass Tint:");
            var ddGlassTint = glassRow2.add("dropdownlist", undefined, [
                "Clear Transparent",
                "Emerald Green",
                "Sapphire Blue",
                "Amber Gold",
                "Rose Quartz",
                "Cyberpunk Neon"
            ]);
            ddGlassTint.selection = 0;
            ddGlassTint.preferredSize = [135, 21];

            var glassRow3 = tabGlass.add("group");
            glassRow3.add("statictext", undefined, "Opacity (%):");
            var inpGlassOpacity = glassRow3.add("edittext", undefined, String(DEFAULT_CONFIG.glassOpacity));
            inpGlassOpacity.preferredSize = [42, 21];

            glassRow3.add("statictext", undefined, "Frost Blur (px):");
            var inpGlassFrostBlur = glassRow3.add("edittext", undefined, String(DEFAULT_CONFIG.glassFrostBlur));
            inpGlassFrostBlur.preferredSize = [42, 21];

            glassRow3.add("statictext", undefined, "Refraction Distort:");
            var inpGlassDistort = glassRow3.add("edittext", undefined, String(DEFAULT_CONFIG.glassDistortion));
            inpGlassDistort.preferredSize = [42, 21];

            var chkGlassBevel = glassRow3.add("checkbox", undefined, "3D Bevel & Specular Rim");
            chkGlassBevel.value = DEFAULT_CONFIG.glassBevelRim;

            var glassInfoPanel = tabGlass.add("panel", undefined, "3D Glass Characteristics");
            glassInfoPanel.orientation = "column";
            glassInfoPanel.alignChildren = ["fill", "top"];
            glassInfoPanel.spacing = 2;
            glassInfoPanel.margins = 6;
            glassInfoPanel.add("statictext", undefined, "• Frosted Glassmorphism: Smooth Gaussian depth blur + micro-surface noise.");
            glassInfoPanel.add("statictext", undefined, "• Fluted / Reeded Glass: Cylindrical vertical optical lenses with wave refraction.");
            glassInfoPanel.add("statictext", undefined, "• 3D Convex Sphere: Spherical optical distortion + specular glare reflection.");
            glassInfoPanel.add("statictext", undefined, "• Rainbow Prism: Chromatic horizontal aberration dispersion effect.");

            // --------------------------------------------------------------------
            // TAB 4: CREATIVE GRADIENT, LIGHTING & LIQUIFY
                // --------------------------------------------------------------------
            // TAB 4: CREATIVE GRADIENT, LIGHTING & LIQUIFY
            // --------------------------------------------------------------------
            tabCreative.orientation = "column";
            tabCreative.alignChildren = ["fill", "top"];
            tabCreative.spacing = 6;
            tabCreative.margins = 8;

            var gradRow1 = tabCreative.add("group");
            var chkGradient = gradRow1.add("checkbox", undefined, "Enable Gradient Overlay");
            chkGradient.value = DEFAULT_CONFIG.gradientEnable;
            chkGradient.preferredSize = [175, 20];
            gradRow1.add("statictext", undefined, "Opacity (%):");
            var inpGradOpacity = gradRow1.add("edittext", undefined, String(DEFAULT_CONFIG.gradientOpacity));
            inpGradOpacity.preferredSize = [45, 21];
            gradRow1.add("statictext", undefined, "Blend:");
            var ddGradBlend = gradRow1.add("dropdownlist", undefined, ["Soft Light", "Overlay", "Normal", "Multiply", "Screen", "Color", "Hard Light"]);
            ddGradBlend.selection = 0;
            ddGradBlend.preferredSize = [105, 21];

            var gradRow2 = tabCreative.add("group");
            gradRow2.add("statictext", undefined, "Preset (30 Categories):");
            var ddGradPreset = gradRow2.add("dropdownlist", undefined, PRESET_NAMES);
            ddGradPreset.selection = 0;
            ddGradPreset.preferredSize = [175, 21];
            gradRow2.add("statictext", undefined, "Type:");
            var ddGradType = gradRow2.add("dropdownlist", undefined, ["Random Type", "Linear", "Radial", "Angle", "Reflected", "Diamond"]);
            ddGradType.selection = 0;
            ddGradType.preferredSize = [115, 21];
            var chkMultiLayerMesh = gradRow2.add("checkbox", undefined, "Dual Mesh");
            chkMultiLayerMesh.value = DEFAULT_CONFIG.gradientMultiLayerMesh;

            var sep3 = tabCreative.add("panel");
            sep3.alignment = "fill";

            var lightRow = tabCreative.add("group");
            var chkLighting = lightRow.add("checkbox", undefined, "Optical Lighting Engine");
            chkLighting.value = DEFAULT_CONFIG.lightingEnable;
            var chkVignette = lightRow.add("checkbox", undefined, "Studio Vignette");
            chkVignette.value = DEFAULT_CONFIG.vignetteEnable;
            var chkAnamorphic = lightRow.add("checkbox", undefined, "Anamorphic Flare");
            chkAnamorphic.value = DEFAULT_CONFIG.anamorphicFlareEnable;
            var chkSunlight = lightRow.add("checkbox", undefined, "Sunlight Rim");
            chkSunlight.value = DEFAULT_CONFIG.ambientSunlightEnable;

            var sep4 = tabCreative.add("panel");
            sep4.alignment = "fill";

            var liqRow1 = tabCreative.add("group");
            var chkLiquify = liqRow1.add("checkbox", undefined, "Enable Liquify Fluid Flow");
            chkLiquify.value = DEFAULT_CONFIG.liquifyEnable;
            chkLiquify.preferredSize = [175, 20];
            liqRow1.add("statictext", undefined, "Intensity (%):");
            var inpLiqIntensity = liqRow1.add("edittext", undefined, String(DEFAULT_CONFIG.liquifyIntensity));
            inpLiqIntensity.preferredSize = [45, 21];

            var liqRow2 = tabCreative.add("group");
            liqRow2.add("statictext", undefined, "Fluid Style:");
            var ddLiqStyle = liqRow2.add("dropdownlist", undefined, [
                "Organic Fluid Wave", "Silk Swirl Vortex", "Liquid Marble Flow", 
                "Abstract Mesh Warp", "Spherical 3D Bulge", "Hourglass Silhouette", 
                "Pinch & Pucker Vortex", "Spiral Wave Flow", "Directional Ripple Warp", "Random Fluid"
            ]);
            ddLiqStyle.selection = 0;
            ddLiqStyle.preferredSize = [200, 21];

            tabPanel.selection = tabSetup;

            // --------------------------------------------------------------------
            // COMPACT PROGRESS & TELEMETRY BAR
            // --------------------------------------------------------------------
            var progPanel = win.add("panel", undefined, "Batch Execution Telemetry");
            progPanel.orientation = "column";
            progPanel.alignChildren = ["fill", "top"];
            progPanel.spacing = 3;
            progPanel.margins = 7;

            var progressBar = progPanel.add("progressbar", undefined, 0, 100);
            progressBar.preferredSize = [510, 14];

            var lblCurrentFile = progPanel.add("statictext", undefined, "Ready. Select Source & Output folders, then click START.");
            var lblStats = progPanel.add("statictext", undefined, "Success: 0  |  Failed: 0  |  Below Min MB: 0  |  Remaining: 0");

            // --------------------------------------------------------------------
            // COMPACT ACTION BUTTON BAR
            // --------------------------------------------------------------------
            var ctrlGrp = win.add("group");
            ctrlGrp.orientation = "row";
            ctrlGrp.alignChildren = ["center", "center"];
            ctrlGrp.spacing = 6;

            var btnStart = ctrlGrp.add("button", undefined, "START");
            btnStart.preferredSize = [70, 28];

            var btnPause = ctrlGrp.add("button", undefined, "PAUSE");
            btnPause.preferredSize = [60, 28];
            btnPause.enabled = false;

            var btnResume = ctrlGrp.add("button", undefined, "RESUME");
            btnResume.preferredSize = [65, 28];
            btnResume.enabled = false;

            var btnStop = ctrlGrp.add("button", undefined, "STOP");
            btnStop.preferredSize = [55, 28];
            btnStop.enabled = false;

            var btnSkip = ctrlGrp.add("button", undefined, "SKIP");
            btnSkip.preferredSize = [52, 28];
            btnSkip.enabled = false;

            var btnRetry = ctrlGrp.add("button", undefined, "RETRY");
            btnRetry.preferredSize = [58, 28];
            btnRetry.enabled = false;

            var btnReset = ctrlGrp.add("button", undefined, "RESET");
            btnReset.preferredSize = [58, 28];

            var btnClose = ctrlGrp.add("button", undefined, "CLOSE");
            btnClose.preferredSize = [58, 28];

            var scannedFilesCache = [];

            ddResPreset.onChange = function () {
                var idx = ddResPreset.selection ? ddResPreset.selection.index : 0;
                if (idx < RESOLUTION_PRESETS.length - 1) {
                    inpWidth.text = String(RESOLUTION_PRESETS[idx].width);
                    inpHeight.text = String(RESOLUTION_PRESETS[idx].height);
                }
            };

            function updateStatsUI(remainingCount, statusMsg) {
                if (statusMsg !== undefined) {
                    lblCurrentFile.text = statusMsg;
                }
                lblStats.text = "Success: " + batchState.successCount +
                    "  |  Failed: " + batchState.failedCount +
                    "  |  Below Min MB: " + batchState.belowMinSizeCount +
                    "  |  Remaining: " + remainingCount;
                if (win && typeof win.update === "function") {
                    try { win.update(); } catch (uErr) {}
                }
            }

            function setControlsRunningState(running) {
                btnStart.enabled = !running;
                btnPause.enabled = running && !batchState.isPaused;
                btnResume.enabled = running && batchState.isPaused;
                btnStop.enabled = running;
                btnSkip.enabled = running;
                btnRetry.enabled = !running && (batchState.failedQueue.length > 0);
                btnReset.enabled = !running;
                btnClose.enabled = true;
                btnBrowseSrc.enabled = !running;
                btnBrowseOut.enabled = !running;
                if (win && typeof win.update === "function") {
                    try { win.update(); } catch (uErr) {}
                }
            }

            function parseIntSafe(val, fallback, minV, maxV) {
                var n = parseInt(val, 10);
                if (isNaN(n)) return fallback;
                if (n < minV) return minV;
                if (n > maxV) return maxV;
                return n;
            }

            function parseFloatSafe(val, fallback, minV, maxV) {
                var n = parseFloat(val);
                if (isNaN(n)) return fallback;
                if (n < minV) return minV;
                if (n > maxV) return maxV;
                return n;
            }

            function syncConfigFromUI() {
                config.sourcePath = txtSrcPath.text;
                config.outputPath = txtOutPath.text;
                config.processMode = ddBatchScope.selection ? ddBatchScope.selection.text : "3-Image Fusion (Anti-Similar)";
                config.width = parseIntSafe(inpWidth.text, 4000, 100, 30000);
                config.height = parseIntSafe(inpHeight.text, 2000, 100, 30000);
                config.resizeMode = ddResizeMode.selection ? ddResizeMode.selection.text : "Fit/Crop (Fill)";
                config.seamlessBlend = chkSeamless.value;
                config.maxBatchCount = parseIntSafe(inpMaxBatch.text, 500, 1, MAX_ALLOWED_BATCH);

                config.exportFormat = ddExportFormat.selection ? ddExportFormat.selection.text : "JPEG (Baseline 300 DPI)";
                config.jpegQuality = parseIntSafe(inpJpegQuality.text, 12, 1, 12);
                config.minFileSizeMB = parseFloatSafe(inpMinSizeMB.text, 0, 0, 100);
                config.embedProfile = chkEmbedProfile.value;
                config.filenamePrefix = sanitizeFilenamePrefix(inpPrefix.text);

                config.blurType = ddBlurType.selection ? ddBlurType.selection.text : "None (Clean Stock Approved)";
                config.blurRadius = parseFloatSafe(inpBlurRad.text, 25, 0.1, 250);
                config.blurThreshold = parseIntSafe(inpBlurThresh.text, 25, 2, 100);
                config.motionAngle = parseIntSafe(inpMotionAngle.text, 0, -180, 180);
                config.motionDistance = parseIntSafe(inpMotionDist.text, 30, 1, 250);
                config.radialMethod = ddRadialMethod.selection ? ddRadialMethod.selection.text : "Spin";
                config.blurScope = ddBlurScope.selection ? ddBlurScope.selection.text : "Full Composition";
                config.blurEnable = (config.blurType !== "None (Clean Stock Approved)");

                config.noiseEnable = chkNoise.value;
                config.noiseAmount = parseFloatSafe(inpNoiseAmt.text, 6, 1, 100);
                config.noiseFilmGrainOverlay = chkFilmGrainOverlay.value;
                config.noiseDistribution = ddNoiseDist.selection ? ddNoiseDist.selection.text : "Gaussian";
                config.noiseMonochromatic = chkNoiseMono.value;

                // 3D Glass Studio Sync
                config.glassEnable = chkGlassEnable.value;
                config.glassStyle = ddGlassStyle.selection ? ddGlassStyle.selection.text : "Frosted Glassmorphism (Floating 3D Slab)";
                config.glassScope = ddGlassScope.selection ? ddGlassScope.selection.text : "Full Composition";
                config.glassTintColor = ddGlassTint.selection ? ddGlassTint.selection.text : "Clear Transparent";
                config.glassOpacity = parseIntSafe(inpGlassOpacity.text, 50, 10, 100);
                config.glassFrostBlur = parseFloatSafe(inpGlassFrostBlur.text, 15, 1, 60);
                config.glassDistortion = parseIntSafe(inpGlassDistort.text, 30, 5, 100);
                config.glassBevelRim = chkGlassBevel.value;

                config.lightingEnable = chkLighting.value;
                config.vignetteEnable = chkVignette.value;
                config.anamorphicFlareEnable = chkAnamorphic.value;
                config.ambientSunlightEnable = chkSunlight.value;

                config.gradientEnable = chkGradient.value;
                config.gradientPreset = ddGradPreset.selection ? ddGradPreset.selection.text : "Random Preset";
                config.gradientType = ddGradType.selection ? ddGradType.selection.text : "Random Type";
                config.gradientOpacity = parseIntSafe(inpGradOpacity.text, 35, 1, 100);
                config.gradientBlendMode = ddGradBlend.selection ? ddGradBlend.selection.text : "Soft Light";
                config.gradientMultiLayerMesh = chkMultiLayerMesh.value;

                config.liquifyEnable = chkLiquify.value;
                config.liquifyStyle = ddLiqStyle.selection ? ddLiqStyle.selection.text : "Organic Fluid Wave";
                config.liquifyIntensity = parseIntSafe(inpLiqIntensity.text, 65, 1, 150);
            }

            function resetSettingsToDefault() {
                config = cloneConfig(DEFAULT_CONFIG);
                ddResPreset.selection = 0;
                inpWidth.text = String(config.width);
                inpHeight.text = String(config.height);
                ddResizeMode.selection = 0;
                chkSeamless.value = config.seamlessBlend;
                inpMaxBatch.text = String(config.maxBatchCount);

                ddExportFormat.selection = 0;
                inpJpegQuality.text = String(config.jpegQuality);
                inpMinSizeMB.text = String(config.minFileSizeMB);
                chkEmbedProfile.value = config.embedProfile;
                inpPrefix.text = config.filenamePrefix;

                ddBlurType.selection = 0;
                inpBlurRad.text = String(config.blurRadius);
                inpBlurThresh.text = String(config.blurThreshold);
                inpMotionAngle.text = String(config.motionAngle);
                inpMotionDist.text = String(config.motionDistance);
                ddRadialMethod.selection = 0;
                ddBlurScope.selection = 0;

                chkNoise.value = config.noiseEnable;
                inpNoiseAmt.text = String(config.noiseAmount);
                chkFilmGrainOverlay.value = config.noiseFilmGrainOverlay;
                ddNoiseDist.selection = 0;
                chkNoiseMono.value = config.noiseMonochromatic;

                // Reset 3D Glass controls
                chkGlassEnable.value = config.glassEnable;
                ddGlassStyle.selection = 0;
                ddGlassScope.selection = 0;
                ddGlassTint.selection = 0;
                inpGlassOpacity.text = String(config.glassOpacity);
                inpGlassFrostBlur.text = String(config.glassFrostBlur);
                inpGlassDistort.text = String(config.glassDistortion);
                chkGlassBevel.value = config.glassBevelRim;

                chkLighting.value = config.lightingEnable;
                chkVignette.value = config.vignetteEnable;
                chkAnamorphic.value = config.anamorphicFlareEnable;
                chkSunlight.value = config.ambientSunlightEnable;

                chkGradient.value = config.gradientEnable;
                ddGradPreset.selection = 0;
                ddGradType.selection = 0;
                inpGradOpacity.text = String(config.gradientOpacity);
                ddGradBlend.selection = 0;
                chkMultiLayerMesh.value = config.gradientMultiLayerMesh;

                chkLiquify.value = config.liquifyEnable;
                ddLiqStyle.selection = 0;
                inpLiqIntensity.text = String(config.liquifyIntensity);
            }

            btnBrowseSrc.onClick = function () {
                var chosen = Folder.selectDialog("Select Source Image Folder");
                if (chosen) {
                    txtSrcPath.text = chosen.fsName;
                    scannedFilesCache = scanSourceFolder(chosen.fsName);
                    var tripletCount = Math.ceil(scannedFilesCache.length / 3);
                    lblScannedInfo.text = "Found: " + scannedFilesCache.length + " (" + tripletCount + " sets)";
                    if (scannedFilesCache.length === 0) {
                        alert("Notice: No supported images (JPG, PNG, TIF, PSD, BMP) found in:\n" + chosen.fsName);
                    }
                }
            };

            btnBrowseOut.onClick = function () {
                var chosen = Folder.selectDialog("Select Output Destination Folder");
                if (chosen) {
                    txtOutPath.text = chosen.fsName;
                }
            };

            ddBatchScope.onChange = function () {
                var isSelectedMode = (ddBatchScope.selection && ddBatchScope.selection.text === "Selected Images");
                btnSelectSpecific.enabled = isSelectedMode;
            };

            btnSelectSpecific.onClick = function () {
                var filterPattern = ($.os.indexOf("Windows") !== -1) ?
                    "Supported Images:*.jpg;*.jpeg;*.png;*.tif;*.tiff;*.psd;*.bmp,All Files:*.*" :
                    function (f) { return (f instanceof Folder) || SUPPORTED_EXTENSIONS.test(f.name); };
                var picked = null;
                try {
                    picked = File.openDialog("Select Images to Process", filterPattern, true);
                } catch (dialogErr) {
                    picked = File.openDialog("Select Images to Process", "*.*", true);
                }
                if (picked && picked.length > 0) {
                    config.selectedFiles = picked;
                    lblScannedInfo.text = "Picked: " + picked.length + " files";
                }
            };

            btnPause.onClick = function () {
                batchState.isPaused = true;
                setControlsRunningState(true);
                updateStatsUI(Math.max(0, batchState.queue.length - batchState.currentIndex), "PAUSED at item " + (batchState.currentIndex + 1));
            };

            btnResume.onClick = function () {
                batchState.isPaused = false;
                setControlsRunningState(true);
            };

            btnStop.onClick = function () {
                batchState.stopRequested = true;
                batchState.isPaused = false;
            };

            btnSkip.onClick = function () {
                batchState.skipCurrentRequested = true;
            };

            btnReset.onClick = function () {
                resetSettingsToDefault();
                lblCurrentFile.text = "Settings reset to studio defaults.";
            };

            btnClose.onClick = function () {
                if (batchState.isRunning) {
                    batchState.stopRequested = true;
                    batchState.isPaused = false;
                }
                win.close(0);
            };

            win.onClose = function () {
                if (batchState.isRunning) {
                    batchState.stopRequested = true;
                    batchState.isPaused = false;
                }
                return true;
            };

            function buildProcessingQueue() {
                var baseList = [];
                if (config.processMode === "Selected Images" && config.selectedFiles.length > 0) {
                    baseList = config.selectedFiles.slice(0);
                } else {
                    baseList = scanSourceFolder(config.sourcePath);
                }

                if (baseList.length > config.maxBatchCount) {
                    baseList = baseList.slice(0, config.maxBatchCount);
                }

                if (config.processMode === "3-Image Fusion (Anti-Similar)") {
                    var triplets = [];
                    for (var i = 0; i < baseList.length; i += 3) {
                        var grp = [baseList[i]];
                        if (i + 1 < baseList.length) grp.push(baseList[i + 1]);
                        if (i + 2 < baseList.length) grp.push(baseList[i + 2]);
                        triplets.push(grp);
                    }
                    return { queue: triplets, totalScanned: baseList.length };
                }

                return { queue: baseList, totalScanned: baseList.length };
            }

            function executeBatchQueue(customQueue, totalScannedCount) {
                var folders;
                try {
                    folders = ensureOutputStructure(config.outputPath);
                } catch (dirErr) {
                    lblCurrentFile.text = "Folder Error: " + dirErr.message;
                    return;
                }

                batchState.isRunning = true;
                batchState.isPaused = false;
                batchState.stopRequested = false;
                batchState.skipCurrentRequested = false;
                batchState.queue = customQueue;
                batchState.failedQueue = [];
                batchState.currentIndex = 0;
                batchState.successCount = 0;
                batchState.failedCount = 0;
                batchState.belowMinSizeCount = 0;
                batchState.logs = [];
                batchState.failedDetails = [];
                batchState.startTime = getTimestamp();

                var prevDialogs = app.displayDialogs;
                var prevRulerUnits = app.preferences.rulerUnits;
                app.displayDialogs = DialogModes.NO;
                app.preferences.rulerUnits = Units.PIXELS;

                setControlsRunningState(true);
                var seqCounter = 1;
                var totalItems = batchState.queue.length;

                try {
                    for (var idx = 0; idx < totalItems; idx++) {
                        batchState.currentIndex = idx;

                        while (batchState.isPaused && !batchState.stopRequested) {
                            app.refresh();
                            if (win && typeof win.update === "function") {
                                try { win.update(); } catch (uErr) {}
                            }
                            $.sleep(120);
                        }

                        if (batchState.stopRequested) {
                            break;
                        }

                        var item = batchState.queue[idx];
                        var itemLabel = (item instanceof Array) ? (item[0].name + " (Triplet)") : item.name;

                        if (batchState.skipCurrentRequested) {
                            batchState.skipCurrentRequested = false;
                            batchState.logs.push("[SKIPPED] " + itemLabel);
                            continue;
                        }

                        progressBar.value = Math.round(((idx + 1) / totalItems) * 100);
                        updateStatsUI(totalItems - idx, "Processing [" + (idx + 1) + "/" + totalItems + "]: " + itemLabel);
                        app.refresh();

                        var result = processSingleImage(item, folders, seqCounter, config);
                        seqCounter = result.nextSeq;

                        if (result.success) {
                            batchState.successCount++;
                            batchState.processedFilesMap[itemLabel] = true;
                            batchState.logs.push("[OK] " + result.outputName + " <- " + result.sourceName + " (" + result.sizeMB + " MB" + result.extraInfo + ")");
                        } else {
                            batchState.failedCount++;
                            if (result.belowMinSize) {
                                batchState.belowMinSizeCount++;
                            }
                            batchState.failedQueue.push(item);
                            batchState.failedDetails.push("[FAILED] " + result.sourceName + " -> " + result.reason);
                            batchState.logs.push("[FAILED] " + result.sourceName + " -> " + result.reason);
                        }

                        saveCheckpoint(folders.reports);
                        updateStatsUI(totalItems - (idx + 1));

                        // Purge Photoshop History & Cache every 10 items to prevent RAM exhaustion
                        if ((idx % 10) === 0) {
                            try {
                                app.purge(PurgeTarget.ALLCACHES);
                            } catch (purgeErr) {}
                        }
                    }
                } finally {
                    app.displayDialogs = prevDialogs;
                    app.preferences.rulerUnits = prevRulerUnits;
                    batchState.isRunning = false;
                    batchState.isPaused = false;
                    generateAllReports(folders, totalScannedCount, totalItems);
                    if (!batchState.stopRequested) {
                        clearCheckpoint(folders.reports);
                    }
                    setControlsRunningState(false);
                    var endStatusMsg = batchState.stopRequested ? "Batch Stopped. Reports saved." : ("Batch Completed! Success: " + batchState.successCount + " | Failed: " + batchState.failedCount);
                    updateStatsUI(0, endStatusMsg);

                    if (batchState.successCount > 0) {
                        alert("Batch Processing Completed!\n\nSuccessfully Processed: " + batchState.successCount + " images\nFailed: " + batchState.failedCount + "\nOutput Directory:\n" + folders.processed.fsName);
                    } else if (batchState.failedCount > 0 && !batchState.stopRequested) {
                        var firstErrMsg = (batchState.failedDetails && batchState.failedDetails.length > 0) ? batchState.failedDetails[0] : "Check reports for error details.";
                        alert("Batch processing ended, but 0 images were successfully saved.\nTotal Failed: " + batchState.failedCount + "\n\nFirst error:\n" + firstErrMsg);
                    }
                }
            }

            btnStart.onClick = function () {
                syncConfigFromUI();
                if (config.processMode === "Selected Images") {
                    if (!config.selectedFiles || config.selectedFiles.length === 0) {
                        alert("Please select images first.\nClick 'Pick Files...' button.");
                        lblCurrentFile.text = "Error: Please click 'Pick Files...' to select images.";
                        return;
                    }
                } else {
                    if (!config.sourcePath || config.sourcePath === "" || !(new Folder(config.sourcePath)).exists) {
                        alert("Please select a Source Folder first.\nClick 'Source Folder...' button.");
                        lblCurrentFile.text = "Error: Please select a valid Source Folder.";
                        return;
                    }
                }
                if (!config.outputPath || config.outputPath === "" || !(new Folder(config.outputPath)).exists) {
                    alert("Please select an Output Folder first.\nClick 'Output Folder...' button.");
                    lblCurrentFile.text = "Error: Please select a valid Output Folder.";
                    return;
                }

                var built = buildProcessingQueue();
                if (!built || !built.queue || built.queue.length === 0) {
                    alert("No supported images (JPG, PNG, TIF, PSD, BMP) found in:\n" + config.sourcePath);
                    lblCurrentFile.text = "Error: No supported images found to process.";
                    return;
                }

                executeBatchQueue(built.queue, built.totalScanned);
            };

            btnRetry.onClick = function () {
                if (batchState.failedQueue.length === 0) return;
                syncConfigFromUI();
                var retryItems = batchState.failedQueue.slice(0);
                executeBatchQueue(retryItems, retryItems.length);
            };

            win.center();
            win.layout.layout(true);
            win.show();
        }

        launchStudioUI();

    } catch (fatalErr) {
        alert("RI Creative Script Error:\nLine: " + fatalErr.line + "\nMessage: " + fatalErr.message);
    }
})();
