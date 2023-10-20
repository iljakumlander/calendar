import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-copy';
import path from 'path';
import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json'
import dotenv from 'dotenv';

dotenv.config({ path: './.env.client' });

const production = process.env.NODE_ENV === 'production';
const destianion = production ? 'deploy' : 'watch';

export default [
  {
    input: 'src/client.tsx',
    output: {
      name: 'client',
      file: destianion + '/client/index.js',
      format: 'iife',
      sourcemap: !production
    },
    plugins: [
      json(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      scss({ fileName: destianion + '/client/index.css', watch: production ? undefined : 'src' }),
      typescript(),
      production && terser(),
      production && license({
        sourcemap: true,
        cwd: process.cwd(),
  
        banner: {
          commentStyle: 'regular',
  
          content: {
            file: path.join(__dirname, 'LICENSE'),
            encoding: 'utf-8',
          },

          data() {
            return {
              foo: 'foo',
            };
          },
        },
        thirdParty: {
          includePrivate: true,
          multipleVersions: true,
          output: {
            file: path.join(__dirname, destianion + '/client', 'dependencies.txt'),
            encoding: 'utf-8',
          },
        },
      }),
      copy({
        targets: [
          { src: 'LICENSE', dest: destianion + '/client' },
          { src: 'src/index.html', dest: destianion + '/client' },
          { src: 'static/**/*', dest: destianion + '/client' },
        ]
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
        'process.env.SERVER': JSON.stringify(process.env.SERVER),
      }),
    ],
  },
  {
    input: 'src/server.ts',
    output: {
      file: destianion + '/server/index.js',
      format: 'module'
    },
    plugins: [
      json(),
      resolve(),
      commonjs(),
      typescript(),
      copy({
        targets: [
          { src: destianion + '/client/**/*', dest: destianion + '/server/public' },
          { src: '.env.server', dest: destianion + '/server' , rename: '.env' },
        ]
      }),
      /*
      replace({
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      }),
      */
    ],
  }
];


/*
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';

export default [
  {
    input: 'src/client.tsx',
    output: [
      {
        file: 'deploy/client/index.js',
        format: 'cjs'
      },
      {
        file: 'deploy/server/static/index.js',
        format: 'cjs'
      }
    ],
    plugins: [
      resolve(),
      scss({ fileName: 'deploy/client/index.css' }),
      copy({
        targets: [
          { src: 'src/index.html', dest: 'deploy/client' },
          { src: 'static/** /*', dest: 'deploy/client' }
        ]
      }),
      typescript(),
      babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'bundled',
         presets: ['@babel/preset-react'],
      }),
    ],
  },
  {
    input: 'src/server.ts',
    output: {
      file: 'deploy/server/index.js',
      format: 'module'
    },
    plugins: [
      typescript(),
      copy({
        targets: [
          { src: 'src/index.html', dest: 'deploy/server/static' },
          { src: 'static/** /*', dest: 'deploy/server/static' }
        ]
      }),
    ],
  }
];
/* */