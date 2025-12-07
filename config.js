// config.js

const CHAPTERS = [
    { id: 1, name: "Real Numbers", file: "ch1_real_numbers.json" },
    { id: 2, name: "Polynomials", file: "ch2_polynomials.json" },
    { id: 3, name: "Pair of Linear Equations", file: "ch3_linear_equations.json" },
    { id: 4, name: "Quadratic Equations", file: "ch4_quadratic_equations.json" },
    { id: 5, name: "Arithmetic Progressions", file: "ch5_arithmetic_progressions.json" },
    { id: 6, name: "Triangles", file: "ch6_triangles.json" },
    { id: 7, name: "Coordinate Geometry", file: "ch7_coordinate_geometry.json" },
    { id: 8, name: "Introduction to Trigonometry", file: "ch8_intro_to_trigonometry.json" },
    { id: 9, name: "Applications of Trigonometry", file: "ch9_applications_of_trigonometry.json" },
    { id: 10, name: "Circles", file: "ch10_circles.json" },
    { id: 11, name: "Areas Related to Circles", file: "ch11_areas_related_to_circles.json" },
    { id: 12, name: "Surface Areas and Volumes", file: "ch12_surface_areas_volumes.json" },
    { id: 13, name: "Statistics", file: "ch13_statistics.json" },
    { id: 14, name: "Probability", file: "ch14_probability.json" }
];

// The CBSE Blueprint Matrix
const BOARD_BLUEPRINT = [
    { chapter: "Real Numbers", breakdown: { 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 } },
    { chapter: "Polynomials", breakdown: { 1: 1, 2: 0, 3: 1, 4: 0, 5: 0 } },
    { chapter: "Pair of Linear Equations", breakdown: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 1 } },
    { chapter: "Quadratic Equations", breakdown: { 1: 2, 2: 0, 3: 1, 4: 0, 5: 0 } },
    { chapter: "Arithmetic Progressions", breakdown: { 1: 1, 2: 0, 3: 0, 4: 1, 5: 0 } },
    { chapter: "Triangles", breakdown: { 1: 0, 2: 1, 3: 1, 4: 1, 5: 0 } },
    { chapter: "Coordinate Geometry", breakdown: { 1: 2, 2: 1, 3: 0, 4: 0, 5: 0 } },
    { chapter: "Introduction to Trigonometry", breakdown: { 1: 2, 2: 1, 3: 1, 4: 0, 5: 0 } },
    { chapter: "Applications of Trigonometry", breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 } },
    { chapter: "Circles", breakdown: { 1: 3, 2: 0, 3: 0, 4: 0, 5: 1 } },
    { chapter: "Areas Related to Circles", breakdown: { 1: 1, 2: 0, 3: 1, 4: 0, 5: 0 } },
    { chapter: "Surface Areas and Volumes", breakdown: { 1: 2, 2: 0, 3: 0, 4: 1, 5: 0 } },
    { chapter: "Statistics", breakdown: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 1 } },
    { chapter: "Probability", breakdown: { 1: 2, 2: 1, 3: 0, 4: 0, 5: 0 } }
];