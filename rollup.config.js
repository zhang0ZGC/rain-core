import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize'
import replace from 'rollup-plugin-replace'
// import analyze from 'rollup-plugin-analyzer'
// import { uglify } from 'rollup-plugin-uglify'
import { terser } from 'rollup-plugin-terser'

// const env = process.env.NODE_ENV;
const noDeclarationFiles = { compilerOptions: { declaration: false } };

const config = [
    // CommonJS
    {
        input: 'src/index.ts',
        output: {
            file: 'lib/rain.js',
            format: 'cjs',
            indent: false,
        },
        plugins: [
            resolve(),
            typescript({ useTsconfigDeclarationDir: true }),
            babel(),
        ]
    },

    // UMD development
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/rain.js',
            format: 'umd',
            name: 'Rain',
            sourcemap: true,
            // footer: '/* @see https://github.com */',
        },
        plugins: [
            resolve(),
            typescript({tsconfigOverride: noDeclarationFiles}),
            filesize(),
            // analyze(),
            replace({
                'process.env.NODE_ENV': JSON.stringify('development')
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    },

    // UMD production
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/rain.min.js',
            format: 'umd',
            name: 'Rain',
            indent: false,
            sourcemap: true,
        },
        plugins: [
            resolve(),
            typescript({tsconfigOverride: noDeclarationFiles}),
            replace({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            babel({
                exclude: 'node_modules/**'
            }),
            // uglify(),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true,
                    warnings: false
                }
            })
        ]
    },
]

export default config;