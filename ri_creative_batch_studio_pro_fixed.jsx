/**
 * ============================================================================
 * RI CREATIVE - BATCH BACKGROUND PROCESSING STUDIO PRO
 * Version: 2.0.1 (Safe UI Loader + 16-Bit High-Precision Engine)
 * Target: Adobe Photoshop CC 2020 - 2026 (Windows 10/11)
 * ============================================================================
 */

#target photoshop
app.bringToFront();

(function () {
    try {
        // ========================================================================
        // 1. GLOBAL CONSTANTS & DEFAULT CONFIGURATION
        // ========================================================================
        var SCRIPT_TITLE = "RI CREATIVE — BATCH BACKGROUND STUDIO PRO";
        var SCRIPT_VERSION = "2.0.1";
        var MAX_ALLOWED_BATCH = 500;
        var SUPPORTED_EXTENSIONS = /\.(jpg|jpeg|png|tif|tiff|psd|bmp)$/i;

        var DEFAULT_CONFIG = {
            sourcePath: "",
            outputPath: "",
            processMode: "3-Image Fusion (Anti-Similar)",
            selectedFiles: [],
            width: 4000,
            height: 2000,
            resizeMode: "Fit/Crop (Fill)",
            maxBatchCount: 500,
            // 11 Photoshop Blur Engine Configuration
            blurType: "None (Clean Stock Approved)", // Average, Blur, Blur More, Box Blur..., Gaussian Blur..., Lens Blur..., Motion Blur..., Radial Blur..., Shape Blur..., Smart Blur..., Surface Blur...
            blurScope: "Full Composition", // Background Only, Full Composition, Left Zone, Center Zone, Right Zone
            blurRadius: 25,
            blurThreshold: 25,
            motionAngle: 0,
            motionDistance: 30,
            radialAmount: 25,
            radialMethod: "Spin", // Spin, Zoom
            blurEnable: false, // Default false so stock photos remain 100% crisp and unblurred
            // Blur Engine Optical Noise & Film Grain Integration
            blurNoiseEnable: false,
            blurNoiseAmount: 12,
            blurNoiseDistribution: "Gaussian",
            blurNoiseMono: true,
            gaussianEnable: false,
            gaussianRadius: 25,
            deepAbstractBlur: false,
            noiseEnable: false, // Default false so no noise rejection!
            noiseAmount: 0,
            noiseDistribution: "Uniform",
            noiseMonochromatic: true,
            gradientEnable: false, // Default false so natural colors are preserved!
            gradientPreset: "Random Preset",
            gradientType: "Random Type",
            gradientOpacity: 35,
            gradientBlendMode: "Soft Light",
            gradientMultiLayerMesh: false,
            liquifyEnable: false, // Default false so no liquid distortion!
            liquifyStyle: "Organic Fluid Wave",
            liquifyIntensity: 0,
            jpegQuality: 12,
            minFileSizeMB: 0,
            embedProfile: true,
            filenamePrefix: "RI_Background_"
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

        function getNextAvailableOutputFile(processedFolder, prefix, startSeq) {
            var seq = startSeq;
            var candidateFile;
            while (seq < 999999) {
                var fileName = prefix + padNumber(seq, 4) + ".jpg";
                candidateFile = new File(processedFolder.fsName + "/" + fileName);
                if (!candidateFile.exists) {
                    return {
                        file: candidateFile,
                        nextSeq: seq + 1
                    };
                }
                seq++;
            }
            throw new Error("Exceeded maximum sequential filename limit.");
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
                if (f instanceof File && !f.hidden && SUPPORTED_EXTENSIONS.test(f.name)) {
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
        // 5. PHOTOSHOP NATIVE IMAGE PROCESSING ENGINE
        // ========================================================================
        function prepareBaseLayer(doc) {
            try {
                if (doc.layers.length > 1 || doc.activeLayer.kind !== LayerKind.NORMAL) {
                    doc.flatten();
                }
            } catch (e) {}
            try {
                if (doc.activeLayer.isBackgroundLayer) {
                    doc.activeLayer.isBackgroundLayer = false;
                }
                doc.activeLayer.allLocked = false;
                doc.activeLayer.pixelsLocked = false;
                doc.activeLayer.positionLocked = false;
                doc.activeLayer.transparentPixelsLocked = false;
            } catch (lockErr) {}
        }

        function convertToHighPrecisionRGB(doc) {
            if (doc.mode !== DocumentMode.RGB) {
                doc.changeMode(ChangeMode.RGB);
            }
            if (doc.bitsPerChannel !== BitsPerChannelType.SIXTEEN) {
                try {
                    doc.bitsPerChannel = BitsPerChannelType.SIXTEEN;
                } catch (bitErr) {
                    doc.bitsPerChannel = BitsPerChannelType.EIGHT;
                }
            }
        }

        function finalizeTo8BitDithered(doc) {
            if (doc.bitsPerChannel !== BitsPerChannelType.EIGHT) {
                doc.bitsPerChannel = BitsPerChannelType.EIGHT;
            }
        }

        function resizeImageSmart(doc, targetW, targetH, mode) {
            var origW = doc.width.as("px");
            var origH = doc.height.as("px");

            if (origW === targetW && origH === targetH) {
                return;
            }

            var highResample = ResampleMethod.BICUBICSMOOTHER;

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
        // Average, Blur, Blur More, Box Blur, Gaussian Blur, Lens Blur,
        // Motion Blur, Radial Blur, Shape Blur, Smart Blur, Surface Blur
        // ====================================================================

        function applyAverageBlur(doc) {
            try {
                doc.activeLayer.applyAverage();
            } catch (e) {
                try {
                    var idAvrg = charIDToTypeID("Avrg");
                    executeAction(idAvrg, undefined, DialogModes.NO);
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
                executeAction(idBxBl, desc, DialogModes.NO);
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
                executeAction(idlensBlur, desc, DialogModes.NO);
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
                executeAction(idRdlB, desc, DialogModes.NO);
            } catch (e) {}
        }

        function applyShapeBlurFilter(doc, radius) {
            try {
                var idshapeBlur = stringIDToTypeID("shapeBlur");
                var desc = new ActionDescriptor();
                desc.putUnitDouble(charIDToTypeID("Rds "), charIDToTypeID("#Pxl"), radius);
                executeAction(idshapeBlur, desc, DialogModes.NO);
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
                executeAction(idsurfaceBlur, desc, DialogModes.NO);
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
            } else if (bType === "Zoom Blur" || bType.indexOf("Zoom") !== -1) {
                applyRadialBlurFilter(doc, cfg.radialAmount || 25, "Zoom", "Best");
            } else if (bType === "Spin Blur" || bType.indexOf("Spin") !== -1) {
                applyRadialBlurFilter(doc, cfg.radialAmount || 25, "Spin", "Best");
            } else if (bType === "Bokeh Blur" || bType.indexOf("Bokeh") !== -1) {
                applyLensBlur(doc, cfg.blurRadius || 25, 250);
            } else if (bType === "Directional Blur" || bType.indexOf("Directional") !== -1) {
                applyMotionBlurFilter(doc, cfg.motionAngle || 0, cfg.motionDistance || 30);
            } else if (bType === "Tilt-Shift Blur" || bType.indexOf("Tilt-Shift") !== -1) {
                applyGaussianBlurFilter(doc, cfg.blurRadius || 25);
            } else if (bType === "Depth of Field" || bType.indexOf("Depth") !== -1) {
                applyLensBlur(doc, cfg.blurRadius || 25, 230);
            } else if (bType === "Progressive Blur" || bType.indexOf("Progressive") !== -1) {
                applyGaussianBlurFilter(doc, cfg.blurRadius || 25);
            } else if (bType === "Frosted Blur" || bType.indexOf("Frosted") !== -1) {
                applyGaussianBlurFilter(doc, Math.max(2, (cfg.blurRadius || 25) * 0.45));
                applyAddNoiseFilter(doc, 12, "Uniform", true);
            } else if (bType === "Glow Blur" || bType.indexOf("Glow") !== -1) {
                applyGaussianBlurFilter(doc, cfg.blurRadius || 25);
            } else if (bType === "Soft Focus Blur" || bType.indexOf("Soft Focus") !== -1) {
                applyGaussianBlurFilter(doc, cfg.blurRadius || 25);
            }

            // Optical Film Grain & Noise Integration (Photoshop Lens Blur Spec)
            if (cfg.blurNoiseEnable && cfg.blurNoiseAmount > 0) {
                applyAddNoiseFilter(doc, cfg.blurNoiseAmount, cfg.blurNoiseDistribution || "Gaussian", cfg.blurNoiseMono !== false);
            } else if (cfg.noiseEnable && cfg.noiseAmount > 0) {
                applyAddNoiseFilter(doc, cfg.noiseAmount, cfg.noiseDistribution || "Gaussian", cfg.noiseMonochromatic !== false);
            }
        }

        function applyAddNoiseFilter(doc, amount, distributionStr, monochromatic) {
            try {
                var distEnum = (distributionStr === "Gaussian") ? NoiseDistribution.GAUSSIAN : NoiseDistribution.UNIFORM;
                doc.activeLayer.applyAddNoise(amount, distEnum, monochromatic);
            } catch (e) {
                var idAdNs = charIDToTypeID("AdNs");
                var desc = new ActionDescriptor();
                desc.putEnumerated(charIDToTypeID("Dstr"), charIDToTypeID("Dstr"), (distributionStr === "Gaussian") ? charIDToTypeID("Gsn ") : charIDToTypeID("Unfr"));
                desc.putUnitDouble(charIDToTypeID("Nose"), charIDToTypeID("#Prc"), amount);
                desc.putBoolean(charIDToTypeID("Mnch"), monochromatic);
                executeAction(idAdNs, desc, DialogModes.NO);
            }
        }

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
                    // Default: Organic Fluid Wave
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

            executeAction(idMk, descMain, DialogModes.NO);

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
                executeAction(idGrdn, descG, DialogModes.NO);

                rasterLayer.opacity = cfg.gradientOpacity;
                rasterLayer.blendMode = mapBlendModeToEnum(cfg.gradientBlendMode);
            }

            return params;
        }

        function exportBaselineJPEG(doc, outFile, quality, embedProfile) {
            // 1. Ensure document is flattened and free of extra alpha channels
            try {
                if (doc.layers.length > 1) {
                    doc.flatten();
                }
                while (doc.channels.length > 3) {
                    doc.channels[doc.channels.length - 1].remove();
                }
            } catch (cleanErr) {}

            // 2. Convert to sRGB IEC61966-2.1 for accurate web/commercial colors
            try {
                if (embedProfile) {
                    doc.convertProfile("sRGB IEC61966-2.1", Intent.PERCEPTUAL, true, true);
                }
            } catch (profErr) {}

            // 3. Clean JPEG Save Options (Removed conflicting 'scans' property for Baseline)
            var jpgOpts = new JPEGSaveOptions();
            jpgOpts.quality = Math.max(1, Math.min(12, Math.round(quality)));
            jpgOpts.formatOptions = FormatOptions.STANDARDBASELINE;
            jpgOpts.embedColorProfile = Boolean(embedProfile);
            jpgOpts.matte = MatteType.NONE;

            try {
                doc.saveAs(outFile, jpgOpts, true, Extension.LOWERCASE);
            } catch (saveErr) {
                // ActionManager Fallback (Export / Save a Copy as JPEG)
                var idsave = charIDToTypeID("save");
                var desc = new ActionDescriptor();
                var descAs = new ActionDescriptor();
                descAs.putInteger(charIDToTypeID("EQlt"), jpgOpts.quality);
                descAs.putEnumerated(charIDToTypeID("MttC"), charIDToTypeID("MttC"), charIDToTypeID("None"));
                desc.putObject(charIDToTypeID("As  "), charIDToTypeID("JPEG"), descAs);
                desc.putPath(charIDToTypeID("In  "), outFile);
                desc.putBoolean(charIDToTypeID("Cpy "), true);
                desc.putBoolean(charIDToTypeID("LwCs"), true);
                executeAction(idsave, desc, DialogModes.NO);
            }
        }

        function verifyExportedJPEG(outFile, expectedW, expectedH, minBytes) {
            if (!outFile || !outFile.exists) {
                return { valid: false, reason: "Exported JPEG file was not created on disk.", sizeBytes: 0 };
            }

            if (!/\.jpe?g$/i.test(outFile.name)) {
                return { valid: false, reason: "Invalid file extension (must be .jpg).", sizeBytes: outFile.length };
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
                resizeImageSmart(extraDoc, zoneW, zoneH, "Fit/Crop (Fill)");

                extraDoc.activeLayer.duplicate(mainDoc, ElementPlacement.PLACEATBEGINNING);
                extraDoc.close(SaveOptions.DONOTSAVECHANGES);
                extraDoc = null;

                app.activeDocument = mainDoc;
                var pastedLayer = mainDoc.activeLayer;
                pastedLayer.name = layerTag;

                var bounds = pastedLayer.bounds;
                var curX = bounds[0].as("px");
                var curY = bounds[1].as("px");
                var targetX = 0;
                if (zoneType === "LEFT") {
                    targetX = 0;
                } else if (zoneType === "RIGHT") {
                    targetX = cfg.width - zoneW;
                } else {
                    targetX = zoneW;
                }
                pastedLayer.translate(UnitValue(targetX - curX, "px"), UnitValue(0 - curY, "px"));
            } catch (err) {
                if (extraDoc !== null) {
                    try { extraDoc.close(SaveOptions.DONOTSAVECHANGES); } catch (e2) {}
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
                        // Background Only Scope: Primary image fills canvas and gets blurred as backdrop
                        resizeImageSmart(doc, cfg.width, cfg.height, "Fit/Crop (Fill)");
                        applyPhotoshopBlurEngineJSX(doc, cfg);
                        doc.activeLayer.name = "Blurred Backdrop";

                        // Place all 3 photos sharp and crisp on top of the blurred backdrop
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

                        // Full Composition Scope: apply blur to the entire composition
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

                if (cfg.noiseEnable && cfg.noiseAmount > 0) {
                    applyAddNoiseFilter(doc, cfg.noiseAmount, cfg.noiseDistribution, cfg.noiseMonochromatic);
                }

                var appliedGradInfo = null;
                if (cfg.gradientEnable) {
                    appliedGradInfo = applyEditableGradientLayer(doc, cfg);
                }

                if (doc.layers.length > 1) {
                    doc.flatten();
                }

                if (cfg.liquifyEnable && cfg.liquifyIntensity > 0) {
                    prepareBaseLayer(doc);
                    applyOrganicLiquifyFlow(doc, cfg.liquifyStyle, cfg.liquifyIntensity);
                }

                finalizeTo8BitDithered(doc);

                var slot = getNextAvailableOutputFile(folders.processed, cfg.filenamePrefix, seqCounter);
                tempOutputFile = slot.file;

                // Verify active document dimensions match target before exporting
                var actualDocW = Math.round(doc.width.as("px"));
                var actualDocH = Math.round(doc.height.as("px"));
                if (actualDocW !== cfg.width || actualDocH !== cfg.height) {
                    doc.resizeImage(UnitValue(cfg.width, "px"), UnitValue(cfg.height, "px"), 300, ResampleMethod.BICUBICSMOOTHER);
                }

                exportBaselineJPEG(doc, tempOutputFile, cfg.jpegQuality, cfg.embedProfile);

                var qcResult = verifyExportedJPEG(tempOutputFile, cfg.width, cfg.height, minRequiredBytes);

                if (!qcResult.valid && qcResult.belowMinSize) {
                    if (tempOutputFile.exists) {
                        tempOutputFile.remove();
                    }

                    try {
                        prepareBaseLayer(doc);
                        doc.activeLayer.applyUnSharpMask(45, 0.9, 0);
                        applyAddNoiseFilter(doc, 10, "Gaussian", false);
                    } catch (detailErr) {}

                    exportBaselineJPEG(doc, tempOutputFile, 12, cfg.embedProfile);
                    qcResult = verifyExportedJPEG(tempOutputFile, cfg.width, cfg.height, minRequiredBytes);
                }

                doc.close(SaveOptions.DONOTSAVECHANGES);
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

                return {
                    success: true,
                    belowMinSize: false,
                    sourceName: fusedNames.join(" + "),
                    outputName: tempOutputFile.name,
                    sizeMB: formatBytesToMB(qcResult.sizeBytes),
                    gradientInfo: appliedGradInfo ? (appliedGradInfo.category + " (" + appliedGradInfo.type + ")") : "Disabled",
                    nextSeq: slot.nextSeq
                };

            } catch (err) {
                if (doc !== null) {
                    try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (closeErr) {}
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
                "PROCESSING SUMMARY REPORT",
                "====================================================================",
                "Start Time           : " + (batchState.startTime || "N/A"),
                "End Time             : " + endTime,
                "Source Folder        : " + config.sourcePath,
                "Output Folder        : " + folders.root.fsName,
                "--------------------------------------------------------------------",
                "Target Dimensions    : " + config.width + " x " + config.height + " px (2:1)",
                "Resize Mode          : " + config.resizeMode,
                "Blur Effect          : " + (config.blurEnable ? ("Enabled (" + config.blurRadius + " px)") : "Disabled"),
                "Gaussian Blur        : " + (config.gaussianEnable ? ("Enabled (" + config.gaussianRadius + " px)") : "Disabled"),
                "Add Noise            : " + (config.noiseEnable ? ("Enabled (" + config.noiseAmount + "%, " + config.noiseDistribution + ", Mono: " + config.noiseMonochromatic + ")") : "Disabled"),
                "Liquify Fluid Flow   : " + (config.liquifyEnable ? ("Enabled (" + config.liquifyStyle + ", Intensity: " + config.liquifyIntensity + "%)") : "Disabled"),
                "Gradient Overlay     : " + (config.gradientEnable ? ("Enabled (" + config.gradientPreset + ", " + config.gradientOpacity + "%, " + config.gradientBlendMode + ")") : "Disabled"),
                "JPEG Quality         : " + config.jpegQuality + " / 12 (Baseline, ICC: " + config.embedProfile + ")",
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
            win.spacing = 8;
            win.margins = 12;

            var headerGrp = win.add("group");
            headerGrp.orientation = "row";
            headerGrp.alignChildren = ["left", "center"];
            var titleText = headerGrp.add("statictext", undefined, "RI CREATIVE — BATCH BACKGROUND STUDIO PRO");
            try {
                titleText.graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);
            } catch (fontErr) {}

            var tabPanel = win.add("tabbedpanel");
            tabPanel.alignChildren = ["fill", "fill"];
            tabPanel.preferredSize = [520, 240];

            // TAB 1: FOLDERS, RESIZE & EXPORT
            var tabSetup = tabPanel.add("tab", undefined, "1. Folders & Export");
            tabSetup.orientation = "column";
            tabSetup.alignChildren = ["fill", "top"];
            tabSetup.spacing = 8;
            tabSetup.margins = 10;

            var srcRow = tabSetup.add("group");
            var btnBrowseSrc = srcRow.add("button", undefined, "Source Folder...");
            btnBrowseSrc.preferredSize = [115, 24];
            var txtSrcPath = srcRow.add("edittext", undefined, "", { readonly: true });
            txtSrcPath.preferredSize = [370, 22];

            var outRow = tabSetup.add("group");
            var btnBrowseOut = outRow.add("button", undefined, "Output Folder...");
            btnBrowseOut.preferredSize = [115, 24];
            var txtOutPath = outRow.add("edittext", undefined, "", { readonly: true });
            txtOutPath.preferredSize = [370, 22];

            var modeRow = tabSetup.add("group");
            modeRow.add("statictext", undefined, "Mode:");
            var ddBatchScope = modeRow.add("dropdownlist", undefined, ["3-Image Fusion (Anti-Similar)", "All Images (1-by-1)", "Selected Images"]);
            ddBatchScope.selection = 0;
            ddBatchScope.preferredSize = [185, 22];

            var btnSelectSpecific = modeRow.add("button", undefined, "Pick Files...");
            btnSelectSpecific.preferredSize = [80, 22];
            btnSelectSpecific.enabled = false;

            var lblScannedInfo = modeRow.add("statictext", undefined, "Found: 0 images");
            lblScannedInfo.preferredSize = [155, 20];

            var sep1 = tabSetup.add("panel");
            sep1.alignment = "fill";

            var dimRow = tabSetup.add("group");
            dimRow.add("statictext", undefined, "Size:");
            var inpWidth = dimRow.add("edittext", undefined, String(DEFAULT_CONFIG.width));
            inpWidth.preferredSize = [52, 22];
            dimRow.add("statictext", undefined, "x");
            var inpHeight = dimRow.add("edittext", undefined, String(DEFAULT_CONFIG.height));
            inpHeight.preferredSize = [52, 22];
            dimRow.add("statictext", undefined, "Mode:");
            var ddResizeMode = dimRow.add("dropdownlist", undefined, ["Fit/Crop (Fill)", "Fit (Contain)", "Stretch"]);
            ddResizeMode.selection = 0;
            ddResizeMode.preferredSize = [115, 22];
            dimRow.add("statictext", undefined, "Max:");
            var inpMaxBatch = dimRow.add("edittext", undefined, String(DEFAULT_CONFIG.maxBatchCount));
            inpMaxBatch.preferredSize = [42, 22];

            var expRow1 = tabSetup.add("group");
            expRow1.add("statictext", undefined, "Quality (1-12):");
            var inpJpegQuality = expRow1.add("edittext", undefined, String(DEFAULT_CONFIG.jpegQuality));
            inpJpegQuality.preferredSize = [36, 22];
            expRow1.add("statictext", undefined, "Min MB:");
            var inpMinSizeMB = expRow1.add("edittext", undefined, String(DEFAULT_CONFIG.minFileSizeMB));
            inpMinSizeMB.preferredSize = [42, 22];
            expRow1.add("statictext", undefined, "Prefix:");
            var inpPrefix = expRow1.add("edittext", undefined, DEFAULT_CONFIG.filenamePrefix);
            inpPrefix.preferredSize = [135, 22];

            var chkEmbedProfile = tabSetup.add("checkbox", undefined, "Embed ICC Color Profile (Standard Baseline JPEG)");
            chkEmbedProfile.value = DEFAULT_CONFIG.embedProfile;

            // TAB 2: BLUR & NOISE EFFECTS
            var tabEffects = tabPanel.add("tab", undefined, "2. Blur & Noise");
            tabEffects.orientation = "column";
            tabEffects.alignChildren = ["fill", "top"];
            tabEffects.spacing = 10;
            tabEffects.margins = 12;

            var blurRow1 = tabEffects.add("group");
            blurRow1.add("statictext", undefined, "Filter > Blur Menu (11 Photoshop Blurs):");
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
            ddBlurType.preferredSize = [230, 22];

            var blurRow2 = tabEffects.add("group");
            blurRow2.add("statictext", undefined, "Radius (px):");
            var inpBlurRad = blurRow2.add("edittext", undefined, String(DEFAULT_CONFIG.blurRadius));
            inpBlurRad.preferredSize = [50, 22];
            blurRow2.add("statictext", undefined, "Threshold:");
            var inpBlurThresh = blurRow2.add("edittext", undefined, String(DEFAULT_CONFIG.blurThreshold));
            inpBlurThresh.preferredSize = [50, 22];
            blurRow2.add("statictext", undefined, "Angle (°):");
            var inpMotionAngle = blurRow2.add("edittext", undefined, String(DEFAULT_CONFIG.motionAngle));
            inpMotionAngle.preferredSize = [45, 22];
            blurRow2.add("statictext", undefined, "Distance:");
            var inpMotionDist = blurRow2.add("edittext", undefined, String(DEFAULT_CONFIG.motionDistance));
            inpMotionDist.preferredSize = [45, 22];

            var blurRow3 = tabEffects.add("group");
            blurRow3.add("statictext", undefined, "Radial Method:");
            var ddRadialMethod = blurRow3.add("dropdownlist", undefined, ["Spin", "Zoom"]);
            ddRadialMethod.selection = 0;
            ddRadialMethod.preferredSize = [85, 22];
            blurRow3.add("statictext", undefined, "Target Scope:");
            var ddBlurScope = blurRow3.add("dropdownlist", undefined, ["Full Composition", "Background Only", "Outer Panels (Center Sharp)"]);
            ddBlurScope.selection = 0;
            ddBlurScope.preferredSize = [140, 22];

            var sep2 = tabEffects.add("panel");
            sep2.alignment = "fill";

            var noiseRow1 = tabEffects.add("group");
            var chkNoise = noiseRow1.add("checkbox", undefined, "Enable Add Noise Filter");
            chkNoise.value = DEFAULT_CONFIG.noiseEnable;
            chkNoise.preferredSize = [220, 20];
            noiseRow1.add("statictext", undefined, "Amount (%):");
            var inpNoiseAmt = noiseRow1.add("edittext", undefined, String(DEFAULT_CONFIG.noiseAmount));
            inpNoiseAmt.preferredSize = [55, 22];

            var noiseRow2 = tabEffects.add("group");
            noiseRow2.add("statictext", undefined, "Noise Distribution:");
            var ddNoiseDist = noiseRow2.add("dropdownlist", undefined, ["Uniform", "Gaussian"]);
            ddNoiseDist.selection = 0;
            ddNoiseDist.preferredSize = [110, 22];
            var chkNoiseMono = noiseRow2.add("checkbox", undefined, "Monochromatic Noise");
            chkNoiseMono.value = DEFAULT_CONFIG.noiseMonochromatic;

            // TAB 3: CREATIVE GRADIENT & LIQUIFY STUDIO
            var tabCreative = tabPanel.add("tab", undefined, "3. Gradient & Liquify");
            tabCreative.orientation = "column";
            tabCreative.alignChildren = ["fill", "top"];
            tabCreative.spacing = 8;
            tabCreative.margins = 10;

            var gradRow1 = tabCreative.add("group");
            var chkGradient = gradRow1.add("checkbox", undefined, "Enable Gradient Overlay");
            chkGradient.value = DEFAULT_CONFIG.gradientEnable;
            chkGradient.preferredSize = [185, 20];
            gradRow1.add("statictext", undefined, "Opacity (%):");
            var inpGradOpacity = gradRow1.add("edittext", undefined, String(DEFAULT_CONFIG.gradientOpacity));
            inpGradOpacity.preferredSize = [45, 22];

            var gradRow2 = tabCreative.add("group");
            gradRow2.add("statictext", undefined, "Preset:");
            var ddGradPreset = gradRow2.add("dropdownlist", undefined, PRESET_NAMES);
            ddGradPreset.selection = 0;
            ddGradPreset.preferredSize = [175, 22];
            gradRow2.add("statictext", undefined, "Type:");
            var ddGradType = gradRow2.add("dropdownlist", undefined, ["Random Type", "Linear", "Radial", "Angle", "Reflected", "Diamond"]);
            ddGradType.selection = 0;
            ddGradType.preferredSize = [115, 22];

            var gradRow3 = tabCreative.add("group");
            gradRow3.add("statictext", undefined, "Blend Mode:");
            var ddGradBlend = gradRow3.add("dropdownlist", undefined, ["Soft Light", "Overlay", "Normal", "Multiply", "Screen", "Color", "Hard Light"]);
            ddGradBlend.selection = 0;
            ddGradBlend.preferredSize = [105, 22];
            var chkMultiLayerMesh = gradRow3.add("checkbox", undefined, "Dual-Layer 3D Mesh Glow");
            chkMultiLayerMesh.value = DEFAULT_CONFIG.gradientMultiLayerMesh;

            var sep3 = tabCreative.add("panel");
            sep3.alignment = "fill";

            var liqRow1 = tabCreative.add("group");
            var chkLiquify = liqRow1.add("checkbox", undefined, "Enable Liquify / Fluid Flow");
            chkLiquify.value = DEFAULT_CONFIG.liquifyEnable;
            chkLiquify.preferredSize = [185, 20];
            liqRow1.add("statictext", undefined, "Intensity (%):");
            var inpLiqIntensity = liqRow1.add("edittext", undefined, String(DEFAULT_CONFIG.liquifyIntensity));
            inpLiqIntensity.preferredSize = [45, 22];

            var liqRow2 = tabCreative.add("group");
            liqRow2.add("statictext", undefined, "Fluid Distortion Style:");
            var ddLiqStyle = liqRow2.add("dropdownlist", undefined, [
                "Organic Fluid Wave", "Silk Swirl Vortex", "Liquid Marble Flow", 
                "Abstract Mesh Warp", "Spherical 3D Bulge", "Hourglass Silhouette", 
                "Pinch & Pucker Vortex", "Spiral Wave Flow", "Directional Ripple Warp", "Random Fluid"
            ]);
            ddLiqStyle.selection = 0;
            ddLiqStyle.preferredSize = [185, 22];

            tabPanel.selection = tabSetup;

            // COMPACT PROGRESS & TELEMETRY BAR
            var progPanel = win.add("panel", undefined, "Batch Progress");
            progPanel.orientation = "column";
            progPanel.alignChildren = ["fill", "top"];
            progPanel.spacing = 4;
            progPanel.margins = 8;

            var progressBar = progPanel.add("progressbar", undefined, 0, 100);
            progressBar.preferredSize = [500, 14];

            var lblCurrentFile = progPanel.add("statictext", undefined, "Ready. Select Source & Output folders, then click START.");
            var lblStats = progPanel.add("statictext", undefined, "Success: 0  |  Failed: 0  |  Below Min MB: 0  |  Remaining: 0");

            // COMPACT ACTION BUTTON BAR
            var ctrlGrp = win.add("group");
            ctrlGrp.orientation = "row";
            ctrlGrp.alignChildren = ["center", "center"];
            ctrlGrp.spacing = 5;

            var btnStart = ctrlGrp.add("button", undefined, "START");
            btnStart.preferredSize = [68, 28];

            var btnPause = ctrlGrp.add("button", undefined, "PAUSE");
            btnPause.preferredSize = [58, 28];
            btnPause.enabled = false;

            var btnResume = ctrlGrp.add("button", undefined, "RESUME");
            btnResume.preferredSize = [64, 28];
            btnResume.enabled = false;

            var btnStop = ctrlGrp.add("button", undefined, "STOP");
            btnStop.preferredSize = [54, 28];
            btnStop.enabled = false;

            var btnSkip = ctrlGrp.add("button", undefined, "SKIP");
            btnSkip.preferredSize = [50, 28];
            btnSkip.enabled = false;

            var btnRetry = ctrlGrp.add("button", undefined, "RETRY");
            btnRetry.preferredSize = [56, 28];
            btnRetry.enabled = false;

            var btnReset = ctrlGrp.add("button", undefined, "RESET");
            btnReset.preferredSize = [56, 28];

            var btnClose = ctrlGrp.add("button", undefined, "CLOSE");
            btnClose.preferredSize = [58, 28];

            var scannedFilesCache = [];

            function updateStatsUI(remainingCount, statusMsg) {
                if (statusMsg !== undefined) {
                    lblCurrentFile.text = statusMsg;
                }
                lblStats.text = "Success: " + batchState.successCount +
                    "  |  Failed: " + batchState.failedCount +
                    "  |  Below Min MB: " + batchState.belowMinSizeCount +
                    "  |  Remaining: " + remainingCount;
                win.update();
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
                win.update();
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
                config.maxBatchCount = parseIntSafe(inpMaxBatch.text, 500, 1, MAX_ALLOWED_BATCH);

                config.blurType = ddBlurType.selection ? ddBlurType.selection.text : "None (Clean Stock Approved)";
                config.blurRadius = parseFloatSafe(inpBlurRad.text, 25, 0.1, 250);
                config.blurThreshold = parseIntSafe(inpBlurThresh.text, 25, 2, 100);
                config.motionAngle = parseIntSafe(inpMotionAngle.text, 0, -180, 180);
                config.motionDistance = parseIntSafe(inpMotionDist.text, 30, 1, 250);
                config.radialMethod = ddRadialMethod.selection ? ddRadialMethod.selection.text : "Spin";
                config.blurScope = ddBlurScope.selection ? ddBlurScope.selection.text : "Full Composition";
                config.blurEnable = (config.blurType !== "None (Clean Stock Approved)");

                config.noiseEnable = chkNoise.value;
                config.noiseAmount = parseFloatSafe(inpNoiseAmt.text, 50, 1, 100);
                config.noiseDistribution = ddNoiseDist.selection ? ddNoiseDist.selection.text : "Uniform";
                config.noiseMonochromatic = chkNoiseMono.value;

                config.gradientEnable = chkGradient.value;
                config.gradientPreset = ddGradPreset.selection ? ddGradPreset.selection.text : "Random Preset";
                config.gradientType = ddGradType.selection ? ddGradType.selection.text : "Random Type";
                config.gradientOpacity = parseIntSafe(inpGradOpacity.text, 35, 1, 100);
                config.gradientBlendMode = ddGradBlend.selection ? ddGradBlend.selection.text : "Soft Light";
                config.gradientMultiLayerMesh = chkMultiLayerMesh.value;

                config.liquifyEnable = chkLiquify.value;
                config.liquifyStyle = ddLiqStyle.selection ? ddLiqStyle.selection.text : "Organic Fluid Wave";
                config.liquifyIntensity = parseIntSafe(inpLiqIntensity.text, 75, 1, 150);

                config.jpegQuality = parseIntSafe(inpJpegQuality.text, 12, 1, 12);
                config.minFileSizeMB = parseFloatSafe(inpMinSizeMB.text, 0, 0, 100);
                config.embedProfile = chkEmbedProfile.value;
                config.filenamePrefix = sanitizeFilenamePrefix(inpPrefix.text);
            }

            function resetSettingsToDefault() {
                config = cloneConfig(DEFAULT_CONFIG);
                inpWidth.text = String(config.width);
                inpHeight.text = String(config.height);
                ddResizeMode.selection = 0;
                inpMaxBatch.text = String(config.maxBatchCount);

                ddBlurType.selection = 0;
                inpBlurRad.text = String(config.blurRadius);
                inpBlurThresh.text = String(config.blurThreshold);
                inpMotionAngle.text = String(config.motionAngle);
                inpMotionDist.text = String(config.motionDistance);
                ddRadialMethod.selection = 0;
                ddBlurScope.selection = 0;

                chkNoise.value = config.noiseEnable;
                inpNoiseAmt.text = String(config.noiseAmount);
                ddNoiseDist.selection = 0;
                chkNoiseMono.value = config.noiseMonochromatic;

                chkGradient.value = config.gradientEnable;
                ddGradPreset.selection = 0;
                ddGradType.selection = 0;
                inpGradOpacity.text = String(config.gradientOpacity);
                ddGradBlend.selection = 0;
                chkMultiLayerMesh.value = config.gradientMultiLayerMesh;

                chkLiquify.value = config.liquifyEnable;
                ddLiqStyle.selection = 0;
                inpLiqIntensity.text = String(config.liquifyIntensity);

                inpJpegQuality.text = String(config.jpegQuality);
                inpMinSizeMB.text = String(config.minFileSizeMB);
                chkEmbedProfile.value = config.embedProfile;
                inpPrefix.text = config.filenamePrefix;
            }

            btnBrowseSrc.onClick = function () {
                var chosen = Folder.selectDialog("Select Source Image Folder");
                if (chosen) {
                    txtSrcPath.text = chosen.fsName;
                    scannedFilesCache = scanSourceFolder(chosen.fsName);
                    var tripletCount = Math.ceil(scannedFilesCache.length / 3);
                    lblScannedInfo.text = "Found: " + scannedFilesCache.length + " (" + tripletCount + " sets)";
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
                var picked = null;
                try {
                    picked = File.openDialog("Select Images to Process", function (f) {
                        return (f instanceof Folder) || SUPPORTED_EXTENSIONS.test(f.name);
                    }, true);
                } catch (dialogErr) {
                    picked = File.openDialog("Select Images to Process", "Images:*.jpg;*.jpeg;*.png;*.tif;*.tiff;*.psd;*.bmp", true);
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
                            if (win && win.update) win.update();
                            $.sleep(150);
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
                            batchState.logs.push("[OK] " + result.outputName + " <- " + result.sourceName + " (" + result.sizeMB + " MB | " + result.gradientInfo + ")");
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
                    updateStatsUI(0, batchState.stopRequested ? "Batch Stopped. Reports saved." : "Batch Completed! Success: " + batchState.successCount);
                }
            }

            btnStart.onClick = function () {
                syncConfigFromUI();
                if (config.processMode === "Selected Images") {
                    if (!config.selectedFiles || config.selectedFiles.length === 0) {
                        lblCurrentFile.text = "Error: Please click 'Pick Files...' to select images.";
                        return;
                    }
                } else {
                    if (!config.sourcePath || !(new Folder(config.sourcePath)).exists) {
                        lblCurrentFile.text = "Error: Please select a valid Source Folder.";
                        return;
                    }
                }
                if (!config.outputPath || !(new Folder(config.outputPath)).exists) {
                    lblCurrentFile.text = "Error: Please select a valid Output Folder.";
                    return;
                }

                var built = buildProcessingQueue();
                if (built.queue.length === 0) {
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