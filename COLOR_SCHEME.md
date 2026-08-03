# Color Scheme

Cornell-anchored palette: carnelian red primary with vibrant rainbow accents,
matching the poster theme. For use on the website and in accompanying paper
figures and visualizations.

## Primary Accent Colors

### Carnelian (Primary Accent — Cornell Red)
- **Hex:** `#b31b1b`
- **RGB:** `rgb(179, 27, 27)`
- **Usage:** Primary brand color, highlights, key metrics, buttons, links
- **Paper use:** Main data series, primary emphasis, correlation lines

### Gold
- **Hex:** `#d4940a`
- **RGB:** `rgb(212, 148, 10)`
- **Usage:** Term 1 (Weak Decodability) accent
- **Paper use:** Warm secondary data series

### Vivid Orange
- **Hex:** `#e8590c`
- **RGB:** `rgb(232, 89, 12)`
- **Usage:** Warm gradient partner, secondary warm accent
- **Paper use:** Secondary warm data series

### Blue Energy
- **Hex:** `#2563eb`
- **RGB:** `rgb(37, 99, 235)`
- **Usage:** Term 2 (Strong Decodability), strong cool accent
- **Paper use:** Deep blue data series, strong emphasis

### Neon Violet
- **Hex:** `#7c3aed`
- **RGB:** `rgb(124, 58, 237)`
- **Usage:** Term 3 (Steerability), gradient transitions
- **Paper use:** Tertiary data series, gradient fills

### Detect Green
- **Hex:** `#2f9e44`
- **RGB:** `rgb(47, 158, 68)`
- **Usage:** OOD / failure-detection section accent
- **Paper use:** Detection results, healthy/in-distribution series

### Cool Horizon
- **Hex:** `#3b82f6`
- **RGB:** `rgb(59, 130, 246)`
- **Usage:** Lighter cool accent, gradients
- **Paper use:** Cool-toned data series, background accents

### Hyper Magenta
- **Hex:** `#c2255c`
- **RGB:** `rgb(194, 37, 92)`
- **Usage:** Rarely; extra rainbow stop when more hues are needed
- **Paper use:** Additional data series

## Section Accent Mapping

| Section | Accent |
|---|---|
| Term 1 — Weak Decodability | Gold `#d4940a` |
| Term 2 — Strong Decodability | Blue Energy `#2563eb` |
| Term 3 — Steerability | Neon Violet `#7c3aed` |
| OOD / Failure Detection | Detect Green `#2f9e44` |
| Site-wide brand / everything else | Carnelian `#b31b1b` |

## Background Colors

### Background Deep
- **Hex:** `#fafafa`
- **Usage:** Page background

### Background Surface
- **Hex:** `#ffffff`
- **Usage:** Card backgrounds, elevated surfaces, plot backgrounds

### Background Elevated
- **Hex:** `#f5f5f5`
- **Usage:** Subtle elevation, card backgrounds

## Text Colors

### Text Primary
- **Hex:** `#1a1a1a`
- **Usage:** Main text, headings, axis labels, titles

### Text Secondary
- **Hex:** `#4a4a4a`
- **Usage:** Secondary text, descriptions, captions

### Text Muted
- **Hex:** `#7a7a7a`
- **Usage:** Tertiary text, hints, grid lines, minor labels

## Border Colors

### Border Subtle
- **Value:** `rgba(0, 0, 0, 0.06)`
- **Usage:** Subtle borders, dividers, light grid lines

### Border Light
- **Value:** `rgba(0, 0, 0, 0.1)`
- **Usage:** Light borders, dividers, plot borders

## Recommended Color Combinations for Paper Figures

### For Line Plots / Time Series
- **Primary series:** Carnelian `#b31b1b`
- **Secondary series:** Blue Energy `#2563eb`
- **Tertiary series:** Neon Violet `#7c3aed`
- **Baseline/Reference:** Text Muted `#7a7a7a`

### For Bar Charts
- **Our results:** Carnelian `#b31b1b`
- **Baseline/Comparison:** Blue Energy `#2563eb`
- **Alternative method:** Neon Violet `#7c3aed`

### For Detection / OOD Figures
- **In-distribution / healthy:** Detect Green `#2f9e44`
- **OOD / failure:** Carnelian `#b31b1b`
- **Expected trend:** Text Muted `#7a7a7a` (dashed)

## LaTeX/Matplotlib Color Definitions

### For LaTeX (xcolor package)
```latex
\definecolor{carnelian}{RGB}{179,27,27}
\definecolor{gold}{RGB}{212,148,10}
\definecolor{vividorange}{RGB}{232,89,12}
\definecolor{blueenergy}{RGB}{37,99,235}
\definecolor{neonviolet}{RGB}{124,58,237}
\definecolor{detectgreen}{RGB}{47,158,68}
\definecolor{coolhorizon}{RGB}{59,130,246}
```

### For Python/Matplotlib
```python
COLORS = {
    'carnelian': '#b31b1b',
    'gold': '#d4940a',
    'vivid_orange': '#e8590c',
    'blue_energy': '#2563eb',
    'neon_violet': '#7c3aed',
    'detect_green': '#2f9e44',
    'cool_horizon': '#3b82f6',
    'text_primary': '#1a1a1a',
    'text_secondary': '#4a4a4a',
    'text_muted': '#7a7a7a',
}
```

## Accessibility Notes

- **Carnelian** on white passes WCAG AA for normal text; use white text on
  carnelian-filled buttons and chips (black fails contrast on this red).
- **Carnelian vs. Detect Green** is a red/green pairing — when they encode
  opposing conditions in a figure, differentiate with line style (solid vs.
  dashed) as well as color for colorblind readers.
- **Blue Energy** and **Neon Violet** are distinguishable from carnelian
  under common color-vision deficiencies.
