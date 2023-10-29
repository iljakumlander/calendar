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
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

dotenv.config({ path: './.env.client' + (process.env.NODE_ENV === 'production' ? '.production' : '') });

const production = process.env.NODE_ENV === 'production';
const destianion = production ? 'deploy' : 'watch';
const root = process.env.CLIENT_ROOT || '/';

export default [
  {
    input: 'src/index.html',
    output: { dir: destianion + '/client' },
    plugins: [
      html({
        extractAssets: false,
        transformHtml: [
          html => html.replace('/index.js', `${root}index.js`),
          html => html.replace('/index.css', `${root}index.css`),
          html => html.replace('/favicon.ico', `${root}favicon.ico`),
        ],
      }),
    ],
  },
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
          { src: 'static/**/*', dest: destianion + '/client' },
        ]
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
        'process.env.SERVER': JSON.stringify(process.env.SERVER),
        'process.env.CLIENT_ROOT': JSON.stringify(process.env.CLIENT_ROOT),
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
          { src: '.env.server' + (production ? '.production' : ''), dest: destianion + '/server' , rename: '.env' },
        ]
      }),
    ],
  }
];
