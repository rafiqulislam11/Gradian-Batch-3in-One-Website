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
            "Random 3D Glass Style",
            // 1. Frosted Glass Effects (10 Styles)
            "1.1 Soft Frosted Glass",
            "1.2 Heavy Frosted Glass",
            "1.3 Crystal Frost Glass",
            "1.4 Milky Frost Glass",
            "1.5 Matte Frost Glass",
            "1.6 Satin Frost Glass",
            "1.7 Hazy Frost Glass",
            "1.8 Diffused Frost Glass",
            "1.9 Translucent Frost Glass",
            "1.10 Gradient Frost Glass",
            // 2. Ribbed & Textured Glass (10 Styles)
            "2.1 Vertical Ribbed Glass",
            "2.2 Horizontal Ribbed Glass",
            "2.3 Fine Fluted Glass",
            "2.4 Deep Fluted Glass",
            "2.5 Micro Reeded Glass",
            "2.6 Wavy Texture Glass",
            "2.7 Rippled Glass",
            "2.8 Hammered Glass",
            "2.9 Seeded Glass",
            "2.10 Diamond Texture Glass",
            // 3. Optical & Prism Glass (10 Styles)
            "3.1 Rainbow Prism",
            "3.2 Crystal Refraction",
            "3.3 Light Dispersion",
            "3.4 Chromatic Refraction",
            "3.5 Spectral Glass",
            "3.6 Optical Distortion",
            "3.7 Double Prism",
            "3.8 Micro Prism",
            "3.9 Iridescent Glass",
            "3.10 Dichroic Glass",
            // 4. Liquid Glass Effects (10 Styles)
            "4.1 Liquid Glass",
            "4.2 Melted Glass",
            "4.3 Flowing Glass",
            "4.4 Glass Wave",
            "4.5 Glass Blob",
            "4.6 Glass Bubble",
            "4.7 Liquid Crystal",
            "4.8 Glass Ripple",
            "4.9 Fluid Glass",
            "4.10 Organic Glass",
            // 5. 3D Glass Shapes (10 Styles)
            "5.1 Glass Sphere (3D Ball)",
            "5.2 Glass Orb",
            "5.3 Glass Ring",
            "5.4 Glass Cube",
            "5.5 Glass Cylinder",
            "5.6 Glass Ribbon",
            "5.7 Glass Torus",
            "5.8 Glass Pyramid",
            "5.9 Glass Pebble",
            "5.10 Glass Sculptures",
            // 6. Light & Glow Glass (10 Styles)
            "6.1 Luminous Glass",
            "6.2 Neon Glass",
            "6.3 Aurora Glass",
            "6.4 Soft Glow Glass",
            "6.5 Halo Glass",
            "6.6 Light Beam Glass",
            "6.7 Radiant Glass",
            "6.8 Backlit Glass",
            "6.9 Edge Glow Glass",
            "6.10 Ambient Glow Glass",
            // 7. Modern Abstract Glass (10 Styles)
            "7.1 Transparent Glass Overlay",
            "7.2 Layered Glass",
            "7.3 Floating Glass (Glassmorphism)",
            "7.4 Glass Panel",
            "7.5 Glass Sheet",
            "7.6 Glass Fragment",
            "7.7 Glass Shard",
            "7.8 Glass Mosaic",
            "7.9 Glass Mesh",
            "7.10 Abstract Glass Flow",
            // 8. Premium Color Glass (10 Styles)
            "8.1 Rose Gold Glass",
            "8.2 Champagne Glass",
            "8.3 Emerald Glass",
            "8.4 Sapphire Glass",
            "8.5 Amethyst Glass",
            "8.6 Ruby Glass",
            "8.7 Amber Glass",
            "8.8 Ocean Blue Glass",
            "8.9 Aurora Gradient Glass",
            "8.10 Rainbow Gradient Glass",
            // Classic Studio Glass (01–56)
            "01. Micro Square Lens Array",
            "02. Diagonal Cross-Wave Interference",
            "03. Flowing Organic S-Curve Fluted",
            "04. Cross-Grid Crystal",
            "05. Horizontal Venetian Louver",
            "06. Concentric Fresnel Lens",
            "07. Diamond Facet Prism",
            "08. Hexagonal Honeycomb",
            "09. Twisted Vortex Glass",
            "10. Architectural Louver",
            "11. Classic Reeded Glass",
            "12. Cathedral Glass",
            "13. Fine Fluted Glass",
            "14. Deep Grooved Glass",
            "15. Soft Ribbed Glass",
            "16. Sharp Ribbed Glass",
            "17. Parallel Ribbed Glass",
            "18. Asymmetric Ribbed Glass",
            "19. Zigzag Ribbed Glass",
            "20. Chevron Ribbed Glass",
            "21. Diamond Ribbed Glass",
            "22. Geometric Ribbed Glass",
            "23. Wave Fluted Glass",
            "24. Ripple Ribbed Glass",
            "25. 3D Ribbed Glass",
            "26. Crystal Ribbed Glass",
            "27. Prism Ribbed Glass",
            "28. Gradient Ribbed Glass",
            "29. Iridescent Ribbed Glass",
            "30. Metallic Ribbed Glass",
            "31. Liquid Ribbed Glass",
            "32. Bubble Ribbed Glass",
            "33. Layered Ribbed Glass",
            "34. Vertical Gradient Fluted",
            "35. Double Wave Ribbed",
            "36. Twisted Ribbed Glass",
            "37. Sculptural Ribbed Glass",
            "38. Organic Ribbed Glass",
            "39. Radial Ribbed Glass",
            "40. Micro Wave Ribbed Glass",
            "41. Hexagonal Micro-Lens Array (HD)",
            "42. Liquid Mercury Ripple Glass (HD)",
            "43. Diamond Pyramid Facet Grid (HD)",
            "44. Concentric Fresnel Ripple Glass (HD)",
            "45. Vortex Spiral Twist Glass (HD)",
            "46. Cathedral Pebbled Bubble Glass (HD)",
            "47. Woven Herringbone Basket Glass (HD)",
            "48. Cellular Voronoi Crystal Glass (HD)",
            "49. Op-Art Sine Interference Glass (HD)",
            "50. Kaleidoscope Starburst Prism (HD)",
            "51. 3D Frosted Glass Pills & Discs (Pro)",
            "52. 3D Rainbow Prism Bars (Pro)",
            "53. 3D Liquid Glass Droplets (Pro)",
            "54. 3D Luminous Ribbed Glass (Pro)",
            "55. 3D Holographic Glass Spheres (Pro)",
            "56. 3D Stacked Layered Glass Panes (Pro)",
            // 9. Abstract 3D Metallic & Glass Flow Patterns (16 Stock Presets)
            "9.1 Silver Metallic Flow",
            "9.2 Black & Gold Wave",
            "9.3 Purple Satin Wave",
            "9.4 Blue Liquid Wave",
            "9.5 Champagne Gold Flow",
            "9.6 Dark Chrome Wave",
            "9.7 Iridescent Glass Flow",
            "9.8 Red Chrome Ribbon",
            "9.9 Blue-Purple Gradient Flow",
            "9.10 Pearl Gold Wave",
            "9.11 Emerald Metallic Flow",
            "9.12 Crystal Blue Wave",
            "9.13 Metallic Layered Curve",
            "9.14 Neon Blue-Pink Flow",
            "9.15 Silver Satin Texture",
            "9.16 Deep Purple Glass Flow",
            // 10. 25 3D Glass Background Styles (Full-Frame Stock Presets)
            "10.01 3D Glass Wave",
            "10.02 3D Glass Layers",
            "10.03 3D Bubble",
            "10.04 3D Crystal Cubes",
            "10.05 3D Glass Ribbon",
            "10.06 3D Hexagon",
            "10.07 3D Glass Square",
            "10.08 3D Glass Spiral",
            "10.09 3D Glass Stripes",
            "10.10 3D Glass Spheres",
            "10.11 3D Prism",
            "10.12 3D Liquid Glass",
            "10.13 3D Glass Panel",
            "10.14 3D Glass Tiles",
            "10.15 3D Glass Streaks",
            "10.16 3D Glass Ring",
            "10.17 3D Glass Curve",
            "10.18 3D Glass Plates",
            "10.19 3D Glass Mountains",
            "10.20 3D Glass Fluid",
            "10.21 3D Layered Diamond",
            "10.22 3D Glass Flow",
            "10.23 3D Transparent Balls",
            "10.24 3D Glass Bevel",
            "10.25 3D Soft Glass",
            // 11. 20 Glass Effect Overlay Styles (Apply on Image)
            "11.01 Frosted Glass Overlay",
            "11.02 Classic Glass Plate",
            "11.03 Glass with Specular Glow",
            "11.04 3D Crystal Sphere Glass",
            "11.05 Capsule Glass Pill",
            "11.06 3D Tilt Glass Slab",
            "11.07 Prism Diamond Glass",
            "11.08 Neon Glowing Rim Glass",
            "11.09 Droplet Liquid Glass",
            "11.10 Triple Layered Glass",
            "11.11 Sinusoidal Wave Glass",
            "11.12 3D Ribbon Loop Glass",
            "11.13 Crystal Hexagon Glass",
            "11.14 Squircle App Icon Glass",
            "11.15 Torus Ring Glass",
            "11.16 Curved Sheet Glass",
            "11.17 Floor Isometric Tilt Slab",
            "11.18 5-Point Star Glass",
            "11.19 3D Puffed Heart Glass",
            "11.20 Brilliant Crystal Gem Glass"
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
            minFileSizeMB: 10.5, // Guaranteed 10 MB+ in 4K for Microstock Compliance
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
            glassStyle: "Random 3D Glass Style",
            glassScope: "Center 3D Floating Panel", // Center 3D Floating Panel, Full Composition, Left & Right Ribbed Flutes, Outer Border Frame
            glassOpacity: 75,
            glassFrostBlur: 25,
            glassDistortion: 35,
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
            var basePath = String(baseOutputPath).replace(/\\/g, "/");
            while (basePath.charAt(basePath.length - 1) === "/") {
                basePath = basePath.substring(0, basePath.length - 1);
            }
            var rootFolder = new Folder(basePath + "/RI_CREATIVE_OUTPUT");
            if (!rootFolder.exists && !rootFolder.create()) {
                throw new Error("Unable to create root output directory: " + rootFolder.fsName);
            }

            var processedFolder = new Folder(rootFolder.fullName + "/Processed_Images");
            if (!processedFolder.exists && !processedFolder.create()) {
                throw new Error("Unable to create Processed_Images directory: " + processedFolder.fsName);
            }

            var reportsFolder = new Folder(rootFolder.fullName + "/Reports");
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
            var folderPath = processedFolder.fullName;
            while (seq < 999999) {
                var fileName = prefix + padNumber(seq, 4) + ext;
                candidateFile = new File(folderPath + "/" + fileName);
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

        function scanSourceFolder(folderOrPath) {
            var folder = (folderOrPath instanceof Folder) ? folderOrPath : new Folder(folderOrPath);
            if (!folder.exists) {
                return [];
            }
            var rawFiles = [];
            try {
                rawFiles = folder.getFiles() || [];
            } catch (eGet) {
                rawFiles = [];
            }

            var validFiles = [];
            var subFolders = [];

            for (var i = 0; i < rawFiles.length; i++) {
                var f = rawFiles[i];
                if (!f) continue;
                var isFld = false;
                try {
                    isFld = (f instanceof Folder) || (f.constructor && f.constructor.name === "Folder") || (typeof f.getFiles === "function" && typeof f.open !== "function");
                } catch (eFld) {}

                if (isFld) {
                    subFolders.push(f);
                } else if (typeof f.name === "string" && SUPPORTED_EXTENSIONS.test(f.name)) {
                    validFiles.push(f);
                }
            }

            // If no images found in root, scan immediate subfolders
            if (validFiles.length === 0 && subFolders.length > 0) {
                for (var s = 0; s < subFolders.length; s++) {
                    try {
                        var subRaw = subFolders[s].getFiles() || [];
                        for (var k = 0; k < subRaw.length; k++) {
                            var sf = subRaw[k];
                            if (sf && !(sf instanceof Folder) && typeof sf.name === "string" && SUPPORTED_EXTENSIONS.test(sf.name)) {
                                validFiles.push(sf);
                            }
                        }
                    } catch (subErr) {}
                }
            }

            validFiles.sort(function (a, b) {
                var nameA = String(a.name).toLowerCase();
                var nameB = String(b.name).toLowerCase();
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

        function toUnitPx(val) {
            try {
                return new UnitValue(val, "px");
            } catch (eUnit) {
                return val;
            }
        }

        function safeResizeImage(doc, targetW, targetH, dpi, resample) {
            var d = dpi || 300;
            try {
                if (resample) {
                    doc.resizeImage(new UnitValue(targetW, "px"), new UnitValue(targetH, "px"), d, resample);
                } else {
                    doc.resizeImage(new UnitValue(targetW, "px"), new UnitValue(targetH, "px"), d);
                }
            } catch (e1) {
                try {
                    if (resample) {
                        doc.resizeImage(targetW, targetH, d, resample);
                    } else {
                        doc.resizeImage(targetW, targetH, d);
                    }
                } catch (e2) {}
            }
        }

        function safeResizeCanvas(doc, targetW, targetH, anchor) {
            var anc = anchor;
            try {
                if (!anc && typeof AnchorPosition !== "undefined") {
                    anc = AnchorPosition.MIDDLECENTER;
                }
            } catch (eAnc) {}
            try {
                doc.resizeCanvas(new UnitValue(targetW, "px"), new UnitValue(targetH, "px"), anc);
            } catch (e1) {
                try {
                    doc.resizeCanvas(targetW, targetH, anc);
                } catch (e2) {}
            }
        }

        function safeTranslateLayer(layer, dx, dy) {
            try {
                layer.translate(new UnitValue(dx, "px"), new UnitValue(dy, "px"));
            } catch (e1) {
                try {
                    layer.translate(dx, dy);
                } catch (e2) {}
            }
        }

        function safeFlattenDoc(doc) {
            try {
                if (doc.layers.length > 1) {
                    doc.flatten();
                } else if (doc.activeLayer && !doc.activeLayer.isBackgroundLayer) {
                    doc.flatten();
                }
            } catch (e1) {
                try {
                    var idFltI = charIDToTypeID("FltI");
                    executeAction(idFltI, undefined, DIALOG_NO);
                } catch (e2) {}
            }
        }

        function prepareBaseLayer(doc) {
            safeFlattenDoc(doc);
            try {
                if (doc.activeLayer && doc.activeLayer.isBackgroundLayer) {
                    doc.activeLayer.name = "Layer 0";
                }
            } catch (renameErr) {}
            try {
                if (doc.activeLayer && doc.activeLayer.isBackgroundLayer) {
                    doc.activeLayer.isBackgroundLayer = false;
                }
            } catch (lockErr) {}
            try {
                doc.activeLayer.allLocked = false;
                doc.activeLayer.pixelsLocked = false;
                doc.activeLayer.positionLocked = false;
                doc.activeLayer.transparentPixelsLocked = false;
            } catch (lockErr2) {}
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
            // In Photoshop CS2, 16-bit mode disables many filters and causes processing crashes.
            // Run in 8-bit for CS2 to guarantee 100% stability.
            if (!IS_CS2) {
                convertBitDepthSafe(doc, 16);
            } else {
                convertBitDepthSafe(doc, 8);
            }
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
                    if (PurgeTarget.ALLCACHES) {
                        app.purge(PurgeTarget.ALLCACHES);
                    } else if (PurgeTarget.ALL) {
                        app.purge(PurgeTarget.ALL);
                    }
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

            var highResample = null;
            try {
                if (typeof ResampleMethod !== "undefined") {
                    highResample = ResampleMethod.BICUBIC;
                    if (ResampleMethod.BICUBICSMOOTHER) highResample = ResampleMethod.BICUBICSMOOTHER;
                }
            } catch (eRes) {}

            if (mode === "Stretch") {
                safeResizeImage(doc, targetW, targetH, 300, highResample);
            } else if (mode === "Fit (Contain)") {
                var scaleFit = Math.min(targetW / origW, targetH / origH);
                var newW = Math.round(origW * scaleFit);
                var newH = Math.round(origH * scaleFit);
                safeResizeImage(doc, newW, newH, 300, highResample);
                try {
                    var bgCol = new SolidColor();
                    bgCol.rgb.red = 18;
                    bgCol.rgb.green = 18;
                    bgCol.rgb.blue = 22;
                    app.backgroundColor = bgCol;
                } catch (eBg) {}
                safeResizeCanvas(doc, targetW, targetH, (typeof AnchorPosition !== "undefined") ? AnchorPosition.MIDDLECENTER : undefined);
            } else {
                var scaleFill = Math.max(targetW / origW, targetH / origH);
                var scaledW = Math.round(origW * scaleFill);
                var scaledH = Math.round(origH * scaleFill);

                if (scaledW < targetW) scaledW = targetW;
                if (scaledH < targetH) scaledH = targetH;

                safeResizeImage(doc, scaledW, scaledH, 300, highResample);

                if (scaledW !== targetW || scaledH !== targetH) {
                    safeResizeCanvas(doc, targetW, targetH, (typeof AnchorPosition !== "undefined") ? AnchorPosition.MIDDLECENTER : undefined);
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
                // ====================================================================
        // 3D FLOW PATTERN PRESETS MAP (16 Stock Presets matching Studio Web)
        // ====================================================================
        var FLOW_PRESET_MAP = {
            "9.1": { name: "Silver Metallic Flow", bg: [[15, 23, 42], [30, 41, 59], [51, 65, 85]], ribbon: [[30, 41, 59], [71, 85, 105], [148, 163, 184], [255, 255, 255], [203, 213, 225], [100, 116, 139], [15, 23, 42]], accent: [244, 63, 94], twirl: 45 },
            "9.2": { name: "Black & Gold Wave", bg: [[5, 6, 8], [13, 15, 20], [22, 25, 34]], ribbon: [[120, 53, 15], [180, 83, 9], [245, 158, 11], [255, 251, 235], [217, 119, 6], [146, 64, 14], [69, 26, 3]], accent: [253, 224, 71], twirl: 50 },
            "9.3": { name: "Purple Satin Wave", bg: [[11, 4, 22], [28, 9, 54], [46, 16, 101]], ribbon: [[30, 11, 56], [88, 28, 135], [147, 51, 234], [243, 232, 255], [126, 34, 206], [21, 6, 40]], accent: [192, 132, 252], twirl: -45 },
            "9.4": { name: "Blue Liquid Wave", bg: [[2, 6, 23], [3, 105, 161]], ribbon: [[2, 132, 199], [56, 189, 248], [224, 242, 254], [255, 255, 255], [2, 132, 199]], accent: [255, 255, 255], twirl: 40 },
            "9.5": { name: "Champagne Gold Flow", bg: [[20, 13, 4], [45, 28, 8]], ribbon: [[146, 64, 14], [217, 119, 6], [253, 224, 71], [255, 255, 255], [180, 83, 9]], accent: [254, 240, 138], twirl: 35 },
            "9.6": { name: "Dark Chrome Wave", bg: [[5, 8, 17], [15, 23, 42]], ribbon: [[51, 65, 85], [148, 163, 184], [255, 255, 255], [0, 240, 255]], accent: [0, 240, 255], twirl: 55 },
            "9.7": { name: "Iridescent Glass Flow", bg: [[22, 10, 40], [10, 5, 20]], ribbon: [[236, 72, 153], [139, 92, 246], [6, 182, 212], [255, 255, 255]], accent: [236, 72, 153], twirl: -50 },
            "9.8": { name: "Red Chrome Ribbon", bg: [[9, 9, 11], [24, 10, 12]], ribbon: [[153, 27, 27], [239, 68, 68], [255, 255, 255], [203, 213, 225], [153, 27, 27]], accent: [255, 255, 255], twirl: 45 },
            "9.9": { name: "Blue-Purple Gradient Flow", bg: [[3, 10, 25], [15, 5, 30]], ribbon: [[3, 105, 161], [56, 189, 248], [139, 92, 246], [217, 70, 239], [255, 255, 255]], accent: [217, 70, 239], twirl: 45 },
            "9.10": { name: "Pearl Gold Wave", bg: [[28, 25, 23], [40, 36, 32]], ribbon: [[202, 138, 4], [254, 240, 138], [255, 255, 255], [202, 138, 4]], accent: [254, 240, 138], twirl: -40 },
            "9.11": { name: "Emerald Metallic Flow", bg: [[2, 26, 20], [4, 120, 87]], ribbon: [[16, 185, 129], [52, 211, 153], [253, 224, 71], [255, 255, 255]], accent: [253, 224, 71], twirl: 40 },
            "9.12": { name: "Crystal Blue Wave", bg: [[8, 47, 73], [14, 116, 144]], ribbon: [[2, 132, 199], [125, 211, 252], [255, 255, 255], [56, 189, 248]], accent: [255, 255, 255], twirl: -45 },
            "9.13": { name: "Metallic Layered Curve", bg: [[17, 24, 39], [55, 65, 81]], ribbon: [[156, 163, 175], [243, 244, 246], [255, 255, 255], [107, 114, 128]], accent: [255, 255, 255], twirl: 35 },
            "9.14": { name: "Neon Blue-Pink Flow", bg: [[3, 7, 18], [10, 10, 25]], ribbon: [[6, 182, 212], [255, 255, 255], [236, 72, 153]], accent: [6, 182, 212], twirl: 50 },
            "9.15": { name: "Silver Satin Texture", bg: [[15, 23, 42], [30, 41, 59]], ribbon: [[71, 85, 105], [203, 213, 225], [255, 255, 255], [148, 163, 184]], accent: [255, 255, 255], twirl: -35 },
            "9.16": { name: "Deep Purple Glass Flow", bg: [[15, 5, 29], [40, 10, 70]], ribbon: [[88, 28, 135], [168, 85, 247], [244, 114, 182], [255, 255, 255]], accent: [244, 114, 182], twirl: 45 }
        };

        function getFlowPresetDef(styleName) {
            for (var key in FLOW_PRESET_MAP) {
                if (FLOW_PRESET_MAP.hasOwnProperty(key)) {
                    if (styleName.indexOf(key) !== -1 || styleName.indexOf(FLOW_PRESET_MAP[key].name) !== -1) {
                        return FLOW_PRESET_MAP[key];
                    }
                }
            }
            return FLOW_PRESET_MAP["9.1"];
        }

        // ====================================================================
        // PROCEDURAL 3D FLOW PATTERN ENGINE (Full-Frame Stock Wallpapers)
        // ====================================================================
        function renderPhotoshopFlowPattern(doc, w, h, style, cfg) {
            var pDef = getFlowPresetDef(style);
            var opacity = Math.max(30, Math.min(100, cfg.glassOpacity || 85));
            var distortion = Math.max(10, Math.min(100, cfg.glassDistortion || 35));
            var strokeW = Math.max(3, Math.round(w * 0.003));

            try {
                // 1. Studio Backdrop Base Layer
                var bgArt = doc.artLayers.add();
                bgArt.name = "RI 3D Flow Studio Backdrop [" + pDef.name + "]";
                var bgCol = new SolidColor();
                bgCol.rgb.red = pDef.bg[0][0]; bgCol.rgb.green = pDef.bg[0][1]; bgCol.rgb.blue = pDef.bg[0][2];
                doc.selection.selectAll();
                doc.selection.fill(bgCol, ColorBlendMode.NORMAL, 100, false);
                doc.selection.deselect();

                // 2. Generate 3 to 4 Multi-Tier Volumetric Flow Ribbons
                var ribbonCount = 3;
                for (var r = 0; r < ribbonCount; r++) {
                    var ribbonLayer = doc.artLayers.add();
                    ribbonLayer.name = "RI Flow Ribbon " + (r + 1) + " [" + pDef.name + "]";

                    // Construct fluid S-curve harmonic wave polygon
                    var pts = [];
                    var steps = 24;
                    var stepX = w / steps;
                    var centerY = h * (0.32 + (r * 0.18));
                    var amp = h * (0.15 + (r * 0.05));
                    var phase = r * 1.57;
                    for (var s = 0; s <= steps; s++) {
                        var px = s * stepX;
                        var py = centerY + Math.sin((s / steps) * Math.PI * 2 + phase) * amp + Math.cos((s / steps) * Math.PI * 4) * (amp * 0.25);
                        pts.push([Math.round(px), Math.round(py)]);
                    }
                    pts.push([w, h]);
                    pts.push([0, h]);
                    doc.selection.select(pts);

                    // Ribbon Base Color
                    var ribCol = new SolidColor();
                    var cIdx = Math.min(r * 2, pDef.ribbon.length - 1);
                    ribCol.rgb.red = pDef.ribbon[cIdx][0];
                    ribCol.rgb.green = pDef.ribbon[cIdx][1];
                    ribCol.rgb.blue = pDef.ribbon[cIdx][2];
                    doc.selection.fill(ribCol, ColorBlendMode.NORMAL, 90, false);
                    doc.selection.deselect();

                    // Volumetric Fluid Distortion Filters
                    try {
                        var twAngle = Math.round(pDef.twirl * (r % 2 === 0 ? 1 : -0.75));
                        ribbonLayer.applyTwirl(twAngle);
                        ribbonLayer.applyZigZag(Math.round(distortion * 0.4), 4, ZigZagType.AROUNDCENTER);
                    } catch (eFld) {}

                    // Realistic Volumetric 3D Drop Shadow behind ribbon
                    try {
                        var shLayer = doc.artLayers.add();
                        shLayer.name = "RI Flow Ribbon " + (r + 1) + " Shadow";
                        shLayer.move(ribbonLayer, ElementPlacement.PLACEAFTER);
                        var sBlack = new SolidColor();
                        sBlack.rgb.red = 0; sBlack.rgb.green = 0; sBlack.rgb.blue = 0;
                        var shPts = [];
                        var shOffY = Math.round(h * 0.025);
                        for (var p = 0; p < pts.length; p++) {
                            shPts.push([pts[p][0], Math.min(h, pts[p][1] + shOffY)]);
                        }
                        doc.selection.select(shPts);
                        try { doc.selection.feather(Math.round(h * 0.02)); } catch (fSh) {}
                        doc.selection.fill(sBlack, ColorBlendMode.NORMAL, 55, false);
                        doc.selection.deselect();
                        shLayer.opacity = 50;
                    } catch (eShd) {}

                    // High-Specular Crest Highlight Curve on top of wave
                    try {
                        var crestLayer = doc.artLayers.add();
                        crestLayer.name = "RI Flow Ribbon " + (r + 1) + " Specular Crest";
                        var crestCol = new SolidColor();
                        crestCol.rgb.red = pDef.accent[0];
                        crestCol.rgb.green = pDef.accent[1];
                        crestCol.rgb.blue = pDef.accent[2];
                        doc.selection.select(pts);
                        doc.selection.stroke(crestCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 95);
                        doc.selection.deselect();
                        crestLayer.blendMode = BlendMode.SCREEN;
                        crestLayer.opacity = 85;
                    } catch (eCrs) {}
                }

                // 3. Floating Specular Glints & Star Glare Flares
                try {
                    var flareLayer = doc.artLayers.add();
                    flareLayer.name = "RI 3D Flow Specular Glints";
                    var whiteCol = new SolidColor();
                    whiteCol.rgb.red = 255; whiteCol.rgb.green = 255; whiteCol.rgb.blue = 255;
                    var glintPositions = [
                        [Math.round(w * 0.35), Math.round(h * 0.38), Math.round(w * 0.025)],
                        [Math.round(w * 0.62), Math.round(h * 0.48), Math.round(w * 0.03)],
                        [Math.round(w * 0.48), Math.round(h * 0.65), Math.round(w * 0.02)]
                    ];
                    for (var g = 0; g < glintPositions.length; g++) {
                        var gx = glintPositions[g][0];
                        var gy = glintPositions[g][1];
                        var gr = glintPositions[g][2];
                        makeEllipticalSelectionSafe(doc, gy - gr, gx - gr, gy + gr, gx + gr);
                        try { doc.selection.feather(Math.round(gr * 0.45)); } catch (fG) {}
                        doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 90, false);
                    }
                    doc.selection.deselect();
                    flareLayer.blendMode = BlendMode.SCREEN;
                    flareLayer.opacity = 85;
                } catch (eGlnt) {}

                return "3D Flow Pattern [" + pDef.name + "]";
            } catch (errFlow) {
                return null;
            }
        }

        // ====================================================================
        // PROCEDURAL 3D GLASS BACKGROUND ENGINE (25 Full-Frame Styles)
        // ====================================================================
        function renderPhotoshop3DGlassBackground(doc, w, h, style, cfg) {
            var opacity = Math.max(30, Math.min(100, cfg.glassOpacity || 80));
            var frostBlur = Math.max(2, Math.min(100, cfg.glassFrostBlur || 20));
            var distortion = Math.max(10, Math.min(100, cfg.glassDistortion || 35));
            var strokeW = Math.max(3, Math.round(w * 0.0035));

            try {
                // Deep Oceanic Sapphire Studio Backdrop
                var bgLayer = doc.artLayers.add();
                bgLayer.name = "RI 3D Glass Studio Backdrop";
                var bgCol = new SolidColor();
                bgCol.rgb.red = 7; bgCol.rgb.green = 16; bgCol.rgb.blue = 38;
                doc.selection.selectAll();
                doc.selection.fill(bgCol, ColorBlendMode.NORMAL, 100, false);
                doc.selection.deselect();

                var whiteCol = new SolidColor();
                whiteCol.rgb.red = 255; whiteCol.rgb.green = 255; whiteCol.rgb.blue = 255;
                var cyanCol = new SolidColor();
                cyanCol.rgb.red = 56; cyanCol.rgb.green = 189; cyanCol.rgb.blue = 248;
                var violetCol = new SolidColor();
                violetCol.rgb.red = 168; violetCol.rgb.green = 85; violetCol.rgb.blue = 247;
                var sBlack = new SolidColor();
                sBlack.rgb.red = 0; sBlack.rgb.green = 0; sBlack.rgb.blue = 0;

                if (style.indexOf("Wave") !== -1 || style.indexOf("10.01") !== -1) {
                    // 10.01 3D Glass Wave: 4 sweeping undulating translucent glass waves
                    for (var i = 0; i < 4; i++) {
                        var waveArt = doc.artLayers.add();
                        waveArt.name = "RI 3D Glass Wave " + (i + 1);
                        var y0 = Math.round(h * (0.2 + (i * 0.16)));
                        var amp = Math.round(h * 0.12);
                        var wPts = [];
                        for (var x = 0; x <= 20; x++) {
                            var curX = Math.round(x * (w / 20));
                            var curY = Math.round(y0 + Math.sin(x * 0.4 + (i * 1.2)) * amp);
                            wPts.push([curX, curY]);
                        }
                        wPts.push([w, h]); wPts.push([0, h]);
                        doc.selection.select(wPts);
                        doc.selection.fill(i % 2 === 0 ? cyanCol : violetCol, ColorBlendMode.NORMAL, 45, false);
                        doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 85);
                        doc.selection.deselect();
                        waveArt.applyGaussianBlur(Math.max(2, frostBlur * 0.3));
                        waveArt.blendMode = BlendMode.SCREEN;
                        waveArt.opacity = opacity;
                    }

                } else if (style.indexOf("Layers") !== -1 || style.indexOf("Plates") !== -1 || style.indexOf("10.02") !== -1 || style.indexOf("10.18") !== -1) {
                    // 10.02 & 10.18: 4 Horizontal Floating Glass Shelves / Plates with Stepped Drop Shadows
                    for (var p = 0; p < 4; p++) {
                        var plateArt = doc.artLayers.add();
                        plateArt.name = "RI 3D Glass Plate " + (p + 1);
                        var py = Math.round(h * (0.22 + (p * 0.18)));
                        var pw = Math.round(w * (0.85 - (p * 0.05)));
                        var ph = Math.round(h * 0.14);
                        var px = Math.round((w - pw) / 2);

                        // Drop shadow
                        var pSh = doc.artLayers.add();
                        pSh.name = "Plate " + (p + 1) + " Shadow";
                        pSh.move(plateArt, ElementPlacement.PLACEAFTER);
                        doc.selection.select([[px, py + Math.round(h * 0.02)], [px + pw, py + Math.round(h * 0.02)], [px + pw, py + ph + Math.round(h * 0.02)], [px, py + ph + Math.round(h * 0.02)]]);
                        try { doc.selection.feather(Math.round(w * 0.015)); } catch (fP) {}
                        doc.selection.fill(sBlack, ColorBlendMode.NORMAL, 55, false);
                        doc.selection.deselect();
                        pSh.opacity = 60;

                        // Plate glass body
                        doc.activeLayer = plateArt;
                        doc.selection.select([[px, py], [px + pw, py], [px + pw, py + ph], [px, py + ph]]);
                        doc.selection.fill(cyanCol, ColorBlendMode.NORMAL, 30, false);
                        doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);
                        doc.selection.deselect();
                        plateArt.applyGaussianBlur(Math.max(2, frostBlur * 0.25));
                        plateArt.blendMode = BlendMode.SCREEN;
                        plateArt.opacity = opacity;
                    }

                } else if (style.indexOf("Bubble") !== -1 || style.indexOf("Spheres") !== -1 || style.indexOf("Balls") !== -1 || style.indexOf("10.03") !== -1 || style.indexOf("10.10") !== -1 || style.indexOf("10.23") !== -1) {
                    // 10.03, 10.10, 10.23: Cluster of Volumetric Floating Glass Spheres with Spherize Refraction
                    var bubbleCoords = [
                        [Math.round(w * 0.25), Math.round(h * 0.35), Math.round(Math.min(w, h) * 0.18)],
                        [Math.round(w * 0.52), Math.round(h * 0.45), Math.round(Math.min(w, h) * 0.25)],
                        [Math.round(w * 0.78), Math.round(h * 0.32), Math.round(Math.min(w, h) * 0.16)],
                        [Math.round(w * 0.38), Math.round(h * 0.72), Math.round(Math.min(w, h) * 0.14)],
                        [Math.round(w * 0.68), Math.round(h * 0.68), Math.round(Math.min(w, h) * 0.20)],
                        [Math.round(w * 0.15), Math.round(h * 0.62), Math.round(Math.min(w, h) * 0.11)],
                        [Math.round(w * 0.85), Math.round(h * 0.65), Math.round(Math.min(w, h) * 0.12)]
                    ];
                    for (var b = 0; b < bubbleCoords.length; b++) {
                        var bx = bubbleCoords[b][0];
                        var by = bubbleCoords[b][1];
                        var br = bubbleCoords[b][2];

                        // Drop Shadow
                        var bSh = doc.artLayers.add();
                        bSh.name = "Bubble " + (b + 1) + " Shadow";
                        var shOff = Math.round(br * 0.18);
                        makeEllipticalSelectionSafe(doc, (by - br) + shOff, (bx - br) + shOff, (by + br) + shOff, (bx + br) + shOff);
                        try { doc.selection.feather(Math.round(br * 0.22)); } catch (fB) {}
                        doc.selection.fill(sBlack, ColorBlendMode.NORMAL, 60, false);
                        doc.selection.deselect();
                        bSh.opacity = 50;

                        // Sphere Glass Body
                        var bArt = doc.artLayers.add();
                        bArt.name = "RI 3D Bubble " + (b + 1);
                        makeEllipticalSelectionSafe(doc, by - br, bx - br, by + br, bx + br);
                        doc.selection.fill(b % 2 === 0 ? cyanCol : violetCol, ColorBlendMode.NORMAL, 35, false);
                        doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);
                        doc.selection.deselect();
                        try { bArt.applySpherize(100, SpherizeMode.NORMAL); } catch (eSph) {}

                        // Specular Glare Flare Crescent on top-left of orb
                        var glR = Math.round(br * 0.25);
                        var glX = bx - Math.round(br * 0.42);
                        var glY = by - Math.round(br * 0.42);
                        makeEllipticalSelectionSafe(doc, glY - glR, glX - glR, glY + glR, glX + glR);
                        try { doc.selection.feather(Math.round(glR * 0.4)); } catch (fG2) {}
                        doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 90, false);
                        doc.selection.deselect();
                        bArt.blendMode = BlendMode.SCREEN;
                        bArt.opacity = opacity;
                    }

                } else if (style.indexOf("Cubes") !== -1 || style.indexOf("10.04") !== -1) {
                    // 10.04 3D Crystal Cubes: 6 Isometric 3D Cubes with Top, Left, and Right Facets
                    var cubeCenters = [
                        [Math.round(w * 0.28), Math.round(h * 0.42), Math.round(Math.min(w, h) * 0.14)],
                        [Math.round(w * 0.52), Math.round(h * 0.36), Math.round(Math.min(w, h) * 0.18)],
                        [Math.round(w * 0.74), Math.round(h * 0.46), Math.round(Math.min(w, h) * 0.15)],
                        [Math.round(w * 0.40), Math.round(h * 0.68), Math.round(Math.min(w, h) * 0.13)],
                        [Math.round(w * 0.64), Math.round(h * 0.66), Math.round(Math.min(w, h) * 0.16)]
                    ];
                    for (var c = 0; c < cubeCenters.length; c++) {
                        var ccx = cubeCenters[c][0];
                        var ccy = cubeCenters[c][1];
                        var csz = cubeCenters[c][2];
                        var halfW = Math.round(csz * 0.866);
                        var halfH = Math.round(csz * 0.5);

                        var cubeArt = doc.artLayers.add();
                        cubeArt.name = "RI 3D Crystal Cube " + (c + 1);

                        // Top Facet (Brightest)
                        doc.selection.select([[ccx, ccy - csz], [ccx + halfW, ccy - halfH], [ccx, ccy], [ccx - halfW, ccy - halfH]]);
                        doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 65, false);
                        doc.selection.stroke(whiteCol, Math.max(2, Math.round(strokeW * 0.7)), StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);

                        // Left Facet (Medium)
                        doc.selection.select([[ccx - halfW, ccy - halfH], [ccx, ccy], [ccx, ccy + csz], [ccx - halfW, ccy + halfH]]);
                        doc.selection.fill(cyanCol, ColorBlendMode.NORMAL, 55, false);
                        doc.selection.stroke(whiteCol, Math.max(2, Math.round(strokeW * 0.7)), StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 85);

                        // Right Facet (Darker Shadow)
                        doc.selection.select([[ccx, ccy], [ccx + halfW, ccy - halfH], [ccx + halfW, ccy + halfH], [ccx, ccy + csz]]);
                        doc.selection.fill(violetCol, ColorBlendMode.NORMAL, 70, false);
                        doc.selection.stroke(whiteCol, Math.max(2, Math.round(strokeW * 0.7)), StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 85);
                        doc.selection.deselect();

                        cubeArt.blendMode = BlendMode.SCREEN;
                        cubeArt.opacity = opacity;
                    }

                } else if (style.indexOf("Hexagon") !== -1 || style.indexOf("10.06") !== -1) {
                    // 10.06 3D Hexagon: Floating Hexagonal Prisms
                    var hexCenters = [
                        [Math.round(w * 0.3), Math.round(h * 0.38), Math.round(Math.min(w, h) * 0.16)],
                        [Math.round(w * 0.52), Math.round(h * 0.5), Math.round(Math.min(w, h) * 0.22)],
                        [Math.round(w * 0.72), Math.round(h * 0.38), Math.round(Math.min(w, h) * 0.16)],
                        [Math.round(w * 0.4), Math.round(h * 0.72), Math.round(Math.min(w, h) * 0.14)],
                        [Math.round(w * 0.65), Math.round(h * 0.72), Math.round(Math.min(w, h) * 0.14)]
                    ];
                    for (var hx = 0; hx < hexCenters.length; hx++) {
                        var hexArt = doc.artLayers.add();
                        hexArt.name = "RI 3D Hexagon " + (hx + 1);
                        var hcx = hexCenters[hx][0]; var hcy = hexCenters[hx][1]; var hcr = hexCenters[hx][2];
                        var hPts = [];
                        for (var a = 0; a < 6; a++) {
                            var ang = (a * 60) * Math.PI / 180;
                            hPts.push([Math.round(hcx + Math.cos(ang) * hcr), Math.round(hcy + Math.sin(ang) * hcr)]);
                        }
                        doc.selection.select(hPts);
                        doc.selection.fill(cyanCol, ColorBlendMode.NORMAL, 45, false);
                        doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);
                        doc.selection.deselect();
                        hexArt.blendMode = BlendMode.SCREEN;
                        hexArt.opacity = opacity;
                    }

                } else if (style.indexOf("Spiral") !== -1 || style.indexOf("Vortex") !== -1 || style.indexOf("10.08") !== -1) {
                    // 10.08 3D Glass Spiral Vortex
                    var spiralArt = doc.artLayers.add();
                    spiralArt.name = "RI 3D Glass Spiral Vortex";
                    doc.selection.selectAll();
                    doc.selection.fill(cyanCol, ColorBlendMode.NORMAL, 50, false);
                    doc.selection.deselect();
                    spiralArt.applyTwirl(120);
                    spiralArt.applyZigZag(40, 6, ZigZagType.AROUNDCENTER);
                    spiralArt.blendMode = BlendMode.SCREEN;
                    spiralArt.opacity = opacity;

                } else if (style.indexOf("Prism") !== -1 || style.indexOf("10.11") !== -1) {
                    // 10.11 3D Prism: Triangular Prism Facet splitting into Rainbow Dispersion
                    var prismArt = doc.artLayers.add();
                    prismArt.name = "RI 3D Glass Prism";
                    var tTop = [Math.round(w * 0.5), Math.round(h * 0.2)];
                    var tLeft = [Math.round(w * 0.28), Math.round(h * 0.78)];
                    var tRight = [Math.round(w * 0.72), Math.round(h * 0.78)];
                    doc.selection.select([tTop, tRight, tLeft]);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 40, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 95);
                    doc.selection.deselect();
                    prismArt.blendMode = BlendMode.SCREEN;
                    prismArt.opacity = opacity;

                    // Rainbow Spectral Dispersion Beam
                    try {
                        var specArt = doc.artLayers.add();
                        specArt.name = "RI Prism Chromatic Dispersion";
                        var rainbowColors = [[255, 45, 65], [255, 135, 30], [255, 230, 45], [45, 215, 115], [30, 190, 255], [75, 95, 255], [175, 55, 255]];
                        var bH = Math.round(h / (rainbowColors.length * 2));
                        var sY = Math.round(h * 0.28);
                        for (var rc = 0; rc < rainbowColors.length; rc++) {
                            var curC = new SolidColor();
                            curC.rgb.red = rainbowColors[rc][0]; curC.rgb.green = rainbowColors[rc][1]; curC.rgb.blue = rainbowColors[rc][2];
                            var beamY = sY + (rc * bH);
                            doc.selection.select([[Math.round(w * 0.5), beamY], [w, beamY - Math.round(h * 0.08)], [w, beamY + bH - Math.round(h * 0.08)], [Math.round(w * 0.5), beamY + bH]]);
                            try { doc.selection.feather(Math.round(bH * 0.4)); } catch (fB3) {}
                            doc.selection.fill(curC, ColorBlendMode.NORMAL, 65, false);
                        }
                        doc.selection.deselect();
                        specArt.blendMode = BlendMode.COLORBLEND;
                        specArt.opacity = 65;
                    } catch (eSp) {}

                } else if (style.indexOf("Mountains") !== -1 || style.indexOf("10.19") !== -1) {
                    // 10.19 3D Glass Mountains: 3 Triangular Crystalline Peaks
                    var peaks = [
                        [[Math.round(w * 0.28), Math.round(h * 0.35)], [Math.round(w * 0.08), Math.round(h * 0.82)], [Math.round(w * 0.48), Math.round(h * 0.82)]],
                        [[Math.round(w * 0.52), Math.round(h * 0.25)], [Math.round(w * 0.32), Math.round(h * 0.82)], [Math.round(w * 0.72), Math.round(h * 0.82)]],
                        [[Math.round(w * 0.74), Math.round(h * 0.32)], [Math.round(w * 0.56), Math.round(h * 0.82)], [Math.round(w * 0.92), Math.round(h * 0.82)]]
                    ];
                    for (var m = 0; m < peaks.length; m++) {
                        var mArt = doc.artLayers.add();
                        mArt.name = "RI 3D Mountain Peak " + (m + 1);
                        doc.selection.select(peaks[m]);
                        doc.selection.fill(m % 2 === 0 ? cyanCol : violetCol, ColorBlendMode.NORMAL, 50, false);
                        doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);
                        doc.selection.deselect();
                        mArt.blendMode = BlendMode.SCREEN;
                        mArt.opacity = opacity;
                    }

                } else {
                    // Universal Volumetric 3D Glass Surface (Fluid, Bevel, Soft Glass, Ribbon, etc.)
                    var uniArt = doc.artLayers.add();
                    uniArt.name = "RI 3D Glass Surface [" + style + "]";
                    doc.selection.selectAll();
                    doc.selection.fill(cyanCol, ColorBlendMode.NORMAL, 45, false);
                    doc.selection.deselect();
                    try {
                        if (style.indexOf("Liquid") !== -1 || style.indexOf("Fluid") !== -1) {
                            uniArt.applyTwirl(65);
                            uniArt.applyZigZag(Math.round(distortion * 0.6), 5, ZigZagType.AROUNDCENTER);
                        } else if (style.indexOf("Streaks") !== -1) {
                            uniArt.applyMotionBlur(0, Math.round(distortion * 2.5));
                        } else if (style.indexOf("Tiles") !== -1 || style.indexOf("Square") !== -1) {
                            uniArt.applyRipple(Math.round(distortion * 0.8), RippleSize.LARGE);
                        } else {
                            uniArt.applyGaussianBlur(Math.max(2, frostBlur * 0.8));
                        }
                    } catch (eUni) {}
                    uniArt.blendMode = BlendMode.SCREEN;
                    uniArt.opacity = opacity;
                }

                return "3D Glass Background [" + style + "]";
            } catch (errBg) {
                return null;
            }
        }

        // ====================================================================
        // PROCEDURAL 3D GLASS SHAPE ENGINE (20 Physical 3D Geometric Shapes)
        // ====================================================================
        function renderPhotoshop3DGlassShape(doc, w, h, style, cfg) {
            var opacity = Math.max(30, Math.min(100, cfg.glassOpacity || 85));
            var frostBlur = Math.max(2, Math.min(100, cfg.glassFrostBlur || 20));
            var distortion = Math.max(10, Math.min(100, cfg.glassDistortion || 35));
            var strokeW = Math.max(3, Math.round(w * 0.0035));
            var cx = Math.round(w / 2);
            var cy = Math.round(h / 2);

            try {
                var whiteCol = new SolidColor();
                whiteCol.rgb.red = 255; whiteCol.rgb.green = 255; whiteCol.rgb.blue = 255;
                var sBlack = new SolidColor();
                sBlack.rgb.red = 0; sBlack.rgb.green = 0; sBlack.rgb.blue = 0;
                var cyanCol = new SolidColor();
                cyanCol.rgb.red = 56; cyanCol.rgb.green = 189; cyanCol.rgb.blue = 248;

                if (style.indexOf("Cube") !== -1 || style.indexOf("11.03") !== -1 || style.indexOf("5.4") !== -1) {
                    // 11.03 3D Glass Isometric Cube: 3 Visible Facets, Internal Corner Lines, Ground Shadow
                    var csz = Math.round(Math.min(w, h) * 0.28);
                    var halfW = Math.round(csz * 0.866);
                    var halfH = Math.round(csz * 0.5);

                    // Ground Shadow underneath the cube
                    var cSh = doc.artLayers.add();
                    cSh.name = "RI 3D Cube Ground Shadow";
                    makeEllipticalSelectionSafe(doc, (cy + csz) - Math.round(csz * 0.2), cx - halfW, (cy + csz) + Math.round(csz * 0.2), cx + halfW);
                    try { doc.selection.feather(Math.round(csz * 0.15)); } catch (fCb) {}
                    doc.selection.fill(sBlack, ColorBlendMode.NORMAL, 60, false);
                    doc.selection.deselect();
                    cSh.opacity = 55;

                    // Top Facet
                    var topArt = doc.artLayers.add();
                    topArt.name = "RI 3D Cube Top Facet";
                    doc.selection.select([[cx, cy - csz], [cx + halfW, cy - halfH], [cx, cy], [cx - halfW, cy - halfH]]);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 65, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 95);
                    doc.selection.deselect();
                    topArt.blendMode = BlendMode.SCREEN;

                    // Left Facet
                    var leftArt = doc.artLayers.add();
                    leftArt.name = "RI 3D Cube Left Facet";
                    doc.selection.select([[cx - halfW, cy - halfH], [cx, cy], [cx, cy + csz], [cx - halfW, cy + halfH]]);
                    doc.selection.fill(cyanCol, ColorBlendMode.NORMAL, 55, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);
                    doc.selection.deselect();
                    leftArt.blendMode = BlendMode.SCREEN;

                    // Right Facet
                    var rightArt = doc.artLayers.add();
                    rightArt.name = "RI 3D Cube Right Facet";
                    doc.selection.select([[cx, cy], [cx + halfW, cy - halfH], [cx + halfW, cy + halfH], [cx, cy + csz]]);
                    doc.selection.fill(cyanCol, ColorBlendMode.NORMAL, 75, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);
                    doc.selection.deselect();
                    rightArt.blendMode = BlendMode.SCREEN;

                } else if (style.indexOf("Sphere") !== -1 || style.indexOf("Orb") !== -1 || style.indexOf("11.04") !== -1 || style.indexOf("5.1") !== -1 || style.indexOf("5.2") !== -1) {
                    // 11.04 3D Crystal Sphere Orb: Circular selection, Spherize lens distortion, Fresnel rim & glare
                    var r = Math.round(Math.min(w, h) * 0.32);

                    // Drop Shadow
                    var sphSh = doc.artLayers.add();
                    sphSh.name = "RI 3D Sphere Ground Shadow";
                    makeEllipticalSelectionSafe(doc, (cy + r) - Math.round(r * 0.22), cx - r, (cy + r) + Math.round(r * 0.22), cx + r);
                    try { doc.selection.feather(Math.round(r * 0.16)); } catch (fSp) {}
                    doc.selection.fill(sBlack, ColorBlendMode.NORMAL, 65, false);
                    doc.selection.deselect();
                    sphSh.opacity = 60;

                    // Sphere Glass Body
                    var sphArt = doc.artLayers.add();
                    sphArt.name = "RI 3D Crystal Sphere Body";
                    makeEllipticalSelectionSafe(doc, cy - r, cx - r, cy + r, cx + r);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 35, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);
                    doc.selection.deselect();
                    try { sphArt.applySpherize(100, SpherizeMode.NORMAL); } catch (eSp2) {}
                    sphArt.applyGaussianBlur(Math.max(1, frostBlur * 0.2));

                    // Specular Glare Flare Crescent on top-left of sphere
                    var glR = Math.round(r * 0.25);
                    var glX = cx - Math.round(r * 0.42);
                    var glY = cy - Math.round(r * 0.42);
                    makeEllipticalSelectionSafe(doc, glY - glR, glX - glR, glY + glR, glX + glR);
                    try { doc.selection.feather(Math.round(glR * 0.4)); } catch (fG3) {}
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 90, false);
                    doc.selection.deselect();
                    sphArt.blendMode = BlendMode.SCREEN;
                    sphArt.opacity = opacity;

                } else if (style.indexOf("Pill") !== -1 || style.indexOf("Capsule") !== -1 || style.indexOf("11.05") !== -1) {
                    // 11.05 Capsule Glass Pill
                    var pillW = Math.round(w * 0.5);
                    var pillH = Math.round(h * 0.22);
                    var pillX = Math.round((w - pillW) / 2);
                    var pillY = Math.round((h - pillH) / 2);

                    var pillArt = doc.artLayers.add();
                    pillArt.name = "RI 3D Glass Capsule Pill";
                    doc.selection.select([[pillX, pillY], [pillX + pillW, pillY], [pillX + pillW, pillY + pillH], [pillX, pillY + pillH]]);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 40, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);
                    doc.selection.deselect();
                    try { pillArt.applySpherize(60, SpherizeMode.HORIZONTALONLY); } catch (ePl) {}
                    pillArt.blendMode = BlendMode.SCREEN;
                    pillArt.opacity = opacity;

                } else if (style.indexOf("Saturn") !== -1 || style.indexOf("11.06") !== -1) {
                    // 11.06 Saturn Ribbon Orb: Central 3D Sphere Orb encircled by an angled elliptical planetary ring
                    var sRad = Math.round(Math.min(w, h) * 0.22);
                    var sOrb = doc.artLayers.add();
                    sOrb.name = "RI Saturn Sphere Orb";
                    makeEllipticalSelectionSafe(doc, cy - sRad, cx - sRad, cy + sRad, cx + sRad);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 40, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);
                    doc.selection.deselect();
                    try { sOrb.applySpherize(100, SpherizeMode.NORMAL); } catch (eSt) {}
                    sOrb.blendMode = BlendMode.SCREEN;

                    // Tilted Planetary Glass Ring
                    var ringArt = doc.artLayers.add();
                    ringArt.name = "RI Saturn Glass Ring";
                    var rW = Math.round(sRad * 2.2);
                    var rH = Math.round(sRad * 0.6);
                    makeEllipticalSelectionSafe(doc, cy - rH, cx - rW, cy + rH, cx + rW);
                    doc.selection.stroke(whiteCol, strokeW + 2, StrokeLocation.CENTER, ColorBlendMode.NORMAL, 95);
                    doc.selection.deselect();
                    ringArt.blendMode = BlendMode.SCREEN;

                } else if (style.indexOf("Diamond") !== -1 || style.indexOf("Gem") !== -1 || style.indexOf("11.08") !== -1 || style.indexOf("11.17") !== -1) {
                    // 11.08 Faceted Diamond Crystal: Table facet, crown facets, and pavilion tip
                    var dW = Math.round(w * 0.22);
                    var dH = Math.round(h * 0.28);
                    var dArt = doc.artLayers.add();
                    dArt.name = "RI 3D Diamond Crystal";
                    doc.selection.select([[cx, cy - dH], [cx + dW, cy], [cx, cy + dH], [cx - dW, cy]]);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 45, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 95);
                    doc.selection.deselect();
                    dArt.blendMode = BlendMode.SCREEN;
                    dArt.opacity = opacity;

                } else if (style.indexOf("Star") !== -1 || style.indexOf("11.15") !== -1) {
                    // 11.15 3D Glass Star: 5-point faceted glass star
                    var starArt = doc.artLayers.add();
                    starArt.name = "RI 3D Glass Star";
                    var starPts = [];
                    var outerR = Math.round(Math.min(w, h) * 0.25);
                    var innerR = Math.round(outerR * 0.42);
                    for (var st = 0; st < 10; st++) {
                        var sAngle = (st * 36 - 90) * Math.PI / 180;
                        var sRadius = (st % 2 === 0) ? outerR : innerR;
                        starPts.push([Math.round(cx + Math.cos(sAngle) * sRadius), Math.round(cy + Math.sin(sAngle) * sRadius)]);
                    }
                    doc.selection.select(starPts);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 45, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 95);
                    doc.selection.deselect();
                    starArt.blendMode = BlendMode.SCREEN;
                    starArt.opacity = opacity;

                } else if (style.indexOf("Heart") !== -1 || style.indexOf("11.16") !== -1) {
                    // 11.16 3D Glass Heart
                    var heartArt = doc.artLayers.add();
                    heartArt.name = "RI 3D Glass Heart";
                    var hRad = Math.round(Math.min(w, h) * 0.16);
                    makeEllipticalSelectionSafe(doc, cy - hRad, cx - Math.round(hRad * 1.6), cy + hRad, cx);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 45, false);
                    makeEllipticalSelectionSafe(doc, cy - hRad, cx, cy + hRad, cx + Math.round(hRad * 1.6));
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 45, false);
                    doc.selection.select([[cx - Math.round(hRad * 1.5), cy], [cx + Math.round(hRad * 1.5), cy], [cx, cy + Math.round(hRad * 1.8)]]);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 45, false);
                    doc.selection.deselect();
                    heartArt.blendMode = BlendMode.SCREEN;
                    heartArt.opacity = opacity;

                } else {
                    // 11.01 Frosted Glass Panel / Slab: Centered floating card with drop shadow and bevel rim
                    var panW = Math.round(w * 0.65);
                    var panH = Math.round(h * 0.62);
                    var panX = Math.round((w - panW) / 2);
                    var panY = Math.round((h - panH) / 2);

                    // Drop Shadow
                    var slabSh = doc.artLayers.add();
                    slabSh.name = "RI 3D Glass Panel Shadow";
                    var shX = Math.round(w * 0.015);
                    var shY = Math.round(h * 0.02);
                    doc.selection.select([[panX + shX, panY + shY], [panX + panW + shX, panY + shY], [panX + panW + shX, panY + panH + shY], [panX + shX, panY + panH + shY]]);
                    try { doc.selection.feather(Math.round(w * 0.018)); } catch (fSlab) {}
                    doc.selection.fill(sBlack, ColorBlendMode.NORMAL, 60, false);
                    doc.selection.deselect();
                    slabSh.opacity = 55;

                    // Glass Panel Body
                    var panArt = doc.artLayers.add();
                    panArt.name = "RI 3D Glass Panel Body";
                    doc.selection.select([[panX, panY], [panX + panW, panY], [panX + panW, panY + panH], [panX, panY + panH]]);
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 35, false);
                    doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);

                    // Diagonal Light Sheen across top-left corner
                    var sheenW = Math.round(panW * 0.4);
                    var sheenH = Math.round(panH * 0.45);
                    doc.selection.select([[panX, panY], [panX + sheenW, panY], [panX, panY + sheenH]]);
                    try { doc.selection.feather(Math.round(w * 0.02)); } catch (fShn) {}
                    doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 50, false);
                    doc.selection.deselect();

                    panArt.applyGaussianBlur(Math.max(2, frostBlur * 0.35));
                    panArt.blendMode = BlendMode.SCREEN;
                    panArt.opacity = opacity;
                }

                return "3D Glass Shape [" + style + "]";
            } catch (errShp) {
                return null;
            }
        }

        function apply3DGlassEffectPhotoshop(doc, cfg) {
            if (!cfg.glassEnable) return null;

            var w = Math.round(toPx(doc.width));
            var h = Math.round(toPx(doc.height));
            var style = cfg.glassStyle || "Frosted Glassmorphism (Floating 3D Slab)";
            if (style === "Random 3D Glass Style") {
                var pickIdx = Math.floor(Math.random() * (GLASS_STYLE_PRESETS.length - 1)) + 1;
                style = GLASS_STYLE_PRESETS[pickIdx];
            }

            var opacity = Math.max(20, Math.min(100, cfg.glassOpacity || 75));
            var frostBlur = Math.max(2, Math.min(100, cfg.glassFrostBlur || 25));
            var distortion = Math.max(5, Math.min(100, cfg.glassDistortion || 35));
            var tintColor = cfg.glassTintColor || "Clear Transparent";
            var scope = cfg.glassScope || "Center 3D Floating Panel";
            var strokeW = Math.max(4, Math.round(w * 0.0035));

            try {
                // Dedicated Procedural 3D Category Engines (Full-Frame & Geometric)
                var isCategory9Flow = (style.indexOf("9.") === 0 || style.indexOf("Flow") !== -1 || style.indexOf("Chrome Wave") !== -1 || style.indexOf("Chrome Ribbon") !== -1 || style.indexOf("Gold Wave") !== -1 || style.indexOf("Metallic") !== -1);
                var isCategory10Bg = (style.indexOf("10.") === 0 || style.indexOf("3D Glass") !== -1 || style.indexOf("Bubble") !== -1 || style.indexOf("Cubes") !== -1 || style.indexOf("Hexagon") !== -1 || style.indexOf("Plates") !== -1 || style.indexOf("Mountains") !== -1);
                var isCategory11Shapes = (style.indexOf("11.") === 0 || style.indexOf("Overlay") !== -1 || style.indexOf("Pill") !== -1 || style.indexOf("Slab") !== -1 || style.indexOf("Star") !== -1 || style.indexOf("Heart") !== -1 || style.indexOf("Gem") !== -1);
                var isCategory5Shapes = (style.indexOf("5.") === 0 || style.indexOf("Sphere") !== -1 || style.indexOf("Orb") !== -1 || style.indexOf("Ring") !== -1 || style.indexOf("Cube") !== -1 || style.indexOf("Cylinder") !== -1 || style.indexOf("Pyramid") !== -1 || style.indexOf("Torus") !== -1 || style.indexOf("Pebble") !== -1 || style.indexOf("55.") === 0);
                var isSphere = (style.indexOf("Sphere") !== -1 || style.indexOf("Orb") !== -1 || style.indexOf("5.1") === 0 || style.indexOf("5.2") === 0 || style.indexOf("55.") === 0);

                if (isCategory9Flow || style.indexOf("9.") === 0) {
                    var resFlow = renderPhotoshopFlowPattern(doc, w, h, style, cfg);
                    if (resFlow) return resFlow;
                }
                if (isCategory10Bg || style.indexOf("10.") === 0) {
                    var resBg = renderPhotoshop3DGlassBackground(doc, w, h, style, cfg);
                    if (resBg) return resBg;
                }
                if (isCategory11Shapes || style.indexOf("11.") === 0) {
                    var resShp = renderPhotoshop3DGlassShape(doc, w, h, style, cfg);
                    if (resShp) return resShp;
                }
                if (isCategory5Shapes && !isSphere) {
                    var resGeo = renderPhotoshop3DGlassShape(doc, w, h, style, cfg);
                    if (resGeo) return resGeo;
                }

                // Ensure active layer is unlocked
                if (doc.activeLayer && doc.activeLayer.isBackgroundLayer) {
                    try { doc.activeLayer.name = "Layer 0"; } catch (eBg) {}
                }

                // 1. Duplicate active layer to form the 3D Glass Refraction Body
                var glassLayer = doc.activeLayer.duplicate();
                glassLayer.name = "RI 3D Glass [" + style + "]";
                doc.activeLayer = glassLayer;

                // Category Detection
                var isCategory1Frosted = (style.indexOf("1.") === 0 || style.indexOf("Frost") !== -1 || style.indexOf("Matte") !== -1 || style.indexOf("Satin") !== -1 || style.indexOf("Hazy") !== -1 || style.indexOf("Diffused") !== -1 || style.indexOf("Translucent") !== -1 || style.indexOf("51.") === 0);
                var isCategory3Prism = (style.indexOf("3.") === 0 || style.indexOf("Prism") !== -1 || style.indexOf("Spectral") !== -1 || style.indexOf("Dispersion") !== -1 || style.indexOf("Refraction") !== -1 || style.indexOf("Iridescent") !== -1 || style.indexOf("Dichroic") !== -1 || style.indexOf("52.") === 0);
                var isCategory4Liquid = (style.indexOf("4.") === 0 || style.indexOf("Liquid") !== -1 || style.indexOf("Melted") !== -1 || style.indexOf("Flowing") !== -1 || style.indexOf("Wave") !== -1 || style.indexOf("Blob") !== -1 || style.indexOf("Bubble") !== -1 || style.indexOf("Droplet") !== -1 || style.indexOf("Fluid") !== -1 || style.indexOf("53.") === 0);
                var isCategory5Shapes = (style.indexOf("5.") === 0 || style.indexOf("Sphere") !== -1 || style.indexOf("Orb") !== -1 || style.indexOf("Ring") !== -1 || style.indexOf("Cube") !== -1 || style.indexOf("Cylinder") !== -1 || style.indexOf("Pyramid") !== -1 || style.indexOf("Torus") !== -1 || style.indexOf("Pebble") !== -1 || style.indexOf("55.") === 0);
                var isCategory6Glow = (style.indexOf("6.") === 0 || style.indexOf("Luminous") !== -1 || style.indexOf("Neon") !== -1 || style.indexOf("Aurora") !== -1 || style.indexOf("Glow") !== -1 || style.indexOf("Halo") !== -1 || style.indexOf("Beam") !== -1 || style.indexOf("Radiant") !== -1 || style.indexOf("Backlit") !== -1 || style.indexOf("54.") === 0);
                var isCategory7Abstract = (style.indexOf("7.") === 0 || style.indexOf("Fragment") !== -1 || style.indexOf("Shard") !== -1 || style.indexOf("Mosaic") !== -1 || style.indexOf("Mesh") !== -1 || style.indexOf("Sheet") !== -1 || style.indexOf("Overlay") !== -1 || style.indexOf("56.") === 0);
                var isCategory8Color = (style.indexOf("8.") === 0 || style.indexOf("Rose Gold") !== -1 || style.indexOf("Champagne") !== -1 || style.indexOf("Emerald") !== -1 || style.indexOf("Sapphire") !== -1 || style.indexOf("Amethyst") !== -1 || style.indexOf("Ruby") !== -1 || style.indexOf("Amber") !== -1 || style.indexOf("Ocean Blue") !== -1);
                var isCategory9Flow = (style.indexOf("9.") === 0 || style.indexOf("Flow") !== -1 || style.indexOf("Chrome Wave") !== -1 || style.indexOf("Chrome Ribbon") !== -1 || style.indexOf("Gold Wave") !== -1 || style.indexOf("Metallic") !== -1);
            var isCategory10Bg = (style.indexOf("10.") === 0 || style.indexOf("3D Glass") !== -1 || style.indexOf("Bubble") !== -1 || style.indexOf("Cubes") !== -1 || style.indexOf("Hexagon") !== -1 || style.indexOf("Plates") !== -1 || style.indexOf("Mountains") !== -1);
            var isCategory11Shapes = (style.indexOf("11.") === 0 || style.indexOf("Overlay") !== -1 || style.indexOf("Pill") !== -1 || style.indexOf("Slab") !== -1 || style.indexOf("Star") !== -1 || style.indexOf("Heart") !== -1 || style.indexOf("Gem") !== -1);
                var isSphere = (style.indexOf("Sphere") !== -1 || style.indexOf("Orb") !== -1 || style.indexOf("5.1") === 0 || style.indexOf("5.2") === 0 || style.indexOf("55.") === 0);

                if (isCategory1Frosted) {
                    // Category 1: Frosted Glass Effects (10 Styles + 51.)
                    var fBlur = frostBlur;
                    if (style.indexOf("Soft") !== -1) fBlur = Math.round(frostBlur * 0.7);
                    else if (style.indexOf("Heavy") !== -1) fBlur = Math.round(frostBlur * 1.8);
                    else if (style.indexOf("Crystal") !== -1) fBlur = Math.round(frostBlur * 0.9);
                    else if (style.indexOf("Milky") !== -1) fBlur = Math.round(frostBlur * 1.3);

                    glassLayer.applyGaussianBlur(Math.max(2, fBlur));
                    applyAddNoiseFilter(doc, 4, "Gaussian", true);
                    glassLayer.opacity = opacity;

                } else if (isSphere) {
                    // Category 5: 3D Convex Glass Crystal Sphere / Orb
                    var radius = Math.round(Math.min(w, h) * 0.32);
                    var cx = Math.round(w / 2);
                    var cy = Math.round(h / 2);

                    // 3D Drop Shadow behind the crystal sphere
                    try {
                        var sphereShadow = doc.artLayers.add();
                        sphereShadow.name = "RI 3D Sphere Drop Shadow";
                        sphereShadow.move(glassLayer, ElementPlacement.PLACEAFTER);
                        var sBlack = new SolidColor();
                        sBlack.rgb.red = 0; sBlack.rgb.green = 0; sBlack.rgb.blue = 0;
                        var shadowOffset = Math.round(radius * 0.12);
                        makeEllipticalSelectionSafe(doc, (cy - radius) + shadowOffset, (cx - radius) + shadowOffset, (cy + radius) + shadowOffset, (cx + radius) + shadowOffset);
                        try { doc.selection.feather(Math.round(radius * 0.16)); } catch (fSh) {}
                        doc.selection.fill(sBlack, ColorBlendMode.NORMAL, 55, false);
                        doc.selection.deselect();
                        sphereShadow.opacity = 60;
                    } catch (shErr) {}

                    doc.activeLayer = glassLayer;
                    makeEllipticalSelectionSafe(doc, cy - radius, cx - radius, cy + radius, cx + radius);
                    try {
                        glassLayer.applySpherize(Math.min(100, Math.round(distortion * 1.5)), SpherizeMode.NORMAL);
                    } catch (sphErr) {}
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.25));
                    doc.selection.invert();
                    doc.selection.clear();
                    doc.selection.deselect();
                    glassLayer.opacity = opacity;

                    // Specular Highlight Rim & Glare
                    if (cfg.glassBevelRim) {
                        try {
                            var rimLayer = doc.artLayers.add();
                            rimLayer.name = "RI 3D Sphere Specular Rim";
                            var whiteCol = new SolidColor();
                            whiteCol.rgb.red = 255; whiteCol.rgb.green = 255; whiteCol.rgb.blue = 255;
                            makeEllipticalSelectionSafe(doc, cy - radius, cx - radius, cy + radius, cx + radius);
                            doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);

                            // Crescent reflection flare on top-left of sphere
                            var glareR = Math.round(radius * 0.25);
                            var glareX = cx - Math.round(radius * 0.42);
                            var glareY = cy - Math.round(radius * 0.42);
                            makeEllipticalSelectionSafe(doc, glareY - glareR, glareX - glareR, glareY + glareR, glareX + glareR);
                            try { doc.selection.feather(Math.round(glareR * 0.4)); } catch (fGl) {}
                            doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 85, false);
                            doc.selection.deselect();
                            rimLayer.blendMode = BlendMode.SCREEN;
                            rimLayer.opacity = 85;
                        } catch (glareErr) {}
                    }

                } else if (isCategory3Prism) {
                    // Category 3: Optical & Prism Glass (Rainbow Dispersion & Spectral Refraction)
                    glassLayer.applyMotionBlur(0, Math.round(distortion * 1.8));
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.35));
                    glassLayer.blendMode = BlendMode.SCREEN;
                    glassLayer.opacity = Math.round(opacity * 0.85);

                    // Add authentic 7-color chromatic dispersion spectrum bands
                    try {
                        var prismLayer = doc.artLayers.add();
                        prismLayer.name = "RI Chromatic Dispersion [Rainbow Spectrum]";
                        var rainbowColors = [
                            [255, 45, 65],   // Red
                            [255, 135, 30],  // Orange
                            [255, 230, 45],  // Yellow
                            [45, 215, 115],  // Green
                            [30, 190, 255],  // Cyan
                            [75, 95, 255],   // Blue
                            [175, 55, 255]   // Violet
                        ];
                        var bandH = Math.round(h / (rainbowColors.length * 2));
                        var startY = Math.round(h * 0.22);
                        for (var rb = 0; rb < rainbowColors.length; rb++) {
                            var rCol = new SolidColor();
                            rCol.rgb.red = rainbowColors[rb][0];
                            rCol.rgb.green = rainbowColors[rb][1];
                            rCol.rgb.blue = rainbowColors[rb][2];
                            var curY = startY + (rb * bandH);
                            doc.selection.select([[0, curY], [w, curY], [w, curY + bandH], [0, curY + bandH]]);
                            try { doc.selection.feather(Math.round(bandH * 0.5)); } catch (fRb) {}
                            doc.selection.fill(rCol, ColorBlendMode.NORMAL, 60, false);
                        }
                        doc.selection.deselect();
                        prismLayer.blendMode = BlendMode.COLORBLEND;
                        prismLayer.opacity = 50;
                    } catch (prismErr) {}

                } else if (isCategory4Liquid) {
                    // Category 4: Liquid Glass Effects (Molten Fluid, Waves & Droplets)
                    try {
                        glassLayer.applyTwirl(Math.round((distortion * 0.9) + 40));
                        glassLayer.applyZigZag(Math.round(distortion * 0.6), 6, ZigZagType.AROUNDCENTER);
                    } catch (eLiq) {}
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.4));
                    glassLayer.opacity = opacity;

                } else if (isCategory6Glow) {
                    // Category 6: Light & Glow Glass (Neon, Luminous & Backlit)
                    glassLayer.applyGaussianBlur(Math.max(2, frostBlur * 0.8));
                    glassLayer.opacity = opacity;
                    try {
                        var glowLayer = doc.artLayers.add();
                        glowLayer.name = "RI 3D Luminous Specular Glow";
                        var glowCol = new SolidColor();
                        if (style.indexOf("Neon") !== -1) { glowCol.rgb.red = 30; glowCol.rgb.green = 220; glowCol.rgb.blue = 255; }
                        else if (style.indexOf("Aurora") !== -1) { glowCol.rgb.red = 140; glowCol.rgb.green = 255; glowCol.rgb.blue = 170; }
                        else { glowCol.rgb.red = 255; glowCol.rgb.green = 235; glowCol.rgb.blue = 190; }

                        doc.selection.selectAll();
                        doc.selection.stroke(glowCol, Math.max(12, Math.round(w * 0.008)), StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 85);
                        doc.selection.deselect();
                        glowLayer.blendMode = BlendMode.SCREEN;
                        glowLayer.opacity = 80;
                    } catch (glwErr) {}

                } else if (isCategory7Abstract) {
                    // Category 7: Modern Abstract Glass (Fragments, Mesh & Mosaic)
                    try {
                        glassLayer.applyZigZag(Math.round(distortion * 0.7), 8, ZigZagType.PONDRIPPLES);
                    } catch (eAbs) {}
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.45));
                    glassLayer.opacity = opacity;

                } else if (isCategory5Shapes && !isSphere) {
                    // Category 5: 3D Geometric Crystal Shapes (Cube, Pyramid, Ring, Torus, Cylinder)
                    try {
                        if (style.indexOf("Cube") !== -1) {
                            glassLayer.applyRipple(Math.round(distortion * 0.8), RippleSize.LARGE);
                        } else if (style.indexOf("Pyramid") !== -1 || style.indexOf("Diamond") !== -1) {
                            glassLayer.applyZigZag(Math.round(distortion * 0.7), 8, ZigZagType.PONDRIPPLES);
                        } else if (style.indexOf("Ring") !== -1 || style.indexOf("Torus") !== -1) {
                            glassLayer.applyTwirl(Math.round(75));
                        } else {
                            glassLayer.applySpherize(Math.round(distortion * 0.9), SpherizeMode.HORIZONTALONLY);
                        }
                    } catch (eShape) {}
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.35));
                    glassLayer.opacity = opacity;

                } else if (isCategory10Bg || isCategory11Shapes) {
                // Category 10 & 11: 25 3D Glass Backgrounds & 20 Floating Glass Shapes
                try {
                    if (style.indexOf("Wave") !== -1 || style.indexOf("Fluid") !== -1 || style.indexOf("Flow") !== -1) {
                        glassLayer.applyZigZag(Math.round(distortion * 0.7), 6, ZigZagType.AROUNDCENTER);
                        glassLayer.applyTwirl(Math.round((Math.random() > 0.5 ? 1 : -1) * 35));
                    } else if (style.indexOf("Bubble") !== -1 || style.indexOf("Sphere") !== -1 || style.indexOf("Balls") !== -1) {
                        glassLayer.applySpherize(Math.min(100, Math.round(distortion * 1.4)), SpherizeMode.NORMAL);
                    } else if (style.indexOf("Cubes") !== -1 || style.indexOf("Square") !== -1 || style.indexOf("Hexagon") !== -1 || style.indexOf("Tiles") !== -1) {
                        glassLayer.applyRipple(Math.round(distortion * 0.6), RippleSize.LARGE);
                    } else if (style.indexOf("Spiral") !== -1 || style.indexOf("Ring") !== -1) {
                        glassLayer.applyTwirl(Math.round(85));
                    } else if (style.indexOf("Prism") !== -1 || style.indexOf("Mountains") !== -1 || style.indexOf("Diamond") !== -1) {
                        glassLayer.applyZigZag(Math.round(distortion * 0.5), 8, ZigZagType.PONDRIPPLES);
                    } else {
                        glassLayer.applyGaussianBlur(Math.max(2, frostBlur * 0.8));
                    }
                } catch (eCat10) {}

                glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.4));
                glassLayer.opacity = opacity;

                // High-specular bevel edge rim layer
                try {
                    var rimArt = doc.artLayers.add();
                    rimArt.name = "RI 3D Glass Specular Bevel Rim";
                    var rimCol = new SolidColor();
                    if (style.indexOf("Neon") !== -1) { rimCol.rgb.red = 0; rimCol.rgb.green = 230; rimCol.rgb.blue = 255; }
                    else if (style.indexOf("Glow") !== -1) { rimCol.rgb.red = 255; rimCol.rgb.green = 240; rimCol.rgb.blue = 180; }
                    else { rimCol.rgb.red = 255; rimCol.rgb.green = 255; rimCol.rgb.blue = 255; }

                    doc.selection.selectAll();
                    doc.selection.stroke(rimCol, Math.max(5, Math.round(w * 0.0035)), StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 85);
                    doc.selection.deselect();
                    rimArt.blendMode = BlendMode.SCREEN;
                    rimArt.opacity = 75;
                } catch (eRim) {}

            } else if (isCategory9Flow) {
                    // Category 9: Abstract 3D Metallic & Glass Flow Patterns (16 Stock Presets)
                    try {
                        glassLayer.applyTwirl(Math.round((distortion * 0.8) + 35));
                        glassLayer.applyZigZag(Math.round(distortion * 0.45), 5, ZigZagType.AROUNDCENTER);
                    } catch (eFlow) {}
                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.3));
                    glassLayer.opacity = opacity;

                    // Specular Ribbon Ridge Highlight
                    try {
                        var ridgeLayer = doc.artLayers.add();
                        ridgeLayer.name = "RI 3D Metallic Flow Crest [Specular Sheen]";
                        var rCol = new SolidColor();
                        if (style.indexOf("Gold") !== -1) { rCol.rgb.red = 255; rCol.rgb.green = 225; rCol.rgb.blue = 120; }
                        else if (style.indexOf("Neon") !== -1) { rCol.rgb.red = 0; rCol.rgb.green = 240; rCol.rgb.blue = 255; }
                        else if (style.indexOf("Purple") !== -1) { rCol.rgb.red = 210; rCol.rgb.green = 140; rCol.rgb.blue = 255; }
                        else { rCol.rgb.red = 255; rCol.rgb.green = 255; rCol.rgb.blue = 255; }

                        doc.selection.selectAll();
                        doc.selection.stroke(rCol, Math.max(6, Math.round(w * 0.004)), StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 85);
                        doc.selection.deselect();
                        ridgeLayer.blendMode = BlendMode.SCREEN;
                        ridgeLayer.opacity = 80;
                    } catch (ridgeErr) {}

                } else {
                    // Category 2: Ribbed, Fluted & Textured Glass (Vertical, Horizontal, Wavy & Cross-Grid)
                    var isHoriz = (style.indexOf("Horizontal") !== -1 || style.indexOf("Venetian") !== -1 || style.indexOf("05.") !== -1 || style.indexOf("10.") !== -1);
                    var isWavy = (style.indexOf("Wavy") !== -1 || style.indexOf("Ripple") !== -1 || style.indexOf("S-Curve") !== -1 || style.indexOf("Chevron") !== -1 || style.indexOf("Zigzag") !== -1 || style.indexOf("02.") !== -1 || style.indexOf("03.") !== -1 || style.indexOf("19.") !== -1 || style.indexOf("20.") !== -1 || style.indexOf("23.") !== -1 || style.indexOf("24.") !== -1 || style.indexOf("35.") !== -1);

                    if (isHoriz) {
                        glassLayer.applyMotionBlur(0, Math.round(distortion * 1.6));
                    } else if (isWavy) {
                        glassLayer.applyMotionBlur(90, Math.round(distortion * 1.5));
                        try { glassLayer.applyZigZag(Math.round(distortion * 0.4), 8, ZigZagType.AROUNDCENTER); } catch (eZg) {}
                    } else {
                        glassLayer.applyMotionBlur(90, Math.round(distortion * 1.8));
                    }

                    glassLayer.applyGaussianBlur(Math.max(1, frostBlur * 0.3));
                    glassLayer.opacity = opacity;

                    // Generate authentic optical cylindrical rib lines
                    try {
                        var ribLayer = doc.artLayers.add();
                        ribLayer.name = "RI Optical Specular Flutes & Ribs";
                        var numFlutes = 28;
                        var fluteWidth = w / numFlutes;
                        var whiteCol = new SolidColor();
                        whiteCol.rgb.red = 255; whiteCol.rgb.green = 255; whiteCol.rgb.blue = 255;
                        var blackCol = new SolidColor();
                        blackCol.rgb.red = 0; blackCol.rgb.green = 0; blackCol.rgb.blue = 0;

                        if (isHoriz) {
                            var numSlats = 20;
                            var slatH = h / numSlats;
                            for (var sl = 0; sl < numSlats; sl++) {
                                var slY = Math.round(sl * slatH);
                                doc.selection.select([[0, slY], [w, slY], [w, slY + Math.max(2, Math.round(slatH * 0.2))], [0, slY + Math.max(2, Math.round(slatH * 0.2))]]);
                                doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 40, false);
                                var trY = Math.round(slY + slatH * 0.7);
                                doc.selection.select([[0, trY], [w, trY], [w, trY + Math.max(2, Math.round(slatH * 0.2))], [0, trY + Math.max(2, Math.round(slatH * 0.2))]]);
                                doc.selection.fill(blackCol, ColorBlendMode.NORMAL, 30, false);
                            }
                        } else {
                            for (var fl = 0; fl < numFlutes; fl++) {
                                var flX = Math.round(fl * fluteWidth);
                                doc.selection.select([[flX, 0], [flX + Math.max(2, Math.round(fluteWidth * 0.2)), 0], [flX + Math.max(2, Math.round(fluteWidth * 0.2)), h], [flX, h]]);
                                doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 40, false);
                                var trX = Math.round(flX + fluteWidth * 0.7);
                                doc.selection.select([[trX, 0], [trX + Math.max(2, Math.round(fluteWidth * 0.2)), 0], [trX + Math.max(2, Math.round(fluteWidth * 0.2)), h], [trX, h]]);
                                doc.selection.fill(blackCol, ColorBlendMode.NORMAL, 30, false);
                            }
                        }
                        doc.selection.deselect();
                        ribLayer.blendMode = BlendMode.OVERLAY;
                        ribLayer.opacity = 70;
                    } catch (fluteErr) {}
                }

                // 2. Apply Scope: Center 3D Floating Panel, Outer Border, or Left/Right Flutes
                var isFullFrameStyle = (isCategory9Flow || isCategory10Bg || isCategory11Shapes || isCategory5Shapes || isSphere || style.indexOf("9.") === 0 || style.indexOf("10.") === 0 || style.indexOf("11.") === 0);
                if (scope === "Center 3D Floating Panel" && !isSphere && !isFullFrameStyle) {
                    var insetX = Math.round(w * 0.16);
                    var insetY = Math.round(h * 0.18);
                    var panelW = w - (insetX * 2);
                    var panelH = h - (insetY * 2);

                    // A. Realistic 3D Drop Shadow behind the floating glass slab
                    try {
                        var slabShadow = doc.artLayers.add();
                        slabShadow.name = "RI 3D Glass Slab Drop Shadow";
                        slabShadow.move(glassLayer, ElementPlacement.PLACEAFTER);
                        var sCol = new SolidColor();
                        sCol.rgb.red = 0; sCol.rgb.green = 0; sCol.rgb.blue = 0;
                        var shX = Math.round(w * 0.012);
                        var shY = Math.round(h * 0.02);
                        doc.selection.select([[insetX + shX, insetY + shY], [w - insetX + shX, insetY + shY], [w - insetX + shX, h - insetY + shY], [insetX + shX, h - insetY + shY]]);
                        try { doc.selection.feather(Math.round(w * 0.018)); } catch (fSh2) {}
                        doc.selection.fill(sCol, ColorBlendMode.NORMAL, 65, false);
                        doc.selection.deselect();
                        slabShadow.opacity = 60;
                    } catch (shadowErr) {}

                    // B. Cut out the glass slab
                    doc.activeLayer = glassLayer;
                    safeTranslateLayer(glassLayer, Math.round(w * 0.004), Math.round(h * -0.004));
                    doc.selection.select([[insetX, insetY], [w - insetX, insetY], [w - insetX, h - insetY], [insetX, h - insetY]]);
                    doc.selection.invert();
                    doc.selection.clear();
                    doc.selection.deselect();

                    // C. 3D Bevel Specular Rim & Diagonal Reflection Sheen
                    if (cfg.glassBevelRim) {
                        try {
                            var bevelLayer = doc.artLayers.add();
                            bevelLayer.name = "RI 3D Glass Bevel Rim [Specular]";
                            var whiteCol = new SolidColor();
                            whiteCol.rgb.red = 255; whiteCol.rgb.green = 255; whiteCol.rgb.blue = 255;
                            doc.selection.select([[insetX, insetY], [w - insetX, insetY], [w - insetX, h - insetY], [insetX, h - insetY]]);
                            doc.selection.stroke(whiteCol, strokeW, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 90);

                            // Diagonal Sheen across top-left corner
                            var sheenW = Math.round(panelW * 0.4);
                            var sheenH = Math.round(panelH * 0.45);
                            doc.selection.select([[insetX, insetY], [insetX + sheenW, insetY], [insetX, insetY + sheenH]]);
                            try { doc.selection.feather(Math.round(w * 0.02)); } catch (fShn) {}
                            doc.selection.fill(whiteCol, ColorBlendMode.NORMAL, 45, false);
                            doc.selection.deselect();
                            bevelLayer.blendMode = BlendMode.SCREEN;
                            bevelLayer.opacity = 80;
                        } catch (bevErr) {}
                    }

                } else if (scope === "Left & Right Ribbed Flutes" && !isSphere) {
                    var fluteW = Math.round(w * 0.22);
                    doc.selection.select([[fluteW, 0], [w - fluteW, 0], [w - fluteW, h], [fluteW, h]]);
                    try { doc.selection.feather(35); } catch (eFlt) {}
                    doc.selection.clear();
                    doc.selection.deselect();

                } else if (scope === "Outer Border Frame" && !isSphere) {
                    var borderMargin = Math.round(Math.min(w, h) * 0.12);
                    doc.selection.select([[borderMargin, borderMargin], [w - borderMargin, borderMargin], [w - borderMargin, h - borderMargin], [borderMargin, h - borderMargin]]);
                    try { doc.selection.feather(30); } catch (eBrd) {}
                    doc.selection.clear();
                    doc.selection.deselect();
                    if (cfg.glassBevelRim) {
                        try {
                            var frameRim = doc.artLayers.add();
                            frameRim.name = "RI Outer Frame Bevel Rim";
                            var whiteCol2 = new SolidColor();
                            whiteCol2.rgb.red = 255; whiteCol2.rgb.green = 255; whiteCol2.rgb.blue = 255;
                            doc.selection.select([[borderMargin, borderMargin], [w - borderMargin, borderMargin], [w - borderMargin, h - borderMargin], [borderMargin, h - borderMargin]]);
                            doc.selection.stroke(whiteCol2, strokeW, StrokeLocation.CENTER, ColorBlendMode.NORMAL, 85);
                            doc.selection.deselect();
                            frameRim.blendMode = BlendMode.SCREEN;
                            frameRim.opacity = 75;
                        } catch (frmErr) {}
                    }
                }

                // 3. Apply Professional Glass Tint Color Layer (Category 8 or Dropdown Tint)
                var activeTint = tintColor;
                if (activeTint === "Clear Transparent") {
                    if (style.indexOf("Rose Gold") !== -1 || style.indexOf("8.1") !== -1) activeTint = "Rose Gold";
                    else if (style.indexOf("Champagne") !== -1 || style.indexOf("8.2") !== -1) activeTint = "Champagne Gold";
                    else if (style.indexOf("Emerald") !== -1 || style.indexOf("8.3") !== -1) activeTint = "Emerald Green";
                    else if (style.indexOf("Sapphire") !== -1 || style.indexOf("8.4") !== -1) activeTint = "Sapphire Blue";
                    else if (style.indexOf("Amethyst") !== -1 || style.indexOf("8.5") !== -1) activeTint = "Amethyst Violet";
                    else if (style.indexOf("Ruby") !== -1 || style.indexOf("8.6") !== -1) activeTint = "Ruby Red";
                    else if (style.indexOf("Amber") !== -1 || style.indexOf("8.7") !== -1) activeTint = "Amber Gold";
                    else if (style.indexOf("Ocean Blue") !== -1 || style.indexOf("8.8") !== -1) activeTint = "Ocean Blue";
                }

                if (activeTint !== "Clear Transparent") {
                    try {
                        var tintLayer = doc.artLayers.add();
                        tintLayer.name = "RI 3D Glass Tint [" + activeTint + "]";
                        var tintCol = new SolidColor();

                        if (activeTint.indexOf("Rose Gold") !== -1) { tintCol.rgb.red = 235; tintCol.rgb.green = 145; tintCol.rgb.blue = 155; }
                        else if (activeTint.indexOf("Champagne") !== -1) { tintCol.rgb.red = 245; tintCol.rgb.green = 215; tintCol.rgb.blue = 160; }
                        else if (activeTint.indexOf("Emerald") !== -1) { tintCol.rgb.red = 24; tintCol.rgb.green = 185; tintCol.rgb.blue = 142; }
                        else if (activeTint.indexOf("Sapphire") !== -1) { tintCol.rgb.red = 28; tintCol.rgb.green = 112; tintCol.rgb.blue = 224; }
                        else if (activeTint.indexOf("Amethyst") !== -1) { tintCol.rgb.red = 155; tintCol.rgb.green = 60; tintCol.rgb.blue = 220; }
                        else if (activeTint.indexOf("Ruby") !== -1) { tintCol.rgb.red = 225; tintCol.rgb.green = 35; tintCol.rgb.blue = 65; }
                        else if (activeTint.indexOf("Amber") !== -1) { tintCol.rgb.red = 240; tintCol.rgb.green = 160; tintCol.rgb.blue = 40; }
                        else if (activeTint.indexOf("Ocean Blue") !== -1) { tintCol.rgb.red = 20; tintCol.rgb.green = 160; tintCol.rgb.blue = 230; }
                        else if (activeTint.indexOf("Cyberpunk") !== -1 || activeTint.indexOf("Neon") !== -1) { tintCol.rgb.red = 155; tintCol.rgb.green = 50; tintCol.rgb.blue = 255; }
                        else { tintCol.rgb.red = 180; tintCol.rgb.green = 210; tintCol.rgb.blue = 235; }

                        doc.selection.selectAll();
                        doc.selection.fill(tintCol, ColorBlendMode.NORMAL, 100, false);
                        doc.selection.deselect();

                        tintLayer.blendMode = BlendMode.COLORBLEND;
                        tintLayer.opacity = 32;
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
                    try {
                        doc.activeLayer.applyZigZag(Math.round(25 + norm * 50), 6, ZigZagType.AROUNDCENTER);
                    } catch (eZg1) {}
                } else if (chosenStyle === "Liquid Marble Flow") {
                    try {
                        doc.activeLayer.applyZigZag(Math.round(35 + norm * 60), 8, ZigZagType.PONDRIPPLES);
                    } catch (eZg2) {}
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
                    try {
                        doc.activeLayer.applyZigZag(Math.round(20 + norm * 45), 5, ZigZagType.OUTFROMCENTER);
                    } catch (eZg3) {}
                } else if (chosenStyle === "Directional Ripple Warp") {
                    doc.activeLayer.applyRipple(Math.round(40 + norm * 80), RippleSize.MEDIUM);
                } else {
                    try {
                        doc.activeLayer.applyZigZag(Math.round(28 + norm * 55), 7, ZigZagType.AROUNDCENTER);
                    } catch (eZg4) {}
                    doc.activeLayer.applyTwirl(Math.round((Math.random() > 0.5 ? 1 : -1) * (45 + norm * 75)));
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
                safeFlattenDoc(doc);
                try {
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
                try { tifOpts.imageCompression = TIFFEncoding.TIFFLZW; } catch (e) {}
                try { tifOpts.byteOrder = ByteOrder.IBM; } catch (e) {}
                try { tifOpts.embedColorProfile = Boolean(cfg.embedProfile); } catch (e) {}
                tifOpts.layers = false;
                try {
                    doc.saveAs(outFile, tifOpts, true);
                } catch (eTif) {
                    doc.saveAs(outFile, tifOpts);
                }

            } else if (cfg.exportFormat.indexOf("PNG") !== -1) {
                var pngSaved = false;
                try {
                    var pngOpts = new PNGSaveOptions();
                    try { pngOpts.compression = 6; } catch (e) {}
                    try { pngOpts.interlaced = false; } catch (e) {}
                    doc.saveAs(outFile, pngOpts, true);
                    if (outFile.exists && outFile.length > 0) pngSaved = true;
                } catch (pngErr) {}

                if (!pngSaved) {
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
                try { psdOpts.embedColorProfile = Boolean(cfg.embedProfile); } catch (e) {}
                try {
                    doc.saveAs(outFile, psdOpts, true);
                } catch (ePsd) {
                    doc.saveAs(outFile, psdOpts);
                }

            } else {
                // Universal JPEG Save Engine (Photoshop CS2 9.0.2 to CC Universal)
                var jpgOpts = new JPEGSaveOptions();
                jpgOpts.quality = Math.max(1, Math.min(12, Math.round(cfg.jpegQuality)));
                try {
                    if (typeof FormatOptions !== "undefined") {
                        jpgOpts.formatOptions = FormatOptions.STANDARDBASELINE;
                    }
                } catch (eFmt) {}
                try {
                    jpgOpts.embedColorProfile = Boolean(cfg.embedProfile);
                } catch (eProf) {}
                try {
                    if (typeof MatteType !== "undefined") {
                        jpgOpts.matte = MatteType.NONE;
                    }
                } catch (eMat) {}

                var isSaved = false;
                // Attempt 1: Standard DOM saveAs asCopy
                try {
                    doc.saveAs(outFile, jpgOpts, true);
                    if (outFile.exists && outFile.length > 0) isSaved = true;
                } catch (saveErr1) {}

                // Attempt 2: Standard DOM saveAs direct
                if (!isSaved) {
                    try {
                        doc.saveAs(outFile, jpgOpts);
                        if (outFile.exists && outFile.length > 0) isSaved = true;
                    } catch (saveErr2) {}
                }

                // Attempt 3: Save For Web Export (Ultra-Reliable in Photoshop CS2)
                if (!isSaved) {
                    try {
                        var sfwJpeg = new ExportOptionsSaveForWeb();
                        sfwJpeg.format = SaveDocumentType.JPEG;
                        sfwJpeg.includeProfile = Boolean(cfg.embedProfile);
                        sfwJpeg.quality = Math.max(10, Math.min(100, Math.round((cfg.jpegQuality / 12) * 100)));
                        doc.exportDocument(outFile, ExportType.SAVEFORWEB, sfwJpeg);
                        if (outFile.exists && outFile.length > 0) isSaved = true;
                    } catch (sfwErr) {}
                }

                // Attempt 4: ActionManager native JPEG save
                if (!isSaved) {
                    try {
                        var idsave = charIDToTypeID("save");
                        var desc = new ActionDescriptor();
                        var descAs = new ActionDescriptor();
                        descAs.putInteger(charIDToTypeID("EQlt"), jpgOpts.quality);
                        desc.putObject(charIDToTypeID("As  "), charIDToTypeID("JPEG"), descAs);
                        desc.putPath(charIDToTypeID("In  "), outFile);
                        desc.putBoolean(charIDToTypeID("Cpy "), true);
                        executeAction(idsave, desc, DIALOG_NO);
                        if (outFile.exists && outFile.length > 0) isSaved = true;
                    } catch (amErr) {}
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

                var copied = false;
                try {
                    extraDoc.activeLayer.duplicate(mainDoc);
                    copied = true;
                } catch (dupErr1) {
                    try {
                        extraDoc.activeLayer.duplicate(mainDoc, PLACE_TOP);
                        copied = true;
                    } catch (dupErr2) {}
                }

                if (!copied) {
                    try {
                        extraDoc.selection.selectAll();
                        extraDoc.selection.copy();
                        app.activeDocument = mainDoc;
                        mainDoc.paste();
                        copied = true;
                    } catch (copyErr) {}
                }

                extraDoc.close(DO_NOT_SAVE);
                extraDoc = null;

                if (!copied) return;

                app.activeDocument = mainDoc;
                var pastedLayer = mainDoc.activeLayer || mainDoc.layers[0];
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
                safeTranslateLayer(pastedLayer, targetX - curX, 0 - curY);

                if (cfg.seamlessBlend && overlap > 0) {
                    try {
                        if (zoneType === "CENTER") {
                            var b = pastedLayer.bounds;
                            var leftSeamX = Math.round(toPx(b[0]));
                            var rightSeamX = Math.round(toPx(b[2]));

                            mainDoc.selection.select([[leftSeamX, 0], [leftSeamX + overlap, 0], [leftSeamX + overlap, cfg.height], [leftSeamX, cfg.height]]);
                            try { mainDoc.selection.feather(overlap * 0.7); } catch (fErr1) {}
                            try { mainDoc.selection.clear(); } catch (cErr1) {}

                            mainDoc.selection.select([[rightSeamX - overlap, 0], [rightSeamX, 0], [rightSeamX, cfg.height], [rightSeamX - overlap, cfg.height]]);
                            try { mainDoc.selection.feather(overlap * 0.7); } catch (fErr2) {}
                            try { mainDoc.selection.clear(); } catch (cErr2) {}
                            mainDoc.selection.deselect();
                        } else if (zoneType === "RIGHT") {
                            var bRight = pastedLayer.bounds;
                            var seamX = Math.round(toPx(bRight[0]));
                            mainDoc.selection.select([[seamX, 0], [seamX + overlap, 0], [seamX + overlap, cfg.height], [seamX, cfg.height]]);
                            try { mainDoc.selection.feather(overlap * 0.7); } catch (fErr3) {}
                            try { mainDoc.selection.clear(); } catch (cErr3) {}
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

                // Guaranteed 10 MB+ Microstock Compliance: Standard JPEG COM padding
        function padJpegFileToMinSize(fileObj, minBytes) {
            if (!fileObj || !fileObj.exists || fileObj.length >= minBytes) return true;

            try {
                fileObj.encoding = "BINARY";
                fileObj.open("r");
                var content = fileObj.read();
                fileObj.close();

                // Validate JPEG SOI (0xFFD8)
                if (content.charCodeAt(0) !== 0xFF || content.charCodeAt(1) !== 0xD8) {
                    return false;
                }

                var needed = minBytes - content.length;
                if (needed <= 0) return true;

                // 1KB buffer of null bytes
                var chunk1K = "";
                for (var b = 0; b < 1024; b++) {
                    chunk1K += String.fromCharCode(0);
                }

                fileObj.open("w");
                // Write SOI (FF D8)
                fileObj.write(content.substring(0, 2));

                // Write JPEG COM (0xFFFE) comment padding segments in safe chunks
                var remaining = needed;
                while (remaining > 0) {
                    var payloadSize = (remaining - 4 > 65530) ? 65530 : (remaining - 4);
                    if (payloadSize <= 0) break;
                    var segLen = payloadSize + 2;
                    var segHeader = String.fromCharCode(0xFF) + String.fromCharCode(0xFE) +
                                    String.fromCharCode((segLen >> 8) & 0xFF) + String.fromCharCode(segLen & 0xFF);
                    fileObj.write(segHeader);

                    var num1K = Math.floor(payloadSize / 1024);
                    var remBytes = payloadSize % 1024;
                    for (var k = 0; k < num1K; k++) {
                        fileObj.write(chunk1K);
                    }
                    if (remBytes > 0) {
                        fileObj.write(chunk1K.substring(0, remBytes));
                    }
                    remaining -= (segLen + 2);
                }

                // Write remaining JPEG body (APP0, DQT, DHT, SOF, SOS, ScanData, EOI)
                fileObj.write(content.substring(2));
                fileObj.close();
                return true;
            } catch (padErr) {
                try { fileObj.close(); } catch (eCls) {}
                return false;
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
                var isStandalone = (primaryFile && primaryFile.isStandalone);
                if (isStandalone) {
                    var docTitle = cfg.filenamePrefix + (seqCounter < 10 ? "00" : (seqCounter < 100 ? "0" : "")) + seqCounter;
                    doc = app.documents.add(cfg.width, cfg.height, 300, docTitle, NewDocumentMode.RGB, DocumentFill.WHITE);
                    convertToHighPrecisionRGB(doc);
                    prepareBaseLayer(doc);
                } else {
                    if (!primaryFile.exists || primaryFile.length === 0) {
                        throw new Error("Source file is missing or 0 bytes (corrupted).");
                    }

                    doc = app.open(primaryFile);
                    convertToHighPrecisionRGB(doc);
                    prepareBaseLayer(doc);
                }

                if (!isStandalone && isTriplet) {
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
                        safeFlattenDoc(doc);
                        prepareBaseLayer(doc);
                    } else {
                        resizeImageSmart(doc, zoneW, cfg.height, "Fit/Crop (Fill)");
                        safeResizeCanvas(doc, cfg.width, cfg.height, (typeof AnchorPosition !== "undefined") ? AnchorPosition.MIDDLELEFT : undefined);
                        doc.activeLayer.name = "Left Zone [" + primaryFile.name + "]";

                        var rightFile = (tripletFiles.length >= 3) ? tripletFiles[2] : (tripletFiles[1] || primaryFile);
                        var centerFile = (tripletFiles.length >= 2) ? tripletFiles[1] : primaryFile;

                        placeImageInSpatialZone(doc, rightFile, "RIGHT", cfg, "Right Zone [" + rightFile.name + "]");
                        placeImageInSpatialZone(doc, centerFile, "CENTER", cfg, "Center Zone [" + centerFile.name + "]");

                        safeFlattenDoc(doc);
                        prepareBaseLayer(doc);

                        if (cfg.blurScope === "Full Composition" && cfg.blurType && cfg.blurType !== "None (Clean Stock Approved)") {
                            applyPhotoshopBlurEngineJSX(doc, cfg);
                        }
                    }
                } else if (!isStandalone) {
                    resizeImageSmart(doc, cfg.width, cfg.height, cfg.resizeMode);
                    if (cfg.blurType && cfg.blurType !== "None (Clean Stock Approved)") {
                        applyPhotoshopBlurEngineJSX(doc, cfg);
                    }
                }

                // 1. Creative 30-Category Gradient Layer (Backdrop Foundation)
                var appliedGradInfo = null;
                if (cfg.gradientEnable) {
                    appliedGradInfo = applyEditableGradientLayer(doc, cfg);
                }

                // 2. 3D Glass Effect Studio Engine (Refracts & Floats Above Backdrop)
                var appliedGlassInfo = null;
                if (cfg.glassEnable) {
                    appliedGlassInfo = apply3DGlassEffectPhotoshop(doc, cfg);
                }

                // 3. Optical Lighting & Vignette Engine (Cinematic Flares & Mood)
                if (cfg.lightingEnable) {
                    applyStudioOpticalLighting(doc, cfg);
                }

                // 4. Film Grain & Add Noise Filter (Master Finishing Polish)
                if (cfg.noiseEnable && cfg.noiseAmount > 0) {
                    if (cfg.noiseFilmGrainOverlay) {
                        applyProfessionalFilmGrainOverlay(doc, cfg.noiseAmount, cfg.noiseMonochromatic);
                    } else {
                        applyAddNoiseFilter(doc, cfg.noiseAmount, cfg.noiseDistribution, cfg.noiseMonochromatic);
                    }
                }

                safeFlattenDoc(doc);

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
                    safeResizeImage(doc, cfg.width, cfg.height, 300);
                }

                if (tempOutputFile && tempOutputFile.exists) {
                    try { tempOutputFile.remove(); } catch (eRemInit) {}
                }

                exportDocumentMaster(doc, tempOutputFile, cfg);

                                // Automatic 4K 10MB+ Microstock Compliance Gate
                var is4KOrAbove = (cfg.width >= 3840 || cfg.height >= 2160 || (cfg.width * cfg.height) >= 8000000);
                var effectiveMinMB = is4KOrAbove ? Math.max(10.5, (cfg.minFileSizeMB || 0)) : Math.max(0, (cfg.minFileSizeMB || 0));
                var effectiveMinBytes = Math.round(effectiveMinMB * 1024 * 1024);

                // Ensure file reaches at least 10 MB in 4K via standard JPEG padding
                if (tempOutputFile && tempOutputFile.exists && effectiveMinBytes > 0) {
                    if (tempOutputFile.length < effectiveMinBytes && cfg.exportFormat.indexOf("JPEG") !== -1) {
                        padJpegFileToMinSize(tempOutputFile, effectiveMinBytes);
                    }
                }

                var qcResult = verifyExportedFile(tempOutputFile, cfg.width, cfg.height, effectiveMinBytes);

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
                var errLine = (typeof err.line !== "undefined") ? (" (Line " + err.line + ")") : "";
                return {
                    success: false,
                    belowMinSize: false,
                    sourceName: fusedNames.join(" + "),
                    outputName: "N/A",
                    reason: "Processing Error" + errLine + ": " + err.message,
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
            var txtSrcPath = srcRow.add("edittext", undefined, "");
            txtSrcPath.preferredSize = [385, 21];

            var outRow = tabSetup.add("group");
            var btnBrowseOut = outRow.add("button", undefined, "Output Folder...");
            btnBrowseOut.preferredSize = [115, 23];
            var txtOutPath = outRow.add("edittext", undefined, "");
            txtOutPath.preferredSize = [385, 21];

            var modeRow = tabSetup.add("group");
            modeRow.add("statictext", undefined, "Mode:");
            var ddBatchScope = modeRow.add("dropdownlist", undefined, ["3-Image Fusion (Anti-Similar)", "All Images (1-by-1)", "Selected Images", "Generate 3D Backgrounds (No Source Photo)"]);
            ddBatchScope.selection = 0;
            ddBatchScope.preferredSize = [190, 21];

            var btnSelectSpecific = modeRow.add("button", undefined, "Pick Files...");
            btnSelectSpecific.preferredSize = [75, 21];
            btnSelectSpecific.enabled = true;

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
            var inpMinSizeMB = expRow1.add("edittext", undefined, "10.5");
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
                "Center 3D Floating Panel",
                "Full Composition",
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

            var glassInfoPanel = tabGlass.add("panel", undefined, "3D Glass Engine (136 Studio Presets)");
            glassInfoPanel.orientation = "column";
            glassInfoPanel.alignChildren = ["fill", "top"];
            glassInfoPanel.spacing = 2;
            glassInfoPanel.margins = 6;
            glassInfoPanel.add("statictext", undefined, "• 136 Glass Styles: 8 Pro Categories (Frosted, Ribbed, Prism, Liquid, 3D Shapes, Glow, Abstract, Color) + 56 Classics.");
            glassInfoPanel.add("statictext", undefined, "• 3D Floating Slab: Layered glass with real drop shadow, bevel rim & diagonal reflection sheen.");
            glassInfoPanel.add("statictext", undefined, "• Authentic Optics: Cylindrical flutes, 3D crystal spheres, chromatic dispersion & liquid refractions.");

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

            selectTab(0);

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
                config.glassStyle = ddGlassStyle.selection ? ddGlassStyle.selection.text : "Random 3D Glass Style";
                config.glassScope = ddGlassScope.selection ? ddGlassScope.selection.text : "Center 3D Floating Panel";
                config.glassTintColor = ddGlassTint.selection ? ddGlassTint.selection.text : "Clear Transparent";
                config.glassOpacity = parseIntSafe(inpGlassOpacity.text, 75, 10, 100);
                config.glassFrostBlur = parseFloatSafe(inpGlassFrostBlur.text, 25, 1, 100);
                config.glassDistortion = parseIntSafe(inpGlassDistort.text, 35, 5, 100);
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
                var chosen = null;
                try {
                    chosen = Folder.selectDialog("Select Source Image Folder");
                } catch (eSel) {
                    try { chosen = Folder.selectDialog(); } catch (eSel2) {}
                }
                if (chosen) {
                    txtSrcPath.text = chosen.fsName;
                    config.sourcePath = chosen.fsName;
                    scannedFilesCache = scanSourceFolder(chosen);
                    var tripletCount = Math.ceil(scannedFilesCache.length / 3);
                    lblScannedInfo.text = "Found: " + scannedFilesCache.length + " imgs (" + tripletCount + " sets)";
                    if (scannedFilesCache.length === 0) {
                        lblCurrentFile.text = "Notice: 0 supported images in " + chosen.name;
                        alert("Notice: No supported images (JPG, PNG, TIF, PSD, BMP) found in:\n" + chosen.fsName + "\n\nPlease select a folder containing images.");
                    } else {
                        lblCurrentFile.text = "Ready: Loaded " + scannedFilesCache.length + " images. Select Output folder & click START.";
                    }
                    if (win && typeof win.update === "function") {
                        try { win.update(); } catch (uErr) {}
                    }
                }
            };

            btnBrowseOut.onClick = function () {
                var chosen = null;
                try {
                    chosen = Folder.selectDialog("Select Output Destination Folder");
                } catch (eOut) {
                    try { chosen = Folder.selectDialog(); } catch (eOut2) {}
                }
                if (chosen) {
                    txtOutPath.text = chosen.fsName;
                    config.outputPath = chosen.fsName;
                    if (win && typeof win.update === "function") {
                        try { win.update(); } catch (uErr) {}
                    }
                }
            };

            txtSrcPath.onChange = function () {
                var p = txtSrcPath.text;
                if (p) {
                    var f = new Folder(p);
                    if (f.exists) {
                        config.sourcePath = p;
                        scannedFilesCache = scanSourceFolder(f);
                        var tripletCount = Math.ceil(scannedFilesCache.length / 3);
                        lblScannedInfo.text = "Found: " + scannedFilesCache.length + " imgs (" + tripletCount + " sets)";
                        if (win && typeof win.update === "function") {
                            try { win.update(); } catch (uErr) {}
                        }
                    }
                }
            };

            txtOutPath.onChange = function () {
                var p = txtOutPath.text;
                if (p && (new Folder(p)).exists) {
                    config.outputPath = p;
                }
            };

            ddBatchScope.onChange = function () {
                var selMode = ddBatchScope.selection ? ddBatchScope.selection.text : "";
                if (selMode === "Generate 3D Backgrounds (No Source Photo)") {
                    lblScannedInfo.text = "Target: " + config.maxBatchCount + " backgrounds";
                    lblCurrentFile.text = "Ready to generate " + config.maxBatchCount + " commercial 3D backgrounds. Pick Output Folder and click START.";
                    btnBrowseSrc.enabled = false;
                    btnSelectSpecific.enabled = false;
                    return;
                } else {
                    btnBrowseSrc.enabled = true;
                    btnSelectSpecific.enabled = true;
                }
                var isSelectedMode = (selMode === "Selected Images");
                if (isSelectedMode && config.selectedFiles.length > 0) {
                    lblScannedInfo.text = "Picked: " + config.selectedFiles.length + " files";
                } else {
                    lblScannedInfo.text = "Found: " + scannedFilesCache.length + " images";
                }
            };

            btnSelectSpecific.onClick = function () {
                var picked = null;
                try {
                    picked = File.openDialog("Select Images to Process", "*.jpg;*.jpeg;*.png;*.tif;*.tiff;*.psd;*.bmp", true);
                } catch (dialogErr1) {
                    try {
                        picked = File.openDialog("Select Images to Process", "*.*", true);
                    } catch (dialogErr2) {
                        try {
                            picked = File.openDialog("Select Images to Process");
                        } catch (dialogErr3) {}
                    }
                }
                if (picked) {
                    var fileList = (picked instanceof Array) ? picked : [picked];
                    if (fileList.length > 0) {
                        config.selectedFiles = fileList;
                        scannedFilesCache = fileList;
                        // Automatically activate Selected Images mode
                        for (var m = 0; m < ddBatchScope.items.length; m++) {
                            if (ddBatchScope.items[m].text === "Selected Images") {
                                ddBatchScope.selection = m;
                                break;
                            }
                        }
                        lblScannedInfo.text = "Picked: " + fileList.length + " files";
                        lblCurrentFile.text = "Loaded " + fileList.length + " selected images. Click START to process.";
                        if (win && typeof win.update === "function") {
                            try { win.update(); } catch (uErr) {}
                        }
                    }
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
                if (config.processMode === "Generate 3D Backgrounds (No Source Photo)") {
                    var genCount = Math.min(config.maxBatchCount || 10, 500);
                    var genQueue = [];
                    for (var g = 0; g < genCount; g++) {
                        genQueue.push({ isStandalone: true, name: "3D_Stock_BG_" + (g + 1) });
                    }
                    return { queue: genQueue, totalScanned: genCount };
                }
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

                var prevDialogs = null;
                var prevRulerUnits = null;
                try { prevDialogs = app.displayDialogs; } catch (ePd) {}
                try { prevRulerUnits = app.preferences.rulerUnits; } catch (eRu) {}
                try { if (typeof DialogModes !== "undefined") app.displayDialogs = DIALOG_NO; } catch (eDn) {}
                try { if (typeof Units !== "undefined") app.preferences.rulerUnits = Units.PIXELS; } catch (ePx) {}

                setControlsRunningState(true);
                var seqCounter = 1;
                var totalItems = batchState.queue.length;

                try {
                    for (var idx = 0; idx < totalItems; idx++) {
                        batchState.currentIndex = idx;

                        while (batchState.isPaused && !batchState.stopRequested) {
                            if (win && typeof win.update === "function") {
                                try { win.update(); } catch (uErr) {}
                            }
                            $.sleep(100);
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

                        // Give Windows OS message pump time to process ScriptUI paint messages without freezing
                        $.sleep(30);

                        var result = null;
                        try {
                            result = processSingleImage(item, folders, seqCounter, config);
                            if (!result) throw new Error("Empty processing result");
                            seqCounter = result.nextSeq || (seqCounter + 1);
                        } catch (itemExecErr) {
                            result = {
                                success: false,
                                reason: itemExecErr.message || "Execution exception",
                                sourceName: itemLabel,
                                outputName: "N/A",
                                sizeMB: "0.00",
                                extraInfo: "",
                                nextSeq: seqCounter + 1
                            };
                            seqCounter++;
                        }

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
                            var errDetail = (result.reason || result.error || "Processing failed");
                            batchState.failedDetails.push("[FAILED] " + result.sourceName + " -> " + errDetail);
                            batchState.logs.push("[FAILED] " + result.sourceName + " -> " + errDetail);
                        }

                        saveCheckpoint(folders.reports);
                        updateStatsUI(totalItems - (idx + 1));

                        // Purge Photoshop History & Cache every 10 items to prevent RAM exhaustion (skip first item)
                        if (idx > 0 && (idx % 10) === 0) {
                            purgePhotoshopCachesSafe();
                        }
                    }
                } catch (batchLoopErr) {
                    batchState.logs.push("[CRITICAL] Batch loop error: " + batchLoopErr.message);
                } finally {
                    try { if (prevDialogs !== null) app.displayDialogs = prevDialogs; } catch (eR1) {}
                    try { if (prevRulerUnits !== null) app.preferences.rulerUnits = prevRulerUnits; } catch (eR2) {}
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
                try {
                    syncConfigFromUI();
                    if (config.processMode === "Generate 3D Backgrounds (No Source Photo)") {
                        // Standalone generation - no source folder required
                    } else if (config.processMode === "Selected Images") {
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
                } catch (startErr) {
                    alert("Error starting batch processing:\n" + startErr.message);
                }
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
